from flask import Flask, request, jsonify
import requests
import psycopg2
import bcrypt
import logging
from flask_cors import CORS
import pandas as pd
import json

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

def username_exists(username):
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM users WHERE username = %s", (username,))
    exists = cursor.fetchone() is not None
    conn.close()
    return exists

def get_next_user_id():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT COALESCE(MAX(user_id), 0) + 1 FROM users")
    next_id = cursor.fetchone()[0]
    conn.close()
    return next_id

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    logger.info(f"Попытка регистрации для {username}")
    
    if username_exists(username):
        logger.warning(f"Пользователь {username} уже существует")
        return jsonify({"error": "Username already exists"}), 409
    
    try:
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_id = get_next_user_id()
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (user_id, username, password_hash, plain_password) VALUES (%s, %s, %s, %s)",
            (user_id, username, hashed_password, password)
        )
        conn.commit()
        conn.close()
        logger.info(f"Регистрация успешна для {username}, user_id: {user_id}")
        return jsonify({"user_id": user_id, "message": "Registration successful"}), 201
    except Exception as e:
        logger.error(f"Ошибка при регистрации: {str(e)}")
        return jsonify({"error": "Failed to register"}), 500

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
        
        if user_logs.empty:
            logger.info(f"No history found for user {user_id}")
            return jsonify([]), 200
        
        history = user_logs.merge(
            movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link', 'year', 'reviews']],
            left_on='movie_id',
            right_on='id',
            how='inner'
        )
        
        history['id'] = history['id'].fillna(-1).astype(int)
        history['name'] = history['name'].fillna('Unknown')
        history['description'] = history['description'].fillna('')
        history['link'] = history['link'].fillna('https://via.placeholder.com/150')
        history['reviews'] = history['reviews'].fillna('[]')
        
        def fix_reviews(reviews_str):
            try:
                reviews_list = eval(reviews_str) if isinstance(reviews_str, str) and reviews_str.strip() else []
                return json.dumps(reviews_list, ensure_ascii=False)
            except Exception as e:
                logger.warning(f"Failed to parse reviews: {reviews_str}, error: {str(e)}")
                return '[]'
        
        history['reviews'] = history['reviews'].apply(fix_reviews)
        
        def clean_year(y):
            if pd.isna(y):
                return 0
            if isinstance(y, str) and '-' in y:
                try:
                    return int(y.split('-')[0])
                except:
                    logger.warning(f"Invalid year format: {y}")
                    return 0
            try:
                return int(y)
            except:
                logger.warning(f"Invalid year value: {y}")
                return 0
        
        history['year'] = history['year'].apply(clean_year)
        
        def safe_eval(x):
            try:
                return eval(x) if isinstance(x, str) and x.strip() else []
            except:
                logger.warning(f"Failed to eval: {x}")
                return []
        
        history['genres'] = history['genres'].apply(safe_eval)
        history['countries'] = history['countries'].apply(safe_eval)
        history['staff'] = history['staff'].apply(safe_eval)
        
        genres_map = dict(zip(genres_df['id'], genres_df['name']))
        countries_map = dict(zip(countries_df['id'], countries_df['name']))
        staff_map = dict(zip(staff_df['id'], staff_df['name']))
        
        history['genres'] = history['genres'].apply(lambda x: [genres_map.get(id, str(id)) for id in x] if isinstance(x, list) else [])
        history['country'] = history['countries'].apply(lambda x: [countries_map.get(id, str(id)) for id in x] if isinstance(x, list) else [])
        history['actors'] = history['staff'].apply(lambda x: [staff_map.get(id, str(id)) for id in x] if isinstance(x, list) else [])
        
        result = history[['id', 'name', 'description', 'genres', 'country', 'actors', 'link', 'year', 'reviews']].to_dict('records')
        logger.info(f"History length: {len(result)}")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Failed to get history: {str(e)}")
        return jsonify({"error": "Failed to get history"}), 500

@app.route('/profile', methods=['GET'])
def get_profile():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    logger.info(f"Requesting profile for user {user_id}")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT username FROM users WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()
        conn.close()
        if result:
            return jsonify({"username": result[0]}), 200
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logger.error(f"Failed to get profile: {str(e)}")
        return jsonify({"error": "Failed to get profile"}), 500

@app.route('/change_password', methods=['POST'])
def change_password():
    data = request.get_json()
    user_id = data.get('user_id')
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not user_id or not current_password or not new_password:
        return jsonify({"error": "user_id, current_password, and new_password are required"}), 400
    
    logger.info(f"Attempting to change password for user {user_id}")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()
        if not result:
            conn.close()
            return jsonify({"error": "User not found"}), 404
        
        if not bcrypt.checkpw(current_password.encode('utf-8'), result[0].encode('utf-8')):
            conn.close()
            return jsonify({"error": "Current password is incorrect"}), 401
        
        hashed_new_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute(
            "UPDATE users SET password_hash = %s, plain_password = %s WHERE user_id = %s",
            (hashed_new_password, new_password, user_id)
        )
        conn.commit()
        conn.close()
        logger.info(f"Password changed successfully for user {user_id}")
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        logger.error(f"Failed to change password: {str(e)}")
        return jsonify({"error": "Failed to change password"}), 500

@app.route('/analytics', methods=['GET'])
def get_analytics():
    user_id = request.args.get('user_id', type=int)
    min_movies = request.args.get('min_movies', default=1, type=int)  # Фильтр для топ-актёров
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    logger.info(f"Requesting analytics for user {user_id}")

    def safe_eval(x):
        try:
            return eval(x) if isinstance(x, str) and x.strip() else []
        except:
            logger.warning(f"Failed to eval: {x}")
            return []
    
    try:
        logs = pd.read_csv('/app/data/logs.csv')
        movies = pd.read_csv('/app/data/movies.csv')
        genres_df = pd.read_csv('/app/data/genres.csv')
        countries_df = pd.read_csv('/app/data/countries.csv')
        staff_df = pd.read_csv('/app/data/staff.csv')
        
        user_logs = logs[logs['user_id'] == user_id]
        if user_logs.empty:
            return jsonify({
                "genres": [],
                "countries": [],
                "weekday_views": [],
                "top_actors": []
            }), 200
        
        # 1. Распределение по жанрам
        user_movies = user_logs.merge(movies, left_on='movie_id', right_on='id', how='inner')
        user_movies['genres'] = user_movies['genres'].apply(safe_eval)
        genre_counts = {}
        for genres in user_movies['genres']:
            for genre_id in genres:
                genre_name = genres_df[genres_df['id'] == genre_id]['name'].iloc[0] if genre_id in genres_df['id'].values else str(genre_id)
                genre_counts[genre_name] = genre_counts.get(genre_name, 0) + 1
        genres_data = [{"name": k, "value": v} for k, v in genre_counts.items()]
        
        # 2. Распределение по странам
        user_movies['countries'] = user_movies['countries'].apply(safe_eval)
        country_counts = {}
        for countries in user_movies['countries']:
            for country_id in countries:
                country_name = countries_df[countries_df['id'] == country_id]['name'].iloc[0] if country_id in countries_df['id'].values else str(country_id)
                country_counts[country_name] = country_counts.get(country_name, 0) + 1
        countries_data = [{"name": k, "value": v} for k, v in country_counts.items()]
        
        # 3. Динамика просмотров по дням недели
        user_logs['datetime'] = pd.to_datetime(user_logs['datetime'])
        user_logs['weekday'] = user_logs['datetime'].dt.day_name()
        weekday_views = user_logs.groupby('weekday')['duration'].sum().reset_index()
        # Упорядочиваем дни недели
        days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekday_views['weekday'] = pd.Categorical(weekday_views['weekday'], categories=days_order, ordered=True)
        weekday_views = weekday_views.sort_values('weekday')
        weekday_views_data = weekday_views.to_dict('records')
        
        # 4. Топ актёров с фильтром
        user_movies['staff'] = user_movies['staff'].apply(safe_eval)
        staff_counts = {}
        for staff in user_movies['staff']:
            for staff_id in staff:
                staff_role = staff_df[staff_df['id'] == staff_id]['role'].iloc[0] if staff_id in staff_df['id'].values else 'unknown'
                if staff_role == 'actor':
                    staff_name = staff_df[staff_df['id'] == staff_id]['name'].iloc[0] if staff_id in staff_df['id'].values else str(staff_id)
                    staff_counts[staff_name] = staff_counts.get(staff_name, 0) + 1
        # Фильтруем актёров по минимальному количеству фильмов
        filtered_staff_counts = {k: v for k, v in staff_counts.items() if v >= min_movies}
        top_actors = [{"name": k, "value": v} for k, v in sorted(filtered_staff_counts.items(), key=lambda x: x[1], reverse=True)[:10]]
        
        return jsonify({
            "genres": genres_data,
            "countries": countries_data,
            "weekday_views": weekday_views_data,
            "top_actors": top_actors
        }), 200
    except Exception as e:
        logger.error(f"Failed to get analytics: {str(e)}")
        return jsonify({"error": "Failed to get analytics"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)