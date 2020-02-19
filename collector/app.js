const express = require('express')
const ttn = require('ttn')

require('dotenv').config()

const PORT = process.env.PORT
const TTN_APPID = process.env.TTN_APPID
const TTN_ACCESSKEY = process.env.TTN_ACCESSKEY
const DATABASE_URL = process.env.DATABASE_URL

const app = express()

const pgp = require('pg-promise')()
pgp.pg.defaults.ssl = true
const db = pgp(DATABASE_URL)

ttn.data(TTN_APPID, TTN_ACCESSKEY)
  .then((client) => { 
      client.on("uplink", (devID, payload) => {
          db.none("INSERT INTO readings(temp, humidity, time, device_id) VALUES($1,$2,$3,$4);", [payload.payload_fields.temp, payload.payload_fields.humidity, payload.metadata.time, devID])
          //.then(() => {
          //    console.log("Saved reading to database")
          //    console.log(payload)
          //})
          .catch(error => console.log(error))
      })
      console.log("Listening for updates...")
  })
  .catch((err) => {
      console.error("Unable to connect to TTN server.")
      console.error(err)
  })

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
