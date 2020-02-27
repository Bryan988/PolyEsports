const User = require('../models/usersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keyconfig = require('../config/key');
const services = require('../services/userServices');
const commonServices = require('../services/commonServices');


//store the secret key for jwt
const secretkey = keyconfig.secretkey;

const EMAIL_REGEXX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

exports.loginpage= function(req,res){
    let status=commonServices.getCookie(req,'status');
    res.render('./users/login',{status,logged:false});
};

exports.login = function(req,res,next){

    //Note that status : 0 = Something is wrong
    //store the form's data
    const data = commonServices.sanitizeBody(req);
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
                                        commonServices.setCookie(res,'token',token);
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
                            commonServices.setCookie(res,'status',0);
                            res.status(400).render('./redirect',{link:'/users/login'});
                        }
                    });
                });
            }
            else{
                commonServices.setCookie(res,'status',0);
                res.status(400).render('./redirect',{link:'/users/login'});
            }
        }
        else {
            commonServices.setCookie(res,'status',0);
            res.status(400).render('./redirect',{link:'/users/login'});
        }
    });
};

exports.signupPage = function(req,res){
    // return the corresponding page with variables initialized to undefined
    //Note that errorNb : 0 = mails are not matching
    // 1 = passwords are not matching
    // 2 = mail is already in database
    let errorNb=commonServices.getCookie(req,'errorNb');
    console.log("errorNb = "+errorNb);
    res.render('./users/signup',{errorNb,logged:false});
};
exports.signup = function(req,res){

    // store the form's data
    const newUser = commonServices.sanitizeBody(req);
    console.log(newUser);
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
                            commonServices.setCookie(res,'signedup',1);
                            res.status(201).render('./redirect',{link:"/"});


                        } else {
                            //return the signup page with the corresponding error
                            commonServices.setCookie(res,'errorNb', 1);
                            res.status(400).render('./redirect',{link:"/users/signup"});
                        }
                    });
                }
                else{
                    commonServices.setCookie(res,'errorNb',2);
                    res.status(400).render('./redirect',{link:"/users/signup"});
                }
            });
        }
        //return the signup page with the corresponding error
        else {
            commonServices.setCookie(res,'errorNb', 0);
            res.status(400).render('./redirect',{link:"/users/signup"});
        }
    }
    else{
        commonServices.setCookie(res,'errorNb',0);
        res.status(400).render('./redirect',{link:"/users/signup"});
    }

};

//Admin page
exports.adminPage = function(req,res){
    res.render('./users/admin/admin',{logged:true});
};

