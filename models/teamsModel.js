const connection = require('../config/database');

const Teams = {
    getAllTeams : function(cb){
        connection.query('SELECT * FROM team',(err,data)=>{
            if(err){throw err;}
            cb(data);
        })
    },
    getTeamById : function(id,cb){
        connection.query('SELECT * FROM team WHERE id=?',id,(err,data)=>{
            if(err){throw err;}
            cb(data);
        })
    },
    createTeam : function(name,logo){
        connection.query('INSERT INTO team SET ?',{teamName:name,logo:logo},(err)=>{
            if(err)throw err;
            console.log("New team created ! ");
        });
    },

};

module.exports = Teams;