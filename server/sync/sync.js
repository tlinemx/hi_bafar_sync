let ce = require('./carga_empleados')
let ct = require('./carga_tienda')
let cat = require('./carga_asig_tienda')
let cu = require('./carga_users')

module.exports = {
    sync: sync
};

async function sync() {
    let resp
    try{
        resp = {"carga_empleados": null , "tline_api_carga_tienda": null,"tline_api_carga_asig_tienda": null,"carga_users": null}
        resp.carga_empleados = await ce.carga_empleados()
        resp.tline_api_carga_tienda = await ct.carga_tienda()
        resp.tline_api_carga_asig_tienda = await cat.carga_asig_tienda()
        resp.carga_users = await cu.carga_users()
    } catch (err) {
        console.log(err)
        return err
    }
    return resp
}