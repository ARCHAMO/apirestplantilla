'use strict';

var fs = require('fs');
var path = require('path');
var User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');

function create(req, res) {
    var user = new User();
    var params = req.body;

    user.primerNombre = params.primerNombre;
    user.segundoNombre = params.segundoNombre;
    user.primerApellido = params.primerApellido;
    user.segundoApellido = params.segundoApellido;
    user.email = params.email;
    user.image = 'null';
    user.rol = 'Operador';

    if (params.password){
        //Encritamos el paswwordc
        bcrypt.hash(params.password, saltRounds, function (err, hash) {
            user.password = hash;
            if(user.primerNombre != null && user.primerApellido != null && user.email != null) {
                user.save((err, userStored) => {
                    if(err){
                        console.log(err);
                        res.status(500).send({
                            message: 'Error al guardar el usuario'
                        });
                    } else {
                        if(!userStored){
                            res.status(404).send({
                                message: 'No se ha registrado el usuario'
                            });
                        } else {
                            res.status(200).send({
                                user: userStored
                            });
                        }
                    }
                });
            } else {
                res.status(200).send({
                    message: 'Rellena tados los campos'
                });
            }
        })
    } else {
        res.status(500).send({
            message: 'Introduzca la contraseña'
        });
        user.password = params.password;
    }
}

function login(req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({
       email: email.toLowerCase()
    }, (err, user) => {
        if(err){
            res.status(500).send({
               message: 'Error en la peticion.'
            });
        } else {
            if(!user) {
                res.status(404).send({
                    message: 'Usuario no existe.'
                });
            }else {
                bcrypt.compare(password, user.password, function (err, check) {
                    if(check){
                        if(params.gethash){
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {
                            res.status(200).send({
                                user
                            });
                        }
                    } else {
                        res.status(404).send({
                            message: 'Usuario y/o contraseña incorrecta..'
                        });
                    }
                });
            }
        }
    });
}

function update(req, res) {
    var userId = req.params.id;
    var updateParams = req.body;

    User.findByIdAndUpdate(userId, updateParams, (err, userUpdate) => {
        if(err){
            res.status(500).send({
               message: 'Error al actualizar el usuario'
            });
        } else {
            if(!userUpdate){
                res.status(404).send({
                    message: 'No se ha podido actualizar el usuario'
                });
            } else {
                res.status(200).send({
                    user: userUpdate
                });
            }
        }
    });
}

function uploadImagen(req, res) {
    var userId = req.params.id;
    var fileName = 'No subido';

    if(req.files){
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];
        console.log(fileExt.lowercase);

        if(fileExt.toLowerCase() == 'png' || fileExt.toLowerCase() == 'jpg' || fileExt.toLowerCase() == 'gif'){
            User.findByIdAndUpdate(userId, {image: fileName}, (err, userUpdate) => {
                if(!userUpdate){
                    res.status(404).send({
                        message: 'No se ha podido actualizar el usuario'
                    });
                } else {
                    res.status(200).send({
                        user: userUpdate,
                        image: fileName
                    });
                }
            });
        } else {
            res.status(200).send({message: 'Extension de archivo no valida.'})
        }
    } else {
        res.status(200).send({
           message: 'No has subido ninguna imagen.'
        });
    }
}

function getImagen(req, res) {
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/users/' + imageFile;
    fs.exists(pathFile, function (exists) {
        if(exists){
            res.sendFile(path.resolve(pathFile));
        } else {
            res.status(200).send({message: 'No existe imagen con ese nombre...'})
        }
    })
}

function findByAll(req, res){
    if(req.params.page){
        var page = req.params.page;
    } else {
        var page = 1;
    }
    var itemsPerPage = 3;

    User.find().sort('primerApellido').paginate(page, itemsPerPage, function (error, users, total) {
        if(error){
            res.status(500).send({message: 'Error en la peticion'});
        } else {
            if(!users){
                res.status(404).send({message: 'No hay usuarios registrados'});
            } else {
                return res.status(200).send({
                    items: total,
                    users: users
                });
            }
        }
    })
}

function findById(req, res) {
    var userId = req.params.id;

    User.findById(userId, (error, user) => {
       if(error){
           res.status(500).send({message: 'Error en la peticion.'});
       } else {
           if(!user){
               res.status(404).send({message: 'El artista no existe.'});
           } else {
               res.status(500).send({user});
           }
       }
    });
}

function destroy(req, res) {
    var userId = req.params.id;

    User.findByIdAndRemove(userId, function (error, userRemove) {
       if(error){
           res.status(500).send({message: 'Error eliminando el usuario.'});
       } else {
           if(!userRemove) {
               res.status(404).send({message: 'El usuario no existe.'});
           } else {
               res.status(200).send({userRemove});
           }
       }
    });
}

module.exports = {
    create,
    login,
    update,
    uploadImagen,
    getImagen,
    findByAll,
    findById,
    destroy
};