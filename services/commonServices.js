let jwt = require('jsonwebtoken');
let key = require('../config/key');
let secretkey=key.secretkey;
const nodemail = require('nodemailer');
const infomail = require('../config/mail');

let transporter = nodemail.createTransport({
    service: 'gmail',
    auth:{
        user: infomail.mail,
        pass: infomail.pw,
    }
});


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
                return newDate.getDate() >= today.getDate();
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
exports.correctString = function(text){
    return text.replace(/\W /g, "_");
};
exports.writeAndSend = function(res,code){
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ status: code }));
    res.end();
};
exports.makeid=function(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

exports.sendVerifMail = function(mail,code){
    const mailOption = {
        to: mail,
        subject: "Mail Verification",
        text: code,
        html: "<h3>" + code + "</h3>"
    };
    transporter.sendMail(mailOption,(err)=>{
        if(err){
            console.log(err);
        }
    });

};