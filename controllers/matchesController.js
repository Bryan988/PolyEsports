const Matches = require('../models/matchesModel');
const Rank = require('../models/ranksModel');
const services = require('../services/commonServices');
const Ranks = require("../models/ranksModel");
const Teams = require("../models/teamsModel");


exports.addMatch = function(req,res){
    let idTournament = req.params.id;
    let body = services.sanitizeBody(req);
    if(body.idTeam1!==body.idTeam2) {
        if (body.score1 > body.score2) {
            //increase team1's score
            Rank.getTeamAById(idTournament, body.idTeam1, (infoRank) => {
                if (typeof infoRank !== 'undefined') {
                    //add the match to the DB
                    Matches.addMatch(idTournament, body.idTeam1, body.idTeam2, body.score1, body.score2);
                    //update the score in the corresponding tournament
                    Rank.updateScore(idTournament, body.idTeam1);
                    services.setCookie(res, 'code', 201);
                    services.setCookie(res, 'status', 1);
                    res.redirect("/users/admin/tournament/"+idTournament+"/matches/create");

                } else {
                    //bad inputs
                    services.setCookie(res, 'code', 400);
                    services.setCookie(res, 'status', 0);
                    res.redirect("/users/admin/tournament/"+idTournament+"/matches/create");
                }
            });
        }
        else if(body.score1===body.score2){
            //just add the match without any update in the ranks
            Matches.addMatch(idTournament, body.idTeam1, body.idTeam2, body.score1, body.score2);
            services.setCookie(res, 'code', 400);
            services.setCookie(res, 'status', 0);
            res.redirect("/users/admin/tournament/"+idTournament+"/matches/create");
        }
        else {
            Rank.getTeamAById(idTournament, body.idTeam2, (infoRank) => {

                if (typeof infoRank !== 'undefined') {
                    //add the match to the DB
                    Matches.addMatch(idTournament, body.idTeam1, body.idTeam2, body.score1, body.score2);
                    //update the score in the corresponding tournament
                    Rank.updateScore(idTournament, body.idTeam2);
                    services.setCookie(res, 'code', 201);
                    services.setCookie(res, 'status', 1);
                    res.redirect("/users/admin/tournament/"+idTournament+"/matches/create");
                } else {
                    //bad inputs
                    services.setCookie(res, 'code', 400);
                    services.setCookie(res, 'status', 0);
                    res.redirect("/users/admin/tournament/"+idTournament+"/matches/create");
                }
            });
        }
    }
    else{//bad inputs
        services.setCookie(res, 'code', 400);
        services.setCookie(res, 'status', 0);
        res.redirect("/users/admin/tournament/"+idTournament+"/matches/create");
    }
};

exports.addMatchPage = function(req,res){
    let idTournament = req.params.id;
    let status = services.getCookie(req,'status');
    let code = services.getCookie(req,'code');
    if(typeof code!=='undefined'){
        res.status(code);
    }
    Ranks.getAllTeamInTournament(idTournament,async (teams)=>{
        await Promise.all(teams.map((row) => new Promise((resolve => {
            Teams.getTeamById(row.idTeam,(teamName)=>{
                row.teamName=teamName.teamName;
                resolve();
            });

        }))));
        console.log(teams);
        res.render("./users/admin/matches/create",{status,csrfToken:req.csrfToken(),teams,idTournament});

    })
};

exports.allMatches = function(req,res){
    let idTournament = req.params.id;
    let code = services.getCookie(req,'code');
    if(typeof code !== 'undefined'){
        res.status(code);
    }
    Matches.getAllMatches(idTournament,async (matches)=>{
        await Promise.all(matches.map((row) => new Promise((resolve => {
            Teams.getTeamById(row.idTeam1, (info1) => {
                row.teamName1 = info1.teamName;
            });
            Teams.getTeamById(row.idTeam2, (info2) => {
                row.teamName2 = info2.teamName;
                resolve();
            });

        }))));
        console.log(matches);
        res.render("./users/admin/matches/allMatches",{idTournament,matches,csrfToken: req.csrfToken()});
    });
};
