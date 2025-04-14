import pandas as pd

# Читаем movies.csv
movies = pd.read_csv('recommender/models/movies.csv')

# Добавляем столбец link с фиксированной стоковой ссылкой
stock_image = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
movies['link'] = stock_image

# Сохраняем обновлённый файл
movies.to_csv('recommender/data/movies.csv', index=False)

print("Поле link добавлено в movies.csv")
