let connection = require('../config/database');

const Games = {
    addGame: function (name, linkImg) {
        connection.query('INSERT INTO jeux SET ?', {libelle: name, image: linkImg}, (err) => {
            if (err) {
                throw err
            }
            console.log("new game added");
        });
    },
    allGames : function(cb){
        connection.query('SELECT * FROM jeux',(err,data)=>{
            if(err){throw err}
            cb(data);
        })
    },
    deleteGame : function(id){
        connection.query('DELETE FROM jeux WHERE id=?',id,(err)=>{
            if(err){throw err}
            console.log("game deleted");
        });
    },
    getNameGame : function(id,cb){
        connection.query('SELECT * FROM jeux WHERE id=?',id,(err,data)=>{
            if(err){console.log(err);}
            cb(data);
        })
    },
    selectGameById : function(id,cb) {
        connection.query('SELECT * FROM jeux WHERE id=?', id, (err, data) => {
            if (err) {
                console.log(err);
            }
            cb(data);
        });
    },
};

module.exports = Games;