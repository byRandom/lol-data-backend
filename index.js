'use strict'
let app = require('./app')

let port = 3700

app.listen(port, ()=>{
    console.log('Servidor corriendo correctamente en la url 127.0.0.1:3700')
})