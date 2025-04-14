from flask import Flask, request, jsonify
import pandas as pd
import joblib
import numpy as np
from lightfm import LightFM
import logging

app = Flask(__name__)

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Загрузка данных
logger.info("Загрузка модели и данных...")
model = joblib.load('models/lightfm_model.joblib')
dataset = joblib.load('models/lightfm_dataset.joblib')
item_features = joblib.load('models/item_features.joblib')
movies = pd.read_csv('models/movies.csv')
genres_df = pd.read_csv('data/genres.csv')
countries_df = pd.read_csv('data/countries.csv')
staff_df = pd.read_csv('data/staff.csv')
logger.info("Модель и данные успешно загружены")

def recommend(user_id, n_items=20):
    user_idx = dataset.mapping()[0].get(user_id)
    if user_idx is None:
        logger.warning(f"User {user_id} not found, returning popular movies.")
        popular_movies = movies.sort_values(by='id').head(n_items)[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link']]
        popular_movies['genres'] = popular_movies['genres'].apply(lambda x: eval(x) if isinstance(x, str) else x)
        popular_movies['countries'] = popular_movies['countries'].apply(lambda x: eval(x) if isinstance(x, str) else x)
        popular_movies['staff'] = popular_movies['staff'].apply(lambda x: eval(x) if isinstance(x, str) else x)
    else:
        n_items_total = len(dataset.mapping()[2])
        scores = model.predict(user_idx, np.arange(n_items_total), item_features=item_features)
        top_items = np.argsort(-scores)[:n_items]

        item_mapping = dataset.mapping()[2]
        reverse_item_mapping = {v: k for k, v in item_mapping.items()}
        recommended_movie_ids = [reverse_item_mapping[item_idx] for item_idx in top_items]

        popular_movies = movies[movies['id'].isin(recommended_movie_ids)][['id', 'name', 'description', 'genres', 'countries', 'staff', 'link']]
        popular_movies['genres'] = popular_movies['genres'].apply(lambda x: eval(x) if isinstance(x, str) else x)
        popular_movies['countries'] = popular_movies['countries'].apply(lambda x: eval(x) if isinstance(x, str) else x)
        popular_movies['staff'] = popular_movies['staff'].apply(lambda x: eval(x) if isinstance(x, str) else x)

    genres_map = dict(zip(genres_df['id'], genres_df['name']))
    countries_map = dict(zip(countries_df['id'], countries_df['name']))
    staff_map = dict(zip(staff_df['id'], staff_df['name']))

    popular_movies['genres'] = popular_movies['genres'].apply(lambda x: [genres_map.get(id, str(id)) for id in x])
    popular_movies['country'] = popular_movies['countries'].apply(lambda x: [countries_map.get(id, str(id)) for id in x])
    popular_movies['actors'] = popular_movies['staff'].apply(lambda x: [staff_map.get(id, str(id)) for id in x])

    return popular_movies[['id', 'name', 'description', 'genres', 'country', 'actors', 'link']]


@app.route('/recommend', methods=['GET'])
def get_recommendations():
    logger.info("Функция запущена")
    user_id = request.args.get('user_id', type=int)
    logger.info(f"{user_id}")
    if user_id is None:
        return jsonify({"error": "user_id is required"}), 400

    logger.info(f"Подбор рекомендаций для пользователя {user_id}")
    recommendations = recommend(user_id)
    return jsonify(recommendations.to_dict('records'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
