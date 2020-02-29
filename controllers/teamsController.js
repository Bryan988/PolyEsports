const Teams = require('../models/teamsModel');
const Users = require('../models/usersModel');
const services = require('../services/commonServices');
const path = "./public/img/teams/";


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
    Teams.getTeamByName(body.name,(info)=>{
        let idTeam = info.id;
        Users.setToCaptain(idUser,idTeam);
    });
    services.setCookie(res,'cookie',201);
    //TODO envoyer un status comme quoi l'équipe a été créée / peut etre renvoyé, sur la page de l'équipe ?
    res.redirect("/");
};
//function that will render the corresponding view to the users
//if he already has a team or a pending request, he cannot send a request to the team
//Note that status will change the render.
// 0 = he can not apply for this team because he has a pending request, is already member of a team, or he is not logged yet
// 1 = He has a pending request for this team
// 2 = He is the captain of this team
// 3 = member of the team
// number in DB and url is a string => no === but ==
exports.profilePage = function(req,res){
    let code =services.getCookie(req,'code');
    if(typeof code !=='undefined'){
        res.status(code);
    }
    //this const will tell if the user has the same team as the one he is visiting
    const idPage=req.params.id;
    let status;
    //First check if the user is logged
    let info = services.isAdminLogged(req);
    let logged = info.logged;
    //this is for the display of the navbar
    let isAdmin = info.isAdmin;
    if(logged){
        //then check if the user can create a team, that means that he can also apply for a team
        let idUser = services.getUserId(req);
        Users.canApplyForTeam(idUser,(data)=>{
            //first case, he can not apply because he is member of another team
            if(data[0].idTeam != idPage && data[0].idTeam !==0){
                status = 0;
            }
            //second case
            else if(data[0].idTeam == idPage && data[0].pending === 1){
                 status = 1;
            }
            else if(data[0].idTeam == idPage && data[0].captain === 1){
                 status = 2;
            }
            else if(data[0].idTeam == idPage && data[0].pending === 0 ){
                 status = 3;
            }
            //TODO all info of the team must be added now
            Users.getAllTeamMembers(idPage,(data)=> {
                res.render('./teams/id', {logged, isAdmin, status, idPage,data});
            });

        });

    }
    else{
        const status = 0;
        res.render('./teams/id',{logged,isAdmin,status,idPage});
    }
};
exports.requestFromPage = function(req,res){
    let idPage = req.params.id;
    let body=services.sanitizeBody(req);
    //first scenario , the user sends his request to the team
    if(body.request==="1") {
        //We start by picking up his id
        let idUser = services.getUserId(req);
        //then update his info in DB (idTeam and pending invitation)
        Users.appliedToTeam(idUser, idPage);
        services.setCookie(res,'code',202);
    }
    //second scenario, the user wants to cancel his request to the team
    else if(body.cancel ==="1"){
        //same pattern for now
        let idUser = services.getUserId(req);
        //then update his info in DB (idTeam and pending invitation)
        Users.cancelledRequest(idUser);
        services.setCookie(res,'code',201);
    }
    //third scenario, the captain decline the request from an user
    else if(typeof body.decline !=='undefined'){
        //store the idUser that needs to be modified != the captain
        let idUser=body.decline;
        //then just  remove the request from the user from DB
        Users.cancelledRequest(idUser);
        services.setCookie(res,'code',200);
    }
    else if(typeof body.accept !=='undefined'){
        //same pattern here but we accept his request
        let idUser=body.accept;
        Users.acceptedInTeam(idUser);
        //then need to update the number of members in the team
        Teams.increaseTeam(idPage);
        services.setCookie(res,'code',200);
    }
    res.redirect("/teams/"+idPage);

};

exports.allTeamsPage = function(req,res){
    let info = services.isAdminLogged(req);
    let logged=info.logged;
    let isAdmin=info.isAdmin;
    Teams.getAllTeams((data)=>{
        res.render("./teams/all",{data,logged,isAdmin});
    });

};

//TODO Visuel page Team + all Teams + Rajouter les logos des teams et user dans l'affichage de la team !