let config = {
	accountId: 'MCTOTJ',
	client_id: 'clientApp1',
	client_secret: 'idgP2WRZf3eHsPTdUkgdOQlXoxjaMJZZ',
	channelProviderId: '4e287bdf-8c96-4eae-ac46-1ff091bcbec0',
	integrationId: 'c082f77d-3ae2-4e4c-8126-65db09b33767',
	integrationName: 'SECUSTOM',
	grant_type: 'client_credentials',
	avayaBaseUrl: 'https://experience.api.avayacloud.com',
	// copilotToken: '6mJ1ECPC0dk.hunFtodVEt72En-mSOwQiSLcBabsgjK_zwLVeAYq6U8', //copy chatbot
	// copilotToken: 'mcKUYtZZ-5A.SNSxaE9Tb2FcLEtXhLAq-ISgM4LAwiH-dzaAvCAuTZA', //univ cop
	copilotToken: 'CAOzaN_kffw.qeboxJ5Ra3e3VHTwg4uSj8vDX-FiAYKbIR_14FZryt4', //it support
}

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
}
// export default {

//   avayaBaseUrl: "https://experience.api.avayacloud.com",
// };

export default config
