const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createMember() {
    try {
        // Check if member already exists
        const result = await db.query(
            'SELECT * FROM members WHERE email = $1',
            ['member@gym.com']
        );

        if (result.rows && result.rows.length > 0) {
            console.log('Member already exists');
            console.log('Email: member@gym.com');
            console.log('Password: member123');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('member123', 10);

        // Create member record
        const memberResult = await db.query(
            `INSERT INTO members (first_name, last_name, email, password)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email`,
            ['John', 'Doe', 'member@gym.com', hashedPassword]
        );

        console.log('Member user created successfully');
        console.log('Email: member@gym.com');
        console.log('Password: member123');
        console.log('Member ID:', memberResult.rows[0].id);
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating member:', error);
        process.exit(1);
    }
}

createMember();
