import axios from "axios";

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
} = avayaConfig;

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

export async function sendMessage(sender, message, mobileNo) {
  try {
    let { access_token } = await fetchAccessToken();

    var options = {
      method: "POST",
      url: sendMsgUrl,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${access_token}`,
        "content-type": "application/json",
      },
      data: {
        //   customerIdentifiers: {name: ['bravishma']},
        customerIdentifiers: { mobile: [mobileNo] },
        body: { elementText: { text: message }, elementType: "text" },
        channelProviderId,
        channelId: "Messaging",
        senderName: sender,
        businessAccountName: integrationId,
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
