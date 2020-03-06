const connection = require("../config/database");

const Matches = {
    addMatch : function(idTournament,idTeam1,idTeam2,score1,score2){
        connection.query('INSERT INTO round SET ?',{idTournois:idTournament,idTeam1:idTeam1,idTeam2:idTeam2,score1:score1,score2:score2},(err)=>{
            if(err) console.log(err);
            console.log("new match added");
        });
    },
    getAllMatches : function(idTournament,cb){
        connection.query('SELECT * FROM round WHERE idTournois=?',idTournament,(err,data)=>{
            if(err) console.log(err);
            cb(data);

        })
    },
    selectMatchById : function(id,cb){
        connection.query('SELECT * FROM round WHERE id=?',id,(err,data)=>{
            if(err) console.log(err);
            cb(data);

        });
    },
    deleteMatchById : function(id){
        connection.query('DELETE FROM round WHERE id=?',id,(err)=>{
            if(err) console.log(err);
            console.log("match deleted");
        });
    },
    updateMatch : function(id,score1,score2){
        connection.query('UPDATE round SET ? WHERE id=?',[{score1:score1,score2:score2},id],(err)=>{
            if(err)console.log(err);
        })
    },
    selectMatchesByTeams : function(idTeam,cb){
        connection.query("SELECT * FROM round WHERE idTeam1=? OR idTeam2=?",[idTeam,idTeam],(err,data)=>{
            if(err)console.log(err);
            cb(data);
        })
    }

};

module.exports = Matches;