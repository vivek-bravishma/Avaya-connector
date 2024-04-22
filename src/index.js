import express from "express";
import cors from "cors";
const app = express();

import avayaConfig from "./config/avaya.js";
import {
  fetchAccessToken,
  createSubscription,
  sendMessage,
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
app.listen(port, () => console.log("server started at ", port));

app.get("/callback", (req, res) => {
  console.log("callback get request");
  res.send("callback url working");
});

app.post("/callback", (req, res) => {
  console.log("================= callback post request data =================");
  const reqBody = req.body;
  if (reqBody.eventType === "MESSAGES") {
    if (
      reqBody.senderParticipantType === "AGENT" ||
      reqBody.senderParticipantType === "SYSTEM"
    ) {
      //  send this data to client/customer
    } else if (reqBody.senderParticipantType === "CUSTOMER") {
      // do nothing
    }
  }
  console.log("================= callback post request end =================");
  res.send("callback url working");
});

app.post("/send-message", async (req, res) => {
  console.log("send message called");
  try {
    let { sender, message } = req.body;
    let tokenResp = await sendMessage(sender, message);
    res.send(tokenResp);
  } catch (error) {
    console.log("eeeeeeeeeeeeeeeeeeee========> ", error.detail);
    res.send(error);
  }
});
