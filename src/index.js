import "dotenv/config";
import express from "express";
import cors from "cors";
const app = express();

// import avayaConfig from "./config/avaya.js";
// const {
//   accountId,
//   client_id,
//   client_secret,
//   channelProviderId,
//   integrationId,
//   integrationName,
//   grant_type,
//   accessTokenUrl,
//   createSubscriptionUrl,
//   sendMsgUrl,
//   callbackUrl,
//   vonageSMSUrl,
//   vonageApiKey,
//   vonageApiSecret,
//   vonageApplicationId,
//   vonagePrivateKey,
//   vonageWhatsAppNumber,
//   vonageUrl,
// } = avayaConfig;

import {
  fetchAccessToken,
  createSubscription,
  sendMessage,
  sendSMS,
  sendVonageMsg,
  sendVonageWhatsappText,
  sendVonageWhatsappImage,
  uploadFileToAvaya,
  uploadImage,
  sendVonageWhatsappFile,
} from "./helpers/index.js";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    "============================================================================================="
  );
  console.log("avaya connector server started at ", port);
});

app.get("/test", async (req, res) => {
  let fu = await sendVonageWhatsappText("909898767887", "textfdsa");
  console.log("fu=======> ", fu);
  res.send(fu);
});

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
        console.log(
          "Recipient=> ",
          recipiant,
          "  replyMsg=> ",
          replyMsg,
          "   providerDialogId=> ",
          reqBody.providerDialogId
        );
        // console.log(reqBody);
        if (recipiant) {
          if (reqBody.providerDialogId === "whatsapp") {
            let type = reqBody.body.elementType;
            console.log("\n\n\nWhatsapp message type : ", type);
            if (type === "image") {
              let imageUrl = reqBody.attachments[0].url;
              let vonageResp = await sendVonageWhatsappImage(
                recipiant,
                imageUrl
              );
              console.log("vonage image resp--> ", vonageResp.data);
            } else if (type === "file") {
              let fileUrl = reqBody.attachments[0].url;
              let vonageResp = await sendVonageWhatsappFile(recipiant, fileUrl);
              console.log("vonage file resp--> ", vonageResp.data);
            } else {
              let vonageResp = await sendVonageWhatsappText(
                recipiant,
                replyMsg
              );
              console.log("vonage resp--> ", vonageResp.data);
            }
          } else if (reqBody.providerDialogId === "Line") {
            console.log("Handle Line messages here");
          } else {
            let smsResp = await sendSMS(recipiant, replyMsg);
            console.log("sms resp--> ", smsResp.data);
          }
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
    let { sender, message, mobileNo, channel } = req.body;
    console.log(sender, message, mobileNo);
    let tokenResp = await sendMessage(sender, message, mobileNo, channel);
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
    let {
      profile,
      text,
      from,
      channel,
      message_type,
      image,
      audio,
      video,
      file,
      message_uuid,
      location,
    } = req.body;

    console.log(
      profile.name,
      text,
      from,
      channel,
      image,
      audio,
      video,
      file,
      message_uuid,
      location
    );

    let fileDetails = undefined;
    let locationDetails = undefined;
    if (
      message_type === "image" ||
      message_type === "audio" ||
      message_type === "file" ||
      message_type === "video"
    ) {
      let resourceFile = image
        ? image
        : audio
        ? audio
        : video
        ? video
        : file
        ? file
        : undefined;
      fileDetails = await uploadFileToAvaya(resourceFile);
    } else if (message_type === "location") {
      locationDetails = location;
    }

    console.log("fileDetails================> ", fileDetails);
    let tokenResp = await sendMessage(
      profile.name,
      text,
      from,
      channel,
      message_type,
      fileDetails,
      locationDetails
    );
    res.send(tokenResp);
  } catch (error) {
    console.log("eeeeeeeeeeeeeeeeeeee========> ", error.detail);
    res.send(error);
  }
});

app.post("/line-callback", async (req, res) => {
  console.log("POST line-callback");
  console.log(req.body);
  try {
    let { events } = req.body;
    let fileDetails = undefined;
    let locationDetails = undefined;

    if (events.length > 0) {
      let messageEvent = events[0];
      let messageType = messageEvent.type;
      console.log("MessageType : " + messageType);

      if (messageType === "message") {
        let tokenResp = await sendMessage(
          messageEvent.source.userId,
          messageEvent.message.text,
          messageEvent.source.userId,
          "Line",
          messageType,
          fileDetails,
          locationDetails
        );
        res.send(tokenResp);
      } else if (messageType === "image") {
      } else if (messageType === "location") {
      } else if (messageType === "audio") {
      } else if (messageType === "video") {
      } else if (messageType === "sticker") {
      } else {
        console.log("Message type not supported.");
      }
    }
  } catch (error) {
    console.log("line-callback error========> ", error.detail);
    res.send(error);
  }
  res.send("OK");
});

app.post("/viber-callback", async (req, res) => {
  console.log("POST viber-callback");
  console.log(JSON.stringify(req.body));
  res.send("OK");
});
