export interface ExchangeTokenParams {
  grantType: string;
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
}