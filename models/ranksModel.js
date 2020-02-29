
let connection = require('../config/database');


const Ranks = {
    getTeamAById : function(idTournament,idTeam,cb) {
        connection.query('SELECT id FROM classement WHERE idTournois=? and idTeam=?',[idTournament,idTeam],(err,data)=>{
            if(err){throw err;}
            cb(data[0]);
        })
    },
    addTeam : function(idTournament,idTeam,position){
        connection.query('INSERT INTO classement SET ?',{idTournois:idTournament,idTeam:idTeam,position:0},(err)=>{
            if(err){throw err;}
            console.log("new team joined the tournament");
        })
    },
    removeTeam : function(idTournament,idTeam){
        connection.query('DELETE FROM classement WHERE idTournois=? AND idTeam=?',[idTournament,idTeam],(err)=>{
            if(err){throw err;}
        })
    }
};

module.exports = Ranks;