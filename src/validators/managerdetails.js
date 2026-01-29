const { z } = require('zod')

const normalize = (v)=>{
  return v.toLowerCase().replace(/\s+/g,"")
}
const CreateManager = z.object(
    {
        emp_id:z.coerce.number(),
        email:z.string()
            .email()
            .endsWith("@adityauniversity.in"),
        password: z.string()
        .min(8, "Password must be at least 8 characters")
        .refine(val => /[A-Z]/.test(val), {
          message: "Password must contain at least one uppercase letter",
        })
        .refine(val => /[a-z]/.test(val), {
          message: "Password must contain at least one lowercase letter",
        })
        .refine(val => /[0-9]/.test(val), {
          message: "Password must contain at least one number",
        })
        .refine(val => /[^A-Za-z0-9]/.test(val), {
          message: "Password must contain at least one special character",
        }),
        name:z.string().min(3),
        role:z.enum(['superadmin','admin','organizer']),
        department:z.enum(['ALL','CSE','EEE','DS','ECE','PT','ME','MIN','IT','AIML','CE']),
        campus:z.enum(['ALL','AUS','ACET']),
    }).superRefine(
        (data,ctx)=>{
         const start = normalize(data.name)
          const expected= `${start}@adityauniversity.in`
          console.log(data.email+" "+expected)
            if(data.email!=expected)
            {
                ctx.addIssue({
                    path:["email"],
                    message:"Wrong email format"
                })
            }
        })

    module.exports = { CreateManager }