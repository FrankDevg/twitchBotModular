const EventEmitter = require('events');
const { request } = require('http');
const fetch = require('node-fetch');

class EventSubBridge extends EventEmitter {
  webhookHost = "http://2ed79e42ea60.ngrok.io";
  webhookPath = "/_eventsub/webhooks";
  accessToken;

    constructor() {
        super();
        console.log('Hello');
    }
    //pubsub
 subscribe(type) {
    const url = "https://api.twitch.tv/helix/eventsub/subscriptions";
    const method = 'POST';
    const headers = {
      "Client-ID": process.env.CLIENT_ID,
      "Authorization": "Bearer " +this.accessToken,
      "Content-Type": "application/json"
  
    }
    const body = JSON.stringify({
      type: type,
      version: "1",
      condition: {
        broadcaster_user_id: process.env.BROADCASTER_ID
      },
      transport: {
        method: "webhook",
        callback: this.webhookHost + this.webhookPath,
        secret: process.env.CLIENT_SECRET
      }
    });
    fetch(url, {
      method,
      body,
      headers
    }).then(response => response.json()).then(data => { 
        console.log("Subscription Response:");        
        console.log(data);
     });
  }
    async authenticate() {
        const url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`
        const method = 'POST';

        const data = await fetch(url, { method })
            .then(response => response.json())
        console.log('authenticated');
        this.accessToken = data["access_token"];
    }
    //list all subs
    async listSubs() {
        const url = `https://api.twitch.tv/helix/eventsub/subscriptions`;
        const method = 'GET';
        const headers = {
            "Client-ID": process.env.CLIENT_ID,
            "Authorization": "Bearer " + this.accessToken,
        }
        //no espera un JSON .JSON no le agregamos
        let data = await fetch(url, {
            method,
            headers
        })
            .then(response => response.json())

        return data;
    }
    ///delete one sub
     unsubscribe(id) {
 //       const id = "123"
        const url = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`;
        const method = 'DELETE';
        const headers = {
            "Client-ID": process.env.CLIENT_ID,
            "Authorization": "Bearer " + this.accessToken,


        }
        fetch(url, {
            method,
            headers
        }).then(data => {
          console.log("Delete Result:");
          console.log(data);
        });
        

    }
    // Listen for requests.
    listen(server){
      server.on("request",(req,res)=>{
        if(req.path==this.webhookPath){
          if(req.method=='POST'){
            let body='';
            req.on('data',(data)=>{
              body+=data
            });
            req.on('end',()=>{
              try{
                let data = JSON.parse(body);
                if(data.challenge){
                  console.log("Verifying challenge.");
                  res.status(200).send(data.challenge);
                }else{
                this.emit("webhook",data);
                  res.end("OK");
                }

              }catch(e){
                console.log("Invalid body.");
                res.end('OKAAYEND');

              }
            })

          }else{
            res.status(200).send("OKay")

          }
        }
        
      });

      
    }
 
}



module.exports = new EventSubBridge();