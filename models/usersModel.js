const connection = require('../config/database');


const User = {
     checkMail: function(mail,cb){
          //function that return true if the mail is in database
          connection.query('SELECT id FROM user WHERE email=?', mail, function(error,results){
               if(error){console.log(error);}
               //console.log(results);
               if (typeof results[0] !== 'undefined'){
                    cb({
                         check: results[0] !== undefined,
                         idUser: results[0].id
                    });
               }
               else{cb();}
          });
     },
     createUser: function(name,firstname,pseudo,code,mail,pw){
          connection.query('INSERT INTO user SET ?',{name:name,firstname:firstname,pseudo:pseudo,code:code,email:mail,password:pw},function (error) {
               if (error) throw error;
               console.log("user added");
          });
     },
     updateUser : function(id,name,firstname,pseudo){
          connection.query('UPDATE user SET ? WHERE id=?',[{name:name,firstname:firstname,pseudo:pseudo},id],(err)=>{
               if (err) throw err;
          })

     },
     //Retrieve the pw from database
     getPw : function(id,cb){
          connection.query('SELECT password FROM user WHERE id=?',id, (error,results)=>{
               if (error) throw error;
               cb(results[0].password);
          });
     },
     updatePw : function(id,pw){
          connection.query('UPDATE user SET ? WHERE id=?',[{password:pw},id],(err)=>{
               if (err) throw err;
          })
     },

     //retrieve pseudo and if the user is admin for the token
     getInfoToken : function(id,cb){
          connection.query('SELECT pseudo,admin FROM user WHERE id=?',id, (error,results)=>{
               if (error) throw error;
               console.log(results[0]);
               cb({pseudo : results[0].pseudo, isAdmin : results[0].admin});
          })
     },
     canApplyForTeam : function(id,cb){
          connection.query('SELECT idTeam,pending,captain FROM user WHERE id=?',id,(err,data)=>{
               if (err) throw err;
               cb(data);
          });
     },

     setToCaptain : function(id,idTeam){
          connection.query('UPDATE user SET ? WHERE id=?',[{captain:1,idTeam:idTeam},id],(err)=>{
               if(err)throw err;
               console.log("user now captain");
          });
     },
     noLongerCaptain : function(idUser){
          connection.query('UPDATE user SET captain = 0 WHERE id=?',idUser,(err)=>{
               if(err)throw err;
               console.log("user no longer captain");
          });
     },
     appliedToTeam : function(idUser,idTeam){
          connection.query('UPDATE user SET ? WHERE id=?',[{idTeam:idTeam,pending:1},idUser],(err)=>{
               if(err)console.log(err);
               console.log("user's team updated");
          });
     },
     cancelledRequest : function(idUser) {
          connection.query('UPDATE user SET ? WHERE id=?', [{idTeam: 0, pending: 0}, idUser], (err) => {
               if (err) console.log(err);
               console.log("user's request canceled");
          });
     },
     getAllTeamMembers : function(idTeam,cb){
          connection.query('SELECT id,pseudo,pending FROM user WHERE idTeam=?',idTeam,(err,data)=>{
               if (err) console.log(err);
               cb(data);
          })
     },
     acceptedInTeam : function(idUser){
          connection.query('UPDATE user SET ? WHERE id=?', [{pending: 0}, idUser], (err) => {
               if (err) console.log(err);
               console.log("user's request accepted");
          });
     },
     getTeamInfo : function(idUser,cb) {
          connection.query('SELECT idTeam,captain FROM user WHERE id=?', idUser, (err, data) => {
               if (err) console.log(err);
               cb(data);
          });
     },
     getUserInfo : function(idUser,cb){
          connection.query('SELECT pseudo,name,firstname,email,idTeam FROM user WHERE id=?',idUser,(err,data)=>{
               if (err) console.log(err);
               cb(data[0]);
          })
     },
     getAllPendingMembers : function(idTeam,cb){
          connection.query('SELECT id FROM user WHERE idTeam=? AND pending=1',idTeam,(err,data)=>{
               if (err) console.log(err);
               cb(data);
          })
     },
     verifyCode : function(code,cb){
          connection.query('SELECT id FROM user WHERE code=?',code,(err,data)=>{
               if (err) console.log(err);
               cb(data[0]);
          })
     },
     verified : function(id){
          connection.query('UPDATE user SET ? WHERE id=?',[{verified:1},id],(err)=>{
               if (err) console.log(err);
          })
     },
     checkVerified : function(id,cb){
          connection.query('SELECT verified FROM user WHERE id=?',id,(err,data)=>{
               if (err) console.log(err);
               cb(data[0]);
          })
     },
     updateCode : function(id,code){
          connection.query('UPDATE user SET ? WHERE id=?',[{code:code},id],(err)=>{
               if(err) console.log(err);
          })
     },

};


module.exports = User;