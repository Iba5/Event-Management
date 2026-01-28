const mongoose = require('mongoose')

const Schema = mongoose.Schema

const eventSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:
    {
        type:String
    },
    price:{
        type:Number,
        required:true
    },
    start_date:{
        type:Date,
        required:true
    },
    last_date:{
        type:Date,
        required:true
    },
    participants:{
        type:[String],
        enum:['CSE','EEE','DS','ECE','PT','ME','MIN','IT','AIML','CE'],
        required: true
    },
    campus:{
        type:[String],
        enum:['AUS','ACET'],
        required:true
    }
}, {timestamps:{createdAt:"Added_at"}})

const registrationSchema = new Schema({
    event_id:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'event',
        required :true
    },    
    student_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'student',
        required:true
    },

},{timestamps:{createdAt:"registered_at"
}})
registrationSchema.index(
    {student_id:1,event_id:1},
    {unique:true}
)

const event = mongoose.model("event",eventSchema)
const registration = mongoose.model("registration",registrationSchema)

module.exports = { event,registration }