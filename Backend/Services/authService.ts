import { google, Auth } from 'googleapis';
import dotenv from 'dotenv';
import openURL from 'openurl';
import { Request, Response } from 'express';


dotenv.config();

const client_id = process.env.CLIENT_ID!;
const client_secret = process.env.CLIENT_SECRET!;
const redirect_uri = process.env.REDIRECT_URI;
const SCOPES = process.env.SCOPES;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);

/**
 * Handles the OAuth2 callback and processes the authorization code
 */
export async function handleCallback(req: Request, res: Response): Promise<void> {
  try {
    const code = req.query.code as string;
    const email = decodeURIComponent(req.query.state as string);

    if (!code || !email) {
      console.warn(JSON.stringify({
        level: 'warn',
        service: 'auth-service',
        event: 'missing_code_or_email',
        message: 'Authorization code or email missing in callback',
        timestamp: new Date().toISOString(),
      }));
      res.status(400).send('Authorization code or email is missing.');
      return;
    }

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const savedToken = JSON.stringify(tokens);


    console.log(JSON.stringify({
      level: 'info',
      service: 'auth-service',
      event: 'token_saved',
      message: 'OAuth token saved successfully',
      email,
      token_expires: tokens.expiry_date,
      timestamp: new Date().toISOString(),
    }));

    oAuth2Client.emit('tokensSaved', null);
    res.status(200).send('Access Granted');
  } catch (error: any) {
    console.error(JSON.stringify({
      level: 'error',
      service: 'auth-service',
      event: 'callback_error',
      message: 'Error handling OAuth2 callback',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }));

    oAuth2Client.emit('tokensSaved', error);
    res.status(500).send('An error occurred during authentication.');
  }
}

/**
 * Generates a new OAuth2 token and prompts the user for authorization
 */
export function getNewToken(
  client: Auth.OAuth2Client,
  email: string,
  callback: (error: Error | null, success?: boolean) => void
): void {
  const state = encodeURIComponent(email);
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'select_account consent',
    state,
  });

  console.log(JSON.stringify({
    level: 'info',
    service: 'auth-service_mailcronjob',
    event: 'auth_url_generated',
    message: 'Prompting user for OAuth authorization',
    email,
    authUrl,
    timestamp: new Date().toISOString(),
  }));

  openURL.open(authUrl);

  client.once('tokensSaved', (error: Error | null) => {
    if (error) return callback(error);
    callback(null, true);
  });
}

/**
 * Authorizes the client using existing token or initiates a new token flow
 */
export async function authorize(email: string): Promise<Auth.OAuth2Client> {
  try {
      await new Promise<void>((resolve, reject) => {
        getNewToken(oAuth2Client, email, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log(JSON.stringify({
        level: 'info',
        service: 'auth-service_mailcronjob',
        event: 'authorization_complete',
        message: 'User authorization completed and token saved',
        email,
        timestamp: new Date().toISOString(),
      }));
    return oAuth2Client;
  } catch (error: any) {
    console.error(JSON.stringify({
      level: 'error',
      service: 'auth-service',
      event: 'fetch_token_error',
      message: 'Error fetching token from DB',
      email,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }));

    throw error;
  }
}

export { oAuth2Client };