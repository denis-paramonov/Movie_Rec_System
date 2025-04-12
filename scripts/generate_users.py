import pandas as pd
import psycopg2
import bcrypt
import secrets
import string

# Настройки базы данных
DB_CONFIG = {
    'user': 'app_user',
    'password': 'app_password', 
    'host': 'localhost',
    'dbname': 'app_db',
    'port': '5432'
}

# Функция для генерации случайного пароля
def generate_password(length=12):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

# Чтение logs.csv
logs = pd.read_csv('recommender/data/logs.csv')
unique_users = logs['user_id'].unique()[:500]  # Берем только первые 500 пользователей

# Подключение к базе
conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

# Проверка существующих пользователей
cursor.execute("SELECT user_id FROM users")
existing_users = set(row[0] for row in cursor.fetchall())

# Добавление новых пользователей
added_count = 0
for user_id in unique_users:
    user_id = int(user_id)  # Преобразуем numpy.int64 в int
    if user_id not in existing_users:
        username = f"user_{user_id}"
        plain_password = generate_password()
        password_hash = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute(
            """
            INSERT INTO users (user_id, username, password_hash, plain_password)
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, username, password_hash, plain_password)
        )
        added_count += 1

        # Вывод прогресса каждые 100 пользователей
        if added_count % 100 == 0:
            print(f"Прогресс: добавлено {added_count} пользователей")

# Финальный вывод
print(f"Всего добавлено пользователей: {added_count}")

# Сохранение изменений
conn.commit()

# Закрытие соединения
cursor.close()
conn.close()