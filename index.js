'use strict'
let app = require('./app')
let mongoose = require("mongoose");
const PORT = process.env.PORT || 5000
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
mongoose
    .connect("mongodb://127.0.0.1:27017/lolData", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Conexion a la base de datos establecida con exito.");
        app.listen(PORT, ()=>{
            console.log('Servidor corriendo correctamente en la url 127.0.0.1:' + PORT)
        })
    })
    .catch(err => console.log(err));


