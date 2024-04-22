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

export async function sendMessage(sender,message){
    try {
    let { access_token } = await fetchAccessToken();

        var options = {
            method: 'POST',
            url: sendMsgUrl,
            headers: {
              accept: 'application/json',
              authorization: `Bearer ${access_token}` ,
              'content-type': 'application/json'
            },
            data: {
              customerIdentifiers: {name: ['bravishma']},
              body: {elementText: {text: message}, elementType: 'text'},
              channelProviderId,
              channelId: 'Messaging',
              senderName: sender,
              businessAccountName: integrationId
            }
          };
          
          let resp = await axios.request(options);
          return resp.data;
        } catch (error) {
          if (error.response.data) {
            console.log(
              "sendMessage.error.response.data==> ",
              error.response.data
            );
            throw error.response.data;
          } else {
            console.log("error.data sendmessage==> ", error.message);
            throw error.message;
          }
        }
}
