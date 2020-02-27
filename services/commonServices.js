

exports.checkPastDate = function(newDate) {
    let today = new Date(Date.now());
    if (newDate.getFullYear() < today.getFullYear()) {
        return false;
    } else {

        if (newDate.getMonth() < today.getMonth()) {
            return false;
        } else {
            if (newDate.getMonth()===today.getMonth()) {
                if (newDate.getDate() < today.getDate()) {
                    return false;
                }
                else{
                    return true;
                }
            }else{
                return true;
            }
        }
    }
};

exports.sanitizeBody=function(req){
    const body = req.body;
    let retour = {};
    for(const parameters in body){
        retour[parameters]=req.sanitize(body[parameters]);
    }
    return retour;
};

exports.setCookie = function(res,name,value){
    return res.cookie(name,value,{maxAge : 3*1000,httpOnly: true});
};
exports.getCookie = function(req,name){
    if(typeof req.cookies !=='undefined'){
        return req.cookies[name];
    }
    else{
        return undefined;
    }
};