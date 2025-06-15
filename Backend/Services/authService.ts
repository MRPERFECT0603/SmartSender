import { google, Auth } from 'googleapis';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { userModel } from '../Models/userModel';


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
    if (tokens.refresh_token) {
      let user = await userModel.findOne({ email });
      if (!user) {
        user = new userModel({ email, refreshToken: tokens.refresh_token, userName: 'Temp' });
      } else {
        user.refreshToken = tokens.refresh_token;
      }
      await user.save();
    }
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
    res.send(`
  <html>
    <body>
      <script>
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth_complete', status: 'success' }, '*');
          window.close();
        } else {
          document.write("You may now close this window.");
        }
      </script>
    </body>
  </html>
`);
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
  callback: (error: Error | null, success?: boolean, authUrl?: string) => void
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
    service: 'auth-service',
    event: 'auth_url_generated',
    message: 'Prompting user for OAuth authorization',
    email,
    authUrl,
    timestamp: new Date().toISOString(),
  }));

  // openURL.open(authUrl);

  client.once('tokensSaved', (error: Error | null) => {
    if (error) return callback(error);
    callback(null, true, authUrl);
  });
}

/**
 * Authorizes the client using existing token or initiates a new token flow
 */
export async function authorize(email: string): Promise<{ client: Auth.OAuth2Client, authUrl: string }> {
  try {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'select_account consent',
      state: encodeURIComponent(email),
    });

    console.log(JSON.stringify({
      level: 'info',
      service: 'auth-service',
      event: 'auth_url_generated',
      message: 'Prompting user for OAuth authorization',
      email,
      authUrl,
      timestamp: new Date().toISOString(),
    }));

    return { client: oAuth2Client, authUrl }; // return this instead of waiting for callback
  } catch (error: any) {
    throw new Error(`Failed to authorize: ${error.message}`);
  }
}

export { oAuth2Client };