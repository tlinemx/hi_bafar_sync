const xmlrpc = require('xmlrpc');

// Configuración del servidor Odoo
let odooHost = process.env.url;  // Dirección del servidor Odoo
const odooPort = 8069;  // Puerto del servidor Odoo
let odooDatabase = process.env.db;
let odooUsername = process.env.username_sup;
let odooPassword = process.env.password_sup;
let authClient;
let modelsClient;


module.exports = {
    odoo: odoo 
};

async function odoo_(model,method,params) {
// Crear un cliente XML-RPC para la autenticación
const authClient = xmlrpc.createClient({
    host: odooHost,
    // port: odooPort,
    path: '/xmlrpc/2/common'
  });
  
  // Autenticar el usuario
  authClient.methodCall('authenticate', [odooDatabase, odooUsername, odooPassword, {}], (error, uid) => {
    if (error) {
      console.error('Error en la autenticación:', error);
      return;
    }
  
    console.log('Usuario autenticado con UID:', uid);
  
    // Crear un cliente XML-RPC para llamar a los métodos
    const modelsClient = xmlrpc.createClient({
      host: odooHost,
    //   port: odooPort,
      path: '/xmlrpc/2/object'
    });
  
    // Llamar a un método de Odoo (por ejemplo, buscar registros de res.partner)
    // const model = 'res.company';
    // const method = 'search_read';
    // const params = []; // Filtros y campos a leer
  
    modelsClient.methodCall('execute_kw', [odooDatabase, uid, odooPassword, model, method, params], (error, records) => {
      if (error) {
        console.error('Error al llamar al método:', error);
        return error;
      }
  
    //   console.log('Registros obtenidos:', records);
      return records
    });
  });
}

async function odoo(model,method,params) {
    return new Promise(async(resolve, reject) => {
        // Crear un cliente XML-RPC para la autenticación
        authClient = xmlrpc.createClient({
            host: odooHost,
            path: '/xmlrpc/2/common'
        });
        
        // Autenticar el usuario
        await authClient.methodCall('authenticate', [odooDatabase, odooUsername, odooPassword, {}], async (error, uid) => {
            if (error) {
                console.error('Error en la autenticación:', error);
                reject(error);
            }
        
            // console.log('Usuario autenticado con UID:', uid);
        
            // Crear un cliente XML-RPC para llamar a los métodos
            modelsClient = await xmlrpc.createClient({
                host: odooHost,
                path: '/xmlrpc/2/object'
            });
        
            await modelsClient.methodCall('execute_kw', [odooDatabase, uid, odooPassword, model, method, params], async (error, records) => {
            if(error){
                    console.error('Error al llamar al método:', error);
                    reject(error);
                }
                resolve(records);
            });
        });
    });
}