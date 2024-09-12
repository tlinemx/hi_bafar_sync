let ma = require('./marcajes')
let con = require('../BD/DB');
module.exports = {
    send_marcajes: send_marcajes,
    send_marcajes_serie: send_marcajes_serie
};

async function send_marcajes() {
    let resp
    try{
        let q, fullyear,data = [],oficina,i,periodo,oficinas;
        periodo = 1 // periodo de tiempo atras
        q =   `select to_char( current_date -1 , 'DD/MM/YYYY') as date`;
        fullyear = mov = await con.excecute(q);
        fullyear = fullyear.rows[0].date;
        for(i = periodo;i>0;i--){

            q= `select name from res_company where name not in ('Grupo Bafar, S.A.B. de C.V.','No Asignadas','Fundacion')`
            oficinas = await con.excecute(q);
            oficinas = oficinas.rows;

            // oficinas =[{
            //     name:"DPC Monterrey"
            // }]

            for (oficina of oficinas){
                console.log([{ "date":fullyear , "oficina":oficina.name}]);
                resp = await ma.send_to_sap([{ "date":fullyear , "oficina":oficina.name}]);
                data.push(resp);
            }
            resp = data;
        }
    } catch (err) {
        console.log(err)
        return err
    }
    return resp
}

async function send_marcajes_serie() {
    let resp
    try{
        let q, fullyear,data = [],oficina,item,it,periodo = [],oficinas;
        q =   `
        WITH date_series AS (
            SELECT
                generate_series(
                    CURRENT_DATE - interval '15 day',
                    CURRENT_DATE - interval '1 day',
                    interval '1 day'
                )::date AS date
        )
        SELECT
            to_char(date, 'DD/MM/YYYY') AS date
        FROM
            date_series
        ORDER BY
            date desc;
        `;
        fullyear = mov = await con.excecute(q);
        fullyear = fullyear.rows


        q= `select name from res_company where name in (
            'DPC BJS',
            'DPC Cancún',
            'DPC Mérida',
            'DPC Sinaloa',
            'DPC Monterrey',
            'DPC Veracruz',
            'DPC Tampico',
            'DPC Obregón'
        )`
        oficinas = await con.excecute(q);
        oficinas = oficinas.rows;

        for(oficina of oficinas){
            for(item of fullyear){
                periodo.push({ "date":item.date , "oficina":oficina.name})
            }
        }
        

        for(item of periodo){
            // resp = await ma.send_to_sap(item);
            data.push(resp);
        }

        resp = data;
    } catch (err) {
        console.log(err)
        return err
    }
    return resp
}