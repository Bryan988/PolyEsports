let Games =  require('../models/gamesModel');

const path = "./public/img/games/";

exports.addGamePage=function(req,res){
    res.render('users/admin/games/add',{logged:true});
};
exports.addGame=function(req,res){
    if(req.files){
        let file=req.files.filename;
        //store the file name and set the path to put the file
        let filename=file.name;
        let filepath=path+filename;
        //put the file in the corresponding path
        file.mv(filepath);
        Games.addGame(req.body.name,filepath);
        res.redirect('/users/admin');
    }
};

exports.deleteGamePage=function(req,res){
    Games.allGames((cb)=>{

        let status = req.cookies.status;
        console.log("status "+status);
        res.render('./users/admin/games/delete',{data:cb,logged:true,status});
    });
};
exports.deleteGame=function(req,res){
    Games.deleteGame(req.body.delete);
    res.cookie('status',true,{maxAge:1 * 1000});
    res.redirect('/users/admin/games/delete');
};