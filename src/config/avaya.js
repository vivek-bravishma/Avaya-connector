// Account id: WXAZCI
// Client id: WXAZCI_client
// Secret: 6oUjG6jbb0t2OXuohMT17fJFnkawFavl
// API key: 2c16537933bd4d4ba1184b44b5dfa94d
// Keyword/value : “itsupport”

// Additional details :
// Integration id : e2b12234-9648-4f41-baf7-cb48a962e5cc
// Channel provider id : 321e5c23-d561-447f-8e2f-dc15de5ed06e
// Integration name : SECUSTOM
// Workspaces url : https://apac-01.workspaces.avayacloud.com/services/ApplicationCenter/workspaces/
// user id/password : kamlesh@seaces.apjgc.com/Avaya@321$

// API/Secret Key details :
// Account id: WXAZCI
// Client id: WXAZCI_client2
// Secret: if1C6ABq6wjJYfJsmpZxq84jJwmWCQwL
// API key: 2c16537933bd4d4ba1184b44b5dfa94d
// Workspaces URL :
// https://apac-01.workspaces.avayacloud.com/services/ApplicationCenter/workspaces/
// Username/password : eryld@seaces.apjgc.com/Avaya@321$
// Engagement parameters :
// “KI” : “KI”
// Integration ID : 0935b975-6a6d-46c3-97e3-4eac8322dfe4
// Channel provider ID : 8c36cb16-d840-4247-add3-e0bf1e4c7316

let config = {
	accountId: 'WXAZCI',
	client_id: 'WXAZCI_client',
	client_secret: '6oUjG6jbb0t2OXuohMT17fJFnkawFavl',
	channelProviderId: '321e5c23-d561-447f-8e2f-dc15de5ed06e',
	integrationId: 'e2b12234-9648-4f41-baf7-cb48a962e5cc',
	integrationName: 'SECUSTOM',
	grant_type: 'client_credentials',
	avayaBaseUrl: 'https://experience.api.avayacloud.com',
	// copilotToken: '6mJ1ECPC0dk.hunFtodVEt72En-mSOwQiSLcBabsgjK_zwLVeAYq6U8', //copy chatbot
	// copilotToken: 'mcKUYtZZ-5A.SNSxaE9Tb2FcLEtXhLAq-ISgM4LAwiH-dzaAvCAuTZA', //univ cop
	copilotToken: 'CAOzaN_kffw.qeboxJ5Ra3e3VHTwg4uSj8vDX-FiAYKbIR_14FZryt4', //it support

	caseItemRoutingBotToken:
		'y1qZKR7F2wY.TASlE5k6rLQrWrjR0fJuNxlFMgvGr5a0l_1doBLVP8c',

	journeyBaseUrl: 'https://app.journeyid.io',
}

// let config = {
// 	accountId: 'MCTOTJ',
// 	client_id: 'clientApp1',
// 	client_secret: 'idgP2WRZf3eHsPTdUkgdOQlXoxjaMJZZ',
// 	channelProviderId: '4e287bdf-8c96-4eae-ac46-1ff091bcbec0',
// 	integrationId: 'c082f77d-3ae2-4e4c-8126-65db09b33767',
// 	integrationName: 'SECUSTOM',
// 	grant_type: 'client_credentials',
// 	avayaBaseUrl: 'https://experience.api.avayacloud.com',
// 	// copilotToken: '6mJ1ECPC0dk.hunFtodVEt72En-mSOwQiSLcBabsgjK_zwLVeAYq6U8', //copy chatbot
// 	// copilotToken: 'mcKUYtZZ-5A.SNSxaE9Tb2FcLEtXhLAq-ISgM4LAwiH-dzaAvCAuTZA', //univ cop
// 	copilotToken: 'CAOzaN_kffw.qeboxJ5Ra3e3VHTwg4uSj8vDX-FiAYKbIR_14FZryt4', //it support

// 	caseItemRoutingBotToken:
// 		'y1qZKR7F2wY.TASlE5k6rLQrWrjR0fJuNxlFMgvGr5a0l_1doBLVP8c',

// 	journeyBaseUrl: 'https://app.journeyid.io',
// }

config = {
	...config,
	accessTokenUrl: `${config.avayaBaseUrl}/api/auth/v1/${config.accountId}/protocol/openid-connect/token`,
	createSubscriptionUrl: `${config.avayaBaseUrl}/api/digital/webhook/v1/accounts/${config.accountId}/subscriptions`,
	sendMsgUrl: `${config.avayaBaseUrl}/api/digital/custom-messaging/v1/accounts/${config.accountId}/messages`,
	avayaFileUploadUrl: `${config.avayaBaseUrl}/api/media-store/v1/accounts/${config.accountId}/media/signed-upload-uri`,
	callbackUrl: 'https://connector.lab.bravishma.com/callback',
	vonageSMSUrl: 'https://rahul.lab.bravishma.com/send-vonage-sms',
	vonageApiKey: process.env.VONAGE_API_KEY,
	vonageApiSecret: process.env.VONAGE_API_SECRET,
	vonageApplicationId: process.env.VONAGE_APPLICATION_ID,
	vonagePrivateKey: process.env.VONAGE_PRIVATE_KEY,
	vonageWhatsAppNumber: '14157386102',
	vonageUrl: 'https://messages-sandbox.nexmo.com/v1/messages',
	vonage_BASE_URL: 'https://messages-sandbox.nexmo.com',
	// VIBER_SERVICE_MESSAGE_ID: "16273",
	VIBER_SERVICE_MESSAGE_ID: '22353',
	lineBaseUrl: 'https://api.line.me/v2/bot',
	lineMessageUrl: ' https://api.line.me/v2/bot/message/push',
	lineToken:
		'rq19tBuwHiVU+icYou47lMaob8U1zM/sUCSZkYzwGRselsT4zpyMX6kmqZwcsbROKs38LvcgwFmLdUATef+X8C2AZb3wkKSeLqHwaBQHbssXQ2MeMWVpchNRLzrcGFxF+V4tXJjfvD7dmwuyHfhMwAdB04t89/1O/w1cDnyilFU=',

	TeamsBotUrl: 'https://bot3f0694.azurewebsites.net/api/msgwebhook',
	// TeamsBotUrl: 'http://localhost:3978/api/msgwebhook',

	TeamsCaseItemRoutingBotURL:
		'https://boteb89e1.azurewebsites.net/api/msgwebhook',
	// TeamsCaseItemRoutingBotURL: 'http://localhost:3978/api/msgwebhook',

	JourneyIFrameUrl: `${config.journeyBaseUrl}/api/iframe/executions`,
	JourneySystemUrl: `${config.journeyBaseUrl}/api/system/executions`,
}
// export default {

//   avayaBaseUrl: "https://experience.api.avayacloud.com",
// };

export default config
