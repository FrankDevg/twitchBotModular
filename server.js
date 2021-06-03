
require("dotenv").config();

//
// Express setup.
//

const express = require("express");
const app = express();
const server = require("http").Server(app);

const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;


app.use(express.static("public"));
app.use(express.json());
/*
app.post("_eventsub/webhooks", (req, res) => {
  const challenge = req.body.challenge;
  console.log(challenge);

  if (challenge) {
    console.log('Verifying challenge.');
    res.status(200).send(challenge)
  } else {

    console.log(req.body);
  }


});
*/
//
server.listen(port, () => console.log(`Listening on port ${port}!`));

//
function channelId(token) {
  const url = `https://api.twitch.tv/helix/users?login=${process.env.BROADCASTER_NAME}`;
  const method = 'GET';
  const headers = {
    "Client-ID": process.env.CLIENT_ID,
    Authorization: "Bearer " + token,
    "Content-Type": "application/json"

  }

  fetch(url, {
    method,
    headers
  }).then(response => response.json()).then(data => {
    console.log(data)
  });
}



//
// Websocket server setup.
//

const WebSocket = require("ws");

const wss = new WebSocket.Server({ server: server });



//
const eventSubBridge = require('./lib/eventsub');

async function initialize() {
  // Subscribe to events.
 eventSubBridge.on("webhook",(data)=>{
   console.log(data);
 })
  await eventSubBridge.authenticate();

  // Listen for webhook hits.
 
  eventSubBridge.listen(server);

  console.log("Subscriptions List");
  let subscriptionData = await eventSubBridge.listSubs();

  for (let i = 0; i < subscriptionData.total; i++) {
    console.log(subscriptionData.data[i].id);

  }
  //delete subs
  /*for (let i = 0; i < subscriptionData.total; i++) {
    console.log("deleting:"+subscriptionData.data[i].id);
    eventSubBridge.unsubscribe(subscriptionData.data[i].id);

} */
     //eventSubBridge.subscribe("channel.update");
     eventSubBridge.subscribe("channel.follow");
//  eventSubBridge.subscribe("channel.follow");
}
initialize();
