const { Client } = require('pg');

async function createConnection() {

const pgSql = new Client({
    host: 'sis-lms-db.cr1qfhlnzvjy.us-east-1.rds.amazonaws.com',
    user: 'postgres',
    password: 'Teqsis454',
    database: 'test-sis-lms',
    port: 5432
  });
  
 await pgSql.connect();
 return pgSql;  
}

module.exports = { createConnection };
