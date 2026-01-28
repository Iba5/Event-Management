const {  verify_access } = require('../utils/tokenManager');

const authmiddleware = async (req,res,next) => {
    const token = req.headers.authorization;
    // check if the token exist
    if(!token)
    {
        res.status(401).send({
            "message":"missing token"
        });
        return;
    }
    if(!token.startsWith("Bearer"))
    {
        res.status(401).send({
            "message":"invalid or expired token"
        });
        return;        
    }
    // split the and obtain the token from the bearer
    const access = token.split(" ")[1];
    // check if the token was tempered or not
    try{
        const user = verify_access(access,process.env.SECRET);
        // now if the token is valid we decode it
        req.user={id:user["id"] ,role:user["role"]};
        // no we check if the token is not expired or what
        next();
    }
    catch(err)
    {
        res.status(403).send({
            "message":"invalid or expired token"
        });
    }
}

module.exports = authmiddleware