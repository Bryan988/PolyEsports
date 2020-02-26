let Tournament = require('../models/tournamentModel');
let Games = require('../models/gamesModel');
let services=require('../services');
const DATE = require('date-and-time');

exports.addTournamentPage = function(req,res){
    Games.allGames((data)=>{
        let status=req.cookies.status;
        let date=req.cookies.date;
        let invalid=req.cookies.invalid;
        res.render('./users/admin/tournament/create',{data,status,date,invalid});
    });
};

exports.addTournament = function(req,res){
    let data = services.sanitizeBody(req);
    let date=data.startingDate;
    let newDate= new Date(date);
    console.log(typeof newDate.getFullYear());

    let today = new Date(Date.now());
    console.log(DATE.format(today,'YYYY/MM/DD'));
    if(typeof newDate.getFullYear()==='number'&& typeof newDate.getMonth()==='number' && typeof newDate.getDate()==='number') {
        if (newDate.getFullYear() < today.getFullYear()) {
            res.cookie("date", 1, {maxAge: 1 * 1000});
            res.redirect('/users/admin/tournament/create')
        } else {
            if (newDate.getMonth() < today.getMonth()) {
                res.cookie("date", 1, {maxAge: 1 * 1000});
                res.redirect('/users/admin/tournament/create');
            } else {
                if (newDate.getDate() < today.getDate()) {
                    res.cookie("date", 1, {maxAge: 1 * 1000});
                    res.redirect('/users/admin/tournament/create');
                } else {
                    console.log('day Good');
                    if (typeof data.idGame !== 'undefined' && typeof data.minNbTeams !== 'undefined' && typeof data.startingDate !== 'undefined' && typeof data.tournamentName !== 'undefined' && typeof data.description !== 'undefined') {
                        Tournament.addTournament(data.idGame, data.minNbTeams, newDate, data.tournamentName, data.description,);
                        res.cookie("status", 1, {maxAge: 1 * 1000});
                        res.redirect('/users/admin/tournament/create');
                    } else {
                        res.cookie("invalid", 1, {maxAge: 1 * 1000});
                        res.redirect('/users/admin/tournament/create');
                    }

                }
            }
        }
    }
    else{
        res.cookie("status", 1, {maxAge: 1 * 1000});
        res.redirect('/users/admin/tournament/create');
    }
};

exports.selectTournamentPage = function(req,res){
    const status = req.cookies.status;
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
exports.updateTournamentPage = function(req,res){
    const pathname=req.url.split('/');
    const id=pathname[3];
    Tournament.getTournamentById(id,(data)=>{
        console.log(data[0]);
        res.render('./users/admin/tournament/update',{data:data});
    })
};

exports.deleteTournament = function(req,res){
    const pathname = req.url.split('/');
    const id=pathname[3];
    Tournament.deleteTournamentById(id);
    res.cookie('status',1);
    res.redirect('/users/admin/tournament/edit')
};
//TODO ENVOYER LES RES.STATUS CORRESPONDANT
//TODO ENLEVER LES <body> et <html> des includes
