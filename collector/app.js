require("dotenv").config();
const ttn = require('ttn')

const PORT = process.env.PORT

const appID = process.env.APPID
const accessKey = process.env.ACCESSKEY
const DATABASE_URL = process.env.DATABASE_URL

ttn.data(appID, accessKey)
  .then((client) => { 
      client.on("uplink", (devID, payload) => {
          // TODO - send reading to database here!!
          console.log("Received uplink from ",devID)
          console.log(payload)
      })
      console.log("Listening for updates...")
  })
  .catch((err) => {
      console.error("Unable to connect to TTN server.")
      console.error(err)
  })
