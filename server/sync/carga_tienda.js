let con = require('../BD/DB');
let request = require('./fetch');
let odoo = require('./odoo');

module.exports = {
    carga_tienda: carga_tienda
};

async function carga_tienda() {
    let resp,url,headers,query,data,created = [], item,emps,regex = /^[0-9.]+$/;
    try{
        url = "https://ux.uxserv.com.mx:4430/neptune/api/hibafar/tiendas"
        headers = {
        'Authorization': 'Basic U1lfSElCQUZBUjpTWV9ISUJBRkFSSW5pY2lvLjAxIQ=='
        }
        query ="TRUNCATE TABLE temp_res_partner"
        resp = await con.excecute(query);
        data = { method: 'GET', headers: headers }
        resp = await request.fetch(url, data);

        for(item of resp.result.IT_TIENDAS){
            if (item['LATITUD'] === '') {
                item['LATITUD'] = 'null';
            } else {
                // item['LATITUD'] = String(item['LATITUD']);
                if(regex.test(item.LATITUD))
                    item['LATITUD'] = item['LATITUD'].replace(/,/g, '');
                else
                item['LATITUD'] = 'null'
            }
            
            if (item['LONGITUD'] === '') {
                item['LONGITUD'] = 'null';
            } else {
                // item['LONGITUD'] = String(item['LONGITUD']);
                if(regex.test(item.LATITUD)) 
                    item['LONGITUD'] = item['LONGITUD'].replace(/,/g, '');
                else
                item['LONGITUD'] = 'null'
            }
            query = `
            insert into temp_res_partner 
            (name, company_id, street, partner_latitude, partner_longitude, store_number, sap_reference, user_id) 
            values (
                '${item['NOMBRE_TDA'].replace(/'/g, " ")}',
                (select id from res_company where name ='${item['OFICINA']}' limit 1),
                '${item['DIRECCION']}',
                ${item['LATITUD'].trim()},
                ${item['LONGITUD'].trim()},
                '${item['ID_TIENDA']}',
                '${item['ID_SAP']}',
                (select id from res_partner where store_number = '${item['ID_TIENDA']}' limit 1)
            )`;
            await con.excecute(query);
        }


        query = "select name,company_id,street,partner_latitude,partner_longitude,store_number,sap_reference from temp_res_partner as t where user_id is null"
        emps = await con.excecute(query);
        emps = emps.rows
        if(emps.length != 0){
            for(item of emps){
                await odoo.odoo('res.partner','create',[item]).then(data=>{ created.push({"store_number":item.store_number,"message":"Tienda creada"}) }).catch(err=>{ created.push({"store_number":item.store_number,"message":"err"}) })
            }
        }else console.log('no entro')

        resp = created


        query = "UPDATE res_partner SET partner_latitude=subquery.partner_latitude,partner_longitude=subquery.partner_longitude,company_id=subquery.company_id FROM (select user_id as id,partner_latitude,partner_longitude,company_id  from temp_res_partner) AS subquery WHERE res_partner.id=subquery.id"
        emps = await con.excecute(query);
        query ="UPDATE res_partner SET customer_rank = 1 FROM (select user_id as id  from temp_res_partner) AS subquery WHERE res_partner.id=subquery.id and customer_rank = 0"
        emps = await con.excecute(query);
        console.log('termino carga tienda')
    } catch (err) {
        console.log(err)
    }
    return resp
}