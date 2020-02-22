
var User = require('../models/usersModel');
var bcrypt = require('bcrypt');

exports.loginpage= function(req,res,next){
    //Note that status : 0 = mail is wrong
    // 1 = password is not matching
    res.render('./users/login',{status:undefined});
};

exports.login = function(req,res,next){
    //store the form's data
    var data = req.body;
    console.log(data);
    // We then check if the mail is in database
    User.checkMail(data.mail,(result) =>{
        console.log(result);
        if(result.check===true){
            console.log("mail ok");
            //Check if the password entered match with the one registered
            User.getPw(result.idUser,(hashedPw)=>{
                console.log(hashedPw);
                bcrypt.compare(data.pw,hashedPw,(err,resp)=>{
                    console.log("le mot de passe est : "+resp);
                    if(resp) {
                        res.render("index", {title: 'YOU ARE LOGGED', logged: true});
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
                        res.render("index", {title: 'Express', logged: true});
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
