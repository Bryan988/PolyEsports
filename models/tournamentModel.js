const connection = require('../config/database');

const Tournament = {
    getAllTournament : function(callback){
        connection.query('SELECT * FROM tournois',(err,data)=>{
            if(err){console.log(err);}
            callback(data);
        });
    },

    addTournament : function(idGame,minNbTeam,startingDate,description) {
        connection.query('INSERT INTO tournois SET ?', {
            idJeux: idGame,
            participantMin: minNbTeam,
            date_debut: startingDate,
            description:description
        }, (err, data) => {
            if (err) {
                throw err;
            }
            console.log('new tournament added')
        });
    },

};

module.exports = Tournament;