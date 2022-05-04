'use strict'
let app = require('./app')

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log('Servidor corriendo correctamente en la url 127.0.0.1:443')
})