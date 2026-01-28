const bcrypt = require('bcrypt')

const hashed = async (password)=>{
    return bcrypt.hash(password,10)
}

const hashed_refresh = async (token) => {
    return crypto.createHmac("sha256",process.env.REFRESH_SECRET).update(token).digest("hex")
}
const verify = async(password,hashed_pwd)=>{
    return bcrypt.compare(password,hashed_pwd)    
}


module.exports = { hashed , verify, hashed_refresh }