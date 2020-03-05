const User = require('../models/usersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keyconfig = require('../config/key');
const middleware = require('../middlewares/userMW');
const commonServices = require('../services/commonServices');


//store the secret key for jwt
const secretkey = keyconfig.secretkey;

const EMAIL_REGEXX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

exports.loginpage= function(req,res){
    let status=commonServices.getCookie(req,'status');
    let code=commonServices.getCookie(req,'code');
    if(typeof code!=='undefined') {
        res.status(code);
    }
    res.render('./users/login',{status,logged:false, csrfToken: req.csrfToken()});
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
                                //Call the services that will create the token and redirect corresponding to his status
                                middleware.createToken(res,result,result.idUser,infoUser.pseudo,infoUser.isAdmin)
                            });
                        }
                        else{
                            //It will come here if the user did not type in the right password
                            commonServices.setCookie(res,'status',0);
                            commonServices.setCookie(res,'code',400);
                            res.redirect('/users/login');
                        }
                    });
                });
            }
            else{
                //that means that the user did not enter the same mails
                commonServices.setCookie(res,'status',0);
                commonServices.setCookie(res,'code',400);
                res.redirect('/users/login');
            }
        }
        else {
            //if there is no mail matching in the DB
            commonServices.setCookie(res,'status',0);
            commonServices.setCookie(res,'code',400);
            res.redirect('/users/login');
        }
    });
};

exports.signupPage = function(req,res){
    // return the corresponding page with variables initialized to undefined
    //Note that errorNb : 0 = mails are not matching
    // 1 = passwords are not matching
    // 2 = mail is already in database
    let errorNb=commonServices.getCookie(req,'errorNb');
    let code=commonServices.getCookie(req,'code');
    if(typeof code!=='undefined'){
        res.status(code);
    }
    res.render('./users/signup',{errorNb,logged:false,csrfToken: req.csrfToken()});
};
exports.signup = function(req,res){

    // store the form's data
    const newUser = commonServices.sanitizeBody(req);
    console.log(newUser);
    if (EMAIL_REGEXX.test(newUser.mail) && typeof newUser.name !=='undefined' && typeof newUser.fname!=='undefined' && typeof newUser.pseudo!=='undefined' && typeof newUser.mail !=='undefined' && typeof newUser.mdp!=='undefined' && newUser.mdp.length>7){
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
                            commonServices.setCookie(res,'code',201);
                            res.redirect("/");
                        } else {
                            //return the signup page with the corresponding error
                            commonServices.setCookie(res,'errorNb', 1);
                            commonServices.setCookie(res,'code',400);
                            res.redirect("/users/signup");
                        }
                    });
                }
                else{
                    commonServices.setCookie(res,'errorNb',2);
                    commonServices.setCookie(res,'code',400);
                    res.redirect("/users/signup");
                }
            });
        }
        //return the signup page with the corresponding error
        else {
            //if mails are not matching
            commonServices.setCookie(res,'errorNb', 0);
            commonServices.setCookie(res,'code',400);
            res.redirect("/users/signup");
        }
    }
    else{
        //if inputs are incorrect
        commonServices.setCookie(res,'errorNb',0);
        commonServices.setCookie(res,'code',400);
        res.redirect("/users/signup");
    }

};

exports.adminPage = function(req,res){
    let idUser = commonServices.getUserId(req);

    res.render('./users/admin/admin',{idUser,logged:true});
};

exports.profilePage = function(req,res){
    let id = req.params.id;
    let info = commonServices.isAdminLogged(req);
    let logged = info.logged;
    let isAdmin = info.isAdmin;
    let status=0;
    if(logged){
        let idUser = commonServices.getUserId(req);
        if(id==idUser){
            User.getUserInfo(id,(info)=>{
                console.log(info);
                if(info.idTeam!==0){
                    status=1;
                }
                res.render("./users/profile",{idUser:id,info,logged,isAdmin,status});
            })

        }
        else{
            res.sendStatus(403);
        }
    }
    else{
        res.sendStatus(401);
    }


};




