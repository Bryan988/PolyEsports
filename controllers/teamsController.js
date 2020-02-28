const Teams = require('../models/teamsModel');
const Users = require('../models/usersModel');
const services = require('../services/commonServices');
const path = "./public/img/teams/";
const middleware = require('../middlewares/userMW');


exports.TeamsPage = function(req,res){
    //retrieve the status code first
    let code = services.getCookie(req,'code');
    if(typeof code!=='undefined'){
        res.status(code);
    }
    //then store all the teams that are in the DB
    Teams.getAllTeams((data)=>{
        res.render('/teams',{data});
    });
};
exports.createTeamPage = function(req,res){
    //to render the team page we must check if the user can create it, therefore, we need his id
    let status = services.getCookie(req,'status');
    let code = services.getCookie(req,'code');
    if(typeof code!=='undefined'){
        res.status(code);
    }
    res.render("./teams/create",{logged:true,status});
};

exports.createTeam = function(req,res){
    //store the form data

    let body=services.sanitizeBody(req);
    let file = req.files.filename;
    let filename=file.name;
    let filepath=path+filename;
    //move the logo into the correct folder
    file.mv(filepath);
    //Create the team in DB
    Teams.createTeam(body.name,filepath);
    //Set the user to captain
    let idUser = services.getUserId(req);
    Users.setToCaptain(idUser);
    services.setCookie(res,'cookie',201);
    //TODO envoyer un status comme quoi l'équie a été crée / peut etre renvoyé, sur la page de l'équipe ?
    res.redirect("/");
};

