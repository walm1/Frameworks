'use strict'

var mongoose = require('mongoose');
var app = require("./app")
var url = 'mongodb://localhost:27017/dbwal'
var port = 3080;


mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log('conexion hecha correctamente');

    app.listen(port, () =>{
        console.log("servidor corriendo en localhost: " + port);
    });
});

