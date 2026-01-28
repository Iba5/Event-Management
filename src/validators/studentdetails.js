const { z } = require('zod')

const curryear = new Date().getFullYear()
const CreateStudent = z.object(
    {
        rollnumber:z.string()
        .regex(
            /^\d{2}B(11|21)[A-Z]{2}\d{3}$/,
            "invalid rollnumber"
        ),
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
        role:z.literal("student"),
        branch:z.enum(['CSE','EEE','DS','ECE','PT','ME','MIN','IT','AIML','CE']),
        campus:z.enum(['AUS','ACET']),
        year: z.number()
        .min(curryear-4,"invalid enrollment year")
        .max(curryear,"invalid enrollment year")
    }).superRefine(
        (data,ctx)=>{
            if(!data.email.startsWith(data.rollnumber))
            {
                ctx.addIssue({
                    path:["email"],
                    message:"Wrong email format"
                })
            }
        })

    module.exports = { CreateStudent }