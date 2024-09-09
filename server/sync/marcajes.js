let con = require('../BD/DB');
let request = require('./fetch');
let odoo = require('./odoo');

module.exports = {
    send_to_sap: send_to_sap
};

async function send_to_sap(body){
    let resp,query,results =[],item,pak_env =[],data, str1="",updates = [],id_rec,n,ele,dates,oficina,mov,result,row,it,status,payload;
    for(item of body){
        mov = []
        dates = item['date']
        oficina = item['oficina']
        query = `
        SELECT e.registration_number as pernr,b.idate as ldate,MIN(itime) AS itime_1,MAX(itime) AS itime_2,
        700 as terid FROM bafar_promotoria as b inner join hr_employee e on b.pernr=e.id 
        where estatus_envio is null and b.company_id = (select id from res_company where name ='${oficina}' limit 1) 
        and idate = '${dates}' GROUP BY e.registration_number,idate ORDER BY registration_number`;
        mov = await con.excecute(query);
        mov = mov.rows

        pak_env =[]

        for(ele of mov){
            if(ele.itime_1 != ele.itime_2){
                pak_env.push({"pernr":ele.pernr,"ldate":ele.ldate,"ltime":ele.itime_1,"terid":"700"})
                pak_env.push({"pernr":ele.pernr,"ldate":ele.ldate,"ltime":ele.itime_2,"terid":"700"})
            }
        }

        console.log(`${pak_env.length} registros enviados.`)

        url = "https://ux.uxserv.com.mx:4430/neptune/public/api/records/send_records"
        headers = {
        'Authorization': 'Basic U1lfSElCQUZBUjpTWV9ISUJBRkFSSW5pY2lvLjAxIQ==',
        'Content-Type': 'application/json'
        }

        payload = [{
            "KEY": "IT_RECORDS",
            "VALUE": JSON.stringify(pak_env)
        }]
        data = { method: 'POST', headers: headers ,body: JSON.stringify(payload)}

        result = await request.fetch(url, data);  ///prod

        // console.log(data)
        // console.log(url)
        // result = {"result": {"RESPONSE": {"CODE": "001","MESSAGE": "Registros guardados con éxito"}}} //test


        // console.log(result)
        str1=""
        updates = []
        id_rec = ""
        n=0
        for(ele of pak_env){
            query = `select id from bafar_promotoria 
            where pernr in (select id from hr_employee where registration_number = '${ele.pernr}') 
            and idate like '${ele.ldate}' and itime like '${ele.ltime}'`;
            row = await con.excecute(query);
            row = row.rows
            for(it of row){
                if(n<1){
                    id_rec +=  `${it.id}`
                }
                if(n>0){
                    id_rec += `,${it.id}`;
                }
                n+=1
            }

        }

        if(result.result != undefined){
            status = result.result
            code = `${status.RESPONSE.CODE}`
            message =`${status.RESPONSE.MESSAGE}`
            if(code == '001'){
                query = `UPDATE bafar_promotoria SET estatus_envio='${message}', error_envio='${code}' WHERE id in (${id_rec})`;
                // q='UPDATE bafar_promotoria SET estatus_envio='+"'"+f'{message}'+"'"+f', error_envio={code} WHERE id in ({id_rec})'
            }else{
                query = `UPDATE bafar_promotoria SET estatus_envio='${message}', error_envio='${code}' WHERE id in (${id_rec})`;
                // q='UPDATE bafar_promotoria SET estatus_envio='+"'"+f'{message}'+"'"+f', error_envio={code} WHERE id in ({id_rec})'
            }

        }else{
            code = `Error no soportado`;
            data =result
            query = `UPDATE bafar_promotoria SET estatus_envio='${data}', error_envio='${code}' WHERE id in (${id_rec})`;
        }
        // console.log(query)
        await con.excecute(query);
        resp = `${pak_env.length} registros enviados.`
        result = {"resp":resp,"status":status,"oficina":body[0].oficina}
        results.push(result)
        pak_env = []

    }
    resp = result
    return resp
}

async function send_to_sap_interval(body){
    let resp,query,results =[],item,pak_env =[],data, str1="",updates = [],id_rec,n,ele,dates,oficina,mov,result,row,it,status,payload;
        let stat

        mov = []
        dates = item['date']
        oficina = item['oficina']
        query = `
        select * from (
            SELECT e.registration_number as pernr,b.idate as ldate,MIN(itime) AS itime_1,MAX(itime) AS itime_2,
            700 as terid FROM bafar_promotoria as b inner join hr_employee e on b.pernr=e.id 
            where b.company_id = (select id from res_company where name ='${oficina}' limit 1) and idate = '${dates}' 
            GROUP BY e.registration_number,idate ORDER BY registration_number) as query where  itime_1 != itime_2
        `;
        mov = await con.excecute(query);
        mov = mov.rows

        pak_env =[]

        for(ele of mov){
            ele.elements = []
            if(ele.itime_1 != ele.itime_2){
                // pak_env.push({"pernr":ele.pernr,"ldate":ele.ldate,"ltime":ele.itime_1,"terid":"700"})
                ele.elements.push({"pernr":ele.pernr,"ldate":ele.ldate,"ltime":ele.itime_1,"terid":"700","estatus_envio": null,"id": null});

                // pak_env.push({"pernr":ele.pernr,"ldate":ele.ldate,"ltime":ele.itime_2,"terid":"700"})
                ele.elements.push({"pernr":ele.pernr,"ldate":ele.ldate,"ltime":ele.itime_2,"terid":"700","estatus_envio": null,"id": null});
            }
        }


        for(ele of mov){
            for(it of ele.elements){
                stat = 0
                query = `
                select id from hr_employee where registration_number = '${it.s}'
                `;
                mov = await con.excecute(query);
                mov = mov.rows
                employee_id 

            }
        }

        url = "https://ux.uxserv.com.mx:4430/neptune/public/api/records/send_records"
        headers = {
        'Authorization': 'Basic U1lfSElCQUZBUjpTWV9ISUJBRkFSSW5pY2lvLjAxIQ==',
        'Content-Type': 'application/json'
        }

        payload = [{
            "KEY": "IT_RECORDS",
            "VALUE": JSON.stringify(pak_env)
        }]
        data = { method: 'POST', headers: headers ,body: JSON.stringify(payload)}

        // result = await request.fetch(url, data);  ///prod
        console.log(`${pak_env.length} registros enviados.`)
        result = {"result": {"RESPONSE": {"CODE": "001","MESSAGE": "Registros guardados con éxito"}}} //test

        str1=""
        updates = []
        id_rec = ""
        n=0
        for(ele of pak_env){
            query = `select id from bafar_promotoria 
            where pernr in (select id from hr_employee where registration_number = '${ele.pernr}') 
            and idate like '${ele.ldate}' and itime like '${ele.ltime}'`;
            row = await con.excecute(query);
            row = row.rows
            for(it of row){
                if(n<1){
                    id_rec +=  `${it.id}`
                }
                if(n>0){
                    id_rec += `,${it.id}`;
                }
                n+=1
            }

        }

        if(result.result != undefined){
            status = result.result
            code = `${status.RESPONSE.CODE}`
            message =`${status.RESPONSE.MESSAGE}`
            if(code == '001'){
                query = `UPDATE bafar_promotoria SET estatus_envio='${message}', error_envio='${code}' WHERE id in (${id_rec})`;
                // q='UPDATE bafar_promotoria SET estatus_envio='+"'"+f'{message}'+"'"+f', error_envio={code} WHERE id in ({id_rec})'
            }else{
                query = `UPDATE bafar_promotoria SET estatus_envio='${message}', error_envio='${code}' WHERE id in (${id_rec})`;
                // q='UPDATE bafar_promotoria SET estatus_envio='+"'"+f'{message}'+"'"+f', error_envio={code} WHERE id in ({id_rec})'
            }

        }else{
            code = `Error no soportado`;
            data =result
            query = `UPDATE bafar_promotoria SET estatus_envio='${data}', error_envio='${code}' WHERE id in (${id_rec})`;
        }
        // console.log(query)
        await con.excecute(query);
        resp = `${pak_env.length} registros enviados.`
        result = {"resp":resp,"status":status,"oficina":body[0].oficina}
        results.push(result)
        pak_env = []

    
    resp = result
    return resp
}