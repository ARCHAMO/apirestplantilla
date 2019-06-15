'use strict'

var express = require('express');
var UserController = require('../controllers/UserController');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

// Rutas para el controlador de usuarios
api.post('/user/login', UserController.login);
api.post('/user', UserController.create);
api.put('/user/update/:id', md_auth.ensureAuth, UserController.update);
api.post('/user/upload-image/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImagen);
api.get('/user/get-image/:imageFile', UserController.getImagen);
api.get('/users/:page?', md_auth.ensureAuth, UserController.findByAll);
api.get('/user/:id', md_auth.ensureAuth, UserController.findById);
api.delete('/user/:id', md_auth.ensureAuth, UserController.destroy);

module.exports = api;