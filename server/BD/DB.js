const { Pool } = require('pg');

// Configura los detalles de tu conexión
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT, // puerto por defecto de PostgreSQL
});

async function excecute(q) {
  let res,client
  return new Promise(async (resolve, reject) => {
    try {
      client = await pool.connect();
      try {
        res = await client.query(q);
  
      } catch(error){
        reject(error);
      }finally {
        client.release();
      }
    } catch (err) {
      console.error('Error ejecutando la consulta', err.stack);
      reject(err); 
    }
    resolve(res);
  });
}

module.exports = {
  excecute
};
