let config = {
  accountId: "MCTOTJ",
  client_id: "clientApp1",
  client_secret: "idgP2WRZf3eHsPTdUkgdOQlXoxjaMJZZ",
  channelProviderId: "4e287bdf-8c96-4eae-ac46-1ff091bcbec0",
  integrationId: "c082f77d-3ae2-4e4c-8126-65db09b33767",
  integrationName: "SECUSTOM",
  grant_type: "client_credentials",
  avayaBaseUrl: "https://experience.api.avayacloud.com",
};

config = {
  ...config,
  accessTokenUrl: `${config.avayaBaseUrl}/api/auth/v1/${config.accountId}/protocol/openid-connect/token`,
  createSubscriptionUrl: `${config.avayaBaseUrl}/api/digital/webhook/v1/accounts/${config.accountId}/subscriptions`,
  sendMsgUrl: `${config.avayaBaseUrl}/api/digital/custom-messaging/v1/accounts/${config.accountId}/messages`,
  callbackUrl: "https://connector.lab.bravishma.com/callback",
};

// export default {

//   avayaBaseUrl: "https://experience.api.avayacloud.com",
// };

export default config;
