const { google } = require('googleapis');

class Gmail {
    /**
     * Constructor. Creates a new instance of the GMail
     * SDK client.
     *
     * @param {string} clientId GMail API client ID
     * @param {string} clientSecret GMail API client secret
     * @param {string} redirectUri URI to redirect to on authentication
     */
    constructor(clientId, clientSecret, redirectUri) {
        this.client = new google.auth.OAuth2(
          clientId,
          clientSecret,
          redirectUri,
      );
    }

    /**
     * Generates a new URL for the user to authenticate with
     * using their Google account.
     */
    generateAuthUrl() {
        const scope = ['https://www.googleapis.com/auth/gmail.readonly'];

        return this.client.generateAuthUrl({ access_type: 'offline', scope, prompt: 'consent' });
    }

    /**
     * Authenticate with the API using the given access code.
     *
     * @param {string} code Access code for authentication
     */
    async authenticate(code) {
        const { tokens } = await this.client.getToken(code);

        this.setCredentials(tokens);

        return tokens;
    }

    /**
     * Set SDK client credentials.
     *
     * @param {object} tokens Object containing the access token details
     */
    setCredentials(tokens) {
        this.client.setCredentials(tokens);

        return this;
    }

    /**
     * Retrieve a paginated set of latest emails 
     * from the user's inbox.
     *
     * @param {number} perPage Number of emails to include in a page
     * @param {number} page Page number to retrieve
     */
    async getEmails(perPage = 5, page = 1) {
        const gmail = google.gmail({ version: 'v1', auth: this.client });
        const messages = await gmail.users.messages.list({ userId: 'me', maxResults: perPage, pageToken: page });

        const emails = await Promise.all(messages.data.messages
          .map(async (message) => gmail
              .users
              .messages
              .get({ userId: 'me', id: message.id })
          ));

        return emails;
    }
}

module.exports = Gmail;
