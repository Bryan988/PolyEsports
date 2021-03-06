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
            services.setCookie(res, 'code', 201);
            services.setCookie(res, 'status', 1);
            res.redirect("/users/admin/tournament/"+idTournament+"/matches/create");
        }
        //increase team 2's score
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
    let idUser = services.getUserId(req);
    let status = services.getCookie(req,'status');
    let code = services.getCookie(req,'code');
    if(typeof code!=='undefined'){
        res.status(code);
    }
    //retrieve all the teams which joined the tournament
    Ranks.getAllTeamInTournament(idTournament,async (teams)=>{
        await Promise.all(teams.map((row) => new Promise((resolve => {
            Teams.getTeamById(row.idTeam,(teamName)=>{
                row.teamName=teamName.teamName;
                resolve();
            });
        }))));
        res.render("./users/admin/matches/create",{idUser,status,csrfToken:req.csrfToken(),teams,idTournament});
    })
};

exports.allMatches = function(req,res){
    let idTournament = req.params.id;
    let idUser = services.getUserId(req);
    let code = services.getCookie(req,'code');
    if(typeof code !== 'undefined'){
        res.status(code);
    }
    //retrieve all matches of the tournament
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
        res.render("./users/admin/matches/allMatches",{idUser,idTournament,matches,csrfToken: req.csrfToken()});
    });
};

exports.deleteMatch = function(req,res){
  let body = services.sanitizeBody(req);
  //retrieve information about the match with its id
  Matches.selectMatchById(body.id,(data)=>{
      if(typeof data !=='undefined'){
          Matches.deleteMatchById(body.id);
          services.writeAndSend(res,200);
      }
      else{
          services.writeAndSend(res,400);
      }
  })
};

exports.updateMatchPage = function(req,res){
    let idTournament = req.params.id;
    let idMatch = req.params.idmatch;
    let idUser = services.getUserId(req);

    Matches.selectMatchById(idMatch,async (match)=>{
        if(typeof match[0]!=='undefined') {

            //in order to know before the update who was ahead to update the general score afterwards
            if (match[0].score1 > match[0].score2) {
                match[0].ahead = 1;
            } else if (match[0].score1 < match[0].score2) {
                match[0].ahead = 2;
            } else {
                match[0].ahead = 0
            }
            await new Promise((resolve => {
                Teams.getTeamById(match[0].idTeam1, (info1) => {
                    match[0].teamName1 = info1.teamName;
                });
                Teams.getTeamById(match[0].idTeam2, (info2) => {
                    match[0].teamName2 = info2.teamName;
                    resolve();
                    //res render is here because if it is outside, one of the teamName is not put in the object match
                    res.render("./users/admin/matches/update", {
                        idUser,
                        match,
                        csrfToken: req.csrfToken(),
                        idTournament,
                        idMatch
                    });
                });
            }));
        }
        else{
            res.redirect('/users/admin/tournament/edit')
        }

    });
};
exports.updateMatch = function(req,res) {
    let idTournament = req.params.id;
    let idMatch = req.params.idmatch;
    let body = services.sanitizeBody(req);
    //first update the match itself
    Matches.updateMatch(idMatch,body.score1,body.score2);
    //increase the score according to the results
    if(body.score1>body.score2){
        if(body.ahead==='1'){
            services.writeAndSend(res,200);

        }
        else if(body.ahead==='0'){
            Ranks.updateScore(idTournament,body.idTeam1);
            services.writeAndSend(res,200);
        }
        else{
            Ranks.updateScore(idTournament,body.idTeam1);
            Ranks.decreaseScore(idTournament,body.idTeam2);
            services.writeAndSend(res,200);

        }

    }
    else if(body.score1<body.score2){
        if(body.ahead==='2'){
            services.writeAndSend(res,200);

        }
        else if(body.ahead==='0'){
            Ranks.updateScore(idTournament,body.idTeam2);
            services.writeAndSend(res,200);
        }
        else{
            Ranks.updateScore(idTournament,body.idTeam2);
            Ranks.decreaseScore(idTournament,body.idTeam1);
            services.writeAndSend(res,200);
        }
    }
    else{
        if(body.ahead==='1'){
            Ranks.decreaseScore(idTournament,body.idTeam1);
            services.writeAndSend(res,200);

        }
        else if(body.ahead==='2'){
            Ranks.decreaseScore(idTournament,body.idTeam2);
            services.writeAndSend(res,200);
        }
        else{
            services.writeAndSend(res,200);
        }
    }

};

