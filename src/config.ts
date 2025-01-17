import dotenv from 'dotenv'

dotenv.config()

const {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_SERVER_ID,
    DISCORD_CHANNEL_ID,
    TIME_LOOP_INTERVAL,
} = process.env

if (
    !DISCORD_TOKEN ||
    !DISCORD_CLIENT_ID ||
    !DISCORD_SERVER_ID ||
    !DISCORD_CHANNEL_ID ||
    !TIME_LOOP_INTERVAL
) {
    throw new Error('Missing environment variables')
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_SERVER_ID,
    DISCORD_CHANNEL_ID,
    TIME_LOOP_INTERVAL,
}
