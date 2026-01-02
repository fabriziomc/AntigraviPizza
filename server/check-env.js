import dotenv from 'dotenv';

dotenv.config({ path: '.env.mssql' });

console.log('Environment variables loaded from .env.mssql:');
console.log('=====================================');
console.log('DB_TYPE:', process.env.DB_TYPE);
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('PORT:', process.env.PORT);
console.log('=====================================');

// Check for hidden characters
console.log('\nChecking for hidden characters:');
console.log('DB_SERVER length:', process.env.DB_SERVER?.length);
console.log('DB_SERVER bytes:', Buffer.from(process.env.DB_SERVER || '').toString('hex'));
console.log('DB_USER length:', process.env.DB_USER?.length);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length);
