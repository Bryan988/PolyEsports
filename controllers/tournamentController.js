let Tournament = require('../models/tournamentModel');
let Games = require('../models/gamesModel');
let userServices = require('../middlewares/userMW');
let commonServices = require('../services/commonServices');
const DATE = require('date-and-time');
const Users = require("../models/usersModel");
const Ranks = require("../models/ranksModel");
const Teams = require('../models/teamsModel');

exports.addTournamentPage = function(req,res){
    Games.allGames((data)=>{
        //store the different cookies set up
        let status=commonServices.getCookie(req,'status');
        let date=commonServices.getCookie(req,'date');
        let invalid=commonServices.getCookie(req,'invalid');
        let code = commonServices.getCookie(req,'code');
        if(typeof code!=='undefined'){
            res.status(code);
        }
        res.render('./users/admin/tournament/create',{data,status,date,invalid,csrfToken: req.csrfToken()});
    });
};

exports.addTournament = function(req,res){
    let data = commonServices.sanitizeBody(req);
    let date=data.startingDate;
    let newDate= new Date(date);

    if(typeof newDate.getFullYear()==='number'&& typeof newDate.getMonth()==='number' && typeof newDate.getDate()==='number') {
        if(commonServices.checkPastDate(newDate)){
            if (typeof data.idGame !== 'undefined' && typeof data.minNbTeams !== 'undefined' && typeof data.startingDate !== 'undefined' && typeof data.tournamentName !== 'undefined' && typeof data.description !== 'undefined') {
                Tournament.addTournament(data.idGame, data.minNbTeams, newDate, data.tournamentName, data.description);
                commonServices.setCookie(res,"status", 1);
                commonServices.setCookie(res,'code',201);
                res.redirect('/users/admin/tournament/create');
            } else {
                //if inputs are invalid
                commonServices.setCookie(res,"invalid", 1);
                commonServices.setCookie(res,'code',400);
                res.redirect('/users/admin/tournament/create');
            }
        }
        else{
            // if the date is already past
            commonServices.setCookie(res,'date',1);
            commonServices.setCookie(res,'code',400);
            res.redirect('/users/admin/tournament/create');
        }
    }
    else{
        // if the date is invalid
        commonServices.setCookie(res,"date", 1);
        commonServices.setCookie(res,'code',400);
        res.redirect('/users/admin/tournament/create');
    }
};

exports.selectTournamentPage = function(req,res){
    const status = commonServices.getCookie(req,'status');
    let code = commonServices.getCookie(req,'code');
    if(typeof code!=='undefined'){
        res.status(code);
    }
    Tournament.getAllOpenTournaments(async (data)=> {
        //await is going to wait that the promise is ready
        await Promise.all(data.map((row) => new Promise((resolve => {
            //However, promise will wait that ALL promises are ended before being ready
            Games.getNameGame(row.idJeux,(gameName)=>{
                row.date_debut=DATE.format(row.date_debut,'YYYY-MM-DD');
                row.titleGame=gameName[0].libelle;
                resolve();
            });

        }))));

        res.render('./users/admin/tournament/viewTournaments',{data:data,status:status,csrfToken: req.csrfToken()});
    });
};

exports.deleteTournament = function(req,res){
    //store the id from the url
    const id=req.params.id;
    //check if the id is in the DB
    Tournament.getTournamentById(id,(check)=>{
        if(typeof check!=='undefined'){
            //delete the corresponding tournament
            Tournament.deleteTournamentById(id);
            commonServices.setCookie(res,'status',1);
            commonServices.setCookie(res,'code',200);
            res.redirect('/users/admin/tournament/edit')
        }
        else{
            commonServices.setCookie(res,'code',400);
            res.redirect('/users/admin/tournament/edit');
        }
    })
};

exports.updateTournamentPage = function(req,res){
    const id=req.params.id;
    let status = commonServices.getCookie(req,'status');
    let invalid = commonServices.getCookie(req,'invalid');
    let date = commonServices.getCookie(req,'date');
    Games.allGames((games)=>{
        Tournament.getTournamentById(id,(data)=>{
            data[0].date_debut=DATE.format(data[0].date_debut,'YYYY-MM-DD');
            console.log(data[0]);

            res.render('./users/admin/tournament/update',{data,games,status,date,invalid,csrfToken: req.csrfToken()});
        })
    })
};

exports.updateTournament = function(req,res){
    let data = commonServices.sanitizeBody(req);

    let date=data.startingDate;
    let newDate= new Date(date);
    console.log(req.body);
    let id = req.params.id;
    if(typeof newDate.getFullYear()==='number'&& typeof newDate.getMonth()==='number' && typeof newDate.getDate()==='number') {
        if(commonServices.checkPastDate(newDate)){
            if (typeof data.idGame !== 'undefined' && typeof data.minNbTeams !== 'undefined' && typeof data.startingDate !== 'undefined' && typeof data.tournamentName !== 'undefined' && typeof data.description !== 'undefined') {
                Tournament.updateTournament(id,data.idGame, data.minNbTeams, newDate, data.tournamentName, data.description);
                commonServices.setCookie(res,"status", 2);
                commonServices.setCookie(res,'code',200);
                res.redirect('/users/admin/tournament/edit');
            } else {
                commonServices.setCookie(res,"invalid", 1);
                commonServices.setCookie(res,'code',400);
                res.redirect('/users/admin/tournament/update/'+id);
            }
        }
        else{
            commonServices.setCookie(res,'date',1);
            commonServices.setCookie(res,'code',400);
            res.redirect('/users/admin/tournament/update/'+id);
        }
    }
    else{
        commonServices.setCookie(res,"invalid", 1);
        commonServices.setCookie(res,'code',400);
        res.redirect('/users/admin/tournament/update/'+id);
    }

};

exports.tournamentPage = function(req,res){
    let id = req.params.id;
    let info = commonServices.isAdminLogged(req);
    let logged = info.logged;
    let isAdmin = info.isAdmin;
    let status;
    //need to know the status of the player, if he's the captain or no
    // retrieve all the info about the tournament
    Tournament.getTournamentById(id,(data)=>{
        if(typeof data[0] !=='undefined') {
            Games.getNameGame(data[0].idJeux,(gameName)=>{
                data[0].game=gameName[0].libelle;
                //store the teams that are in the tournament in order to display the rankings
                Ranks.getAllTeamInTournament(id,async (teams)=>{
                    //we will add every team name to the team row
                    await Promise.all(teams.map((row) => new Promise((resolve => {
                       Teams.getTeamById(row.idTeam,(teamInfo)=>{
                           row.teamName=teamInfo.teamName;
                           row.logo = teamInfo.logo;
                           resolve();
                        });

                    }))));
                    console.log(teams);
                    if(commonServices.checkPastDate(data[0].date_debut)){
                        data[0].date_debut= DATE.format(data[0].date_debut,'ddd, MMM DD YYYY');
                        //here return the corresponding status for the buttons display
                        if (logged) {
                            let idUser = commonServices.getUserId(req);
                            Users.getTeamInfo(idUser, (info) => {
                                console.log(info);
                                //check if the team is registered in the tournament or not
                                if (info[0].captain === 1) {
                                    Ranks.getTeamAById(id, info[0].idTeam, (cb) => {
                                        if (typeof cb !== 'undefined') {
                                            //means that the team is in the tournament
                                            status = 2;
                                        } else {
                                            //it means that the captain can join the tournament
                                            status = 1;
                                        }
                                        res.render("./tournaments/template", {data, logged, isAdmin, status, id,teams,csrfToken: req.csrfToken()});
                                    });
                                } else {
                                    res.render("./tournaments/template", {data, logged, isAdmin, status, id,teams,csrfToken: req.csrfToken()});
                                }
                            });
                        }
                        else {
                            res.render("./tournaments/template", {data, logged, isAdmin, status, id,teams,csrfToken: req.csrfToken()});
                        }
                    }
                    else{
                        data[0].date_debut= DATE.format(data[0].date_debut,'ddd, MMM DD YYYY');
                        //the date is past so no teams can leave the tournament nor join it
                        status=0;
                        res.render("./tournaments/template", {data, logged, isAdmin, status, id,teams,csrfToken: req.csrfToken()});
                    }
                });

            });
        }
        else{
            res.sendStatus(404);
        }
    });
};

/*
*Two scenarios :
* - The captain wants to join the tournament
* - The captain wants to leave the tournament
 */

exports.tournament = function(req,res){
    let  body = commonServices.sanitizeBody(req);
    let id = req.params.id;
    //we first need to get the idTeam of the captain
    let idUser = commonServices.getUserId(req);
    //First scenario
    if(body.join==="1"){

        Users.getTeamInfo(idUser,(teaminfo)=>{
            //increase the number of team by one
            Tournament.increaseTeams(id);
            let idTeam = teaminfo[0].idTeam;
            //then add the team in the rankings
            Ranks.addTeam(id,idTeam);
            commonServices.setCookie(res,"code",201);
            res.redirect('/tournaments/'+id);
        });
    }
    //second scenario
    else if(body.leave==="1"){
        //get the team
        Users.getTeamInfo(idUser,(teaminfo)=> {
            let idTeam = teaminfo[0].idTeam;
            //decrease the number of team in tournament
            Tournament.decreaseTeams(id);
            //delete from rankings
            Ranks.removeTeam(id,idTeam);
            commonServices.setCookie(res,"code",201);
            res.redirect('/tournaments/'+id);
        });
    }
};

exports.allTournaments = function(req,res){
    let infoUser = commonServices.isAdminLogged(req);
    let logged = infoUser.logged;
    let isAdmin = infoUser.isAdmin;
    Tournament.getAllOpenTournaments(async (data)=> {
        //use the same function as in selectPage above
        await Promise.all(data.map((row) => new Promise((resolve => {
            Games.getNameGame(row.idJeux, (gameName) => {
                row.date_debut = DATE.format(row.date_debut, 'YYYY-MM-DD');
                row.titleGame = gameName[0].libelle;
                resolve();
            });

        }))));
        res.render("./tournaments/all", {data, logged, isAdmin});
    });
};
