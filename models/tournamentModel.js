const connection = require('../config/database');
const DATE = require('date-and-time');

const Tournament = {
    getAllTournaments : function(callback){
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
        connection.query('SELECT * FROM tournois WHERE termine=0',(err,data)=>{
            if(err){throw err;}
            callback(data);

        })
    },

    getAllEndedTournaments :  function(callback) {
        let now = new Date(Date.now());
        let today = DATE.format(now, 'YYYY/MM/DD');
        connection.query('SELECT * FROM tournois WHERE termine=1', (err, data) => {
            if (err) {
                throw err;
            }
            callback(data);
        });
    },

    updateTournament : function(id,idGame,minNbTeams,startingDate,name,description){
        connection.query('UPDATE tournois SET ? WHERE id=?',[{idJeux:idGame,participantMin: minNbTeams,date_debut: startingDate,name:name,description:description},id], (err)=>{
            if(err){console.log(err);}
            console.log("tournament updated");
        });
    },

    getTournamentById : function(id,callback){
        connection.query('SELECT * FROM tournois WHERE id=?',id,(err,data)=>{
            if(err){console.log(err);}
            callback(data);
        });
    },

    deleteTournamentById : function(id){
        connection.query('DELETE FROM tournois WHERE id=?',id,(err)=>{
            if(err){console.log(err);}
            console.log("Tournament Deleted");
        })
    },
    increaseTeams : function(id){
        connection.query('UPDATE tournois SET nbParticipant = nbParticipant + 1 WHERE id=?',id,(err)=> {
            if (err) {
                throw err;
            }
        });
    },
    decreaseTeams : function(id){
        connection.query('UPDATE tournois SET nbParticipant = nbParticipant - 1 WHERE id=?',id,(err)=> {
            if (err) {
                throw err;
            }
        });
    },

    endTournament : function(id) {
        connection.query('UPDATE tournois SET termine = 1 WHERE id=?', id, (err) => {
            if (err) {
                console.log(err);
            }
        });
    },

};

module.exports = Tournament;