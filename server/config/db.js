const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'gym_management',
    port: Number(process.env.PGPORT || 5432),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

const query = async (text, params) => {
    const result = await pool.query(text, params);
    return [result.rows, result];
};

const getConnection = async () => {
    const client = await pool.connect();
    return {
        query: async (text, params) => {
            const result = await client.query(text, params);
            return [result.rows, result];
        },
        beginTransaction: async () => client.query('BEGIN'),
        commit: async () => client.query('COMMIT'),
        rollback: async () => client.query('ROLLBACK'),
        release: () => client.release()
    };
};

// Create tables if they don't exist
async function initializeDatabase() {
    try {
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
                    CREATE TYPE subscription_status AS ENUM ('active', 'pending', 'expired');
                END IF;
            END$$;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                user_type VARCHAR(20) NOT NULL DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL DEFAULT 'admin',
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS members (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                status subscription_status DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS class_sessions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(120) NOT NULL,
                coach VARCHAR(120) NOT NULL,
                start_time TIMESTAMP NOT NULL,
                capacity INT NOT NULL DEFAULT 20,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS class_bookings (
                id SERIAL PRIMARY KEY,
                class_session_id INT NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
                member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
                status VARCHAR(20) NOT NULL DEFAULT 'booked',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (class_session_id, member_id)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS member_checkins (
                id SERIAL PRIMARY KEY,
                member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
                checkin_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS member_rewards (
                id SERIAL PRIMARY KEY,
                member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
                points INT NOT NULL DEFAULT 0,
                source VARCHAR(120) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS member_referrals (
                id SERIAL PRIMARY KEY,
                referrer_member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
                referred_email VARCHAR(100) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'invited',
                reward_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                member_id INT REFERENCES members(id) ON DELETE SET NULL,
                member_name VARCHAR(120) NOT NULL,
                plan VARCHAR(80) NOT NULL,
                amount NUMERIC(10, 2) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'Pending',
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS equipment_assets (
                id SERIAL PRIMARY KEY,
                name VARCHAR(140) NOT NULL,
                status VARCHAR(40) NOT NULL DEFAULT 'In service',
                next_check DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS crm_leads (
                id SERIAL PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                stage VARCHAR(80) NOT NULL,
                owner VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS staff_members (
                id SERIAL PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                role VARCHAR(80) NOT NULL,
                shift VARCHAR(80) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS branches (
                id SERIAL PRIMARY KEY,
                name VARCHAR(140) NOT NULL,
                city VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS membership_plans (
                id SERIAL PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                price NUMERIC(10, 2) NOT NULL,
                term VARCHAR(50) NOT NULL,
                perks VARCHAR(200) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS trainers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                specialty VARCHAR(120) NOT NULL,
                rating NUMERIC(3, 1) NOT NULL DEFAULT 4.5,
                availability VARCHAR(120) NOT NULL DEFAULT 'Mon-Fri',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin_action_logs (
                id SERIAL PRIMARY KEY,
                admin_user_id INT REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(120) NOT NULL,
                entity_type VARCHAR(80) NOT NULL,
                entity_id VARCHAR(80),
                details JSONB NOT NULL DEFAULT '{}'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query('CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_member_email ON members(email)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_class_sessions_start_time ON class_sessions(start_time)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_class_bookings_member_id ON class_bookings(member_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_checkins_member_id ON member_checkins(member_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_rewards_member_id ON member_rewards(member_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_referrals_member_id ON member_referrals(referrer_member_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_stage ON crm_leads(stage)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at ON admin_action_logs(created_at)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_membership_plans_name ON membership_plans(name)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_trainers_name ON trainers(name)');

        await pool.query(`
            INSERT INTO class_sessions (title, coach, start_time, capacity)
            SELECT * FROM (
                VALUES
                    ('HIIT Burn', 'Coach Lina', NOW() + INTERVAL '1 day' + INTERVAL '18 hour', 20),
                    ('Core & Mobility', 'Coach Yassine', NOW() + INTERVAL '2 day' + INTERVAL '19 hour', 18),
                    ('Strength Foundations', 'Coach Salma', NOW() + INTERVAL '4 day' + INTERVAL '17 hour', 16)
            ) AS seed(title, coach, start_time, capacity)
            WHERE NOT EXISTS (SELECT 1 FROM class_sessions WHERE start_time > NOW())
        `);

        await pool.query(`
            INSERT INTO equipment_assets (name, status, next_check)
            SELECT * FROM (
                VALUES
                    ('Treadmill #4', 'In service', CURRENT_DATE + 8),
                    ('Rowing Machine #2', 'Maintenance', CURRENT_DATE + 2),
                    ('Cable Station', 'In service', CURRENT_DATE + 11)
            ) AS seed(name, status, next_check)
            WHERE NOT EXISTS (SELECT 1 FROM equipment_assets)
        `);

        await pool.query(`
            INSERT INTO crm_leads (name, stage, owner)
            SELECT * FROM (
                VALUES
                    ('Samir O.', 'Trial booked', 'Amal'),
                    ('Kenza D.', 'Follow-up', 'Hajar'),
                    ('Rami L.', 'Tour scheduled', 'Salim')
            ) AS seed(name, stage, owner)
            WHERE NOT EXISTS (SELECT 1 FROM crm_leads)
        `);

        await pool.query(`
            INSERT INTO staff_members (name, role, shift)
            SELECT * FROM (
                VALUES
                    ('Hajar Ait', 'Front Desk', '07:00 - 15:00'),
                    ('Rachid Karim', 'Coach', '12:00 - 20:00'),
                    ('Nora Aziz', 'Physio', '10:00 - 18:00')
            ) AS seed(name, role, shift)
            WHERE NOT EXISTS (SELECT 1 FROM staff_members)
        `);

        await pool.query(`
            INSERT INTO branches (name, city)
            SELECT * FROM (
                VALUES
                    ('Atlas Gym Downtown', 'Casablanca'),
                    ('Atlas Gym Marina', 'Rabat'),
                    ('Atlas Gym Summit', 'Marrakesh')
            ) AS seed(name, city)
            WHERE NOT EXISTS (SELECT 1 FROM branches)
        `);

        await pool.query(`
            INSERT INTO membership_plans (name, price, term, perks)
            SELECT * FROM (
                VALUES
                    ('Starter', 350, 'Monthly', 'Gym access'),
                    ('Premium', 650, 'Monthly', 'Classes + Gym'),
                    ('Elite', 890, 'Monthly', 'All access + Coach')
            ) AS seed(name, price, term, perks)
            WHERE NOT EXISTS (SELECT 1 FROM membership_plans)
        `);

        await pool.query(`
            INSERT INTO trainers (name, specialty, rating, availability)
            SELECT * FROM (
                VALUES
                    ('Sara Benali', 'HIIT', 4.8, 'Mon/Wed/Fri'),
                    ('Youssef Amine', 'Strength', 4.7, 'Tue/Thu/Sat'),
                    ('Nadia Farah', 'Mobility', 4.9, 'Daily')
            ) AS seed(name, specialty, rating, availability)
            WHERE NOT EXISTS (SELECT 1 FROM trainers)
        `);

        await pool.query(`
            INSERT INTO payments (member_id, member_name, plan, amount, status, due_date)
            SELECT * FROM (
                VALUES
                    (NULL, 'Walk-in Member', 'Premium', 650, 'Pending', CURRENT_DATE + 3),
                    (NULL, 'Drop-in Session', 'Standard', 420, 'Paid', CURRENT_DATE),
                    (NULL, 'Corporate Package', 'Elite', 890, 'Pending', CURRENT_DATE + 5)
            ) AS seed(member_id, member_name, plan, amount, status, due_date)
            WHERE NOT EXISTS (SELECT 1 FROM payments)
        `);

        // Seed default admin user if none exists
        const [adminCheck] = await pool.query(`SELECT 1 FROM users WHERE user_type = 'admin' LIMIT 1`);
        if (adminCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const userResult = await pool.query(
                `INSERT INTO users (first_name, last_name, email, password, user_type) VALUES ($1, $2, $3, $4, 'admin') RETURNING id`,
                ['Admin', 'Atlas', 'admin@atlasgym.ma', hashedPassword]
            );
            await pool.query(
                `INSERT INTO admins (user_id, role) VALUES ($1, 'superadmin')`,
                [userResult.rows[0].id]
            );
            console.log('Default admin created: admin@atlasgym.ma / admin123');
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

initializeDatabase().catch(console.error);

module.exports = { query, getConnection, pool };