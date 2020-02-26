const User = require('../models/usersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keyconfig = require('../config/key');
const services = require('../services/userServices');

//store the secret key for jws
const secretkey = keyconfig.secretkey;

const EMAIL_REGEXX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

exports.loginpage= function(req,res){
    let status=req.cookies.status;
    res.render('./users/login',{status,logged:false});
};

exports.login = function(req,res,next){

    //Note that status : 0 = Something is wrong
    //store the form's data
    const data = services.sanitizeBody(req);
    // We then check if the mail is in database
    User.checkMail(data.mail,(result) =>{
        if(typeof result !== 'undefined'){
            if(result.check===true){
                //Check if the password entered match with the one registered
                User.getPw(result.idUser,(hashedPw)=>{
                    bcrypt.compare(data.pw,hashedPw,(err,resp)=>{
                        if(resp) {
                            User.getInfoToken(result.idUser,(infoUser)=>{
                                console.log(infoUser);
                                //first give the jwt token to the user
                                jwt.sign({id: result.idUser, pseudo: infoUser.pseudo, isAdmin: infoUser.isAdmin === 1}, secretkey, {expiresIn: "1d"}, (err, token) => {
                                    if (token === 'undefined') {
                                        res.redirect('/users/login');
                                    }else {
                                        res.cookie('token', token);
                                        if (infoUser.isAdmin === 1) {
                                            res.redirect("/users/admin")
                                        } else {
                                            res.redirect("/");
                                        }
                                    }
                                });
                            });
                        }
                        else{
                            res.cookie('status',0,{ maxAge: 1 * 1000});
                            res.redirect('/users/login');
                        }
                    });
                });
            }
            else{
                res.cookie('status',0,{ maxAge: 1 * 1000});
                res.redirect('/users/login');
            }
        }
        else {
            res.cookie('status',0,{ maxAge: 1 * 1000, httpOnly: true });
            res.redirect('/users/login');
        }
    });
};

exports.signupPage = function(req,res){
    // return the corresponding page with variables initialized to undefined
    //Note that errorNb : 0 = mails are not matching
    // 1 = passwords are not matching
    // 2 = mail is already in database
    let errorNb=req.cookies.errorNb;

    res.render('./users/signup',{errorNb,logged:false});
};
exports.signup = function(req,res){
    // store the form's data
    const newUser = services.sanitizeBody(req);
    if (EMAIL_REGEXX.test(newUser.mail) && typeof newUser.name !=='undefined' && typeof newUser.fname!=='undefined' && typeof newUser.pseudo!=='undefined' && typeof newUser.mail !=='undefined' && typeof newUser.mdp!=='undefined'){
        //Hashing the password
        const hashedPw = bcrypt.hashSync(newUser.mdp, 10);
        if (newUser.mail === newUser.confmail) {
            //We check if the mail is available in database
            User.checkMail(newUser.mail, (okmail)=>{
                if (okmail === undefined) {
                    //Here, the confmdp will be compare to the hashed password
                    bcrypt.compare(newUser.confmdp, hashedPw, function (err, data) {
                        //console.log(data);
                        if (data) {
                            //everything is good so it add it to the database and the user is created
                            User.createUser(newUser.name, newUser.fname, newUser.pseudo, newUser.mail, hashedPw);
                            res.redirect("/");
                        } else {
                            //return the signup page with the corresponding error
                            res.cookie('errorNb', 1, {maxAge: 1 * 1000});
                            res.redirect('/users/signup');
                        }
                    });
                }
                else{
                    res.cookie('errorNb',2,{maxAge:1*1000});
                    res.redirect('/users/signup');
                }
            });
        }
        //return the signup page with the corresponding error
        else {
            res.cookie('errorNb', 0, {maxAge: 1 * 1000});
            res.redirect('/users/signup');
        }
    }
    else{
        res.cookie('errorNb',0,{maxAge : 1*1000});
        res.redirect('/users/signup');
    }

};

//Admin page
exports.adminPage = function(req,res){
    res.render('./users/admin/admin',{logged:true});
};

