import 'dotenv/config'
import express from 'express'
import cors from 'cors'
const app = express()

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
	sendLineTextMessage,
	sendLineImageMessage,
	sendVonageViberText,
} from './helpers/index.js'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const port = process.env.PORT || 3000
app.listen(port, () => {
	console.log(
		'============================================================================================='
	)
	console.log('avaya connector server started at ', port)
})

app.get('/test', async (req, res) => {
	res.send('api working')
})

// callback for avaya
app.post('/callback', async (req, res) => {
	try {
		const reqBody = req.body
		console.log(
			`======== callback post request ${reqBody.eventType} ${reqBody.senderParticipantType} =========`
		)
		if (reqBody.eventType === 'MESSAGES') {
			if (
				reqBody.senderParticipantType === 'AGENT' ||
				reqBody.senderParticipantType === 'SYSTEM'
			) {
				//  send this data to client/customer
				let replyMsg = reqBody.body.elementText.text
				let recipiant =
					reqBody.recipientParticipants[0].providerParticipantId
				console.log(
					'Recipient=> ',
					recipiant,
					'  replyMsg=> ',
					replyMsg,
					'   providerDialogId=> ',
					reqBody.providerDialogId
				)
				console.log(
					'============================================= ',
					reqBody
				)
				if (recipiant) {
					if (reqBody.providerDialogId === 'whatsapp') {
						let type = reqBody.body.elementType
						console.log('\n\n\nWhatsapp message type : ', type)
						if (type === 'image') {
							let imageUrl = reqBody.attachments[0].url
							let vonageResp = await sendVonageWhatsappImage(
								recipiant,
								imageUrl
							)
							console.log(
								'vonage image resp--> ',
								vonageResp.data
							)
						} else if (type === 'file') {
							let fileUrl = reqBody.attachments[0].url
							let vonageResp = await sendVonageWhatsappFile(
								recipiant,
								fileUrl
							)
							console.log('vonage file resp--> ', vonageResp.data)
						} else {
							let vonageResp = await sendVonageWhatsappText(
								recipiant,
								replyMsg
							)
							console.log('vonage resp--> ', vonageResp.data)
						}
					} else if (reqBody.providerDialogId === 'Line') {
						console.log('Handle Line messages here')
						let type = reqBody.body.elementType
						console.log('\n\nLine message type : ', type)

						if (type === 'text') {
							let lineResponse = await sendLineTextMessage(
								recipiant,
								replyMsg,
								type,
								reqBody.providerDialogId
							)
						} else if (type === 'image') {
							let imageUrl = reqBody.attachments[0].url
							let lineResponse = await sendLineImageMessage(
								recipiant,
								imageUrl,
								type,
								reqBody.providerDialogId
							)
						}
					} else if (reqBody.providerDialogId === 'viber_service') {
						let type = reqBody.body.elementType
						console.log('\n\n\n viber message type : ', type)
						if (type === 'image') {
							let imageUrl = reqBody.attachments[0].url
							let vonageResp = await sendVonageWhatsappImage(
								recipiant,
								imageUrl
							)
							console.log(
								'vonage image resp--> ',
								vonageResp.data
							)
						} else if (type === 'file') {
							let fileUrl = reqBody.attachments[0].url
							let vonageResp = await sendVonageWhatsappFile(
								recipiant,
								fileUrl
							)
							console.log('vonage file resp--> ', vonageResp.data)
						} else {
							let vonageResp = await sendVonageViberText(
								recipiant,
								replyMsg
							)
							console.log('vonage resp--> ', vonageResp.data)
						}
					} else {
						let smsResp = await sendSMS(recipiant, replyMsg)
						console.log('sms resp--> ', smsResp.data)
					}
				}
			} else if (reqBody.senderParticipantType === 'CUSTOMER') {
				console.log('customer msg --> ', reqBody.body.elementText.text)
			}
		}
		res.send('callback url working')
	} catch (error) {
		console.log('error in callback---> ', error)
		res.send(error)
	}
})

app.post('/send-message', async (req, res) => {
	console.log('send message called')
	try {
		let { sender, message, mobileNo, channel } = req.body
		console.log(sender, message, mobileNo)
		let tokenResp = await sendMessage(sender, message, mobileNo, channel)
		res.send(tokenResp)
	} catch (error) {
		console.log('Error in vonage-callback========> ', error.detail)
		res.send(error)
	}
})

app.get('/vonage-callback', async (req, res) => {
	console.log('GET vonage-callback')
	console.log(req.query)

	// query: {
	//   msisdn: '6596542183',
	//   to: '12015009339',
	//   messageId: '3F000000592D437E',
	//   text: 'Hi',
	//   type: 'text',
	//   keyword: 'HI',
	//   'api-key': 'b90a1d65',
	//   'message-timestamp': '2024-04-30 11:36:44'
	// }

	try {
		let { msisdn, to, messageId, text, type, keyword } = req.query
		let tokenResp = await sendMessage(msisdn, text, msisdn, 'sms', type)
		res.send(tokenResp)
	} catch (error) {
		console.log('vonage get callback error ', error)
		res.send(error)
	}
})

app.post('/vonage-callback', async (req, res) => {
	console.log('POST vonage-callback')
	console.log(req.body)
	// {
	//   "to": "14157386102",
	//   "from": "919028477947",
	//   "channel": "whatsapp",
	//   "message_uuid": "8232c01c-9d21-4161-97d4-8f672398144d",
	//   "timestamp": "2024-04-30T12:20:03Z",
	//   "message_type": "text",
	//   "text": "Whatsup",
	//   "context_status": "none",
	//   "profile": { "name": "Vivek Nishad" }
	// }
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
			context,
		} = req.body

		let sender

		if (channel === 'viber_service') {
			sender = context.message_from
		} else {
			sender = profile.name
		}

		let fileDetails = undefined
		let locationDetails = undefined
		if (
			message_type === 'image' ||
			message_type === 'audio' ||
			message_type === 'video' ||
			message_type === 'file'
		) {
			let resourceFile = image
				? image
				: audio
					? audio
					: video
						? video
						: file
							? file
							: undefined
			resourceFile.message_type = message_type
			fileDetails = await uploadFileToAvaya(resourceFile)
		} else if (message_type === 'location') {
			locationDetails = location
		}

		console.log('fileDetails================> ', fileDetails)
		let tokenResp = await sendMessage(
			sender,
			text,
			from,
			channel,
			message_type,
			fileDetails,
			locationDetails
		)
		res.send(tokenResp)
	} catch (error) {
		console.log('Error in vonage-callback========> ', error)
		res.send(error)
	}
})

app.post('/line-callback', async (req, res) => {
	console.log('POST line-callback')
	console.log(JSON.stringify(req.body))
	try {
		let { events } = req.body
		let fileDetails = undefined
		let locationDetails = undefined

		if (events.length > 0) {
			let messageEvent = events[0]
			let messageType = messageEvent.message.type
			console.log('MessageType : ' + messageType)

			if (messageType === 'text') {
				let tokenResp = await sendMessage(
					messageEvent.source.type,
					messageEvent.message.text,
					messageEvent.source.userId,
					'Line',
					messageType,
					fileDetails,
					locationDetails
				)
				res.send(tokenResp)
			} else if (messageType === 'image') {
				console.log('Image Message type not supported.')
			} else if (messageType === 'location') {
				locationDetails = {
					lat: messageEvent.message.latitude,
					long: messageEvent.message.longitude,
				}
				let tokenResp = await sendMessage(
					messageEvent.source.type,
					messageEvent.message.address,
					messageEvent.source.userId,
					'Line',
					messageType,
					fileDetails,
					locationDetails
				)
			} else if (messageType === 'audio') {
				console.log('Audio Message type not supported.')
			} else if (messageType === 'video') {
				console.log('Video Message type not supported.')
			} else if (messageType === 'sticker') {
				console.log('Sticker Message type not supported.')
			} else {
				console.log('Message type not supported.')
			}
		}
	} catch (error) {
		console.log('line-callback error========> ', error.detail)
		res.send(error)
	}
	res.send('OK')
})

app.post('/viber-callback', async (req, res) => {
	console.log('POST viber-callback')
	console.log(JSON.stringify(req.body))
	res.send('OK')
})
