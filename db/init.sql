-- SportDuel PostgreSQL initialization script

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    disc VARCHAR(20) NOT NULL
        CHECK (disc IN ('steps', 'run', 'bike', 'ebike', 'gym', 'physio', 'circus', 'free')),
    value NUMERIC(10,2) DEFAULT 0,
    points NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    note TEXT DEFAULT '',
    photo TEXT,
    together BOOLEAN DEFAULT FALSE,
    initiator BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, subscription)
);
