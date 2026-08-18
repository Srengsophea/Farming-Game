import { initializeDatabase } from './index';

export async function migrateDatabase() {
  try {
    console.log('Initializing database schema...');
    await initializeDatabase();
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  migrateDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
