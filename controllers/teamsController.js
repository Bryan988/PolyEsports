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
    //this const will tell if the user has the same team as the one he is visiting
    const idPage=req.params.id;
    console.log(idPage);
    var status;
    //First check if the user is logged
    let logged = services.userIsLogged(req);
    console.log("logged "+logged);
    if(logged){
        //this is for the display of the navbar
        let isAdmin = services.userIsAdmin(req);
        //then check if the user can create a team, that means that he can also apply for a team
        let idUser = services.getUserId(req);
        Users.canApplyForTeam(idUser,(data)=>{
            //first case, he can not apply because he is member of another team
            if(data[0].idTeam != idPage && data[0].idTeam !==0){
                status = 0;
                //res.render('./teams/id',{logged,isAdmin,status});
            }
            //second case
            else if(data[0].idTeam == idPage && data[0].pending === 1){
                 status = 1;
                //res.render('./teams/id',{logged,isAdmin,status});
            }
            else if(data[0].idTeam == idPage && data[0].captain === 1){
                 status = 2;
                //res.render('./teams/id',{logged,isAdmin,status});
            }
            else if(data[0].idTeam == idPage && data[0].pending === 0 ){
                 status = 3;
                //res.render('./teams/id',{logged,isAdmin,status});
            }
            res.render('./teams/id',{logged,isAdmin,status});

        });

    }
    else{
        const status = 0;
        res.render('./teams/id',{logged,isAdmin:false,status})
    }
};

