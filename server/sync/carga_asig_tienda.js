let con = require('../BD/DB');
let request = require('./fetch');
let odoo = require('./odoo');

module.exports = {
    carga_asig_tienda: carga_asig_tienda
};

async function carga_asig_tienda_() {
    console.log('carga asig tienda')
    let resp,url,query,data,created = [], item,emps,complete = true,num = 0,err_tienda = false,err_empleado = false,
    records = [],
    ids = '',
    err = null,
    exist = false,
    emp,
    sh,
    bafar_employee_stores_Data;
    try{
        url = "https://ux.uxserv.com.mx:4430/neptune/api/hibafar/asociacion_tiendas"
        data = { method: 'GET', headers:  {'Authorization': 'Basic U1lfSElCQUZBUjpTWV9ISUJBRkFSSW5pY2lvLjAxIQ=='}}
        resp = await request.fetch(url, data);
        console.log('paso req')
        for(item of resp.result.IT_ASIG_TDA){
            // if(item.EMPLEADO != ''){            
            emp = item.EMPLEADO
            // sh = await odoo.odoo('hr.employee','search_read',[[['registration_number', '=', emp]]])
            query =`select id from hr_employee where registration_number = '${emp}'` 
            sh = await con.excecute(query);
            sh = sh.rows
            // console.log('longitud empleado: ' + sh.length)
            // console.log(sh)
            if(sh.length > 0)
                item.empleado_id = sh[0].id
            else{
                complete = false
                err_empleado = true
            }
            // console.log(item.empleado_id)
            tienda = item.CLIENTE
            query =`select id from res_partner where store_number = '${tienda}'` 
            sh = await con.excecute(query);
            sh = sh.rows
            // sh = await odoo.odoo('res.partner','search_read',[[['store_number', '=', tienda]]])
            // console.log('longitud tienda: ' + sh.length)
            // console.log(JSON.stringify(sh))
            if(sh.length > 0)
                item.tienda_id = sh[0].id
            else{
                complete = false
                err_tienda = true
            }
            // console.log(item.tienda_id)
            if (!err_empleado && !err_tienda){
                // console.log('entro sin errores ')
                // sh = await odoo.odoo('res.partner','search_read',[[['store_number', '=', tienda]]])
                query =`select id from bafar_employee_stores where employee_id = ${item.empleado_id} and partner_id = ${item.tienda_id}` 
                sh = await con.excecute(query);
                sh = sh.rows
                // exist = true
            }
            
            if(sh.length > 0){
                write_id = sh[0].id
                exist = true
            }

            if(complete){
                if(exist){
                    bafar_employee_stores_Data = {
                        employee_id: item.empleado_id,
                        partner_id: item.tienda_id,
                        visit_monday: item.LUNES,
                        visit_tuesday: item.MARTES,
                        visit_wednesday: item.MIERCOLES,
                        visit_thursday: item.JUEVES,
                        visit_friday: item.VIERNES,
                        visit_saturday: item.SABADO,
                        visit_sunday: item.DOMINGO
                    };
                    // console.log('actualizo')
                    await odoo.odoo('bafar.employee.stores','write',[[write_id], bafar_employee_stores_Data]).then(data=>{ records.push({"status":"Se actualizo la asignacion de la tienda","registration_number":emp,"store_number":tienda }) }).catch(err=>{ records.push({ "status":"error actualizando","registration_number":emp,"store_number":tienda }) })
                    // records.push({"status":"Se actualizo la tienda","registration_number":emp,"store_number":tienda })
                }else{
                    bafar_employee_stores_Data = {
                        employee_id: item.empleado_id,
                        partner_id: item.tienda_id,
                        visit_monday: item.LUNES,
                        visit_tuesday: item.MARTES,
                        visit_wednesday: item.MIERCOLES,
                        visit_thursday: item.JUEVES,
                        visit_friday: item.VIERNES,
                        visit_saturday: item.SABADO,
                        visit_sunday: item.DOMINGO
                    };
                    // console.log('creo')
                    await odoo.odoo('bafar.employee.stores','create',[bafar_employee_stores_Data]).then(data=>{ created.push({ "status":"Se creo la asignacion a la tienda","registration_number":emp,"store_number":tienda }) }).catch(err=>{ created.push({ "status":"error en la creacion","registration_number":emp,"store_number":tienda }) })
                    // created.push({"registration_number":item.registration_number,"message":"Empeado creado"})
                }
            }else{
               if(err_tienda){
                    err = 'error tienda'
               }
               if(err_empleado){
                    err = 'error empleado'
               }
               records.push({"status":err,"registration_number":emp,"store_number":tienda }) 
            }
            exist = false
            complete = true
            err_tienda = false
            err_empleado = false
            num = num + 1
            // }
        }

        resp = records 

        query = "UPDATE bafar_employee_stores SET company_id=subquery.company_id FROM (select id as employee_id , company_id from hr_employee) AS subquery WHERE bafar_employee_stores.employee_id=subquery.employee_id and bafar_employee_stores.company_id is null"
        console.log(query)
        // emps = await con.excecute(query);

    } catch (err) {
        console.log(err)
        // return err
    }
    return resp
}

async function carga_asig_tienda() {
    let resp,url,query,data,created = [], item,asig,id;
    try{
        url = "https://ux.uxserv.com.mx:4430/neptune/api/hibafar/asociacion_tiendas"
        data = { method: 'GET', headers:  {'Authorization': 'Basic U1lfSElCQUZBUjpTWV9ISUJBRkFSSW5pY2lvLjAxIQ=='}}
        query ="TRUNCATE TABLE temp_bafar_employee_stores"
        await con.excecute(query);
        resp = await request.fetch(url, data);
        for(item of resp.result.IT_ASIG_TDA){
            if(item.LUNES == '')item.LUNES = 0
            if(item.MARTES == '')item.MARTES = 0
            if(item.MIERCOLES == '')item.MIERCOLES = 0
            if(item.JUEVES == '')item.JUEVES = 0
            if(item.VIERNES == '')item.VIERNES = 0
            if(item.SABADO == '')item.SABADO = 0
            if(item.DOMINGO == '')item.DOMINGO = 0
            query =`insert into temp_bafar_employee_stores(employee_id,partner_id,registration_number,store_number,visit_monday,visit_tuesday,visit_wednesday,visit_thursday,visit_friday,visit_saturday,visit_sunday) 
            values ((select id from hr_employee where registration_number = '${item.EMPLEADO}'), (select id from res_partner where store_number = '${item.CLIENTE}'limit 1),'${item.EMPLEADO}','${item.CLIENTE}',
            CAST(${item.LUNES} AS boolean),CAST(${item.MARTES} AS boolean),CAST(${item.MIERCOLES} AS boolean),CAST(${item.JUEVES} AS boolean),CAST(${item.VIERNES} AS boolean),CAST(${item.SABADO} AS boolean),CAST(${item.DOMINGO} AS boolean))`;
            await con.excecute(query);
        }
        query ="UPDATE temp_bafar_employee_stores SET id=subquery.id FROM (select id ,employee_id,partner_id from bafar_employee_stores) AS subquery WHERE temp_bafar_employee_stores.employee_id = subquery.employee_id and temp_bafar_employee_stores.partner_id = subquery.partner_id "
        await con.excecute(query);

        query ="select registration_number,store_number,employee_id,partner_id,visit_monday,visit_tuesday,visit_wednesday,visit_thursday,visit_friday,visit_saturday,visit_sunday from temp_bafar_employee_stores where id is null and employee_id is not null and partner_id is not null"
        asig = await con.excecute(query);
        asig = asig.rows
        if(asig.length != 0){
            for(item of asig){
                id = await odoo.odoo('bafar.employee.stores','create',[{
                        "employee_id": item.employee_id,
                        "partner_id": item.partner_id,
                        "visit_monday": item.visit_monday,
                        "visit_tuesday": item.visit_tuesday,
                        "visit_wednesday": item.visit_wednesday,
                        "visit_thursday": item.visit_thursday,
                        "visit_friday": item.visit_friday,
                        "visit_saturday": item.visit_saturday,
                        "visit_sunday": item.visit_sunday
                    }]).then(data=>{ created.push({ "status":"Se creo la asignacion a la tienda","registration_number":item.registration_number,"store_number":item.store_number ,"data":data}) }).catch(err=>{ created.push({ "status":"error en la creacion","registration_number":item.EMPLEADO,"store_number":item.CLIENTE }) })
            }
        }else console.log('no entro')

        resp = created 

        query = "UPDATE bafar_employee_stores SET company_id=subquery.company_id FROM (select id as employee_id , company_id from hr_employee) AS subquery WHERE bafar_employee_stores.employee_id=subquery.employee_id and bafar_employee_stores.company_id is null"
        await con.excecute(query);
        console.log('termino carga asig tienda')
    } catch (err) {
        console.log(err)
        // return err
    }
    return resp
}