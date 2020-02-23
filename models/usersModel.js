

var connection = require('../config/database');


var User = {
     checkMail: function(mail,cb){
          //function that return true if the mail is in database
          connection.query('SELECT id FROM user WHERE email=?', mail, function(error,results,fields){

               cb({
                    check: results[0] !== undefined,
                    idUser: results[0].id
               });
          });
     },
     createUser: function(name,firstname,pseudo,mail,pw){
          connection.query('INSERT INTO user SET ?',{name:name,firstname:firstname,pseudo:pseudo,email:mail,password:pw},function (error, results) {
               if (error) throw error;
               console.log("user added");
          });
     },
     //Retrieve the pw from database
     getPw : function(id,cb){
          connection.query('SELECT password FROM user WHERE id=?',id, (error,results)=>{
               if (error) throw error;
               cb(results[0].password);
          });
     },

     //retrieve pseudo and if the user is admin for the token
     getInfoToken : function(id,cb){
          connection.query('SELECT pseudo,admin FROM user where id=?',id, (error,results)=>{
               if (error) throw error;
               console.log(results[0]);
               cb({pseudo : results[0].pseudo, isAdmin : results[0].admin});
          })
     }

};


module.exports = User;