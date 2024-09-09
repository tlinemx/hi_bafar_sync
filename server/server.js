require('./config/config');
let con = require('./BD/DB')
let express = require('express');
let cors = require('cors');
let http = require('http');
let cron = require('node-cron');
let sync = require('./sync/sync');
let send = require('./sync/send');
let app = express();

app.use(express.json());

app.use(cors());

app.get('/test',async function(req, res) { let resp = {"status":"online","metod":"test"};res.status(200).json(resp);});

app.get('/',async function(req, res) {
    console.log('entro test')
    let resp = {}
    resp = await send.send_marcajes_serie()
    res.status(200).json(resp);}
);

app.get('/sync',async function(req, res) {
    console.log('entro sync')
    let resp = await sync.sync()
    console.log(resp)
    res.status(200).json(resp);}
);

// cron.schedule('0 10 */1 * * *', async function(){
cron.schedule('0 26 1-23 * * *', async () => {
    console.log('entro sync')
    let data = await sync.sync()
    console.log(data)
});

cron.schedule('0 5 1 * * *', async () => {
    console.log('entro send')
    let data = await send.send_marcajes();
    console.log(data)
});

let httpServer = http.createServer(app);

httpServer.listen(process.env.PORT, () => { console.log(`Env: ${process.env.env} escuchando en puerto:`, process.env.PORT) });

module.exports = app