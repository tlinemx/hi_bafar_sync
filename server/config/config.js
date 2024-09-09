//=========================
//env
//=========================
let env = 'PROD';// DEV -- PROD

let env_info;
if(env=='DEV'){
    env_info={
        "env":env,
        "PORT":5012,
        "DB_HOST":'8.242.195.111',
        "DB_PORT":11020,
        "DB_USER":'curiosity',
        "PASSWORD":'aDj5jjIpq2',
        "DATABASE":'Curiositycdp',
        "url":'promotoriabafardev-dev.paasmx.connectnow.global',
        "username_sup":'curiosity.admin@tline.com',
        "password_sup":'app5y5t3m',
        "db": 'Curiositycdp'
    };

}
if(env=='PROD'){
    env_info={
        "env":env,
        "PORT":5013,
        "DB_HOST":'8.242.195.111',
        "DB_PORT":11040,
        "DB_USER":'curiosity',
        "PASSWORD":'aDj5jjIpq2',
        "DATABASE":'Curiositycdp',
        "url":'promotoriabafardev.paasmx.connectnow.global',
        "username_sup":'curiosity.admin@tline.com',
        "password_sup":'app5y5t3m',
        "db": 'Curiositycdp'
    };
}
//=========================
//puerto
//=========================
process.env.PORT = env_info.PORT;
//=========================
//config BD-DSD
//=========================
process.env.DB_HOST = env_info.DB_HOST;
process.env.DB_PORT =  env_info.DB_PORT;
process.env.DB_USER = env_info.DB_USER;
process.env.PASSWORD = env_info.PASSWORD;
process.env.DATABASE = env_info.DATABASE;
process.env.env = env_info.env; 

process.env.url = env_info.url; 
process.env.username_sup = env_info.username_sup; 
process.env.password_sup = env_info.password_sup; 
process.env.db = env_info.db; 
process.env.Authorization = {'Authorization': 'Basic U1lfSElCQUZBUjpTWV9ISUJBRkFSSW5pY2lvLjAxIQ=='};
