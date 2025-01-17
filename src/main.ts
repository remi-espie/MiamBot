import { Client } from 'discord.js'
import { deployCommands } from './commands/deploy-commands'
import { commands } from './commands'
import { config } from './config'
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'
import { run_update } from './services/food_core'

const TIME_LOOP_INTERVAL = parseInt(config.TIME_LOOP_INTERVAL)

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'DirectMessages'],
})
const scheduler = new ToadScheduler()

client.once('ready', async () => {
    await client.guilds.cache.forEach(async (guild) => {
        await deployCommands({ guildId: guild.id, guildName: guild.name })
    })

    const task = new Task('menus update', async () => {
        await run_update(client)
    })
    const job = new SimpleIntervalJob(
        { hours: TIME_LOOP_INTERVAL, runImmediately: true },
        task
    )
    scheduler.addSimpleIntervalJob(job)

    console.log('MiamBot is ready ! 🍜')
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }
    const { commandName } = interaction
    if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction)
    }
})

client.login(config.DISCORD_TOKEN)
