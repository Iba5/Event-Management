const express = require('express')
const { eventAdd } = require('../validators/eventdetails')
const {  student } = require('../models/usermodel')
const { event,registration } = require('../models/eventmodel')
const { transaction }= require('../models/transactionmodel')
const route = express.Router()

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
            res.status(400).send(
                {
                    message: "information provided",
                    errors: data.error.format()
                }
            )
        }
    const new_event = await event.create(data.data)
    res.status(200).send({
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
        if(event_details.last_date < new Date.now())
        {
            res.status(400).send({
                "message":"event ended"
            })
            return
        }
        
        if(event_details.start_date < new Date.now())
        {
            res.status(400).send({
                "message":"Registration closed"
            })
            return
        }
        const student_details = student.findById({_id:req.user.id})
        if(!event_details.campus.includes(student_details.campus) || !event_details.campus.includes(student_details.branch))
        {
            res.status(403).send({
                "message":"You are not eligible for this event"
            })
        }
        const info = {
            "student_id":req.user.id,
            "event_id":req.body.event_id
        }
        const registered_event = await registration.create(info)
        if(!registered_event)
        {
            res.status(403).send({
                "message":"Already registered"
            })
            return
        }
        res.status(201).send({
            "registration_id":registered_event._id,
            "event":{
                ...event_details
            }
        })
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
    const events = await event.find().all()
    return events
})


module.exports = route;


