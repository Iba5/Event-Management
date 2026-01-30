const { z }= require('zod')

const eventAdd = z.object({
    name : z.string().min(1,"name can't be null"),
    description: z.string().optional(),
    price: z.coerce.number().nonnegative(),
    start_date: z.coerce.date(),
    last_date: z.coerce.date(),
    participants: z.array(z.enum(['CSE','EEE','DS','ECE','PT','ME','MIN','IT','AIML','CE'])).min(1,"At one branch is required"),
    campus: z.array(z.enum(['AUS','ACET'])).min(1,"Atleast 1 campus is required")
}).superRefine((data, ctx) => {
    const start = new Date(data.start_date);
    const last = new Date(data.last_date);

    if (isNaN(start) || isNaN(last)) {
        ctx.addIssue({
            path: ["start_date"],
            message: "Invalid ISO datetime format"
        });
        return;
    }

    if (last < start) {
        ctx.addIssue({
            path: ["last_date"],
            message: "can't be less than the start date"
        });
    }
});

module.exports = { eventAdd }