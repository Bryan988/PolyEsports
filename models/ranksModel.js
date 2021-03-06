
let connection = require('../config/database');


const Ranks = {
    getTeamAById : function(idTournament,idTeam,cb) {
        connection.query('SELECT id FROM classement WHERE idTournois=? and idTeam=?',[idTournament,idTeam],(err,data)=>{
            if(err){throw err;}
            cb(data[0]);
        })
    },
    addTeam : function(idTournament,idTeam){
        connection.query('INSERT INTO classement SET ?',{idTournois:idTournament,idTeam:idTeam,score:0},(err)=>{
            if(err){throw err;}
            console.log("new team joined the tournament");
        })
    },
    removeTeam : function(idTournament,idTeam){
        connection.query('DELETE FROM classement WHERE idTournois=? AND idTeam=?',[idTournament,idTeam],(err)=>{
            if(err){throw err;}
        })
    },
    getAllTeamInTournament : function(idTournament,cb){
        connection.query('SELECT * FROM classement WHERE idTournois=? ORDER BY score DESC',idTournament,(err,teams)=>{
                if(err){throw err;}
                cb(teams);
            });
    },
    updateScore : function(idTournament,idTeam){
        connection.query('UPDATE classement SET score = score + 1 WHERE idTournois=? AND idTeam=?',[idTournament,idTeam],(err)=>{
            if(err){throw err;}
            console.log("score updated");
        });
    },
    decreaseScore : function(idTournament,idTeam){
        connection.query('UPDATE classement SET score = score - 1 WHERE idTournois=? AND idTeam=?',[idTournament,idTeam],(err)=>{
            if(err){throw err;}
            console.log("score updated");
        });

    }
};

module.exports = Ranks;