const User = require('../models/usersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keyconfig = require('../config/key');

//store the secret key for jws
const secretkey = keyconfig.secretkey;


exports.loginpage= function(req,res){
    console.log("cookies");
    console.log(req.cookies);
    let status=req.cookies.status;
    res.render('./users/login',{status,logged:false});
};

exports.login = function(req,res,next){

    //Note that status : 0 = Something is wrong
    //store the form's data
    const data = req.body;
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
    const newUser = req.body;
    //Hashing the password
    const hashedPw = bcrypt.hashSync(newUser.mdp, 10);
    if(newUser.mail===newUser.confmail){
        //We check if the mail is available in database
        User.checkMail(newUser.mail,(okmail) =>{
            if(typeof okmail!=='undefined') {
                if (okmail.check === false) {
                    //Here, the confmdp will be compare to the hashed password
                    bcrypt.compare(newUser.confmdp, hashedPw, function (err, data) {
                        console.log(data);
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
                } else {
                    //return the signup page with the corresponding error
                    res.cookie('errorNb', 2, {maxAge: 1 * 1000});
                    res.redirect('/users/signup');
                }
            }
        });
    }
    //return the signup page with the corresponding error
    else{
        res.cookie('errorNb',0,{ maxAge: 1 * 1000});
        res.redirect('/users/signup');
    }

};



//function that will inform if the user is logged or not in order to show the correct content
exports.checkLogged = function(req,res,next){
    let token = req.cookies.token;
    //check if there is a token
    if(typeof token !== 'undefined'){
        //check if the token is the correct sign
        jwt.verify(token,secretkey,(err,playload)=>{
            if(err){
                console.log(err);
                res.clearCookie("token");
                };
            next();
        });
    }
    else{
        next();
    }
};
//function that clears the token from the cookies
exports.logout = function(req,res){
    //delete the token from cookies
    res.clearCookie("token");
    res.redirect('/');
};

//Admin functions below

exports.verifyAdmin = function(req,res,next){
    //store the jwt token
    const token = req.cookies.token;
    console.log(token);
    if(typeof token!=='undefined'){
        //check that the token is the correct signature
        jwt.verify(token,secretkey,(err,playload)=>{
            console.log("error"+err);
            console.log("playload : ");
            console.log(playload);
            if(typeof playload!=='undefined'){
                console.log(playload);
                if(playload.isAdmin){
                    next();
                }
                else{
                    res.sendStatus(403);
                }
            }
            else{
                console.log("token non valide");
                res.redirect('/users/login');
            }
        });
    }
    else{
        res.sendStatus(403);
    }
};

exports.adminPage = function(req,res){
    res.render('./users/admin/admin',{logged:true});
};

