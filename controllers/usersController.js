const User = require('../models/usersModel');
const bcrypt = require('bcrypt');
const middleware = require('../middlewares/userMW');
const commonServices = require('../services/commonServices');
const bouncer = require('express-bouncer')(500,900000,5)



const EMAIL_REGEXX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const NAME_REGEX = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;

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
    if(typeof data.mail !=='undefined' && typeof data.pw !=='undefined' && EMAIL_REGEXX.test(data.mail)) {

        // We then check if the mail is in database
        User.checkMail(data.mail, (result) => {
            if (typeof result !== 'undefined') {
                if (result.check === true) {
                    //Check if the password entered match with the one registered
                    User.getPw(result.idUser, (hashedPw) => {
                        bcrypt.compare(data.pw, hashedPw, (err, resp) => {
                            if (resp) {
                                User.checkVerified(result.idUser, (info) => {
                                    if (info.verified === 1) {
                                        User.getInfoToken(result.idUser, (infoUser) => {
                                            bouncer.reset(req);
                                            //Call the services that will create the token and redirect corresponding to his status
                                            middleware.createToken(res, result, result.idUser, infoUser.pseudo, infoUser.isAdmin)
                                        });
                                    } else {
                                        commonServices.setCookie(res, 'code', 401);
                                        res.redirect('/verify')
                                    }
                                });

                            } else {
                                console.log(6);

                                //It will come here if the user did not type in the right password
                                commonServices.setCookie(res, 'status', 0);
                                commonServices.setCookie(res, 'code', 400);
                                res.redirect('/users/login');
                            }
                        });
                    });
                } else {
                    console.log(7);

                    //that means that the user did not enter the same mails
                    commonServices.setCookie(res, 'status', 0);
                    commonServices.setCookie(res, 'code', 400);
                    res.redirect('/users/login');
                }
            } else {
                console.log(8);

                //if there is no mail matching in the DB
                commonServices.setCookie(res, 'status', 0);
                commonServices.setCookie(res, 'code', 400);
                res.redirect('/users/login');
            }
        });
    }
    else{
        console.log(9);

        commonServices.setCookie(res, 'status', 0);
        commonServices.setCookie(res, 'code', 400);
        res.redirect('/users/login');
    }
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
    let code = commonServices.makeid(8);
    const newUser = commonServices.sanitizeBody(req);
    console.log(newUser);
    if (EMAIL_REGEXX.test(newUser.mail) && typeof newUser.name !=='undefined' && typeof newUser.fname!=='undefined'
        && typeof newUser.pseudo!=='undefined' && typeof newUser.mail !=='undefined' && typeof newUser.mdp!=='undefined'
        && newUser.mdp.length>7 &&  NAME_REGEX.test(newUser.name) && NAME_REGEX.test(newUser.fname)){

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
                            User.createUser(newUser.name, newUser.fname, newUser.pseudo,code, newUser.mail, hashedPw);
                            commonServices.setCookie(res,'code',201);
                            commonServices.sendVerifMail(newUser.mail,code);
                            res.redirect("/verify");
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
                res.render("./users/profile",{idUser:id,info,logged,isAdmin,status,csrfToken:req.csrfToken()});
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

exports.updateProfile = function(req,res){
  let idUser=commonServices.getUserId(req);
  let idPage=req.params.id;
  if(idUser==idPage){
      let body=commonServices.sanitizeBody(req);
      if(typeof body.name !=='undefined' && typeof body.pseudo!=='undefined'
          && typeof body.firstname !=='undefined' && typeof body.email !=='undefined'
          && EMAIL_REGEXX.test(body.email) && NAME_REGEX.test(body.name) && NAME_REGEX.test(body.firstname)
          && NAME_REGEX.test(body.pseudo)){
          //Check if mail already in DB
          User.checkMail(body.email,(info)=>{
              console.log(info);
              if(typeof info==='undefined'){
                  User.updateUser(idUser,body.name,body.firstname,body.email,body.pseudo);
                  commonServices.writeAndSend(res,200);
              }
              else{
                  commonServices.writeAndSend(res,400);
              }
          });
      }
      else{
          commonServices.writeAndSend(res,400);
      }
  }
  else{
      commonServices.writeAndSend(res,403);
  }
};

exports.updatePwPage = function(req,res){
    let idUser = commonServices.getUserId(req);
    let idPage = req.params.id;
    if(idUser==idPage){
        let code = commonServices.getCookie(req,'code');
        if(typeof code !=='undefined'){
            res.status(code);
        }
        let info = commonServices.isAdminLogged(req);
        let logged = info.logged;
        let isAdmin = info.isAdmin;
        res.render("./users/password",{idUser,logged,isAdmin,csrfToken:req.csrfToken()});
    }
    else{
        commonServices.setCookie(res,'code',403);
        res.redirect("/users/profile/"+idUser);
    }
};

exports.updatePw = function(req,res){
    let idUser = commonServices.getUserId(req);
    let idPage = req.params.id;
    if(idUser==idPage){
        console.log("ok id");
        let body = commonServices.sanitizeBody(req);
        if(typeof body.oldPw !=='undefined' && typeof body.newPw !=='undefined' && typeof body.confPw !=='undefined'
            && body.oldPw.length>7 && body.newPw.length>7 && body.confPw.length>7) {
            User.getPw(idUser, (hashpw) => {
                console.log(hashpw);
                bcrypt.compare(body.oldPw, hashpw, (err, data) => {
                    if (data) {
                        console.log("old ok");
                        let newPw = bcrypt.hashSync(body.newPw, 10);
                        bcrypt.compare(body.confPw, newPw, (err, info) => {
                            if (info) {
                                User.updatePw(idUser, newPw);
                                console.log("PASSWORD UPDATED");
                                commonServices.writeAndSend(res, 200);

                            } else {
                                console.log("conf no ok");
                                commonServices.writeAndSend(res, 400);
                            }
                        })
                    } else {
                        console.log("old non ok");
                        commonServices.writeAndSend(res, 400);
                    }
                })
            })
        }
        else{
            console.log("inputs no ok");
            commonServices.writeAndSend(res, 400);
        }
    }
    else{
        commonServices.setCookie(res,'code',403);
        res.redirect("/users/profile/"+idUser);
    }
};

exports.lostPwPage = function(req,res){
    let code = commonServices.getCookie(req,'code');
    if(typeof code!=='undefined'){
        res.status(code);
    }
    res.render("./users/lost-pw",{logged:false,isAdmin:false,csrfToken:req.csrfToken()});
};

exports.lostPw = function(req,res){
    let body = commonServices.sanitizeBody(req);
    console.log(body);
    if(typeof body.mail!=='undefined' && EMAIL_REGEXX.test(body.mail)) {

        User.checkMail(body.mail, (info) => {
            console.log(info);

            if (typeof info !== 'undefined') {
                let newLink = commonServices.makeid(16);
                User.updateCode(info.idUser, newLink);
                commonServices.sendNewPw(body.mail, newLink);
                commonServices.writeAndSend(res, 200);
            } else {
                commonServices.writeAndSend(res, 400);
            }
        });
    }
    else{
        commonServices.writeAndSend(res, 400);
    }
};


exports.lostPwKeyPage = function(req,res){
    let code = commonServices.getCookie(req,'code');
    if(typeof code!=='undefined'){
        res.status(code);
    }
    let key = req.params.key;
    User.verifyCode(key,(info)=>{
        console.log(info);
        if(typeof info!=='undefined'){
            res.render("./users/new-pw",{key,logged:false,isAdmin:false,csrfToken:req.csrfToken()});
        }
        else{
            commonServices.setCookie(res,404);
            res.redirect('/users/login');
        }
    });
};

exports.lostPwKey = function(req,res){
    let body = commonServices.sanitizeBody(req);
    if(typeof body.pw!=='undefined' && typeof body.confpw!=='undefined'
        && body.pw.length>7 && body.confpw.length>7) {
        let key = req.params.key;
        User.verifyCode(key, (info) => {
            let hashedPw = bcrypt.hashSync(body.pw, 10);
            bcrypt.compare(body.confpw, hashedPw, (err, data) => {
                if (data) {
                    User.updatePw(info.id, hashedPw);
                    commonServices.writeAndSend(res, 200);
                } else {
                    commonServices.writeAndSend(res, 400);
                }
            })
        });
    }
    else{
        commonServices.writeAndSend(res, 400);
    }

};