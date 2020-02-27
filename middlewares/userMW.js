const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const keyconfig = require('../config/key');
const commonServices = require('../services/commonServices');
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
  commonServices.setCookie(res,'code',200);
  res.redirect('/');
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
          commonServices.setCookie(res,'code',403);
          res.redirect('/');
        }
      }
      else{
        commonServices.setCookie(res,'code',401);
        res.redirect('/')
      }
    });
  }
  else{
    commonServices.setCookie(res,'code',401);
    res.redirect('/');
  }
};

exports.createToken = function(res,result,idUser,pseudo,isAdmin){
  //sign the token
  console.log(isAdmin===1)
  jwt.sign({
    id:result.idUser,
    pseudo:pseudo,
    isAdmin:isAdmin===1
  }, secretkey, {expiresIn: "1d"}, (err, token) => {
    //if the token is not created return an internal  server error
    console.log("token");
    console.log(token);
    if (token === 'undefined') {
      res.status(500).render('./redirect',{link:'/users/login'});
    } else {
      res.cookie('token', token);
      // return the corresponding page for the user
      if (isAdmin===1) {
        res.status(200).render('./redirect',{link:"/users/admin"});
      } else {
        res.status(200).render('./redirect',{link:"/"});
      }
    }
  });
}

