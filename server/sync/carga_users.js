let con = require('../BD/DB');
let request = require('./fetch');
let odoo = require('./odoo');

module.exports = {
    carga_users: carga_users
};

async function carga_users() {
    let resp,url,headers,query,data,created = [], item,users,write_id,num;
    try{
        if(process.env.env == 'DEV'){
            table = 'temp_res_users_dev'
        }else{
            table = 'temp_res_users'
        }
        url = "https://ux.uxserv.com.mx:4430/neptune/api/hibafar/usuarios"
        headers = {
        'Authorization': 'Basic U1lfSElCQUZBUjpTWV9ISUJBRkFSSW5pY2lvLjAxIQ=='
        }
        query = `TRUNCATE TABLE ${table}`
        resp = await con.excecute(query);
        data = { method: 'GET', headers: headers }
        resp = await request.fetch(url, data);
 
        for(item of resp.result.IT_USUARIOS){
            query = `
        INSERT INTO ${table} 
        (id, login, password, company_id, partner_id, signature, action_id) 
        VALUES (
            (SELECT id FROM res_users WHERE login = '${item['USUARIO']}' LIMIT 1),
            '${item['USUARIO']}',
            '${item['CONTRASENA']}',
            1,
            (SELECT id FROM res_partner WHERE phone = '${item['NUM_EMP']}' LIMIT 1),
            '${item['NUM_EMP']}',
            (SELECT id FROM hr_employee WHERE registration_number = '${item['NUM_EMP']}' LIMIT 1)
        )`;
            await con.excecute(query);
        }

        console.log('paso insert')
        num = 0
        // query ="select t.id,t.login,t.password,t.company_id,t.partner_id,t.signature as employee_number,t.action_id,e.name as employee_name from temp_res_users as t left join hr_employee e on t.action_id = e.id where t.id is null"
        query = `select t.id,t.login,t.password,t.company_id,t.partner_id,t.signature as employee_number,t.action_id as employee_id,e.name as employee_name from ${table}  as t left join hr_employee e on t.action_id = e.id where t.id is null and t.action_id is not null limit 20`
        users = await con.excecute(query);
        users = users.rows
        if(users.length != 0){
            for(item of users){
                console.log('restan'+ (users.length-num))
                if(item.employee_id != null){
                    if(item.partner_id != null){
                        await odoo.odoo('res.users','create',[{
                            "login": item['login'],
                            "password": item['password'],
                            "company_id": item['company_id'],
                            "partner_id": item['partner_id']
                        }]).then(data=>{ created.push({"employee_number":item.employee_number,"message":"Usuario creado"}) }).catch(err=>{ created.push({"employee_number":item.employee_number,"message":"err"}) })
                    }else{
                        write_id =  await odoo.odoo('res.partner','create',[{
                            'name': item.employee_name,
                            'email': item.login,
                            'phone': item.employee_number,
                            'company_id':item.company_id
                        }]).then(data=>{ return data }).catch(err=>{return err })

                        write_id = await odoo.odoo('res.users','create',[{
                            "login": item['login'],
                            "password": item['password'],
                            "company_id": item['company_id'],
                            "partner_id": write_id
                        }]).then(data=>{ created.push({"status":"Usuario y partner  creado","employee_number":item.employee_number }); return data }).catch(err=>{created.push({ "status":"error actualizando","employee_number":item.employee_number,"message":err }); return err })
                        // [[item.employee_id], {'user_id': write_id}]
                        // await odoo.odoo('hr.employee','write',[[item.employee_id],{'user_id': write_id}]).then(data=>{ created.push({"status":"Usuario y partner  creado","employee_number":item.employee_number }) }).catch(err=>{ created.push({ "status":"error actualizando","employee_number":item.employee_number,"message":err }) })
                        query = `UPDATE hr_employee SET user_id=${write_id} where id = ${item.employee_id}`  
                        await con.excecute(query);
                    }
                }else created.push({"employee_number":item.employee_number,"message":"No existe empleado"})
                num ++
            }
        }else console.log('no entro')

        resp = created

        query = "UPDATE res_users SET company_id=subquery.company_id FROM (select user_id as id , company_id from hr_employee) AS subquery WHERE res_users.id=subquery.id and create_date>current_date - 1;"  
        await con.excecute(query);
        query = "update res_users set active = false where login not in ('99999999@bafar.com.mx','D008@bafar.com.mx','ptalamantes@bafar.com.mx','D014@bafar.com.mx','D002@bafar.com.mx','D003@bafar.com.mx','D006@bafar.com.mx','D025@bafar.com.mx','D007@bafar.com.mx','D018@bafar.com.mx','D017@bafar.com.mx','D013@bafar.com.mx','D011@bafar.com.mx','D026@bafar.com.mx','D020@bafar.com.mx','D012@bafar.com.mx','D001@bafar.com.mx','D009@bafar.com.mx','D019@bafar.com.mx','D000@bafar.com.mx','D010@bafar.com.mx','D016@bafar.com.mx','D015@bafar.com.mx','D005@bafar.com.mx','D021@bafar.com.mx','curiosity.admin@tline.com','D024@bafar.com.mx','dgmartinez@bafar.com.mx')"
        await con.excecute(query);
        query =`UPDATE res_users SET active=subquery.active FROM (select id , active from ${table} ) AS subquery WHERE res_users.id=subquery.id`
        // query = "UPDATE res_users SET active=subquery.active FROM (select id , active from ${table} ) AS subquery WHERE res_users.id=subquery.id"  
        await con.excecute(query);
        query = "update hr_employee set parent_id = null  from( select e.id ,r.active,r.id user_id from hr_employee e inner join res_users r on r.id = e.user_id and r.active = false) as subquery WHERE hr_employee.id=subquery.id"  
        await con.excecute(query);
        query = "update bafar_ubicacion set company_id=subquery.company_id FROM (select id as employee_id,  company_id  from hr_employee) AS subquery WHERE bafar_ubicacion.employee_id=subquery.employee_id and bafar_ubicacion.company_id is null"
        await con.excecute(query);
        query = "update res_users set active = true where company_id = (select id from res_company where name = 'Fundacion')"
        await con.excecute(query);
        query = "UPDATE bafar_promotoria SET company_id=subquery.company_id FROM (select id as pernr , company_id from hr_employee) AS subquery WHERE bafar_promotoria.pernr=subquery.pernr and bafar_promotoria.company_id <> subquery.company_id"
        await con.excecute(query);
        console.log('termino carga users')
    } catch (err) {
        console.log(err)
    }
    return resp
}