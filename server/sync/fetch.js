let fetch = require('node-fetch');
module.exports = {
    fetch: request
};

async function request(url,data) {
    try{
        
        resp = await fetch(url, data)
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // console.log('Datos recibidos:', data);
            return data
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud Fetch:', error);
            return error
        });
    } catch (err) {
        return err
    }
    return resp
}