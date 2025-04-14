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
logs = pd.read_csv('data/logs.csv')  # Для проверки истории
logger.info("Модель и данные успешно загружены")

def recommend(user_id, n_items=20):
    # Проверяем, есть ли пользователь в logs.csv
    user_has_history = user_id in logs['user_id'].values
    logger.info(f"User {user_id}, has_history: {user_has_history}")

    if not user_has_history:
        logger.warning(f"User {user_id} has no watch history, returning popular movies.")
        # Выбираем топ-20 по сумме duration
        popularity = logs.groupby('movie_id')['duration'].sum().reset_index()
        popular_movies = popularity.merge(
            movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link']],
            left_on='movie_id',
            right_on='id',
            how='inner'
        )
        popular_movies = popular_movies.sort_values(by='duration', ascending=False).head(n_items)
        popular_movies = popular_movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link']]
    else:
        user_idx = dataset.mapping()[0].get(user_id)
        if user_idx is None:
            logger.error(f"User {user_id} found in logs but not in dataset, this should not happen!")
            # Возвращаем популярные фильмы как запасной вариант
            popularity = logs.groupby('movie_id')['duration'].sum().reset_index()
            popular_movies = popularity.merge(
                movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link']],
                left_on='movie_id',
                right_on='id',
                how='inner'
            )
            popular_movies = popular_movies.sort_values(by='duration', ascending=False).head(n_items)
            popular_movies = popular_movies[['id', 'name', 'description', 'genres', 'countries', 'staff', 'link']]
        else:
            # Получаем просмотренные фильмы
            watched_movie_ids = logs[logs['user_id'] == user_id]['movie_id'].unique()
            logger.info(f"User {user_id} watched {len(watched_movie_ids)} movies")

            # Получаем внутренние индексы фильмов
            item_mapping = dataset.mapping()[2]
            watched_item_indices = [
                item_mapping.get(movie_id)
                for movie_id in watched_movie_ids
                if movie_id in item_mapping
            ]
            watched_item_indices = set(idx for idx in watched_item_indices if idx is not None)

            # Предсказываем для всех фильмов
            n_items_total = len(item_mapping)
            scores = model.predict(user_idx, np.arange(n_items_total), item_features=item_features)

            # Исключаем просмотренные фильмы
            valid_indices = [
                i for i in range(n_items_total)
                if i not in watched_item_indices
            ]
            if len(valid_indices) < n_items:
                logger.warning(f"Only {len(valid_indices)} unseen movies available for user {user_id}")
            
            # Сортируем по скорам только непросмотренные фильмы
            valid_scores = scores[valid_indices]
            top_indices = np.argsort(-valid_scores)[:min(n_items, len(valid_indices))]
            top_items = [valid_indices[i] for i in top_indices]

            # Преобразуем в movie_id
            reverse_item_mapping = {v: k for k, v in item_mapping.items()}
            recommended_movie_ids = [reverse_item_mapping[item_idx] for item_idx in top_items]


            popular_movies = movies[movies['id'].isin(recommended_movie_ids)][['id', 'name', 'description', 'genres', 'countries', 'staff', 'link']]

    # Обработка genres, countries, staff
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
