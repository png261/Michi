import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const main = async () => {
    if (!process.env.POSTGRES_URL_CHATBOT) {
        throw new Error('POSTGRES_URL_CHATBOT is not defined');
    }

    const connection = postgres(process.env.POSTGRES_URL_CHATBOT, { max: 1 });
    const db = drizzle(connection);

    // 1️⃣ Run migrations
    console.log('⏳ Running migrations...');
    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    console.log('✅ Migrations completed in', Date.now() - start, 'ms');

    // 2️⃣ Show all tables
    const tables = await connection`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    `;
    console.log('📋 Tables in database:');
    tables.forEach(row => console.log(`- ${row.table_name}`));

    await connection.end();
    process.exit(0);
};

main().catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});

