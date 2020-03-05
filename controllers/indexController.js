let services = require("../services/commonServices");
const Users = require('../models/usersModel');

exports.homePage = function(req, res){
    console.log(__dirname);
    console.log(req.cookies.token);
    let idUser;
    let info=services.isAdminLogged(req);
    let logged = info.logged;
    let isAdmin = info.isAdmin;
    if(logged){
        idUser=services.getUserId(req);
    }

    let signedup = req.cookies.signedup;

    res.render('index', {idUser,logged,isAdmin,signedup});
};

exports.verifyPage = function(req,res){
    let code = services.getCookie(req,'code');

    if(typeof code!=='undefined'){
        res.status(code)
    }
    res.render("./verify",{logged:false,isAdmin:false,csrfToken:req.csrfToken()});
};

exports.verify = function(req,res){
    let body = services.sanitizeBody(req);
    console.log(body);
    if(typeof body.code_verif !=='undefined'){
        Users.verifyCode(body.code_verif,(info)=>{
            if(typeof info !=='undefined'){
                Users.verified(info.id);
                services.writeAndSend(res,200);
            }
            else{
                services.writeAndSend(res,400);
            }
        });
    }
    else if(typeof body.email!=='undefined'){
        Users.checkMail(body.email,(info)=>{
            if(typeof info!=='undefined'){
                let code = services.makeid(8);
                let idUser = info.idUser;
                Users.updateCode(idUser,code);
                services.sendVerifMail(body.email,code);
                services.writeAndSend(res,200);
            }
            else{
                services.writeAndSend(res,400);
            }


        });

    }

};