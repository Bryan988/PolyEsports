let Tournament = require('../models/tournamentModel');
let Games = require('../models/gamesModel');

exports.addTournamentPage = function(req,res){
    Games.allGames((data)=>{
        let status=req.cookies.status;
        let date=req.cookies.date;
        res.render('./users/admin/tournament/create',{data,status,date});
    });
};

exports.addTournament = function(req,res){
    console.log(req.body);
    let date=req.body.statingDate;
    let newDate= new Date(date).toString();
    console.log(newDate);
    //let splitDate=date.split('-');

    let today = new Date(Date.now());
    console.log(today.getFullYear());

    if(splitDate[0]<today.getFullYear()){
        res.cookie("date",1,{maxAge:1*1000});
        res.redirect('/users/admin/tournament/create')
    }
    else{
        if(split[1]<today.getMonth()){
            res.cookie("date",1,{maxAge:1*1000});
            res.redirect('/users/admin/tournament/create');
        }
        else{
            if(split[2]<today.getDay()){
                res.cookie("date",1,{maxAge:1*1000});
                res.redirect('/users/admin/tournament/create');
            }
            else{
                res.cookie("status",1,{maxAge:1*1000});
                res.redirect('/users/admin/tournament/create');
            }
        }
    }


    res.redirect('/users/admin/tournament/create')
}