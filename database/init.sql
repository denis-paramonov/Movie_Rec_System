CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL
);

-- Пример пользователя (пароль: "password123" зашифрован через bcrypt)
INSERT INTO users (username, password_hash) 
VALUES ('user1', '$2b$12$GX3BIrecomOBcATyINN3q.ePycT/Av4lg4hbH3fTkNa9nCmsWWEPW');
