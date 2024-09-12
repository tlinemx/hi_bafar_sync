let con = require('../BD/DB');
let request = require('./fetch');
let odoo = require('./odoo');

module.exports = {
    carga_descanso: carga_descanso
};

async function carga_descanso() {
    let resp,url,headers,query,data,created = [], item,errs = [];
    try{
        
        url = "https://gwd.lineamccoy.com.mx/neptune/api/hibafar/vacaciones"
        headers = {
        'Authorization': 'Basic c3lfc212dDpTaXN0ZW1hczEw'
        }

        data = { method: 'GET', headers: headers }
        resp = await request.fetch(url, data);

        for(item of resp.result.IT_VACACIONES){
            query = `update hr_employee set km_home_work = ${item.DIAS_VAC} where id = (select id from hr_employee where registration_number = '${item.EMPLEADO}')`;
            await con.excecute(query).then(data=>{ errs.push({"registration_number":item.EMPLEADO,"message":"Dias actualizados"}) }).catch(err=>{ console.log(err); errs.push({"registration_number":item.EMPLEADO,"message":"err de actualizacion"}) });
            // console.log(query)
        }

        resp = errs

        console.log('termino carga dias')
    } catch (err) {
        console.log(err)
    }
    return resp
}