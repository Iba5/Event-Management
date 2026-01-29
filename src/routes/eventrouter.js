const express = require('express')
const { eventAdd } = require('../validators/eventdetails')
const {  student } = require('../models/usermodel')
const { event,registration } = require('../models/eventmodel')
const { transaction }= require('../models/transactionmodel')
const authmiddleware = require('../middleware/authmiddleware')
const route = express.Router()

route.use(authmiddleware);
route.post("/add",async(req,res)=>{
    if(req.user.role === "student")
    {
        res.status(401).send({
            "message":"You are not authorized to perform this operation"
        })
        return
    }
    const data = await eventAdd.safeParseAsync(req.body)
    if(!data.success)
        {
            res.status(400).json(
                {
                    message: "information provided",
                    errors: data.error.format()
                }
            )
        }
    const new_event = await event.create(data.data)
    res.status(201).json({
        "message":"new event added",
        "details":new_event
    })
})

route.post("/register",async(req,res)=>{
    if(req.user.role !== "student")
        {
            res.status(401).send({
                "message":"You are not authorized to perform this operation"
            })
            return
        }    
        const event_details = await event.findById({_id:req.body.event_id})
        if(!event_details)
        {
            res.status(404).send({
                "message":"No such event"
            })
            return
        }
        const todayMs = new Date().getTime()
        const startMs = new Date(event_details.start_date).getTime()
        const endMs = new Date(event_details.last_date).getTime()
        if (todayMs < startMs || todayMs > endMs) {
            return res.status(403).json({
              message: "Event registration is closed",
            });
          }

        const student_details = await student.findById({_id:req.user.id})
        if(!(event_details.campus.includes(student_details.campus) && event_details.participants.includes(student_details.branch )))
        {
            res.status(403).json({
                "message":"You are not eligible for this event",
            })
            return
        }
        const info = {
            "student_id":req.user.id,
            "event_id":req.body.event_id
        }
        try{
            const registered_event = await registration.create(info)
            res.status(201).json({
                "success":true,
                "registration_id":registered_event._id,
                "student":{
                    "name":student_details.name,
                    "rollnumber":student_details.rollnumber,
                    "branch":student_details.branch,
                    "campus":student_details.campus
                },
                "event":{
                    "event_name":event_details.name,
                    "description":event_details.description,
                    "start_date":event_details.start_date,
                    "end_date":event_details.last_date
                }
            })
        }
        catch (error) {
            if (error.code === 11000) {
              return res.status(409).json({
                success: false,
                message: "Already registered the event",
              });
            }
        }
})

route.post("/payment",async(req,res)=>{
    if(req.user.role !== "student")
        {
            res.status(401).send({
                "message":"You are not authorized to perform this operation"
            })
            return
        }
        const registered_event = await registration.findById(req.body.registration_id)
        if(!registered_event)
        {
            res.status(404).send({
                "message":"You are not registered"
            })
            return
        }
        const event_details = await event.findById(registered_event.event_id)
        
})
route.get("/events",async(req,res)=>{
    let events = await event.find()
    res.status(200).json({
        "events":events
    })
})


module.exports = route;


