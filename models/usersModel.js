

var connection = require('../config/database');

var User = {
     checkMail: function(mail,cb){
          //function that return true if the mail is in database
          connection.query('SELECT id FROM user WHERE email=?', mail, function(error,results,fields){
               console.log(results[0].id);
               cb({
                    check: results[0] !== undefined,
                    idUser: results[0].id
               });
          });
     },
     createUser: function(name,firstname,pseudo,mail,pw){
          connection.query('INSERT INTO user SET ?',{name:name,firstname:firstname,pseudo:pseudo,email:mail,password:pw},function (error, results, fields) {
               if (error) throw error;
               console.log(results);
          });
     },
     //Retrieve the pw from database
     getPw : function(id,cb){
          connection.query('SELECT password FROM user WHERE id=?',id, (error,results)=>{
               if (error) throw error;
               cb(results[0].password);
          });
     },

};


module.exports = User;