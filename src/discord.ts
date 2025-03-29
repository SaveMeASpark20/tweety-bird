import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

export async function initializeDiscord() {
    const channelId = process.env.CHANNEL;  
    const botToken = process.env.BOT_TOKEN;

    client.once('ready', async () => {
        console.log(`Logged in as ${client.user?.tag}!`);

        const channelId = process.env.CHANNEL;  
        const botToken = process.env.BOT_TOKEN
        if(!channelId || !botToken) {
            console.log('Initialize Bot is unsuccessful');
            return
        }
        
        const channel = client.channels.cache.get(channelId) as TextChannel;

        if (channel) {
            console.log("Bot is online")
        } else {
            console.error('🚫 Channel not found!');
        }
    });

    await client.login(botToken); // Replace with your actual bot token
}

export async function sendMessageOnDiscord(channelId: string, message: string): Promise<boolean> {
    try {
        const channel = client.channels.cache.get(channelId) as TextChannel;

        if (!channel) {
            console.error('🚫 Channel not found!');
            return false;
        }

        await channel.send(message);
        console.log(`✅ Successfully sent: "${message}"`);
        return true;
    } catch (error) {
        console.error(`🚫 Failed to send: "${message}". Error:`, error);
        return false;
    }
}
