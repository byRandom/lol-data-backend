'use strict'

let express = require('express')
let bodyParser = require('body-parser')

let app = express()


//Archivos rutas
let lolApi_routes = require('./routes/lolApi')

//middlewares

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//CORS
app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', 'https://oploldata.netlify.app');
    // res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
})

//rutas

app.use('/api', lolApi_routes)

app.post('/test', (req, res) =>{
    console.log(req.body)
    console.log(req.query.web)
    res.status(200).send({
        message: 'Hola Mundo desde la api de lol de Tomas'
    })
})
//Exports
module.exports = app