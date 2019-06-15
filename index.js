'use strict'

var mongoose = require('mongoose');

var urlDbNube = 'mongodb://desa:Desa820901*!@' +
    'cluster0-shard-00-00-rqr9q.mongodb.net:27017,' +
    'cluster0-shard-00-01-rqr9q.mongodb.net:27017,' +
    'cluster0-shard-00-02-rqr9q.mongodb.net:27017/admin?' +
    'ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';

var urlDbLocal = 'mongodb://localhost:27017/chat-interno';
var app = require('./app');
var port = process.env.PORT || 3977;

mongoose.connect(urlDbLocal, (err, res) => {
    if(err) {
        throw err;
    } else {
        console.log('La conexion a la base de datos esta corriendo correctamente...');
        app.listen(port, function () {
            console.log('Servidor escuchando en http://localhost:'+port);
        })
    }
});
