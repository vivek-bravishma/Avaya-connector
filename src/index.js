import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'

import Customer from './models/avayaconnector/customer.js'

import {
	fetchAccessToken,
	createSubscription,
	sendMessage,
	sendSMS,
	sendVonageMsg,
	sendVonageWhatsappText,
	sendVonageWhatsappTextApi,
	sendVonageWhatsappImage,
	sendVonageWhatsappImageApi,
	uploadFileToAvaya,
	uploadCustFileToAvaya,
	uploadImage,
	sendVonageWhatsappFile,
	sendVonageWhatsappFileApi,
	sendLineTextMessage,
	sendLineImageMessage,
	sendVonageViberText,
	sendCustomProviderMessage,
	getAllCopilotMessages,
	getLineUserDetails,
	sendTeamsMessage,
	startCopilotConvo,
	sendCopilotAiBotMsg,
	endTeamsAgentInteraction,
	sendVonageViberTextApi,
	sendMessageFromTeamsToAvaya,
	sendJourneyAuth,
	journeyUserDetails,
	journeyAuthStatus,
} from './helpers/index.js'

import avayaConfig from './config/avaya.js'
import { WebSocket } from 'ws'
import axios from 'axios'

const { copilotToken } = avayaConfig

const app = express()
const port = process.env.PORT || 3000

// const devChannels = ['whatsapp', 'Line', 'viber_service', 'custom_chat_provider', 'sms', 'custom_teams_copilot_provider'];
// const devChannel = 'custom_teams_copilot_provider'
const stagingEnv = true

app.use(cors())
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

const httpServer = createServer(app)
const io = new Server(httpServer, {
	cors: {
		origin: '*',
	},
	maxHttpBufferSize: 1024 * 1024 * 1024,
	pingTimeout: 60000,
	pingInterval: 5000,
})

httpServer.listen(port, () => {
	console.log(
		'============================================================================================='
	)
	console.log('avaya connector server started at ', port)
})

mongoose
	.connect(
		'mongodb+srv://vivek:xmM6t85qbIHWlgZx@vivek-custer.kk8uhws.mongodb.net/avayaConnector?retryWrites=true&w=majority&appName=ViveK-Custer'
	)
	.then(
		() => console.log('connected to db'),
		(err) => console.log('Error connecting db', err)
	)

// const connectedSockets = []
const connectedSocketsMap = new Map()

io.on('connection', (socket) => {
	// connectedSockets.push(socket.id)
	// console.log('connected sockets==> ', connectedSockets)

	connectedSocketsMap.set(socket.id, {})
	connectedSocketsMap.forEach((value, key) =>
		console.log('connection - connectedSocketsMap==> ', key, ' = ', value)
	)

	socket.on('disconnect', () => {
		console.log('disconnected socket--> ', socket.id)
		// connectedSockets.splice(connectedSockets.indexOf(socket.id), 1)
		console.log('socket disconnected with id=> ', socket.id)
		connectedSocketsMap.delete(socket.id)
		// connectedSocketsMap.forEach((value, key) =>
		// 	console.log(
		// 		'disconnect - connectedSocketsMap==> ',
		// 		key,
		// 		' = ',
		// 		value
		// 	)
		// )
	})

	// socket.on('message', async (data) => {
	// 	console.log('message from client', data)
	// 	socket.emit('message', data)
	// })

	socket.on('message', async (data) => {
		console.log('data----> ', data)

		let {
			copilot_convo_id,
			sender,
			text,
			message_type,
			image,
			audio,
			video,
			file,
			location,
			mobileNumber,
		} = data

		connectedSocketsMap.set(socket.id, {
			copilotId: copilot_convo_id,
		})

		// connectedSocketsMap.forEach((value, key) =>
		// 	console.log('message - connectedSocketsMap==> ', key, ' = ', value)
		// )

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
			fileDetails = await uploadCustFileToAvaya(resourceFile)
		} else if (message_type === 'location') {
			locationDetails = location
		}
		let channel = 'custom_chat_provider'
		const from = socket.id
		// const from = copilot_convo_id ? copilot_convo_id : socket.id

		let tokenResp = await sendMessage(
			sender,
			text,
			from,
			channel,
			message_type,
			fileDetails,
			locationDetails,
			mobileNumber
		)
		console.log('socket send message resp--> ', tokenResp)
	})
})

app.get('/', async (req, res) => {
	const indexPath = path.join(process.cwd(), 'index.html')
	console.log('env==> ', process.env.VONAGE_API_KEY)
	console.log('env==> ', process.env.VONAGE_API_SECRET)
	console.log('env==> ', process.env.VONAGE_APPLICATION_ID)
	console.log('env==> ', process.env.VONAGE_PRIVATE_KEY)

	res.sendFile(indexPath)
})

app.get('/xyz', (req, res) => {
	const userId = req.query.userId
	const message = req.query.message

	// Retrieve the socket ID for the specified user ID
	const socketId = connectedSockets.find((id) => {
		// Implement your logic to map user ID to socket ID if needed
		// For simplicity, we're assuming the user ID is the same as the socket ID
		return id === userId
	})

	// const socketId= connectedSocketsMap.get()

	if (socketId) {
		// Emit a 'msg' event to the specific user's socket connection
		io.to(socketId).emit('msg', message)
		res.send(`Message "${message}" sent to user ID ${userId}`)
	} else {
		res.status(404).send(`User with ID ${userId} not found`)
	}
})

app.get('/test', async (req, res) => {
	try {
		// let fu = await sendVonageWhatsappText('919558241999', 'test message')
		// http://localhost:3000/test?copilotConvoId=7NMjNdzBRpoKpqfS3INBoA-in
		let fu = await getAllCopilotMessages(req.query.copilotConvoId)
		// console.log('fu=> ', fu)
		res.send(fu)
	} catch (error) {
		res.send(error)
	}
})

app.get('/customer-details', async (req, res) => {
	await Customer.find()
		.then((customers) => {
			res.send(customers)
		})
		.catch((err) => {
			res.send(err)
		})
})

// callback for avaya
app.post('/callback', async (req, res) => {
	try {
		const reqBody = req.body
		// Forward data to localtunnel URL
		if (stagingEnv) {
			const devHeaders = {
				'bypass-tunnel-reminder': 'custom-tunnel-dev',
				'User-Agent': 'MyCustomBrowser/1.0',
			}
			axios
				.post('https://avya-connectr-dev.loca.lt/callback', reqBody, {
					devHeaders,
				})
				.then(() => {
					console.log('Successfully forwarded data to localtunnel.')
				})
				.catch((error) => {
					console.error(
						'Error forwarding data to localtunnel:',
						error.message
					)
					// Log the error, but do not affect main functionality
				})
		}

		console.log(
			`//======== callback post request ${reqBody.eventType} ${reqBody.senderParticipantType} =========`
		)
		console.log(
			'let avaya_callback_request_body = ',
			JSON.stringify(reqBody)
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

				let channel =
					reqBody?.headers?.sourceType?.split('custom-messaging:')[1]
				console.log(
					'let Recipient= ',
					recipiant,
					' let  replyMsg= ',
					replyMsg,
					' let   providerDialogId= ',
					reqBody.providerDialogId,
					' let  channel == ',
					channel
				)

				if (recipiant) {
					if (channel === 'whatsapp') {
						let type = reqBody.body.elementType
						console.log('\n\n\nWhatsapp message type : ', type)
						if (type === 'image') {
							let imageUrl = reqBody.attachments[0].url
							// let vonageResp = await sendVonageWhatsappImage(
							// 	recipiant,
							// 	imageUrl
							// )
							let vonageResp = await sendVonageWhatsappImageApi(
								recipiant,
								imageUrl
							)
							console.log(
								'vonage image resp--> ',
								vonageResp.data
							)
						} else if (type === 'file') {
							let fileUrl = reqBody.attachments[0].url
							// let vonageResp = await sendVonageWhatsappFile(
							// 	recipiant,
							// 	fileUrl
							// )
							let vonageResp = await sendVonageWhatsappFileApi(
								recipiant,
								fileUrl
							)
							console.log('vonage file resp--> ', vonageResp.data)
						} else {
							// let vonageResp = await sendVonageWhatsappText(
							// 	recipiant,
							// 	replyMsg
							// )
							let vonageResp = await sendVonageWhatsappTextApi(
								recipiant,
								replyMsg
							)

							console.log('vonage resp--> ', vonageResp.data)
						}
					} else if (channel === 'Line') {
						console.log('Handle Line messages here')
						let type = reqBody.body.elementType
						console.log('\n\nLine message type : ', type)

						if (type === 'text') {
							let lineResponse = await sendLineTextMessage(
								recipiant,
								replyMsg,
								type,
								channel
							)
						} else if (type === 'image') {
							let imageUrl = reqBody.attachments[0].url
							let lineResponse = await sendLineImageMessage(
								recipiant,
								imageUrl,
								type,
								channel
							)
						}
					} else if (channel === 'viber_service') {
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
							// let vonageResp = await sendVonageViberText(
							// 	recipiant,
							// 	replyMsg
							// )
							let vonageResp = await sendVonageViberTextApi(
								recipiant,
								replyMsg
							)
							console.log('vonage resp--> ', vonageResp.data)
						}
					} else if (channel === 'custom_chat_provider') {
						let proPartyId =
							reqBody.recipientParticipants[0]
								.providerParticipantId

						console.log('proPartyId------> ', proPartyId)
						// console.log('sockets------> ', connectedSockets)

						// let socketId = connectedSockets.find(
						// 	(id) => id === proPartyId
						// )

						let socketId = connectedSocketsMap.has(proPartyId)
							? proPartyId
							: null
						console.log('socketId2------> ', socketId)

						if (!socketId) return

						let copilotId =
							connectedSocketsMap.get(proPartyId).copilotId
						console.log('copilotId------> ', copilotId)
						console.log('copilotId type ------> ', typeof copilotId)

						// if (socketId) io.to(socketId).emit('message', reqBody)
						if (socketId) {
							sendCustomProviderMessage(io, socketId, reqBody)
						}
					} else if (channel === 'sms') {
						let smsResp = await sendSMS(recipiant, replyMsg)
						console.log('sms resp--> ', smsResp.data)
					} else if (channel === 'custom_teams_copilot_provider') {
						let sendTeamsMessageResponse = await sendTeamsMessage(
							reqBody,
							'MESSAGE',
							teamsCopilotUsersMap
						)
						console.log(
							'let avaya_send_Message_to_teams_response= ',
							JSON.stringify(sendTeamsMessageResponse)
						)
					} else {
						console.log('invalid channel ---> ', channel)
					}
				}
			} else if (reqBody.senderParticipantType === 'CUSTOMER') {
				// console.log('let customer msg --> ', reqBody.body.elementText.text)
				let channel =
					reqBody?.headers?.sourceType?.split('custom-messaging:')[1]

				let resipntPartyCustProPartyId =
					reqBody.recipientParticipants?.filter(
						(party) => party.participantType === 'CUSTOMER'
					)[0]?.providerParticipantId

				let avayaCustomer = await Customer.findOne({
					providerParticipantId: resipntPartyCustProPartyId,
				})

				// console.log('avayaCustomker===> ', avayaCustomer)

				if (!avayaCustomer) {
					let resipntPartyCustConnId =
						reqBody.recipientParticipants?.filter(
							(party) => party.participantType === 'CUSTOMER'
						)[0]?.connectionId

					const customerData = {
						customerName: reqBody?.senderParticipantName,
						channel: channel,
						engagementId: reqBody?.engagementId,
						providerParticipantId: resipntPartyCustProPartyId,
						correlationId: reqBody?.correlationId,
						dialogId: reqBody?.dialogId,
						connectionId: resipntPartyCustConnId,
					}
					// console.log('customerDAt ', customerData)
					const avayaCustomer = new Customer(customerData)
					await avayaCustomer.save()
				}
			}
		} else if (reqBody.eventType === 'PARTICIPANT_DISCONNECTED') {
			console.log(
				'=============== PARTICIPANT_DISCONNECTED Participant Type ==============='
			)
			console.log(reqBody.participantType)
			console.log(
				'=============== PARTICIPANT_DISCONNECTED Participant Type ==============='
			)
			await endTeamsAgentInteraction(
				reqBody.providerDialogId,
				teamsCopilotUsersMap
			)
			if (reqBody.participantType === 'CUSTOMER') {
			} else if (reqBody.participantType === 'AGENT') {
			} else {
			}
		} else if (reqBody.eventType === 'PARTICIPANT_ADDED') {
			if (reqBody.participantType === 'CUSTOMER') {
			} else if (reqBody.participantType === 'AGENT') {
				// send client message that agent is added
				// let clientId=reqBody.providerDialogId
				let sendTeamsMessageResponse = await sendTeamsMessage(
					reqBody,
					'JOINED',
					teamsCopilotUsersMap
				)
				console.log(
					'let  agent_joined_avaya_send_Message_to_teams_response= ',
					JSON.stringify(sendTeamsMessageResponse)
				)
			} else {
			}
		}

		res.send('callback url working')
	} catch (error) {
		console.log('error in callback---> ', error)
		res.send(error)
	}
})

// custom chat
app.post('/send-message', async (req, res) => {
	console.log('send message called')
	try {
		let {
			sender,
			text,
			from,
			message_type,
			image,
			audio,
			video,
			file,
			location,
		} = req.body
		console.log('request body --> ', req.body)

		// let fileDetails = undefined
		// let locationDetails = undefined
		// if (
		// 	message_type === 'image' ||
		// 	message_type === 'audio' ||
		// 	message_type === 'video' ||
		// 	message_type === 'file'
		// ) {
		// 	let resourceFile = image
		// 		? image
		// 		: audio
		// 			? audio
		// 			: video
		// 				? video
		// 				: file
		// 					? file
		// 					: undefined
		// 	resourceFile.message_type = message_type
		// 	fileDetails = await uploadFileToAvaya(resourceFile)
		// } else if (message_type === 'location') {
		// 	locationDetails = location
		// }

		let channel = 'custom_chat_provider'

		let tokenResp = await sendMessage(
			sender,
			text,
			from,
			channel,
			message_type
			// fileDetails,
			// locationDetails
		)
		console.log('resp--> ', tokenResp)
		res.send(tokenResp)
	} catch (error) {
		console.log('Error in vonage-callback========> ', error.detail)
		res.send(error)
	}
})

// vonage sms
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

// vonage whatsapp, viber
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

// vonage line
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
			let lineUserId = messageEvent.source.userId
			let lineUserDetails = await getLineUserDetails(lineUserId)
			console.log('lineUserDetails=', lineUserDetails)
			let lineUsername = lineUserDetails?.displayName
				? lineUserDetails.displayName
				: 'Line User'

			console.log('lineUsername=', lineUsername)

			if (messageType === 'text') {
				let tokenResp = await sendMessage(
					lineUsername,
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
					lineUsername,
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

app.post('/caller-id-callback', async (req, res) => {
	console.log(JSON.stringify(req.body))
	let callerID = req.body?.payload?.telephony?.caller_id
	let callerIDDdd = ''
	if (callerID) {
		callerIDDdd = callerID.trim().split('+')[1]
	}
	const sessionId = req.body?.sessionInfo?.session
	const sessionParameters = {
		caller_ids: callerIDDdd,
	}

	// Return a response with fulfillment text and any other necessary information
	const response = {
		fulfillmentResponse: {
			messages: [
				{
					text: {
						text: [''],
					},
				},
			],
		},
		sessionInfo: {
			session: sessionId,
			parameters: sessionParameters,
		},
	}
	console.log(response)
	res.json(response)
})

app.get('/copilot-token', (req, res) => {
	res.send({ copilotToken })
})

app.get('/copilot-messages', async (req, res) => {
	try {
		let socketId = req.query.socketId
		let copilotConvoId = connectedSocketsMap.get(socketId)?.copilotId

		connectedSocketsMap.forEach((value, key) =>
			console.log(
				'copilot-messages - WEB- connectedSocketsMap==> ',
				key,
				' = ',
				value
			)
		)

		console.log('socketId==> ', socketId)
		console.log('copilotConvoId==> ', copilotConvoId)

		if (!copilotConvoId) {
			// 			teamsCopilotUsersMap
			// copilotConversationId
			teamsCopilotUsersMap.forEach((value, key) =>
				console.log(
					'copilot-messages - Teams - teamsCopilotUsersMap==> ',
					key,
					' = ',
					value
				)
			)

			let copilotTeamsUserData = teamsCopilotUsersMap.get(socketId)

			let copilotTeamsConvoId =
				copilotTeamsUserData?.copilotConversationId

			let copilotTeamsConvoToken =
				copilotTeamsUserData?.copilotDetails?.copilotToken

			console.log('copilotTeamsConvoId==> ', copilotTeamsConvoId)
			console.log('copilotTeamsConvoToken==> ', copilotTeamsConvoToken)
			console.log('copilotTeamsUserData==> ', copilotTeamsUserData)

			if (!copilotTeamsConvoId) {
				res.send('invalid customer id')
			} else {
				let copilotMessages = await getAllCopilotMessages(
					copilotTeamsConvoId,
					copilotTeamsConvoToken
				)
				console.log('copilotTeamsMessages=> ', copilotMessages)
				res.send(copilotMessages)
			}
		} else {
			let copilotMessages = await getAllCopilotMessages(copilotConvoId)
			console.log('copilotMessages=> ', copilotMessages)
			res.send(copilotMessages)
		}
	} catch (error) {
		res.send(error)
	}
})

app.get('/copilot-messages-cpcid', async (req, res) => {
	try {
		let copilotMessages = await getAllCopilotMessages(
			req.query.copilotConvoId
		)
		console.log('copilotMessages=> ', copilotMessages)
		res.send(copilotMessages)
	} catch (error) {
		res.send(error)
	}
})

// =================== temas copilot backend ===================

// const payload = {
// 	// from: context.activity.conversation.id,
// 	// text: context.activity.text,
// 	// to: recipiant,
// 	// api_key: vonageApiKey,
// 	// api_secret: vonageApiSecret,
// 	// image,
// 	// audio,
// 	// video,
// 	// file,
// 	// location,
// 	// mobileNumber,

// 	user: {
// 		conversationId: context.activity.conversation.id,
// 		username: context.activity.from.name,
// 	},
// 	text: context.activity.text,
// 	message_type: 'text',
// }

// let {
// 	user,
// 	text,
// 	message_type,
// 	image,
// 	audio,
// 	video,
// 	file,
// 	location,
// 	mobileNumber,
// } = req.body

let teamsCopilotUsersMap = new Map()

// teamsCopilotUsersMap.set(conversationId,{isEcalated:false,mobileNumber:''})
app.post('/teams-copilot-callback', async (req, res) => {
	console.log('// Post teams-copilot-callback')
	console.log(
		'let teams_copilot_callback_req_body=',
		JSON.stringify(req.body)
	)

	let contextActivity = req.body.contextActivity
	let copilotbotName = req.body.copilotbotName

	let conversationId = contextActivity.conversation.id
	let username_teams = contextActivity.from.name
	let text = contextActivity.text

	// contentType: 'application/vnd.microsoft.teams.file.download.info'
	// attachments: [ { contentType: 'text/html', content: '<p>hi</p>' } ],
	console.log(
		'//convo id====== copilot =======> \n username_teams= ',
		username_teams
	)
	let teamsCopilotUserDets = teamsCopilotUsersMap.get(conversationId)
	console.log('teamscopilotuserDets=', teamsCopilotUserDets)
	if (teamsCopilotUserDets) {
		teamsCopilotUserDets.username_teams = username_teams
		teamsCopilotUsersMap.set(teamsCopilotUserDets)
	}

	if (teamsCopilotUserDets === undefined) {
		console.log('/teams-copilot-callback initial msg')
		await startCopilotConvo(
			teamsCopilotUsersMap,
			conversationId,
			username_teams,
			copilotbotName
		)
	} else if (teamsCopilotUserDets.isEcalated === true) {
		// let teamsUserData = teamsCopilotUsersMap.get(conversationId)

		console.log('//teamsUserData Ecalated ')

		let resp = await sendMessageFromTeamsToAvaya({
			// teamsUserData,
			teamsCopilotUserDets,
			messageData: contextActivity,
		})
		console.log('resss=> ', resp)
	} else {
		console.log('//teamsUserData not isEcalated==> ')
		// let teamsUserData = teamsCopilotUsersMap.get(conversationId)
		// // console.log('teamsUserData not isEcalated==> ', teamsUserData)
		// let conversionDetails = {
		// 	conversationId: teamsUserData.copilotConversationId,
		// 	streamUrl: teamsUserData.streamUrl,
		// 	token: teamsUserData.token,
		// }
		let conversionDetails = {
			conversationId: teamsCopilotUserDets.copilotConversationId,
			streamUrl: teamsCopilotUserDets.streamUrl,
			token: teamsCopilotUserDets.token,
		}

		await sendCopilotAiBotMsg(conversionDetails, text)
	}
	// console.log(
	// 	'(teamsCopilotUsersMap.get(conversationId))2==> ',
	// 	teamsCopilotUsersMap.get(conversationId)
	// )

	res.send('ok')
})

app.post('/teams-copilot-init-callback', async (req, res) => {
	console.log('// Post teams-copilot-init-callback')
	console.log('req body==> ', req.body)

	let contextActivity = req.body.contextActivity
	let copilotbotName = req.body.copilotbotName

	let conversationId = contextActivity.conversation.id
	let username_teams = contextActivity.from.name

	// console.log('convo id=============> ', conversationId)

	let teamsCopilotUserDets = teamsCopilotUsersMap.get(conversationId)
	// console.log('teamsCopilotUserDets==> ', teamsCopilotUserDets)

	// if (teamsCopilotUserDets === undefined) {
	await startCopilotConvo(
		teamsCopilotUsersMap,
		conversationId,
		username_teams,
		copilotbotName
	)
	// } else {
	// 	console.log('something is wrong you should not be here')
	// }

	res.send('ok')
})

app.post('/journey-auth', async (req, res) => {
	try {
		if (!req.body.uniqueId)
			return res.status(400).send('uniqueId field required')
		let payload = {
			// deliveryMethod: 'email' | 'sms' | 'push' | 'token' | 'url',
			deliveryMethod: req.body.deliveryMethod || 'url',
			// authType: 'OTP' | 'FACIAL' | 'PUSH',
			authType: req.body.authType || 'FACIAL',
			uniqueId: req.body.uniqueId,
		}
		let resp = await sendJourneyAuth(payload)
		if (resp.url)
			resp.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=50&data=${resp.url}`
		// let resp = await journeyUserDetails('919028477947')
		console.log('resp==> ', resp)
		res.status(201).send(resp)
	} catch (error) {
		console.log('errr=> ', error)
		res.status(404).send(error)
	}
})

app.post('/journey-auth-status', async (req, res) => {
	let { userId, sessionId } = req.body
	if (!userId.trim() || !sessionId.trim()) {
		return res.status(400).send('userId or sessionId missing')
	}

	let authRes = await journeyAuthStatus(userId, sessionId)
	console.log(authRes)

	return res.send(authRes)
})
