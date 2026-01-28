const { z }= require('zod')

const currdate = new Date()

const eventAdd = z.object({
    name : z.string().min(1,"name can't be null"),
    description: z.string().optional(),
    price: z.number().nonnegative(),
    start_date: z.coerce.date(),
    last_date: z.coerce.date(),
    participants: z.array(z.enum(['CSE','EEE','DS','ECE','PT','ME','MIN','IT','AIML','CE'])).min(1,"At one branch is required"),
    campus: z.array(z.enum(['AUS','ACET'])).min(1,"Atleast 1 campus is required")
}).superRefine((data,ctx)=>{
    if(data.last_date<data.start_date)
    {
        ctx.addIssue({
            path:["last_date"],
            message: "can't be less than the start date"
        })
    }
})

module.exports = { eventAdd }