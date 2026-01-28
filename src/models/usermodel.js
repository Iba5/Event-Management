const mongoose = require('mongoose');
const { refresh } = require('../utils/tokenManager');
const { required } = require('zod/mini');

const Schema = mongoose.Schema;

const studentSchema = new Schema({
    rollnumber:{
        type : String,
        unique:true,
        required: true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    name:{
        type : String,
        required : true
    },
    role:{
        type:String,
        enum:["student"],
        default:"student"
    },
    branch:{
        type:String,
        enum:['CSE','EEE','DS','ECE','PT','ME','MIN','IT','AIML','CE'],
        required:true
    },
    campus:{
        type: String,
        enum:['AUS','ACET'],
        required:true,
    },
    year:
    {
        type:Number,
        required:true,
    },
    refresh:{
        type:String,
        select:false
    },
    isActive:{
        type:Boolean,
        default:true
    }
})

const adminSchema = new Schema({
    emp_id:{
        type : Number,
        unique:true,
        required: true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    name:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["superadmin","admin","organizer"]
    },
    department:{
        type:String,
        enum:['ALL','CSE','EEE','DS','ECE','PT','ME','MIN','IT','AIML','CE'],
        required:true
    },
    campus:{
        type: String,
        enum:['ALL','AUS','ACET'],
        required:true,
    },
    refresh:{
        type:String,
        select:false
    },
    isActive:{
        type:Boolean,
        default:true
    }
})
const student = mongoose.model("student",studentSchema)
const manager = mongoose.model("manager",adminSchema)
module.exports = { student,manager }