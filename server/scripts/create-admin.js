const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createAdmin() {
    try {
        // Check if admin already exists
        const [existingAdmin] = await db.query(
            'SELECT u.* FROM users u JOIN admins a ON u.id = a.user_id WHERE u.email = $1',
            ['admin@gym.com']
        );

        if (existingAdmin.length > 0) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Hash password (default password: admin123)
            const hashedPassword = await bcrypt.hash('admin123', 10);

            // Create admin user
            const [userRows] = await connection.query(
                `INSERT INTO users (
                    first_name,
                    last_name,
                    email,
                    password,
                    user_type
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING id`,
                ['Admin', 'User', 'admin@gym.com', hashedPassword, 'admin']
            );

            // Create admin record
            await connection.query(
                'INSERT INTO admins (user_id, role) VALUES ($1, $2)',
                [userRows[0].id, 'super_admin']
            );

            await connection.commit();
            console.log('Admin user created successfully');
            console.log('Email: admin@gym.com');
            console.log('Password: admin123');
            process.exit(0);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

// Run the function
createAdmin(); 