const mongoose = require('mongoose')

const Schema = mongoose.Schema

const transSchema= new Schema({
    registration_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'registration',
        required :true
    },
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
    amount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['PENDING','FAILED','SUCCESS'],
        default: 'PENDING'
    },
    providerOrderId:{
        type:String,
        immutable:true
    },
    providerPaymentId:{
        type:String,
        immutable:true
    },   
},{timestamps:{updatedAt:"paid_at"}})
transSchema.index(
    {registration_id:1},
    {unique:true})

const transaction = mongoose.model("transaction",transSchema)
module.exports = {transaction}