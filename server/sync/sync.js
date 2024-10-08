let ce = require('./carga_empleados')
let ct = require('./carga_tienda')
let cat = require('./carga_asig_tienda')
let cu = require('./carga_users')
let d = require('./carga_dias')

module.exports = {
    sync: sync
};

async function sync() {
    let resp
    try{
        resp = {"carga_empleados": null , "tline_api_carga_tienda": null,"tline_api_carga_asig_tienda": null,"carga_users": null,"tline_api_dias": null}
        resp.carga_empleados = await ce.carga_empleados()
        resp.tline_api_carga_tienda = await ct.carga_tienda()
        resp.tline_api_carga_asig_tienda = await cat.carga_asig_tienda()
        resp.carga_users = await cu.carga_users()
        // resp.tline_api_dias = await d.carga_descanso()
    } catch (err) {
        console.log(err)
        return err
    }
    return resp
}