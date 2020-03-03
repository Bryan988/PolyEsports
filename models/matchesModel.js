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
    }
};

module.exports = Matches;