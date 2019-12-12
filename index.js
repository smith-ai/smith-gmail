const { action, actions } = require('@smith-ai/smith-actions');
const Gmail = require('./gmail');

const gmail = new Gmail(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `http://${process.env.APP_DOMAIN}/api/gmail/auth`,
);

const install = async (output) => {
    const authUrl = gmail.generateAuthUrl();

    output.write(authUrl);

    return {};
};

const auth = async (req) => {
    const { code } = req.query;
    const tokens = await gmail.authenticate(code);

    return { 
        tokens
    };
};

action('what is in my inbox', async (params, config) => {
    gmail.setCredentials(config.tokens);

    const emails = await gmail.getEmails();

    const subjects = emails
      .filter((email) => email.data.labelIds.includes('UNREAD'))
      .map((email) => {
        const subject = email
            .data
            .payload
            .headers
            .filter((header) => header.name === 'Subject')[0]
            .value;

        return `\n - ${subject}`;
      });

    return subjects.length > 0 
      ? `Here are your latest emails:${subjects.join('')}`
      : 'You have no new emails';
});

module.exports = {
    actions,
    install,
    auth,
};
