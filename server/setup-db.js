const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

async function setupDatabase() {
    const client = new Client({
        host: process.env.PGHOST || 'localhost',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'gym_management',
        port: Number(process.env.PGPORT || 5432)
    });

    try {
        await client.connect();

        const schema = await fs.readFile(
            path.join(__dirname, '..', 'database', 'schema.sql'),
            'utf8'
        );

        const statements = schema
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        for (const statement of statements) {
            try {
                await client.query(statement);
                console.log('Executed:', statement.substring(0, 50) + '...');
            } catch (error) {
                const message = error && error.message ? error.message : '';
                if (message.includes('already exists')) {
                    continue;
                }
                throw error;
            }
        }

        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await client.end();
    }
}

setupDatabase();