
var User = require('../models/usersModel');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

exports.loginpage= function(req,res,next){
    //Note that status : 0 = mail is wrong
    // 1 = password is not matching
    res.render('./users/login',{status:undefined});
};

exports.login = function(req,res,next){
    //store the form's data
    var data = req.body;
    // We then check if the mail is in database
    User.checkMail(data.mail,(result) =>{
        if(result.check===true){
            //Check if the password entered match with the one registered
            User.getPw(result.idUser,(hashedPw)=>{
                bcrypt.compare(data.pw,hashedPw,(err,resp)=>{
                    if(resp) {
                        User.getInfoToken(result.idUser,(infoUser)=>{
                            console.log(infoUser);
                            //first give the jwt token to the user
                            jwt.sign({id:result.idUser, pseudo:infoUser.pseudo, isAdmin:infoUser.admin===1,expire: "1800"},'secretkey',(err,token)=>{
                                res.cookie('token',token);
                                res.redirect("/");
                            });
                            //render the page

                        })
                    }
                    else{
                        res.render('./users/login',{status:1});
                    }
                });
            });
        }
        else{
            res.render('./users/login',{status:0})
        }
    });
};

exports.signupPage = function(req,res,next){
    // return the corresponding page with variables initialized to undefined
    //Note that errorNb : 0 = mails are not matching
    // 1 = passwords are not matching
    // 2 = mail is already in database
    res.render('./users/signup',{errorNb:undefined});
};
exports.signup = function(req,res,next){
    // store the form's data
    var newUser=req.body;
    //Hashing the password
    var hashedPw=bcrypt.hashSync(newUser.mdp,10);
    if(newUser.mail===newUser.confmail){
        //We check if the mail is available in database
        User.checkMail(newUser.mail,(okmail) =>{
            if (okmail.check===false) {
                //Here, the confmdp will be compare to the hashed password
                bcrypt.compare(newUser.confmdp, hashedPw, function (err, data) {
                    console.log(data);
                    if (data) {
                        //everything is good so it add it to the database and the user is created
                        User.createUser(newUser.name, newUser.fname, newUser.pseudo, newUser.mail, hashedPw);
                        res.redirect("/");
                    } else {
                        //return the signup page with the corresponding error
                        res.render('./users/signup', {errorNb:1});
                    }
                });
            }
            else{
                //return the signup page with the corresponding error
                res.render('./users/signup',{errorNb:2});
            }
        });
    }
    //return the signup page with the corresponding error
    else{res.render('./users/signup',{errorNb:0});}
};

exports.adminPage = function(req,res){
    console.log("token : "+req.cookies.token);
    jwt.verify(req.cookies.token,'secretkey',(err,authData)=>{
        if(err){throw err}
        res.render('./users/admin');
    })

};

exports.verifyAdmin = function(req,res,next){

    var token = req.cookies.token;

    if(typeof token !== 'undefined'){
        jwt.verify(token,'secretkey',(err,playload)=>{
            console.log(playload);
            if(playload.isAdmin){
                next();
            }
            else{
                res.sendStatus(403);
            }
        });

    }
    else{
        res.sendStatus(403);
    }

}