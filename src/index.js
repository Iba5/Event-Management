require("dotenv").config()
const express = require('express');
const authRouter=require('./routes/authrouter');
const eventRouter = require('../src/routes/eventrouter')
const mongoose = require('mongoose')

const app = express();

const PORT = process.env.PORT || 3000
app.use(express.json())
app.use('/auth',authRouter)
app.use('/events',eventRouter)

app.get("/",(req,res)=>{
    res.send("Hello this is the server")
})

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB connected successfully")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("DB connection error:", err.message)
  })