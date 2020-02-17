const express = require('express')
require("dotenv").config();

const app = express()

const PORT = process.env.PORT
const dbURL = process.env.DATABASE_URL

app.get("/", (req,res) => {
    res.json({"temp": "70.0", "humidity": "50"})
})

app.post("/login", (req,res) => {
    // login a user, return a message and a token
    

})

app.post("/register", (req,res) => {
    // register a user, return a message and a token


})

app.post("/verify", (req,res) => {
    // verify a token, return a message and the token


})


app.listen(PORT, ()=>{ 
    console.log(`Server is running on port ${PORT}`)
})
