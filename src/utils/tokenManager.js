const jwt = require('jsonwebtoken')
const { hashed_refresh }= require('../utils/passwordManager')
const crypto = require('crypto')

const en_access = async (id,role)=>
{
    const payload = {
        "id":id,
        "role":role,
    }
    return jwt.sign(payload,process.env.SECRET,{expiresIn: "7m"})
}

const verify_access = (token)=>{
    return jwt.verify(token,process.env.SECRET)
}

const refresh = async(user)=>
{
    const token = crypto.randomBytes(64).toString("hex")
    // hash the token
    const db_token = await hashed_refresh(token)
    // store in database
    user.refresh=db_token
    await user.save()
    return token
}


module.exports = { en_access, verify_access, refresh }
