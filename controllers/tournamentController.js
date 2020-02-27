let Tournament = require('../models/tournamentModel');
let Games = require('../models/gamesModel');
let userServices = require('../services/Userservices');
let commonServices = require('../services/commonServices');
const DATE = require('date-and-time');

exports.addTournamentPage = function(req,res){
    Games.allGames((data)=>{
        let status=commonServices.getCookie(req,'status');
        let date=commonServices.getCookie(req,'date');
        let invalid=commonServices.getCookie(req,'invalid');
        res.render('./users/admin/tournament/create',{data,status,date,invalid});
    });
};

exports.addTournament = function(req,res){
    let data = commonServices.sanitizeBody(req);
    let date=data.startingDate;
    let newDate= new Date(date);

    if(typeof newDate.getFullYear()==='number'&& typeof newDate.getMonth()==='number' && typeof newDate.getDate()==='number') {
        if(commonServices.checkPastDate(newDate)){
            if (typeof data.idGame !== 'undefined' && typeof data.minNbTeams !== 'undefined' && typeof data.startingDate !== 'undefined' && typeof data.tournamentName !== 'undefined' && typeof data.description !== 'undefined') {
                Tournament.addTournament(data.idGame, data.minNbTeams, newDate, data.tournamentName, data.description,);
                commonServices.setCookie(res,"status", 1);
                res.redirect('/users/admin/tournament/create');
            } else {
                commonServices.setCookie(res,"invalid", 1);
                res.redirect('/users/admin/tournament/create');
            }
        }
        else{
            commonServices.setCookie(res,'date',1);
            res.redirect('/users/admin/tournament/create');
        }
    }
    else{
        commonServices.setCookie(res,"status", 1);
        res.redirect('/users/admin/tournament/create');
    }
};

exports.selectTournamentPage = function(req,res){
    const status = commonServices.getCookie(req,'status');
    Tournament.getAllOpenTournaments(async (data)=> {
        //await is going to wait that the promise is ready

        await Promise.all(data.map((row) => new Promise((resolve => {
            //However, promise will wait that ALL promises are ended before being ready
            Games.getNameGame(row.idJeux,(gameName)=>{
                row.date_debut=DATE.format(row.date_debut,'YYYY/MM/DD');
                row.titleGame=gameName[0].libelle;
                resolve();
            });

        }))));

        console.log(data);
        res.render('./users/admin/tournament/viewTournaments',{data:data,status:status});
    });
};

exports.deleteTournament = function(req,res){
    const pathname = req.url.split('/');
    const id=pathname[3];
    Tournament.deleteTournamentById(id);
    commonServices.setCookie(res,'status',1);
    res.redirect('/users/admin/tournament/edit')
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

            res.render('./users/admin/tournament/update',{data,games,status,date,invalid});
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
                res.redirect('/users/admin/tournament/edit');
            } else {
                commonServices.setCookie(res,"invalid", 1);
                res.redirect('/users/admin/tournament/update/'+id);
            }
        }
        else{
            commonServices.setCookie(res,'date',1);
            res.redirect('/users/admin/tournament/update/'+id);
        }
    }
    else{
        commonServices.setCookie(res,"invalid", 1);
        res.redirect('/users/admin/tournament/update/'+id);
    }

}
//TODO ENVOYER LES RES.STATUS CORRESPONDANT

