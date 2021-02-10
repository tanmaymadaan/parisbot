const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

// Read the signing secret from the environment variables
const web = new WebClient(process.env.SLACK_TOKEN);
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

// Initialize
const slackEvents = createEventAdapter(slackSigningSecret);

// The current date
const currentTime = new Date().toTimeString();

const port = process.env.PORT || 3000;

//This event is called whenever a member mentions @ParisBot in any channel. 
slackEvents.on('app_mention', (event) => {
    // console.log(event);
    if (event.text === "<@U01JH39FD2N> test") {
        sendTestReply(event.ts);
    }
    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

// This event is called when a new member joins a channel
// A couple of alternatives to this approach - using 'channel_joined' and 'message' events
// Both their implementations are done below
slackEvents.on('member_joined_channel', (event) => {
    console.log('mem');
    console.log(event);
});

// Similar to 'member_joined_channel', either of them could be used. 
// Consider going through Slack API docs to understand the differene betweent the two
// Another alternative if this doesn't work is to listen for messages with event subtype 'channel_join'
// and perform an action accordingly, an example below in 'message' event handler
// For creating GreetBot like bots, which greet users when they join a channel
slackEvents.on('channel_joined', (event) => {
    console.log('chj');
    console.log(event);
});

// This event is called whenever a message is sent in any of the channels
// Filter the messages for specific channels using the channel key
// An array of already existing channels can be created on runtime, and different actions 
// can be set based on the channel the message is coming from.
slackEvents.on('message', async (event) => {
    if (event.subtype === 'channel_join' && event.channel === "C01JLNHDKQT") {
        try {
            // Use the `chat.postMessage` method to send a message from this app
            await web.chat.postMessage({
                channel: event.user,
                text: `Hey, this is a test greetbot like message!`,
            });
        } catch (error) {
            console.log(error);
        }
    }
    console.log(event);
});


(async () => {
    // Start the built-in server
    const server = await slackEvents.start(port);

    // Log a message when the server is ready
    console.log(`ParisBot is up and running!\nListening for events on ${server.address().port}`);
})();

const sendTestReply = async (ts) => {
    try {
        // Use the `chat.postMessage` method to send a message from this app
        await web.chat.postMessage({
            channel: '#test_paris',
            text: `Woof woof! This is a test message`,
            thread_ts: ts
        });
    } catch (error) {
        console.log(error);
    }

    console.log('Message posted!');
};