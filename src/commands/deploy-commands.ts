import { REST, Routes } from 'discord.js'
import { config } from '../config'
import { commands } from '.'

const commandsData = Object.values(commands).map((command) => command.data)

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN)

type DeployCommandsProps = {
    guildId: string
    guildName: string
}

export async function deployCommands({
    guildId,
    guildName,
}: DeployCommandsProps) {
    try {
        await rest.put(
            Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
            {
                body: commandsData,
            }
        )

        console.log(
            `[${guildName}] Successfully reloaded application (/) commands.`
        )
    } catch (error) {
        console.error(error)
    }
}
