-- Create admin user with hashed password (password: admin123)
WITH new_user AS (
    INSERT INTO users (
        first_name,
        last_name,
        email,
        password,
        user_type,
        created_at,
        updated_at
    ) VALUES (
        'Admin',
        'User',
        'admin@gym.com',
        '$2a$10$rYOGUzgqwAMkrAOg8JvyYuXqr0zS4KvX4qdh.6tqhCE4Y/y6G5.Ym',
        'admin',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO admins (user_id, role)
SELECT id, 'super_admin' FROM new_user;