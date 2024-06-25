import axios from 'axios'
// const { Vonage } = require('@vonage/server-sdk');
// const { WhatsAppAudio } = require('@vonage/messages');
import { Vonage } from '@vonage/server-sdk'
import {
	WhatsAppText,
	WhatsAppAudio,
	WhatsAppImage,
	WhatsAppFile,
	ViberFile,
	ViberText,
	ViberImage,
} from '@vonage/messages'

import avayaConfig from '../config/avaya.js'
import path from 'path'

import { fileURLToPath } from 'url'
import fs from 'fs'
import FormData from 'form-data'
import { WebSocket } from 'ws'

const {
	accountId,
	client_id,
	client_secret,
	channelProviderId,
	integrationId,
	integrationName,
	grant_type,
	copilotToken,
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
	lineBaseUrl,
	lineMessageUrl,
	lineToken,
	VIBER_SERVICE_MESSAGE_ID,
	TeamsBotUrl,
} = avayaConfig

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
)

export async function fetchAccessToken() {
	try {
		var options = {
			method: 'POST',
			url: accessTokenUrl,
			headers: {
				accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			data: {
				grant_type,
				client_id,
				client_secret,
			},
		}

		let resp = await axios.request(options)
		return resp.data
	} catch (error) {
		if (error.response.data) {
			console.log(
				'fetchAccessToken.error.response.data==> ',
				error.response.data
			)
			throw error.response.data
		} else {
			console.log('error.data==> ', error.message)
			throw error.message
		}
	}
}

export async function createSubscription() {
	try {
		let { access_token } = await fetchAccessToken()
		var options = {
			method: 'POST',
			url: createSubscriptionUrl,
			headers: {
				accept: 'application/json',
				authorization: `Bearer ${access_token}`,
				'content-type': 'application/json',
			},
			data: JSON.stringify({
				eventTypes: ['ALL'],
				callbackUrl,
				channelProviderId,
			}),
		}

		let resp = await axios.request(options)
		return resp.data
	} catch (error) {
		if (error.response.data) {
			console.log(
				'createSubscription.error.response.data==> ',
				error.response.data
			)
			throw error.response.data
		} else {
			console.log('error.data==> ', error.message)
			throw error.message
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
	locationDetails,
	mobileNumber
) {
	try {
		let { access_token } = await fetchAccessToken()

		let body
		let attachments = []

		console.log('Message Type ==> ', message_type)
		if (message_type === 'text') {
			body = {
				elementType: 'text',
				elementText: { text: message },
			}
		} else if (
			message_type === 'image' ||
			message_type === 'audio' ||
			message_type === 'video' ||
			message_type === 'file'
		) {
			body = {
				elementType: message_type,
				elementText: {
					text: message ? message : '',
				},
			}
			attachments.push({
				attachmentId: fileDetails.mediaId,
			})
		} else if (message_type === 'location') {
			body = {
				elementType: 'location',
				elementText: {
					text: message ? message : '',
					textFormat: 'PLAINTEXT',
				},
				richMediaPayload: {
					coordinates: {
						lat: locationDetails.lat,
						long: locationDetails.long,
					},
				},
			}
		}
		console.log('Sending Message')
		var options = {
			method: 'POST',
			url: sendMsgUrl,
			headers: {
				accept: 'application/json',
				authorization: `Bearer ${access_token}`,
				'content-type': 'application/json',
			},
			data: {
				customerIdentifiers: {
					mobile: [mobileNo],
				},
				body: body,
				attachments,
				channelProviderId,
				channelId: 'Messaging',
				senderName: sender,
				businessAccountName: integrationId,
				// providerDialogId: channel,
				providerDialogId: mobileNo,
				customData: {
					msngChannel: channel,
					customerMobileNo: mobileNumber ? mobileNumber : null,
				},
				headers: {
					sourceType: channel,
				},
				engagementParameters: {
					customch: 'customch',
					customerMobileNo: mobileNumber ? mobileNumber : null,
				},
			},
		}

		// console.log('options=============> ', JSON.stringify(options))

		let resp = await axios.request(options)
		// console.log('send message response data==> ', resp.data)
		return resp.data
	} catch (error) {
		if (error.response.data) {
			console.log(
				'sendMessage.error.response.data==> ',
				error.response.data
			)
			throw error.response.data
		} else {
			console.log('error.data sendmessage==> ', error.message)
			throw error.message
		}
	}
}

export async function sendSMS(recipiant, replyMsg) {
	// { from, text, to, api_key, api_secret }
	try {
		const payload = {
			from: '46790965516',
			text: replyMsg,
			to: recipiant,
			api_key: vonageApiKey,
			api_secret: vonageApiSecret,
		}
		console.log('sms_payload= ', payload)
		let vonageUrl = 'https://rest.nexmo.com/sms/json'

		let vonageResponse = await axios.post(vonageUrl, payload)
		// let resp = await axios.post(vonageSMSUrl, payload)
		return vonageResponse
	} catch (error) {
		console.log('send sms error--', error)
		throw error
	}
}

export async function sendVonageMsg(
	to,
	text,
	message_type = 'text',
	channel = 'whatsapp'
) {
	try {
		const payload = {
			from: '14157386102',
			to,
			message_type,
			text,
			channel,
		}
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			auth: {
				username: 'b90a1d65',
				password: 'Xkzmw60T1nLE8hbj',
			},
		}
		let resp = await axios.post(vonageUrl, payload, config)
		return resp
	} catch (error) {
		console.log('send vonage msg error--> ', error)
		throw error
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
		)
		return resp
	} catch (error) {
		console.log('send vonage whatsapp text error--> ', error)
		throw error
	}
}

export async function sendVonageWhatsappTextApi(to, text) {
	try {
		const payload = {
			from: '14157386102',
			to,
			message_type: 'text',
			text,
			channel: 'whatsapp',
		}
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			auth: {
				username: vonageApiKey,
				password: vonageApiSecret,
			},
		}
		let resp = await axios.post(vonageUrl, payload, config)
		return resp
	} catch (error) {
		console.log('send vonage whatsapp text error--> ', error)
		throw error
	}
}

export async function sendVonageWhatsappImage(to, image) {
	try {
		console.log('==>sendVonageWhatsappImage')
		let resp = await vonage.messages.send(
			new WhatsAppImage({
				image: {
					url: image,
				},
				to: to,
				from: vonageWhatsAppNumber,
			})
		)
		console.log('==>sendVonageWhatsappImage Response ', resp)
		return resp
	} catch (error) {
		console.log('send vonage whatsapp image error--> ', error)
		throw error
	}
}

export async function sendVonageWhatsappImageApi(to, image) {
	try {
		console.log('==>sendVonageWhatsappImage')
		const payload = {
			from: '14157386102',
			to,
			message_type: 'image',
			image: {
				url: image,
			},
			channel: 'whatsapp',
		}
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			auth: {
				username: vonageApiKey,
				password: vonageApiSecret,
			},
		}
		let resp = await axios.post(vonageUrl, payload, config)
		console.log('==>sendVonageWhatsappImage Response ', resp)
		return resp
	} catch (error) {
		console.log('send vonage whatsapp image error--> ', error)
		throw error
	}
}

export async function sendVonageWhatsappFile(to, fileUrl) {
	try {
		console.log('--- sendVonageWhatsapp FIle ---')
		let resp = await vonage.messages.send(
			new WhatsAppFile({
				to: to,
				from: vonageWhatsAppNumber,
				file: {
					url: fileUrl,
				},
			})
		)
		console.log('--- sendVonageWhatsapp file response --- ', resp)
		return resp
	} catch (error) {
		console.log('send vonage whatsapp file error--> ', error)
		throw error
	}
}

export async function sendVonageWhatsappFileApi(to, fileUrl) {
	try {
		console.log('--- sendVonageWhatsapp FIle ---')
		const payload = {
			from: '14157386102',
			to,
			message_type: 'file',
			file: {
				url: fileUrl,
			},
			channel: 'whatsapp',
		}
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			auth: {
				username: vonageApiKey,
				password: vonageApiSecret,
			},
		}
		let resp = await axios.post(vonageUrl, payload, config)
		console.log('--- sendVonageWhatsapp file response --- ', resp)
		return resp
	} catch (error) {
		console.log('send vonage whatsapp file error--> ', error)
		throw error
	}
}

export async function uploadFileToAvaya(media) {
	try {
		let fileUrl = media.url
		let fileName = media.name
		let message_type = media.message_type
		let { access_token } = await fetchAccessToken()
		// console.log('media---------------------------> ', media)

		let { fileType, fileSize, file, fileFullPathName } =
			await getFileDetails(fileUrl, fileName)
		console.log(
			'===========asdf==========> ',
			fileName,
			fileType,
			fileSize,
			fileFullPathName
		)

		const options = {
			method: 'POST',
			url: avayaFileUploadUrl,
			headers: {
				accept: 'application/json',
				authorization: `Bearer ${access_token}`,
				'content-type': 'application/json',
			},
			data: {
				mediaName: fileName,
				mediaContentType: fileType,
				// mediaContentType:
				// 	message_type === 'audio'
				// 		? `audio/opus`
				// 		: message_type === 'video'
				// 			? `video/mp4`
				// 			: fileType,
				mediaSize: fileSize,
			},
		}

		console.log('============== generate file url payload==> ', options)
		let resp = await axios.request(options)

		let uploadFilePayload = {
			file,
			fileUrl,
			fileFullPathName,
			mediaName: resp.data.mediaName,
			mediaContentType: resp.data.mediaContentType,
			mediaSize: resp.data.mediaSize,
			mediaId: resp.data.mediaId,
			uploadSignedUri: resp.data.uploadSignedUri,
		}

		let uploadImgResp = await uploadImage(uploadFilePayload)
		console.log('=================> ', uploadImgResp)
		return uploadImgResp
		// return resp.data;
	} catch (error) {
		console.log('Error in uploadFileToAvaya=>  ', error)
		if (error.response.data) {
			throw error.response.data
		} else {
			throw error.message
		}
	}
}

export async function getFileDetails(url, fileName) {
	try {
		const response = await axios.get(url, {
			responseType: 'stream',
		})
		const contentType = response.headers['content-type'].split(';')[0]
		console.log('content type== > ', contentType)

		const __dirname = path.dirname(fileURLToPath(import.meta.url))
		const directory = path.join(__dirname, 'img')
		const filePath = path.join(directory, fileName)

		let { fileSize, file, fileFullPathName } = await processFile(
			response.data,
			filePath
		)

		return {
			fileType: contentType,
			fileSize,
			file,
			fileFullPathName,
		}
	} catch (error) {
		console.error('Error fetching file details:', error.message)
		return null
	}
}

function processFile(stream, filename) {
	return new Promise((resolve, reject) => {
		const fileStream = fs.createWriteStream(filename)
		let fileSize = 0
		let chunks = []

		stream.on('data', (chunk) => {
			fileSize += chunk.length
			chunks.push(chunk)
			fileStream.write(chunk)
		})
		stream.on('end', () => {
			fileStream.end()
			resolve({
				fileSize,
				file: Buffer.concat(chunks),
				fileFullPathName: filename,
			})
		})
		stream.on('error', (error) => {
			fileStream.close()
			reject(error)
		})
	})
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
	} = fileDetails
	try {
		const formData = new FormData()
		formData.append('mediaName', mediaName)
		formData.append('mediaContentType', mediaContentType)
		formData.append('mediaSize', mediaSize)
		formData.append('mediaId', mediaId)
		formData.append('mediaFile', fs.createReadStream(fileFullPathName))

		// console.log(
		// 	'========== upload file payload ================',
		// 	uploadSignedUri,
		// 	formData
		// )
		// console.log(
		// 	'fs.createReadStream(fileFullPathName)------------------------> ',
		// 	await fs.createReadStream(fileFullPathName)
		// )

		const uploadResponse = await axios.post(uploadSignedUri, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				...formData.getHeaders(),
			},
		})

		return uploadResponse.data
	} catch (error) {
		if (error.response.data) {
			console.error(
				'Error uploading image: error.response.data',
				error.response.data
			)

			throw error.response.data
		} else {
			console.error('Error uploading image: error', error)

			throw error.message
		}
	}
}

export async function sendLineTextMessage(
	to,
	text,
	message_type = 'text',
	channel = 'Line'
) {
	try {
		const payload = {
			to: to,
			messages: [
				{
					type: message_type,
					text: text,
				},
			],
		}
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${lineToken}`,
			},
		}
		let resp = await axios.post(lineMessageUrl, payload, config)
		return resp
	} catch (error) {
		console.log('send line msg error--> ', error)
		throw error
	}
}

export async function sendLineImageMessage(
	to,
	imageUrl,
	message_type = 'image',
	channel = 'Line'
) {
	try {
		const payload = {
			to: to,
			messages: [
				{
					type: message_type,
					originalContentUrl: imageUrl,
					previewImageUrl: imageUrl,
				},
			],
		}
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${lineToken}`,
			},
		}
		let resp = await axios.post(lineMessageUrl, payload, config)
		return resp
	} catch (error) {
		console.log('send line msg error--> ', error)
		throw error
	}
}

export async function sendVonageViberText(to, text) {
	try {
		let resp = await vonage.messages.send(
			new ViberText({
				text,
				to,
				from: VIBER_SERVICE_MESSAGE_ID,
			})
		)
		return resp
	} catch (error) {
		console.log('send vonage viber text error--> ', error)
		throw error
	}
}

export async function uploadCustFileToAvaya(media) {
	// console.log('media--> ', media)
	try {
		let fileName = media.name
		let fileData = media.data
		let message_type = media.message_type
		let { access_token } = await fetchAccessToken()
		let { fileType, fileSize, file, fileFullPathName } =
			await getCustFileDetails(fileData, fileName)
		console.log(
			'===========asdf==========> ',
			fileName,
			fileType,
			fileSize,
			fileFullPathName
		)
		const options = {
			method: 'POST',
			url: avayaFileUploadUrl,
			headers: {
				accept: 'application/json',
				authorization: `Bearer ${access_token}`,
				'content-type': 'application/json',
			},
			data: {
				mediaName: fileName,
				mediaContentType: fileType,
				// mediaContentType:
				// 	message_type === 'audio'
				// 		? `audio/opus`
				// 		: message_type === 'video'
				// 			? `video/mp4`
				// 			: fileType,
				mediaSize: fileSize,
			},
		}
		console.log('============== generate file url payload==> ', options)
		let resp = await axios.request(options)
		let uploadFilePayload = {
			fileFullPathName,
			mediaName: resp.data.mediaName,
			mediaContentType: resp.data.mediaContentType,
			mediaSize: resp.data.mediaSize,
			mediaId: resp.data.mediaId,
			uploadSignedUri: resp.data.uploadSignedUri,
		}
		let uploadImgResp = await uploadImage(uploadFilePayload)
		console.log('=================> ', uploadImgResp)
		return uploadImgResp
	} catch (error) {
		console.log('Error in uploadFileToAvaya=>  ', error)
		if (error.response.data) {
			throw error.response.data
		} else {
			throw error.message
		}
	}
}

export async function getCustFileDetails(fileData, fileName) {
	try {
		const contentType = fileData.split(':')[1]?.split(';')[0]
		console.log('content type== > ', contentType)

		const __dirname = path.dirname(fileURLToPath(import.meta.url))
		const directory = path.join(__dirname, 'img')
		const filePath = path.join(directory, fileName)
		const base64Data = fileData.replace(/^data:\w+\/\w+;base64,/, '')
		const fileBinaryData = Buffer.from(base64Data, 'base64')

		let { fileSize, file, fileFullPathName } = await processCustFile(
			fileBinaryData,
			filePath
		)

		return {
			fileType: contentType,
			fileSize,
			file,
			fileFullPathName,
		}
	} catch (error) {
		console.error('Error fetching file details:', error.message)
		return null
	}
}

function processCustFile(file, filename) {
	return new Promise((resolve, reject) => {
		fs.writeFile(filename, file, (err) => {
			if (err) {
				console.error('err saving file: -> ', err)
				reject(err)
			} else {
				console.log('file stat==> ', fs.statSync(filename))
				resolve({
					fileSize: fs.statSync(filename).size,
					file: fs.readFileSync(filename),
					fileFullPathName: filename,
				})
			}
		})
	})
}

export async function sendCustomProviderMessage(io, socketId, reqBody) {
	let message_type = reqBody.body.elementType
	console.log('cust msg pro message type--> ', message_type)
	const sender =
		reqBody.senderParticipantType === 'SYSTEM'
			? 'SYSTEM'
			: reqBody.senderParticipantName
	const payload = {
		sender,
		userType: reqBody.senderParticipantType,
		message_type,
		eventDate: reqBody.eventDate,
		receivedAt: reqBody.receivedAt,
		lastUpdatedAt: reqBody.lastUpdatedAt,

		// text?: 'message text',
		// image?: {
		// 	name: '',
		// 	data: '',
		//	url:''
		// },
		// audio?: {
		// 	name: '',
		// 	data: '',
		//	url:''
		// },
		// video?: {
		// 	name: '',
		// 	data: '',
		//	url:''
		// },
		// file?: {
		// 	name: '',
		// 	data: '',
		//	url:''
		// },
		// location?: {
		// 	lat: 'number',
		// 	long: 'number',
		// },
	}
	if (message_type === 'text') {
		// text/emo(same) and location req
		payload.text = reqBody.body.elementText.text
		let actions = reqBody.body.richMediaPayload?.actions
		if (actions && actions.length > 0) {
			payload.actions = actions
		}
	} else if (message_type === 'image') {
		payload.image = {
			data: '',
			name: reqBody.attachments[0].name,
			size: reqBody.attachments[0].size,
			contentType: reqBody.attachments[0].contentType,
			url: reqBody.attachments[0].url,
		}
	} else if (message_type === 'file') {
		//audio, video and file
		const fileType = reqBody.attachments[0]?.contentType?.split('/')[0]
		if (fileType === 'audio') {
			payload.message_type = 'audio'
			payload.audio = {
				data: '',
				name: reqBody.attachments[0].name,
				size: reqBody.attachments[0].size,
				contentType: reqBody.attachments[0].contentType,
				url: reqBody.attachments[0].url,
			}
		} else if (fileType === 'video') {
			payload.message_type = 'video'
			payload.video = {
				data: '',
				name: reqBody.attachments[0].name,
				size: reqBody.attachments[0].size,
				contentType: reqBody.attachments[0].contentType,
				url: reqBody.attachments[0].url,
			}
		} else {
			payload.file = {
				data: '',
				name: reqBody.attachments[0].name,
				size: reqBody.attachments[0].size,
				contentType: reqBody.attachments[0].contentType,
				url: reqBody.attachments[0].url,
			}
		}
	}
	console.log('cust msg pro payload==> ', payload)

	io.to(socketId).emit('message', payload)
}

export async function getAllCopilotMessages(copilotId) {
	try {
		console.log('copilotId==> ', copilotId)
		console.log('copilotToken==> ', copilotToken)

		var options = {
			method: 'GET',
			url: `https://directline.botframework.com/v3/directline/conversations/${copilotId}/activities`,
			headers: {
				Accept: '*/*',
				Authorization: `Bearer ${copilotToken}`,
			},
		}

		let resp = await axios.request(options)

		let messages = serializeCopilotMessage(resp?.data?.activities)
		return messages
	} catch (error) {
		console.error('getAllCopilotMessages error=> ', error)
		return error
	}
}

export async function serializeCopilotMessage(messages) {
	let filtered = messages?.filter((message) => message.type === 'message')
	let serializedMessages = filtered?.map((message) => {
		return {
			from: {
				id: message?.from?.id,
				name: message?.from?.name,
				role: message?.from?.role,
			},
			text: message?.text,
			timestamp: message?.timestamp,
			suggestedActions: message?.suggestedActions,
			attachmentLayout: message?.attachmentLayout,
			attachments: message?.attachments,
		}
	})
	return serializedMessages
}

export async function getLineUserDetails(userId) {
	try {
		var options = {
			method: 'GET',
			url: `${lineBaseUrl}/profile/${userId}`,
			headers: {
				Accept: '*/*',
				Authorization: `Bearer ${lineToken}`,
			},
		}

		let resp = await axios.request(options)
		return resp.data
	} catch (error) {
		console.error('getLineUserDetails error=> ', error)
		return error
	}
}

// =================== temas copilot backend ===================
// let payload = {
// 	conversationId:
// 		'a:1_0cmSrT9mSpwejfeT3AV4ZZtdAvR7Z1eifPX6-Rq_baSgFYQjCBaAqwju0UwXM6nrdwMny5sdTqDKFeDB6S2jk-jKP_P83rTH-iwtzWoB0KvI3_lbSAiricbOYFD-rVc',
// 	message: {
// 		text: 'kem cho bro',
// 	},
// }
// let reqBody = {
// 	eventType: 'MESSAGES',
// 	correlationId: '55d01742-a3fc-4ec1-a34c-8f7a68304d4d',
// 	eventDate: '2024-06-24T06:00:12.461Z',
// 	messageId: '3ae9e574-b507-45cd-a077-f713c9861246',
// 	accountId: 'MCTOTJ',
// 	dialogId: '5c11b6b6-4b8b-465b-ac69-028049fac4c2',
// 	engagementId: '35970c1b-cf58-4d10-a26b-8db4dc49e37d',
// 	status: 'DELIVERED',
// 	sessionId: null,
// 	businessAccountName: 'c082f77d-3ae2-4e4c-8126-65db09b33767',
// 	channelProviderId: '4e287bdf-8c96-4eae-ac46-1ff091bcbec0',
// 	channelId: 'Messaging',
// 	senderParticipantId: '00000000-0000-0000-0000-222222222222',
// 	senderParticipantName: '',
// 	senderParticipantType: 'SYSTEM',
// 	body: {
// 		elementType: 'text',
// 		elementText: {
// 			text: 'Please select the language between English, Spanish and French',
// 			textFormat: 'PLAINTEXT',
// 		},
// 		payload: null,
// 		richMediaPayload: null,
// 	},
// 	fallbackText: null,
// 	headers: {
// 		sourceAddress: null,
// 		sourceType: 'custom-messaging:custom_teams_copilot_provider',
// 		priority: null,
// 		sensitivity: null,
// 		encoding: null,
// 		subject: null,
// 		from: null,
// 		to: [],
// 		cc: [],
// 		bcc: [],
// 		replyTo: null,
// 		clientDeviceTag: null,
// 		messageSourceServerTag: null,
// 		providerTimestamp: null,
// 		additionalHeaders: {},
// 	},
// 	attachments: [],
// 	recipientParticipants: [
// 		{
// 			participantId: 'E1:671ce6d83c1f91fe16b0bd8905f158b01c55f035',
// 			participantType: 'CUSTOMER',
// 			displayName: 'Alex Wilber',
// 			connectionId: '3362261d-8bce-43f2-9571-c7908ac81239',
// 			providerParticipantId: 'personal-chat-id',
// 			channelProviderId: null,
// 		},
// 	],
// 	customData: {},
// 	messageIndex: 2,
// 	parentMessageId: null,
// 	providerDialogId: 'personal-chat-id',
// 	providerSenderId: null,
// 	providerMessageId: null,
// 	providerParentMessageId: null,
// 	engagementParameters: {},
// 	receivedAt: '2024-06-24T06:00:12.453Z',
// 	lastUpdatedAt: '2024-06-24T06:00:12.459Z',
// }
export async function sendTeamsMessage(reqBody) {
	try {
		let recipiant = reqBody.recipientParticipants[0].providerParticipantId

		let type = reqBody.body.elementType
		if (type === 'image') {
			let imageUrl = reqBody.attachments[0].url
		} else if (type === 'file') {
			let fileUrl = reqBody.attachments[0].url
		}
		// if (type === 'text') {
		let replyMsg = reqBody.body.elementText.text
		// }

		const payload = {
			conversationId: recipiant,
			message: {
				text: replyMsg,
			},
		}
		console.log('teams_payload= ', payload)

		let teamsResponse = await axios.post(TeamsBotUrl, payload)
		// let resp = await axios.post(vonageSMSUrl, payload)
		return teamsResponse
	} catch (error) {
		console.error('sendTeamsMessage error=> ', error)
		return error
	}
}

export async function startCopilotConvo(teamsCopilotUsersMap, teamsConvoId) {
	try {
		const config = {
			headers: {
				Authorization: `Bearer ${copilotToken}`,
			},
		}
		const { conversationId, token, streamUrl } = (
			await axios.post(
				'https://directline.botframework.com/v3/directline/conversations',
				null,
				config
			)
		).data

		// console.log('Conversation ID:', conversationId)
		// console.log('Token:', token)
		// console.log('WebSocket Stream URL:', streamUrl)

		teamsCopilotUsersMap.set(teamsConvoId, {
			isEcalated: false,
			mobileNumber: '',
			copilotConversationId: conversationId,
			token,
			streamUrl,
		})

		await setupCopilotBotSocket(streamUrl, teamsConvoId)
		const conversationDetails = {
			conversationId: conversationId,
			token: token,
		}
		await sendInitialMessage(conversationDetails)

		// // Now you can use `streamUrl` to establish a WebSocket connection
		// // Example: Implement WebSocket connection here
		// // connectWebSocket(streamUrl);
	} catch (error) {
		console.error('Error starting conversation:', error.message)
	}
}

async function setupCopilotBotSocket(streamUrl, teamsConvoId) {
	// teamsCopilotUsersMap.set(teamsConvoId, {
	// 	isEcalated: false,
	// 	mobileNumber: '',
	// 	copilotConversationId: conversationId,
	// 	token,
	// 	streamUrl,
	// })

	const ws = new WebSocket(streamUrl)

	// WebSocket event listeners
	ws.on('open', () => {
		console.log('copilot botWebSocket connection established')
	})

	ws.on('message', (event) => {
		// console.log('Received message:', event)
		const message = event.toString('utf-8')

		if (message.length < 1) {
			return
		}

		// Example: Parse and process message data
		try {
			const eventData = JSON.parse(message)

			if (eventData?.activities[0].type === 'message') {
				// Process incoming message
				console.log('Incoming message:', JSON.stringify(eventData))

				// Example: Send response back to WebSocket
				// const responseMessage = {
				// 	type: 'response',
				// 	data: 'Received your message',
				// }
				// ws.send(JSON.stringify(responseMessage))
				eventData.activities[0].text &&
					sendTeamsMessageFromCopilotBot(
						teamsConvoId,
						eventData.activities[0].text
					)
			}
		} catch (error) {
			console.error('Error parsing incoming message:', error)
		}
	})

	ws.on('error', (error) => {
		console.error('Copilot bot WebSocket error:', error)
	})

	ws.on('close', () => {
		console.log('Copilot bot WebSocket connection closed')
	})
}

async function sendInitialMessage(conversationDetails) {
	try {
		const { conversationId, token } = conversationDetails

		const headers = {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		}

		const body = JSON.stringify({
			name: 'startConversation',
			locale: 'en-EN', // Example: Change as per your requirement
			type: 'event',
			from: {
				id: '5839aa31-0a18-4ae6-bf9a-074b29de79b3',
				role: 'user',
			},
		})

		const url = `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`

		const response = await axios.post(url, body, { headers })

		console.log('Initial message sent:', response.data)
		return response.data // Optional: Return data if needed
	} catch (error) {
		console.error('Error sending initial message:', error.message)
		throw error // Propagate error up the call stack
	}
}

export async function sendCopilotAiBotMsg(conversionDetails, message) {
	const { conversationId, streamUrl, token } = conversionDetails
	console.log('conversionDetails')
	let headersList = {
		authority: 'directline.botframework.com',
		accept: '*/*',
		'accept-language': 'en-US,en;q=0.9',
		authorization: `Bearer ${token}`,
		'content-type': 'application/json',
		type: 'message',
		text: 'test',
	}

	let bodyContent = JSON.stringify({
		locale: 'en-EN',
		// locale: this.locale,

		type: 'message',
		// value: this.rating,

		from: {
			id: 'user1',
			role: 'user',
		},
		text: message,
	})

	let response = await fetch(
		`https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`,
		{
			method: 'POST',
			body: bodyContent,
			headers: headersList,
		}
	)

	let data = await response.text()
	console.log('wtf', data)
}

export async function sendTeamsMessageFromCopilotBot(teamsConvoId, text) {
	try {
		let recipiant = teamsConvoId

		// let type = reqBody.body.elementType
		// if (type === 'image') {
		// 	let imageUrl = reqBody.attachments[0].url
		// } else if (type === 'file') {
		// 	let fileUrl = reqBody.attachments[0].url
		// }
		// if (type === 'text') {
		let replyMsg = text
		// }

		const payload = {
			conversationId: recipiant,
			message: {
				text: replyMsg,
			},
		}
		console.log('teams_payload= ', payload)

		let teamsResponse = await axios.post(TeamsBotUrl, payload)
		// let resp = await axios.post(vonageSMSUrl, payload)
		return teamsResponse
	} catch (error) {
		console.error('sendTeamsMessage error=> ', error)
		return error
	}
}

// export async function uploadCustFileToAvaya(media) {
// 	// console.log('media--> ', media)
// 	try {
// 		let fileName = media.name
// 		let fileData = media.data
// 		let message_type = media.message_type
// 		let { access_token } = await fetchAccessToken()
// 		let { fileType, fileSize, file, fileFullPathName } =
// 			await getCustFileDetails(fileData, fileName)
// 		console.log(
// 			'===========asdf==========> ',
// 			fileName,
// 			fileType,
// 			fileSize,
// 			fileFullPathName
// 		)
// 		const options = {
// 			method: 'POST',
// 			url: avayaFileUploadUrl,
// 			headers: {
// 				accept: 'application/json',
// 				authorization: `Bearer ${access_token}`,
// 				'content-type': 'application/json',
// 			},
// 			data: {
// 				mediaName: fileName,
// 				mediaContentType: fileType,
// 				// mediaContentType:
// 				// 	message_type === 'audio'
// 				// 		? `audio/opus`
// 				// 		: message_type === 'video'
// 				// 			? `video/mp4`
// 				// 			: fileType,
// 				mediaSize: fileSize,
// 			},
// 		}
// 		console.log('============== generate file url payload==> ', options)
// 		let resp = await axios.request(options)
// 		let uploadFilePayload = {
// 			fileFullPathName,
// 			mediaName: resp.data.mediaName,
// 			mediaContentType: resp.data.mediaContentType,
// 			mediaSize: resp.data.mediaSize,
// 			mediaId: resp.data.mediaId,
// 			uploadSignedUri: resp.data.uploadSignedUri,
// 		}
// 		let uploadImgResp = await uploadImage(uploadFilePayload)
// 		console.log('=================> ', uploadImgResp)
// 		return uploadImgResp
// 	} catch (error) {
// 		console.log('Error in uploadFileToAvaya=>  ', error)
// 		if (error.response.data) {
// 			throw error.response.data
// 		} else {
// 			throw error.message
// 		}
// 	}
// }
// =================== XXX temas copilot backend XXX ===================
