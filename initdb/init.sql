CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE post (
    post_id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    post_title VARCHAR(255) NOT NULL,
    post_description TEXT,
    post_content TEXT,
    author VARCHAR(255),
    created_at DATE,
    updated_at DATE
);

CREATE TABLE role (
    role_id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE app_user (
    user_id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name VARCHAR(100),
    role_id UUID REFERENCES role (role_id)
);