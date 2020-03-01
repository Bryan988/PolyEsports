let jwt = require('jsonwebtoken');
let key = require('../config/key');
const Users = require("../models/usersModel");
let secretkey=key.secretkey;

//this function informs wether the date entered is past or not, comparing to today.
//false means that the date is already past

exports.checkPastDate = function(newDate) {
    let today = new Date(Date.now());
    if (newDate.getFullYear() < today.getFullYear()) {
        return false;
    } else {

        if (newDate.getMonth() < today.getMonth()) {
            return false;
        } else {
            if (newDate.getMonth()===today.getMonth()) {
                if (newDate.getDate() < today.getDate()) {
                    return false;
                }
                else{
                    return true;
                }
            }else{
                return true;
            }
        }
    }
};

exports.sanitizeBody=function(req){
    const body = req.body;
    let retour = {};
    for(const parameters in body){
        retour[parameters]=req.sanitize(body[parameters]);
    }
    return retour;
};

exports.setCookie = function(res,name,value){
    return res.cookie(name,value,{maxAge : 3*1000,httpOnly: true});
};
exports.getCookie = function(req,name){
    if(typeof req.cookies !=='undefined'){
        return req.cookies[name];
    }
    else{
        return undefined;
    }
};

exports.getUserId = function (req){
    let token = this.getCookie(req,'token');
    let playload = jwt.verify(token,secretkey);
    return playload.id;
};

exports.userIsAdmin = function(req){
    let token = this.getCookie(req,'token');
    let playload = jwt.verify(token,secretkey);
    return playload.isAdmin;
};

exports.userIsLogged = function(req){
    let token = this.getCookie(req,'token');
    if(typeof token !=='undefined') {
        let playload = jwt.verify(token, secretkey);
        return typeof playload !== 'undefined';
    }
    else{return false}
};

exports.isAdminLogged = function(req){
    let logged = this.userIsLogged(req);
    let isAdmin;
    if(logged){
        isAdmin=this.userIsAdmin(req);
    }
    return {logged,isAdmin};
};
