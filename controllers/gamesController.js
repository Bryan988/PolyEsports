let Games =  require('../models/gamesModel');
let commonServices = require('../services/commonServices');
const path = "public/img/games/";
const fs = require('fs');




exports.addGamePage=function(req,res){
    //retrieve cookies
    let status = commonServices.getCookie(req,'status');
    let code = commonServices.getCookie(req,'code');
    if(typeof code !=='undefined'){
        res.status(code);
    }
    res.render('users/admin/games/add',{status, csrfToken: req.csrfToken()});
};
exports.addGame=function(req,res){

    if(req.files){
        let file=req.files.filename;
        //need to check first if the file is a picture and if the size is not too big
        if(file.size<1000000000){
            let format = file.mimetype.split('/');
            if(format[1]==='png'||format[1]==='jpg'||format[1]==='jpeg') {
                //store the file name and set the path to put the file
                let filename = commonServices.correctString(req.body.name.toLowerCase());
                let filepath = path + filename;
                console.log(filepath);
                //put the file in the corresponding path
                file.mv(filepath);
                Games.addGame(req.body.name, filepath);
                commonServices.setCookie(res, 'status', 1);
                commonServices.setCookie(res, 'code', 201);
                res.redirect('/users/admin/games/add');
            }
            else{
                commonServices.setCookie(res, 'code', 415);
                res.redirect('/users/admin/games/add');

            }
        }
        else{
            commonServices.setCookie(res, 'code', 413);
            res.redirect('/users/admin/games/add');
        }
    }
    else{
        commonServices.setCookie(res,'code',400);
        res.redirect('/users/admin/games/add');
    }
};

exports.deleteGamePage=function(req,res){

    Games.allGames((cb)=>{
        let status = commonServices.getCookie(req,'status');
        let code = commonServices.getCookie(req,"code");
        console.log("status "+status);
        res.render('./users/admin/games/delete',{data:cb,logged:true,status});
    });
};
exports.deleteGame=function(req,res){
    let id = req.params.id;
    let body = commonServices.sanitizeBody(req);
    Games.selectGameById(id,(info)=>{
        if(typeof info!=='undefined'){
            Games.deleteGame(id);
            fs.unlink(info[0].image,err=>{
                if(err){throw err;}
            });
            commonServices.setCookie(res,'status',2);
            commonServices.setCookie(res,'code',200);
            res.redirect('/users/admin/games/delete');
        }
        else{
            commonServices.setCookie(res,'code',400);
            res.redirect('/users/admin/games/delete');
        }
    })

};