'use strict'

const bodyParser = require('body-parser');
var express = require('express')
var http  = require('http');
var app =  express();
 
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


var articleRoutes = require('./routes/article')

app.use('/api', articleRoutes);


module.exports = app;







