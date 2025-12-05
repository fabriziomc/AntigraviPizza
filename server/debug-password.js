import dotenv from 'dotenv';

dotenv.config({ path: '.env.mssql' });

// Helper function to strip surrounding quotes from env values
function stripQuotes(value) {
    if (!value) return value;
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    return value;
}

console.log('Raw password:', process.env.DB_PASSWORD);
console.log('Raw password bytes:', Buffer.from(process.env.DB_PASSWORD || '').toString('hex'));
console.log('Stripped password:', stripQuotes(process.env.DB_PASSWORD));
console.log('Stripped password bytes:', Buffer.from(stripQuotes(process.env.DB_PASSWORD) || '').toString('hex'));
console.log('Expected password bytes:', Buffer.from('pass#123').toString('hex'));
