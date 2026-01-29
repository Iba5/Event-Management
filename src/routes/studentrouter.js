const express = require('express')
const route = express.Router()
const { CreateStudent }= require('../validators/studentdetails')
const { en_access,  verify_access, refresh, verify_refresh  } = require('../utils/tokenManager')
const { student } = require('../models/usermodel')
const { hashed , verify, hashed_refresh } = require('../utils/passwordManager')
const cookieParser = require('cookie-parser')


route.use(cookieParser(process.env.REFRESH_SECRET))
route.post("/login",async (req,res)=>{
    const { rollnumber, password }= req.body
    // check if there exists the user with such credentials in the db
    const data = await student.findOne({"rollnumber":rollnumber}).select("+password +refresh")
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

route.post("/register",async (req,res)=>{
    const data = await CreateStudent.safeParseAsync(req.body)
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
    try {
        const new_student = await student.create(info);
        const access = await en_access(new_student.id,data.role)
        res.header("Authorization",`Bearer ${access}`)
        const tkn = await refresh(new_student)
        res.cookie("refresh_token",tkn,{
            httpOnly:true,
            // secure:true,
            sameSite:"strict",
            maxAge:1000*60*60*24*7,
            signed:true
        })
        res.status(201).json({
          success: true,
          message: "Student registered successfully",
          data:{
            "name":new_student.name,
            "rollnumber":new_student.rollnumber,
            "email":new_student.email,
            "branch":new_student.branch,
            "campus":new_student.campus,
            "year":new_student.year
        }
        });
      
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({
            success: false,
            message: "Student with this roll number already exists",
          });
        }
      
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
      
    // here we add the user into the database {this is a to do task not yet connected to db}
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
        const token = await hashed_refresh(refresh_token);
        const data = await student.findOne({refresh:token})
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
        res.status(401).send({
            "message":"Not Authenticated"
        })
        return
    }
    if(!req.headers.authorization)
    {
        res.status(401).send({
            "message":"Not Authenticated"
        })
        return
    }
        const token = await hashed_refresh(refresh_token);
        const data = await student.findOne({refresh:token})
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