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
import path from "path";

import { fileURLToPath } from "url";
import fs from "fs";
import FormData from "form-data";

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
	avayaFileUploadUrl,
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
	fileDetails,
	locationDetails
) {
	try {
		let { access_token } = await fetchAccessToken();

		let body;
		let attachments = [];

		console.log("Message Type ==> ", message_type);
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
				attachmentId: fileDetails.mediaId,
				// name: image.name,
				// contentType: "image/png",
				// url: image.url,
			});
		} else if (message_type === "location") {
			body = {
				elementType: "location",
				elementText: {
					text: message ? message : "",
					textFormat: "PLAINTEXT",
				},
				richMediaPayload: {
					coordinates: {
						lat: locationDetails.lat,
						long: locationDetails.long,
					},
				},
			};
		}
		console.log("Sending Message");
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
		console.log("wtf error---> ", error);
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

export async function sendVonageWhatsappFile(to, fileUrl) {
	try {
		console.log("--- sendVonageWhatsapp FIle ---");
		let resp = await vonage.messages.send(
			new WhatsAppFile({
				to: to,
				from: vonageWhatsAppNumber,
				file: {
					url: fileUrl,
				},
			})
		);
		console.log("--- sendVonageWhatsapp file response --- ", resp);
		return resp;
	} catch (error) {
		console.log("send vonage whatsapp file error--> ", error);
		throw error;
	}
}

export async function uploadFileToAvaya(media) {
	try {
		let fileUrl = media.url;
		let fileName = media.name;
		let { access_token } = await fetchAccessToken();

		let { fileType, fileSize, file, fileFullPathName } =
			await getFileDetails(fileUrl, fileName);
		console.log(
			"=====================> ",
			fileName,
			fileType,
			fileSize,
			fileFullPathName
		);

		const options = {
			method: "POST",
			url: avayaFileUploadUrl,
			headers: {
				accept: "application/json",
				authorization: `Bearer ${access_token}`,
				"content-type": "application/json",
			},
			data: {
				mediaName: fileName,
				mediaContentType: fileType,
				mediaSize: fileSize,
			},
		};
		let resp = await axios.request(options);

		let uploadFilePayload = {
			file,
			fileUrl,
			fileFullPathName,
			mediaName: resp.data.mediaName,
			mediaContentType: resp.data.mediaContentType,
			mediaSize: resp.data.mediaSize,
			mediaId: resp.data.mediaId,
			uploadSignedUri: resp.data.uploadSignedUri,
		};

		let uploadImgResp = await uploadImage(uploadFilePayload);
		console.log("=================> ", uploadImgResp);
		return uploadImgResp;
		// return resp.data;
	} catch (error) {
		console.log("Error in uploadFileToAvaya=>  ", error);
		if (error.response.data) {
			throw error.response.data;
		} else {
			throw error.message;
		}
	}
}

export async function getFileDetails(url, fileName) {
	try {
		const response = await axios.get(url, { responseType: "stream" });
		const contentType = response.headers["content-type"];

		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const directory = path.join(__dirname, "img");
		const filePath = path.join(directory, fileName);

		let { fileSize, file, fileFullPathName } = await processFile(
			response.data,
			filePath
		);

		return {
			fileType: contentType,
			fileSize,
			file,
			fileFullPathName,
		};
	} catch (error) {
		console.error("Error fetching file details:", error.message);
		return null;
	}
}

function processFile(stream, filename) {
	return new Promise((resolve, reject) => {
		const fileStream = fs.createWriteStream(filename);
		let fileSize = 0;
		let chunks = [];

		stream.on("data", (chunk) => {
			fileSize += chunk.length;
			chunks.push(chunk);
			fileStream.write(chunk);
		});
		stream.on("end", () => {
			fileStream.end();
			resolve({
				fileSize,
				file: Buffer.concat(chunks),
				fileFullPathName: filename,
			});
		});
		stream.on("error", (error) => {
			fileStream.close();
			reject(error);
		});
	});
}

export async function uploadImage(fileDetails) {
	const {
		file,
		fileUrl,
		fileFullPathName,
		mediaName,
		mediaContentType,
		mediaSize,
		mediaId,
		uploadSignedUri,
	} = fileDetails;

	// console.log("ufo======== ", fileDetails);

	try {
		// const response = await axios.get(fileUrl, {
		//   responseType: "arraybuffer",
		// });

		// const imageBlob = Buffer.from(response.data, "binary");
		// console.log("imageBlob--> ", imageBlob);

		const formData = new FormData();

		formData.append("mediaName", mediaName);
		formData.append("mediaContentType", mediaContentType);
		formData.append("mediaSize", mediaSize);
		formData.append("mediaId", mediaId);
		// formData.append("mediaFile", file);
		formData.append("mediaFile", fs.createReadStream(fileFullPathName));

		const uploadResponse = await axios.post(uploadSignedUri, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				...formData.getHeaders(),
			},
		});

		// console.log("Image uploaded successfully:", uploadResponse.data);
		return uploadResponse.data;
	} catch (error) {
		// console.error("Error uploading image:", error);
		if (error.response.data) {
			console.error(
				"Error uploading image: error.response.data",
				error.response.data
			);

			throw error.response.data;
		} else {
			console.error("Error uploading image: error", error);

			throw error.message;
		}
	}
}
