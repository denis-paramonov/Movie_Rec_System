from flask import Flask, request, jsonify
import pandas as pd
import joblib
import numpy as np
from lightfm import LightFM
import logging
import json

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Загрузка модели и данных...")
model = joblib.load('models/lightfm_model.joblib')
dataset = joblib.load('models/lightfm_dataset.joblib')
item_features = joblib.load('models/item_features.joblib')
movies = pd.read_csv('models/movies.csv')
genres_df = pd.read_csv('data/genres.csv')
countries_df = pd.read_csv('data/countries.csv')
staff_df = pd.read_csv('data/staff.csv')
logs = pd.read_csv('data/logs.csv')
logger.info("Модель и данные успешно загружены")

def recommend(user_id, n_items=20):
    user_has_history = user_id in logs['user_id'].values
    logger.info(f"User {user_id}, has_history: {user_has_history}")

    if not user_has_history:
        logger.warning(f"User {user_id} has no watch history, returning popular movies.")
        popularity = logs.groupby('movie_id')['duration'].sum().reset_index()
        popular_movies = popularity.merge(
            movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link', 'year', 'reviews']],
            left_on='movie_id',
            right_on='id',
            how='inner'
        )
        popular_movies = popular_movies.sort_values(by='duration', ascending=False).head(n_items)
        popular_movies = popular_movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link', 'year', 'reviews']]
    else:
        user_idx = dataset.mapping()[0].get(user_id)
        if user_idx is None:
            logger.error(f"User {user_id} found in logs but not in dataset, this should not happen!")
            popularity = logs.groupby('movie_id')['duration'].sum().reset_index()
            popular_movies = popularity.merge(
                movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link', 'year', 'reviews']],
                left_on='movie_id',
                right_on='id',
                how='inner'
            )
            popular_movies = popular_movies.sort_values(by='duration', ascending=False).head(n_items)
            popular_movies = popular_movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link', 'year', 'reviews']]
        else:
            watched_movie_ids = logs[logs['user_id'] == user_id]['movie_id'].unique()
            logger.info(f"User {user_id} watched {len(watched_movie_ids)} movies")

            item_mapping = dataset.mapping()[2]
            watched_item_indices = [
                item_mapping.get(movie_id)
                for movie_id in watched_movie_ids
                if movie_id in item_mapping
            ]
            watched_item_indices = set(idx for idx in watched_item_indices if idx is not None)

            n_items_total = len(item_mapping)
            scores = model.predict(user_idx, np.arange(n_items_total), item_features=item_features)

            valid_indices = [
                i for i in range(n_items_total)
                if i not in watched_item_indices
            ]
            if len(valid_indices) < n_items:
                logger.warning(f"Only {len(valid_indices)} unseen movies available for user {user_id}")
            
            valid_scores = scores[valid_indices]
            top_indices = np.argsort(-valid_scores)[:min(n_items, len(valid_indices))]
            top_items = [valid_indices[i] for i in top_indices]

            reverse_item_mapping = {v: k for k, v in item_mapping.items()}
            recommended_movie_ids = [reverse_item_mapping[item_idx] for item_idx in top_items]

            popular_movies = movies[movies['id'].isin(recommended_movie_ids)][['id', 'name', 'description', 'genres', 'countries', 'staff', 'link', 'year', 'reviews']]

    popular_movies['genres'] = popular_movies['genres'].apply(lambda x: eval(x) if isinstance(x, str) else x)
    popular_movies['countries'] = popular_movies['countries'].apply(lambda x: eval(x) if isinstance(x, str) else x)
    popular_movies['staff'] = popular_movies['staff'].apply(lambda x: eval(x) if isinstance(x, str) else x)
    popular_movies['reviews'] = popular_movies['reviews'].fillna('[]')
    
    # Преобразуем reviews в валидный JSON
    def fix_reviews(reviews_str):
        try:
            reviews_list = eval(reviews_str) if isinstance(reviews_str, str) and reviews_str.strip() else []
            return json.dumps(reviews_list, ensure_ascii=False)
        except Exception as e:
            logger.warning(f"Failed to parse reviews: {reviews_str}, error: {str(e)}")
            return '[]'
    
    popular_movies['reviews'] = popular_movies['reviews'].apply(fix_reviews)
    
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
    
    popular_movies['year'] = popular_movies['year'].apply(clean_year)

    genres_map = dict(zip(genres_df['id'], genres_df['name']))
    countries_map = dict(zip(countries_df['id'], countries_df['name']))
    staff_map = dict(zip(staff_df['id'], staff_df['name']))

    popular_movies['genres'] = popular_movies['genres'].apply(lambda x: [genres_map.get(id, str(id)) for id in x])
    popular_movies['country'] = popular_movies['countries'].apply(lambda x: [countries_map.get(id, str(id)) for id in x])
    popular_movies['actors'] = popular_movies['staff'].apply(lambda x: [staff_map.get(id, str(id)) for id in x])

    return popular_movies[['id', 'name', 'description', 'genres', 'country', 'actors', 'link', 'year', 'reviews']]

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