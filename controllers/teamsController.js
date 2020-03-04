const Teams = require('../models/teamsModel');
const Users = require('../models/usersModel');
const services = require('../services/commonServices');
const path = "public/img/teams/";
const fs = require("fs");

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
    let status = services.getCookie(req,'status');
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
    res.render("./teams/create",{idUser,logged,isAdmin,status,csrfToken: req.csrfToken()});
};

exports.createTeam = function(req,res){
    //store the form data
    if(req.files &&req.body.name !=='') {
        let file = req.files.filename;
        //need to check first if the file is a picture and if the size is not too big
        if (file.size < 10000000) {
            let format = file.mimetype.split('/');
            if (format[1] === 'png' || format[1] === 'jpg' || format[1] === 'jpeg') {
                //store the file name and set the path to put the file
                let filename = services.correctString(req.body.name.toLowerCase());
                let filepath = path + filename;
                console.log(filepath);
                //put the file in the corresponding path
                file.mv(filepath);
                Teams.createTeam(req.body.name, filepath);
                //Set the user to captain
                let idUser = services.getUserId(req);
                Teams.getTeamByName(req.body.name, (info) => {
                    console.log(info);
                    let idTeam = info.id;
                    Users.setToCaptain(idUser, idTeam);
                    services.setCookie(res, 'status', 1);
                    services.setCookie(res, 'code', 201);
                    res.redirect('/teams/'+info.id);
                });
                services.setCookie(res, 'cookie', 201);
                //TODO envoyer un status comme quoi l'équipe a été créée / peut etre renvoyé, sur la page de l'équipe ?

            } else {
                services.setCookie(res, 'code', 415);
                res.redirect('/teams/create');

            }
        } else {
            services.setCookie(res, 'code', 413);
            res.redirect('/teams/create');
        }
    }
    else{

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
    let idUser;

    let status;
    //First check if the user is logged
    let info = services.isAdminLogged(req);
    let logged = info.logged;
    if(logged){
        idUser= services.getUserId(req);
    }
    //this is for the display of the navbar
    let isAdmin = info.isAdmin;
    Teams.getTeamById(idPage,(teaminfo)=>{
       if(typeof teaminfo !=='undefined') {
           Users.getAllTeamMembers(idPage, (members) => {
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
                       issue,
                       members,
                       csrfToken: req.csrfToken()
                   });
               }
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
    console.log(req.params);
    console.log(req.body);
    let body=services.sanitizeBody(req);
    //We start by picking up his id
    let idUser = services.getUserId(req);
    //first scenario , the user sends his request to the team
    if(body.request==="1") {
        //then update his info in DB (idTeam and pending invitation)
        Users.appliedToTeam(idUser, idPage);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ status: 200 }));
        res.end();

    }
    //second scenario, the user wants to cancel his request to the team
    else if(body.cancel ==="1"){
        //then update his info in DB (idTeam and pending invitation)
        Users.cancelledRequest(idUser);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ status: 200 }));
        res.end();

    }
    //third scenario, the captain declines the request from an user
    else if(typeof body.decline !=='undefined'){
        //store the idUser that needs to be modified != the captain
        let targetUser=body.decline;
        //then just  remove the request from the user from DB
        Users.cancelledRequest(targetUser);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ status: 200 }));
        res.end();

    }
    //fourth scenario the captain accepts the user
    else if(typeof body.accept !=='undefined'){
        //same pattern here but we accept his request
        let targetUser=body.accept;
        Users.acceptedInTeam(targetUser);
        //then need to update the number of members in the team
        Teams.increaseTeam(idPage);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ status: 200 }));
        res.end();

    }
    //fifth scenario, the user wants to leave the team
    else if(body.leave==="1"){
        //then update his profile in DB
        Users.cancelledRequest(idUser);
        //Then we need to decrease the number of members in the corresponding team
        Teams.decreaseTeam(idPage);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ status: 200 }));
        res.end();

    }
    //too many scenarios ,here the captain wants to promote another member of his team to captain
    else if(typeof body.promote !=='undefined'){
        let targetUser = body.promote;
        console.log(targetUser);
        console.log(idUser);
        //in case if the captain wants to promote itself, we do a little check
        if(idUser!=targetUser) {
            //first the captain is no longer captain
            Users.noLongerCaptain(idUser);
            //then promote the target user to captain
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ status: 200 }));
            res.end();

        }
        else{
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ status: 401 }));
            res.end();


        }
    }
    //yeah there's one last I hope. Here the captain remove a member of the team
        // we of course check that if he remove himself, he put an other captain
        // In the case that he is alone, we delete the team (DB and logo in folders)
    else if(typeof body.remove!=='undefined'){
        console.log(idPage);
        //Check the number of members in order to know in what scenario the captain is
        Teams.getTeamById(idPage,(info)=>{
           //special scenario when the captain is the last member
            console.log(info);
           if(info.nombre==1){
               console.log("solo captain");
               //Remove everything in the server here the logo
               fs.unlink(info.logo,err=>{
                   if(err){throw err;}
               });
               //then from DB
               Teams.deleteTeam(idPage);
               //then we can remove the user's status
               Users.noLongerCaptain(idUser);
               Users.cancelledRequest(idUser);
               res.writeHead(200, { 'Content-Type': 'application/json' });
               res.write(JSON.stringify({ status: 200 }));
               res.end();

           }
           else{
               //here if the captain wants to remove someone (including himself)
               let targetUser = body.remove;
               Users.getTeamInfo(targetUser,(infoUser)=>{
                   if(infoUser[0].captain===1){
                       console.log("trying to remove captain");
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.write(JSON.stringify({ status: 400 }));
                        res.end();
                       //if the target is captain, it means that he must promote first
                       //TODO This here doesn't work, it is sent after the redirection who knows why


                   }
                   else{
                       //everything is ok here
                       // Start by decreasing the nb of members
                       Teams.decreaseTeam(idPage);
                       //then the target user
                       Users.cancelledRequest(targetUser);
                       res.writeHead(200, { 'Content-Type': 'application/json' });
                       res.write(JSON.stringify({ status: 200 }));
                       res.end();
                   }
               });
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

//TODO Security every where ! check mail // forgot pw
//TODO 2- DO PROFILE PAGE : Allow an user to modify his pseudo // password
//TODO 3- allow the captain to modify the picture/name of his team
//TODO 4- Visuel page Team + all Teams + Rajouter les logos des teams et user dans l'affichage de la team !
