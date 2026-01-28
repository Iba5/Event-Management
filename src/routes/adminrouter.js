const express = require('express')
const route = express.Router()
const { CreateManager }= require('../validators/Managerdetails')
const { en_access,  refresh  } = require('../utils/tokenManager')
const { manager } = require('../models/usermodel')
const { hashed , verify , hashed_refresh } = require('../utils/passwordManager')
const cookieParser = require('cookie-parser')
const { adminmiddleware } = require('../middleware/adminregister')

route.use(cookieParser(process.env.REFRESH_SECRET))
route.post("/login",async (req,res)=>{
    const { email, password }= req.body
    // check if there exists the user with such credentials in the db
    const data = await manager.findOne({"email":email}).select("+password +refresh")
    if(!data)
    {
        res.status(400).send({
            "message":"Invalid credentials"
        }) 
        return
    }
    const pwd = await verify(password,data.password)
    if(!pwd)
    {
        res.status(400).send({
            "message":"Invalid credentials"
        })    
        return
    }
    data.isActive=true
    await data.save()
    // 1. We replace the token in the db
    // 2. This will logout the device that was they ensuring only 
    //    1 device is logged in reducing over traffic of 1 account over accessed
    //    this makes the server not being overloaded so as the database
        const tkn = await refresh(data)
        res.cookie("refresh_token",tkn,{
            httpOnly:true,
            // secure:true,
            sameSite:"strict",
            maxAge:1000*60*60*24*7,
            signed:true
        }) 
    const access = await en_access(data._id,data.role)
    res.header("Authorization",`Bearer ${access}`)
    res.status(200).send({
        "message":"Welcome back"
    })
})

route.post("/register",adminmiddleware,async (req,res)=>{
    const data = await CreateManager.safeParseAsync(req.body)
    if(!data.success)
    {
        res.status(400).send(
            {
                message: "information provided",
                errors: data.error.format()
            }
        )
        return
    }
    // console.log(`password:${req.body.password}`)
    const db_pwd = await hashed(req.body.password)
    const info = {
        ...req.body,
        password:db_pwd
    }
    const new_manager = await manager.create(info)
    // here we add the user into the database {this is a to do task not yet connected to db}
    const access = await en_access(new_manager.id,new_manager.role)
    res.header("Authorization",`Bearer ${access}`)
    const tkn = await refresh(new_manager)
    res.cookie("refresh_token",tkn,{
        httpOnly:true,
        // secure:true,
        sameSite:"strict",
        maxAge:1000*60*60*24*7,
        signed:true
    })
    res.status(201).send({
        "name":new_manager.name,
        "emp_id":new_manager.emp_id,
        "email":new_manager.email,
        "department":new_manager.department,
        "campus":new_manager.campus
    })
})

route.post("/logout",async (req,res)=>{
    const refresh_token = req.signedCookies.refresh_token
    if(!refresh_token)
    {
        res.status(200).send({
            "message":"Already logged out"
        })
        return
    }
        const token = hashed_refresh(refresh_token);
        const data = await manager.findOne({refresh:token})
        if(!data){
            res.status(200).send({
                "message":"user doesn't exist"
            })
            return
        }
        data.isActive=false
        await data.save()
        res.clearCookie("refresh_token",{
            httpOnly:true,
            sameSite:"strict",
            signed:true
        })
        res.status(200).send({
            "message":"logged out"
        })
})

route.post("/renew", async (req,res)=>
{
    const refresh_token = req.signedCookies.refresh_token
    if(!refresh_token)
    {
        res.status(403).send({
            "message":"Not Authenticated"
        })
        return
    }
    if(!req.headers.authorization)
    {
        res.status(403).send({
            "message":"Not Authenticated"
        })
        return
    }
        const token = hashed_refresh(refresh_token);
        const data = await manager.findOne({refresh:token})
        if(!data){
            res.status(404).send({
                "message":"user doesn't exist"
            })
            return
        }
        if(!data.isActive)
        {
            res.status(403).send({
                "message":"User Logged out"
            }) 
            return
        }
        const new_token = await en_access(data._id,data.role)
        res.header("Authorization",`Bearer ${new_token}`)
        res.status(200).send()
})

module.exports = route;