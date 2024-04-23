import express from "express";
import cors from "cors";
const app = express();

import avayaConfig from "./config/avaya.js";
import {
  fetchAccessToken,
  createSubscription,
  sendMessage,
  sendSMS,
} from "./helpers/index.js";

// async function fu() {
//   try {
//     // let tokenResp = await fetchAccessToken();
//     // let tokenResp = await createSubscription();
//     let tokenResp = await sendMessage("anonmouse", "kem cho");

//     console.log("resppppppppppppp+.> ", tokenResp);
//   } catch (error) {
//     console.log("eeeeeeeeeeeeeeeeeeee========> ", error.detail);
//   }
// }
// fu();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("avaya connector server started at ", port));

app.get("/callback", (req, res) => {
  console.log("callback get request");
  res.send("callback url working");
});

app.post("/callback", async (req, res) => {
  try {
    const reqBody = req.body;
    console.log(
      `======== callback post request ${reqBody.eventType} ${reqBody.senderParticipantType} =========`
    );
    if (reqBody.eventType === "MESSAGES") {
      if (
        reqBody.senderParticipantType === "AGENT" ||
        reqBody.senderParticipantType === "SYSTEM"
      ) {
        //  send this data to client/customer
        let replyMsg = reqBody.body.elementText.text;
        let recipiant = reqBody.recipientParticipants[0].providerParticipantId;
        console.log("Recipient=> ", recipiant, "  replyMsg=> ", replyMsg);
        if (recipiant && replyMsg) {
          let smsResp = await sendSMS(recipiant, replyMsg);
          console.log("sms resp--> ", smsResp.data);
        }
      } else if (reqBody.senderParticipantType === "CUSTOMER") {
        console.log("customer msg --> ", reqBody.body.elementText.text);
      }
    }
    res.send("callback url working");
  } catch (error) {
    console.log("error in callback---> ", error);
    res.send(error);
  }
});

app.post("/send-message", async (req, res) => {
  console.log("send message called");
  try {
    let { sender, message, mobileNo } = req.body;
    console.log(sender, message, mobileNo);
    let tokenResp = await sendMessage(sender, message, mobileNo);
    res.send(tokenResp);
  } catch (error) {
    console.log("eeeeeeeeeeeeeeeeeeee========> ", error.detail);
    res.send(error);
  }
});

app.get("/vonage-callback", (req, res) => {
  console.log("GET vonage-callback");
  console.log(req.body);
  res.send("vonage-callback working");
});

app.post("/vonage-callback", async (req, res) => {
  console.log("POST vonage-callback");
  console.log(req.body);
  try {
    let { profile, text, from, channel } = req.body;
    console.log(profile.name, text, from, channel);
    let tokenResp = await sendMessage(profile.name, text, from);
    res.send(tokenResp);
  } catch (error) {
    console.log("eeeeeeeeeeeeeeeeeeee========> ", error.detail);
    res.send(error);
  }
});
