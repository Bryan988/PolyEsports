const connection = require('../config/database');

const Tournament = {
    getAllTournament : function(callback){
        connection.query('SELECT * FROM tournois',(err,data)=>{
            if(err){console.log(err);}
            callback(data);
        });
    },

    addTournament : function(idGame,minNbTeam,startingDate,tournamentName,description) {
        connection.query('INSERT INTO tournois SET ?', {
            idJeux: idGame,
            participantMin: minNbTeam,
            date_debut: startingDate,
            name: tournamentName,
            description:description
        }, (err, data) => {
            if (err) {
                throw err;
            }
            console.log('new tournament added')
        });
    },

    getAllOpenTournaments : function(callback){
        let today = new Date(Date.now());
        connection.query('SELECT id,idJeux,participantMin,date_debut,name,description FROM tournois WHERE termine=0 AND date_debut>=?', today,(err,data)=>{
            if(err){throw err;}
            callback(data);

        })
    },

    updateTournament : function(id,idGame,minNbTeams,startingDate,name,description){
        connection.query('UPDATE tournois SET ? WHERE id=?',{idJeux:idGame,participantMin: minNbTeams,date_debut: startingDate,name:name,description:description},id);
        console.log("tournament updated");
    },

    getTournamentById : function(id,callback){
        connection.query('SELECT * FROM tournois WHERE id=?',id,(err,data)=>{
            if(err){console.log(err);}
            callback(data);
        })
    }



};

module.exports = Tournament;