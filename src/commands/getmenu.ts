import {
    CommandInteraction,
    InteractionEditReplyOptions,
    SlashCommandBuilder,
    TextBasedChannel,
} from 'discord.js'
import { update_foods } from '../services/food_core'

export const data = new SlashCommandBuilder()
    .setName('getmenu')
    .setDescription('Get the menu')

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply()

    const result = (await update_foods(
        true,
        interaction.channel as TextBasedChannel
    )) as InteractionEditReplyOptions
    if (result) await interaction.editReply(result)
}
