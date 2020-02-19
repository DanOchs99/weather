const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

require('dotenv').config()

const PORT = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL
const JWT_SECRET = process.env.JWT_SECRET
const SALT_ROUNDS = 10

const app = express()

const pgp = require('pg-promise')()
pgp.pg.defaults.ssl = true
const db = pgp(DATABASE_URL)

app.use(cors())
app.use(express.json())

// authorization middleware
const auth = (req,res,next) => {
    // get the headers from this request
    const headers = req.headers['authorization'] // Bearer <token>
    if (headers) {
        const token = headers.split(' ')[1]
        // verify the token
        jwt.verify(token, JWT_SECRET, (error,decoded) => {
            if (error) {
                // unable to verify the token
                res.status(401).json({"status": "Authentication failed"})
            }
            else {
                // token verified
                req.headers['payload'] = decoded
                next();
            }
        })
    }
    else
    {
        res.status(401).json({"status": "Authentication failed"})
    }
}

// get latest sensor reading
app.get("/", auth, (req,res) => {
    // TODO: not hardcode the device - for now just get deviceId '001'
    const deviceId = '001'

    // TODO: add an ORDER BY clause and LIMIT 1 reading!!
    db.oneOrNone("SELECT temp, humidity, time FROM readings WHERE device_id=$1;", [deviceId])
    .then(results => {
        if (results) {
            const fake_timestamp = new Date().toLocaleTimeString()
            const reading = {temp: '69.9', humidity: '60', time: fake_timestamp}
            res.status(200).json({success: true, message: '', reading: reading})
        }
        else {
            res.status(200).json({success: false, message: 'No readings available'})
        }
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error'})
    })
})

// login a user, return a message and a token
app.post("/login", (req,res) => {
    const username = req.body.user.username;
    const password = req.body.user.password;
    db.oneOrNone("SELECT id, username, hash FROM users WHERE username=$1;", [username])
    .then(results => {
        if (results) {
            // username found, check password
            bcrypt.compare(password, results.hash)
            .then(passwordsMatch => {
                if (passwordsMatch) {
                    // password good - send back a token
                    const token = jwt.sign({username: username, id: results.id}, JWT_SECRET)
                    res.status(200).json({token: token, id: results.id})
                }
                else {
                    // password did not match, send back an error 
                    res.status(401).json({message: 'Authentication failed'})
                }
            })
            .catch(error => {
                console.log(error)
                res.status(401).json({message: 'Authentication failed'})
            })
        }
        else {
            res.status(401).json({message: 'Authentication failed'})
        } 
    })
    .catch(error => {
        console.log(error)
        res.status(401).json({message: 'Authentication failed'})
    })
})

// register a user, return a message and a token
app.post("/register", (req,res) => {
    // expects a user object { username: "username", password: "password" } in the body
    let username = req.body.username
    let password = req.body.password

    db.any("SELECT id, username, hash FROM users;")
    .then(results => {
        // verify that the username does not exist
        let checkName = results.filter(item => item.username == username);
        if (checkName.length != 0) {
            res.status(400).json({
                success: false,
                message: 'Please choose a different username / password.'
              });
        } 
        else {
            // hash the password provided           
            bcrypt.hash(password, SALT_ROUNDS)
            .then(hash => {
                db.one("INSERT INTO users(username, hash) VALUES($1, $2) RETURNING id;", [username, hash])
                .then(result => {
                    // for now - automatically connect any registered user to device id 001
                    db.none("INSERT INTO usersdevices(user_id, device_id) VALUES($1, $2);", [result.id, '001'])
                    .then(() => {
                        const u = { username: username, id: result.id }
                        const token = jwt.sign(u, process.env.JWT_SECRET)
                        // send back a token
                        res.json({
                            success: true,
                            message: 'New user created',
                            token: token
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            success: false,
                            message: 'Error creating new user.'
                        })
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        success: false,
                        message: 'Error creating new user.'
                    });
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Error creating new user.'
                });
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Error creating new user.'
        });
    }); 
})

// verify a token, return a message and the token
app.post("/verify", (req,res) => {
    const token = req.body.token
    jwt.verify(token, JWT_SECRET, (error,decoded) => {
        if (error) {
            // unable to verify the token
            res.status(401).json({status: "Authentication failed"})
        }
        else {
            // token verified
            req.headers['payload'] = decoded
            res.status(200).json({username: decoded.username})
        }
    })
})

app.listen(PORT, ()=>{ 
    console.log(`Server is running on port ${PORT}`)
})
