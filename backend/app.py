from flask import Flask, request, jsonify
import requests
import psycopg2
import bcrypt
import logging
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_CONFIG = {
    'user': 'app_user',
    'password': 'app_password',
    'host': 'db',
    'dbname': 'app_db',
    'port': '5432'
}

RECOMMENDER_URL = "http://recommender:5000/recommend"

def check_credentials(username, password):
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE username = %s", (username,))
    result = cursor.fetchone()
    conn.close()
    if result and bcrypt.checkpw(password.encode('utf-8'), result[0].encode('utf-8')):
        return True
    return False

def get_user_id(username):
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else None

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    logger.info(f'{data}')
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    logger.info(f"Попытка входа для {username}")
    if check_credentials(username, password):
        user_id = get_user_id(username)
        logger.info(f"Вход успешен для {username}")
        logger.info(f"Будут подбираться рекомендации для {user_id}")
        return jsonify({"user_id": user_id}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/recommend', methods=['GET'])
def get_recommendations():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    logger.info(f"Requesting recommendations for user {user_id}")
    response = requests.get(f"{RECOMMENDER_URL}?user_id={user_id}")
    if response.status_code == 200:
        return jsonify(response.json()), 200
    return jsonify({"error": "Failed to get recommendations"}), 500


@app.route('/history', methods=['GET'])
def get_history():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    logger.info(f"Requesting watch history for user {user_id}")
    
    try:
        logs = pd.read_csv('/app/data/logs.csv')
        movies = pd.read_csv('/app/data/movies.csv')
        genres_df = pd.read_csv('/app/data/genres.csv')
        countries_df = pd.read_csv('/app/data/countries.csv')
        staff_df = pd.read_csv('/app/data/staff.csv')
        
        user_logs = logs[logs['user_id'] == user_id][['movie_id']].drop_duplicates()
        
        history = user_logs.merge(
            movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link']],
            left_on='movie_id',
            right_on='id',
            how='inner'
        )
        
        history['genres'] = history['genres'].apply(lambda x: eval(x) if isinstance(x, str) else x)
        history['countries'] = history['countries'].apply(lambda x: eval(x) if isinstance(x, str) else x)
        history['staff'] = history['staff'].apply(lambda x: eval(x) if isinstance(x, str) else x)
        
        genres_map = dict(zip(genres_df['id'], genres_df['name']))
        countries_map = dict(zip(countries_df['id'], countries_df['name']))
        staff_map = dict(zip(staff_df['id'], staff_df['name']))
        
        history['genres'] = history['genres'].apply(lambda x: [genres_map.get(id, str(id)) for id in x])
        history['country'] = history['countries'].apply(lambda x: [countries_map.get(id, str(id)) for id in x])
        history['actors'] = history['staff'].apply(lambda x: [staff_map.get(id, str(id)) for id in x])
        
        result = history[['id', 'name', 'description', 'genres', 'country', 'actors', 'link']].to_dict('records')
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Failed to get history: {str(e)}")
        return jsonify({"error": "Failed to get history"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
