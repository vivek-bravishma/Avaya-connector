import axios from "axios";
// const { Vonage } = require('@vonage/server-sdk');
// const { WhatsAppAudio } = require('@vonage/messages');
import { Vonage } from "@vonage/server-sdk";
import {
  WhatsAppText,
  WhatsAppAudio,
  WhatsAppImage,
  WhatsAppFile,
} from "@vonage/messages";

import avayaConfig from "../config/avaya.js";

const {
  accountId,
  client_id,
  client_secret,
  channelProviderId,
  integrationId,
  integrationName,
  grant_type,
  accessTokenUrl,
  createSubscriptionUrl,
  sendMsgUrl,
  callbackUrl,
  vonageSMSUrl,
  vonageApiKey,
  vonageApiSecret,
  vonageApplicationId,
  vonagePrivateKey,
  vonageWhatsAppNumber,
  vonageUrl,
  vonage_BASE_URL,
} = avayaConfig;

const vonage = new Vonage(
  {
    apiKey: vonageApiKey,
    apiSecret: vonageApiSecret,
    applicationId: vonageApplicationId,
    privateKey: vonagePrivateKey,
  },
  {
    apiHost: vonage_BASE_URL,
  }
);

export async function fetchAccessToken() {
  try {
    var options = {
      method: "POST",
      url: accessTokenUrl,
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        grant_type,
        client_id,
        client_secret,
      },
    };

    let resp = await axios.request(options);
    return resp.data;
  } catch (error) {
    if (error.response.data) {
      console.log(
        "fetchAccessToken.error.response.data==> ",
        error.response.data
      );
      throw error.response.data;
    } else {
      console.log("error.data==> ", error.message);
      throw error.message;
    }
  }
}

export async function createSubscription() {
  try {
    let { access_token } = await fetchAccessToken();
    var options = {
      method: "POST",
      url: createSubscriptionUrl,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${access_token}`,
        "content-type": "application/json",
      },
      data: JSON.stringify({
        eventTypes: ["ALL"],
        callbackUrl,
        channelProviderId,
      }),
    };

    let resp = await axios.request(options);
    return resp.data;
  } catch (error) {
    if (error.response.data) {
      console.log(
        "createSubscription.error.response.data==> ",
        error.response.data
      );
      throw error.response.data;
    } else {
      console.log("error.data==> ", error.message);
      throw error.message;
    }
  }
}

export async function sendMessage(
  sender,
  message,
  mobileNo,
  channel,
  message_type,
  image,
  message_uuid
) {
  try {
    let { access_token } = await fetchAccessToken();

    let body;
    let attachments = [];

    if (message_type === "text") {
      body = {
        elementType: "text",
        elementText: { text: message },
      };
    } else if (message_type === "image") {
      body = {
        elementType: "image",
        elementText: { text: message ? message : "" },
      };
      attachments.push({
        attachmentId: message_uuid,
        name: image.name,
        contentType: "image/png",
        url: image.url,
      });
    }

    var options = {
      method: "POST",
      url: sendMsgUrl,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${access_token}`,
        "content-type": "application/json",
      },
      data: {
        customerIdentifiers: { mobile: [mobileNo] },
        customData: { msngChannel: channel },
        body: body,
        attachments,
        channelProviderId,
        channelId: "Messaging",
        senderName: sender,
        businessAccountName: integrationId,
        providerDialogId: channel,
      },
    };

    let resp = await axios.request(options);
    return resp.data;
  } catch (error) {
    if (error.response.data) {
      console.log("sendMessage.error.response.data==> ", error.response.data);
      throw error.response.data;
    } else {
      console.log("error.data sendmessage==> ", error.message);
      throw error.message;
    }
  }
}

export async function sendSMS(recipiant, replyMsg) {
  // { from, text, to, api_key, api_secret }
  try {
    const payload = {
      from: "ayva",
      text: replyMsg,
      to: recipiant,
      api_key: vonageApiKey,
      api_secret: vonageApiSecret,
    };
    let resp = await axios.post(vonageSMSUrl, payload);
    return resp;
  } catch (error) {
    console.log("send sms error--", error);
    throw error;
  }
}

export async function sendVonageMsg(
  to,
  text,
  message_type = "text",
  channel = "whatsapp"
) {
  try {
    const payload = {
      from: "14157386102",
      to,
      message_type,
      text,
      channel,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      auth: {
        username: "b90a1d65",
        password: "Xkzmw60T1nLE8hbj",
      },
    };
    let resp = await axios.post(vonageUrl, payload, config);
    return resp;
  } catch (error) {
    console.log("send vonage msg error--> ", error);
    throw error;
  }
}

export async function sendVonageWhatsappText(to, text) {
  try {
    let resp = await vonage.messages.send(
      new WhatsAppText({
        text,
        to,
        from: vonageWhatsAppNumber,
      })
    );
    return resp;
  } catch (error) {
    console.log("send vonage whatsapp text error--> ", error);
    throw error;
  }
}

export async function sendVonageWhatsappImage(to, image) {
  try {
    console.log("==>sendVonageWhatsappImage");
    let resp = await vonage.messages.send(
      new WhatsAppImage({
        image: {
          url: image,
        },
        to: to,
        from: vonageWhatsAppNumber,
      })
    );
    console.log("==>sendVonageWhatsappImage Response ", resp);
    return resp;
  } catch (error) {
    console.log("send vonage whatsapp image error--> ", error);
    throw error;
  }
}
