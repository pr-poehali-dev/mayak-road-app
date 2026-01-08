-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    photo_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    events_created INTEGER DEFAULT 0,
    helpful_reports INTEGER DEFAULT 0,
    push_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы событий на дороге
CREATE TABLE IF NOT EXISTS road_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('accident', 'ice', 'snow', 'repair', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска по координатам
CREATE INDEX IF NOT EXISTS idx_road_events_coordinates ON road_events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_road_events_created_at ON road_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_road_events_user_id ON road_events(user_id);

-- Таблица для отметок "полезно"
CREATE TABLE IF NOT EXISTS event_votes (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES road_events(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Таблица для push-подписок
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);
