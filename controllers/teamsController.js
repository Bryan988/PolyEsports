const Teams = require('../models/teamsModel');
const Users = require('../models/usersModel');
const services = require('../services/commonServices');
const Matches = require("../models/matchesModel");

let NAME_REGEX = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;

exports.TeamsPage = function(req,res){
    //retrieve the status code first
    let info = services.isAdminLogged(req);
    let logged = info.logged;
    let isAdmin = info.isAdmin;
    let idUser;

    if(logged){
        idUser = services.getUserId(req);
    }
    let code = services.getCookie(req,'code');
    if(typeof code!=='undefined'){
        res.status(code);
    }
    //then store all the teams that are in the DB
    Teams.getAllTeams((data)=>{
        res.render('/teams',{logged,isAdmin,data,idUser});
    });
};
exports.createTeamPage = function(req,res){
    //to render the team page we must check if the user can create it, therefore, we need his id
    let code = services.getCookie(req,'code');
    let info = services.isAdminLogged(req);
    let idUser;
    let logged = info.logged;
    if(logged){
        idUser = services.getUserId(req);
    }
    let isAdmin = info.isAdmin;
    if(typeof code!=='undefined'){
        res.status(code);
    }
    res.render("./teams/create",{idUser,logged,isAdmin,csrfToken: req.csrfToken()});
};

exports.createTeam = function(req,res){
    //store the form data
    let body = services.sanitizeBody(req);
    if(typeof body.name !=='undefined' && NAME_REGEX.test(body.name)) {
        //need to check first if the file is a picture and if the size is not too big
        Teams.createTeam(body.name);
        //Set the user to captain
        let idUser = services.getUserId(req);
        Teams.getTeamByName(body.name, (info) => {
            let idTeam = info.id;
            Users.setToCaptain(idUser, idTeam);
            services.setCookie(res, 'code', 201);
            res.redirect('/teams/'+info.id);
        });
    }
    else{
        services.setCookie(res, 'code', 400);
        res.redirect("/teams/create");
    }

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
    let issue = services.getCookie(req,'issue');
    //this const will tell if the user has the same team as the one he is visiting
    const idPage=req.params.id;

    let status;
    //First check if the user is logged
    let info = services.isAdminLogged(req);
    let logged = info.logged;
    let idUser;
    if(logged){
        idUser= services.getUserId(req);
    }
    //this is for the display of the navbar
    let isAdmin = info.isAdmin;
    Teams.getTeamById(idPage,(teaminfo)=>{
       if(typeof teaminfo !=='undefined') {
           Users.getAllTeamMembers(idPage, (members) => {
               Matches.selectMatchesByTeams(idPage,async (matches)=> {

                   await Promise.all(matches.map((row) => new Promise((resolve => {
                       Teams.getTeamById(row.idTeam1, (info1) => {
                           row.teamName1 = info1.teamName;
                       });
                       Teams.getTeamById(row.idTeam2, (info2) => {
                           row.teamName2 = info2.teamName;
                           resolve();
                       });
                   }))));

                   if (logged) {
                       //then check if the user can create a team, that means that he can also apply for a team
                       let idUser = services.getUserId(req);
                       Users.canApplyForTeam(idUser, (data) => {
                           //first case, he can not apply because he is member of another team
                           if (data[0].idTeam != idPage && data[0].idTeam !== 0) {
                               status = 0;
                           }
                           //second case
                           else if (data[0].idTeam == idPage && data[0].pending === 1) {
                               status = 1;
                           } else if (data[0].idTeam == idPage && data[0].captain === 1) {
                               status = 2;
                           } else if (data[0].idTeam == idPage && data[0].pending === 0) {
                               status = 3;
                           }
                           res.render('./teams/id', {
                               idUser,
                               logged,
                               isAdmin,
                               status,
                               idPage,
                               members,
                               matches,
                               issue,
                               csrfToken: req.csrfToken()
                           });
                       });
                   } else {
                       status = 0;
                       res.render('./teams/id', {
                           idUser,
                           logged,
                           isAdmin,
                           status,
                           idPage,
                           matches,
                           issue,
                           members,
                           csrfToken: req.csrfToken()
                       });
                   }
               });
           });
       }
       else{
           services.setCookie(res,'code',404);
           res.redirect("/teams")
       }

    });

};
exports.requestFromPage = function(req,res){
    let idPage = req.params.id;
    let body=services.sanitizeBody(req);
    //We start by picking up his id
    let idUser = services.getUserId(req);
    //first scenario , the user sends his request to the team
    if(body.request==="1") {
        //then update his info in DB (idTeam and pending invitation)
        Users.appliedToTeam(idUser, idPage);
        services.writeAndSend(res,200);


    }
    //second scenario, the user wants to cancel his request to the team
    else if(body.cancel ==="1"){
        //then update his info in DB (idTeam and pending invitation)
        Users.cancelledRequest(idUser);
        services.writeAndSend(res,200);


    }
    //third scenario, the captain declines the request from an user
    else if(typeof body.decline !=='undefined'){
        //we first need to check that the captain is doing these request for HIS team and not another
        Users.canApplyForTeam(idUser,(captInfo)=>{
            if(captInfo[0].idTeam==idPage){
                //store the idUser that needs to be modified != the captain
                let targetUser=body.decline;
                //We need to check if the target user is not an user from another team
                Users.canApplyForTeam(targetUser,(userInfo)=>{
                    if(userInfo[0].idTeam==idPage && userInfo[0].pending==1 ){
                        Users.cancelledRequest(targetUser);
                        services.writeAndSend(res,200);
                    }
                    else{
                        services.writeAndSend(res,403);
                    }
                });
            }
            else{
                services.writeAndSend(res,403);
            }
        });

        //then just  remove the request from the user from DB



    }
    //fourth scenario the captain accepts the user
    else if(typeof body.accept !=='undefined'){
        //same pattern here but we accept his request
        let targetUser=body.accept;
        Users.canApplyForTeam(idUser,(captInfo)=>{
            if(captInfo[0].idTeam==idPage) {
                Users.canApplyForTeam(targetUser,(userInfo)=>{
                    if(userInfo[0].idTeam==idPage && userInfo[0].pending==1 ){
                        Users.acceptedInTeam(targetUser);
                        //then need to update the number of members in the team
                        Teams.increaseTeam(idPage);
                        services.writeAndSend(res,200);
                    }
                    else{
                        services.writeAndSend(res,403);
                    }
                });
            }
            else{
                services.writeAndSend(res,403);
            }
        });
    }
    //fifth scenario, the user wants to leave the team
    else if(body.leave==="1"){
        //then update his profile in DB
        Users.cancelledRequest(idUser);
        //Then we need to decrease the number of members in the corresponding team
        Teams.decreaseTeam(idPage);
        services.writeAndSend(res,200);


    }
    //too many scenarios ,here the captain wants to promote another member of his team to captain
    else if(typeof body.promote !=='undefined'){
        let targetUser = body.promote;
        Users.canApplyForTeam(idUser,(captInfo)=> {
            if (captInfo[0].idTeam == idPage) {
                //in case if the captain wants to promote itself, we do a little check
                if(idUser!=targetUser) {
                    Users.canApplyForTeam(targetUser,(userInfo)=>{
                        if(userInfo[0].idTeam==idPage && userInfo[0].captain==0 ){
                            Users.acceptedInTeam(targetUser);
                            //first the captain is no longer captain
                            Users.noLongerCaptain(idUser);
                            //then promote the target user to captain
                            Users.setToCaptain(targetUser,idPage);
                            services.writeAndSend(res,200);
                        }
                        else{
                            services.writeAndSend(res,403);
                        }
                    });
                }
                else{
                    services.writeAndSend(res,400);
                }
            }
            else{
                services.writeAndSend(res,403);
            }
        });
    }
    //yeah there's one last I hope. Here the captain remove a member of the team
    // we of course check that if he remove himself, he put an other captain
    // In the case that he is alone, we delete the team (DB and logo in folders)
    else if(typeof body.remove!=='undefined'){
        Users.canApplyForTeam(idUser,(captInfo)=> {
            if (captInfo[0].idTeam == idPage) {
                //Check the number of members in order to know in what scenario the captain is
                Teams.getTeamById(idPage,(info)=>{
                    //special scenario when the captain is the last member
                    if(info.nombre==1){
                        //Remove everything in the server here the logo
                        //then from DB
                        Teams.deleteTeam(idPage);
                        //then we can remove the user's status
                        Users.noLongerCaptain(idUser);
                        Users.cancelledRequest(idUser);
                        //the problem here is that we need to cancel all request for this team or
                        //users will be unavailable to join another team
                        Users.getAllPendingMembers(idPage,async (members)=>{
                            await Promise.all(members.map((row) => new Promise((resolve => {
                                Users.cancelledRequest(row.id);
                                resolve();
                            }))));
                        });
                        services.writeAndSend(res,200);

                    }
                    else{
                        //here if the captain wants to remove someone (including himself)
                        let targetUser = body.remove;
                        Users.getTeamInfo(targetUser,(infoUser)=>{
                            if(infoUser[0].captain===1){
                                services.writeAndSend(res,400);
                            }
                            else{
                                //everything is ok here
                                // Start by decreasing the nb of members
                                Users.canApplyForTeam(targetUser,(userInfo)=>{
                                    if(userInfo[0].idTeam==idPage && userInfo[0].pending==0 ){
                                        Teams.decreaseTeam(idPage);
                                        //then the target user
                                        Users.cancelledRequest(targetUser);
                                        services.writeAndSend(res,200);
                                    }
                                    else{
                                        services.writeAndSend(res,403);
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                services.writeAndSend(res,403)
            }
        });
    }


};

exports.allTeamsPage = function(req,res){
    let info = services.isAdminLogged(req);
    let code = services.getCookie(req,'code');
    let idUser;

    if(typeof code!=='undefined'){
        res.status(code);
    }
    let logged=info.logged;
    if(logged){
        idUser= services.getUserId(req);
    }
    let isAdmin=info.isAdmin;
    let status = services.getCookie(req,'status');
    Teams.getAllTeams((data)=>{
        res.render("./teams/all",{idUser,data,logged,isAdmin,status});
    });

};

//TODO 4- Visuel page Team + all Teams + Rajouter les matchs
