const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const keyconfig = require('../config/key');

//store the secret key for jws
const secretkey = keyconfig.secretkey;



//function that will inform if the user is logged or not in order to show the correct content
exports.checkLogged = function(req,res,next){
  let token = req.cookies.token;
  //check if there is a token
  if(typeof token !== 'undefined'){
    //check if the token is the correct sign
    jwt.verify(token,secretkey,(err,playload)=>{
      if(err){console.log(err);}
      if(typeof playload ==='undefined'){
        res.clearCookie("token");
        next();
      }
      else{
        res.redirect('/');
      }
    });
  }
  else{
    next();
  }
};

//function that clears the token from the cookies
exports.logout = function(req,res){
  //delete the token from cookies
  res.clearCookie("token");
  res.status(200).render('./redirect',{link:'/'});
};

exports.verifyAdmin = function(req,res,next){
  //store the jwt token
  const token = req.cookies.token;
  console.log(token);
  if(typeof token!=='undefined'){
    //check that the token is the correct signature
    jwt.verify(token,secretkey,(err,playload)=>{
      if(typeof playload!=='undefined'){
        if(playload.isAdmin){
          next();
        }
        else{
          res.status(403).render('./redirect',{link:'/'});
        }
      }
      else{
        res.status(401).render('./redirect',{link:'/'});
      }
    });
  }
  else{
    res.status(401).render('./redirect',{link:'/'});
  }
};

