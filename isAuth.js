const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('authorization');
    if(!authHeader){
        // console.log('authHeader : ' + authHeader)
        req.isAuth = false;
        return next();
    }
    console.log('authHeader : ' + authHeader)
    const token = authHeader.split(' ')[1];
    // console.log('token : '+ token)
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'somesupersecretsecret');  
    //    console.log('decodedToken')
    } catch(err){
        // console.log('catch errror')
        req.isAuth = false;
        return next();
    }
    if(!decodedToken){
        // console.log('No decodedtoken')
        req.isAuth = false;
        return next();
    }
    // console.log('ending')
    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();
}