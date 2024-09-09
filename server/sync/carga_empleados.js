let con = require('../BD/DB');
let request = require('./fetch');
let odoo = require('./odoo');

module.exports = {
    carga_empleados: carga_empleados
};

async function carga_empleados() {
    let resp,url,headers,query,data,created = [], item,emps;
    try{
        query = `UPDATE bafar_promotoria SET company_id=subquery.company_id 
        FROM (select id as pernr , company_id from hr_employee) AS subquery 
        WHERE bafar_promotoria.pernr=subquery.pernr 
        and bafar_promotoria.company_id <> subquery.company_id`
        await con.excecute(query);
        
        url = "https://ux.uxserv.com.mx:4430/neptune/api/hibafar/promotoria"
        headers = {
        'Authorization': 'Basic U1lfSElCQUZBUjpTWV9ISUJBRkFSSW5pY2lvLjAxIQ=='
        }
        query ="TRUNCATE TABLE temp_hr_employee"
        await con.excecute(query);
        data = { method: 'GET', headers: headers }
        resp = await request.fetch(url, data);

        for(item of resp.result.IT_PROMOTORIA){
            query = `insert into temp_hr_employee(name, work_email, department_id, registration_number, company_id, parent_id, resource_id, coach_id) 
            values ('${item['NOMBRE_EMP'].trim()}', '${item['CORREO']}', (select id from hr_department where name ='Sales' limit 1),
            '${item['NO_EMPLEADO']}', (select id from res_company where name ='${item['OFICINA']}' limit 1), 
            (select id from hr_employee where registration_number ='${item['SUPERVISOR']}' limit 1), 
            (select id from hr_employee where registration_number ='${item['NO_EMPLEADO']}' limit 1), 
            (SELECT e.id from res_company rc inner join res_users ru on split_part(ru.login, '@', 1) = split_part(rc.email, '-', 1) 
            inner join hr_employee e on e.user_id = ru.id where rc.name='${item['OFICINA']}'))`;
            await con.excecute(query);
        }


        query ="select name,work_email,department_id,registration_number,company_id,coach_id from temp_hr_employee as t where resource_id is null and company_id is not null"
        emps = await con.excecute(query);
        emps = emps.rows
        if(emps.length != 0){
            for(item of emps){
                await odoo.odoo('hr.employee','create',[item]).then(data=>{ created.push({"registration_number":item.registration_number,"message":"Empeado creado"}) }).catch(err=>{ console.log(item); created.push({"registration_number":item.registration_number,"message":"err"}) })
            }
        }else created.push({"message":"sin nuevos empleados o empleados no validos"})

        resp = created

        query = "update temp_hr_employee set  parent_id = null , coach_id = null where parent_id = (select id from hr_employee where registration_number = '99999999')"
        emps = await con.excecute(query);
        query ="UPDATE hr_employee SET department_id=subquery.department_id,coach_id=subquery.coach_id, parent_id=subquery.parent_id, company_id=subquery.company_id FROM (  select te.resource_id as id, te.department_id,  te.company_id,  te.coach_id,  te.parent_id  from temp_hr_employee te inner join hr_employee e on e.id = te.resource_id inner join res_users r on r.id =e.user_id where te.company_id is not null and r.active is not false ) AS subquery WHERE hr_employee.id=subquery.id"
        emps = await con.excecute(query);
        console.log('termino carga emp')
    } catch (err) {
        console.log(err)
    }
    return resp
}