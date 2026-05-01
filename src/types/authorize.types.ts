export interface AuthorizeParams {
  responseType: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  userId: string;
}