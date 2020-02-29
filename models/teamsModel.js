const connection = require('../config/database');

const Teams = {
    getAllTeams : function(cb){
        connection.query('SELECT * FROM team',(err,data)=>{
            if(err){throw err;}
            cb(data);
        })
    },
    getTeamByName : function(name,cb){
        connection.query('SELECT * FROM team WHERE teamName=?',name,(err,data)=>{
            if(err){throw err;}
            cb(data[0]);
        })
    },
    createTeam : function(name,logo){
        connection.query('INSERT INTO team SET ?',{teamName:name,logo:logo},(err)=>{
            if(err)throw err;
            console.log("New team created ! ");
        });
    },
    increaseTeam : function(idTeam){
        connection.query('UPDATE team SET nombre = nombre + 1 WHERE id=?',idTeam,(err)=>{
            if(err)throw err;
            console.log("number of members updated");
        });
    }


};

module.exports = Teams;