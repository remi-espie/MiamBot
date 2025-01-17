import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    EmbedBuilder,
    GuildTextBasedChannel,
    MessageCreateOptions,
    TextBasedChannel,
} from 'discord.js'
import { retrieveFood } from './food_gather'
import { config } from '../config'
import * as fs from 'fs'
import { createHash } from 'crypto'

const hash_file = 'menus.hash'
const emojis = [
    '💀',
    '💩',
    '😶‍🌫️',
    '🤢',
    '😰',
    '😳',
    '🤡',
    '🤓',
    '😭',
    '😅',
    '😍',
    '🥰',
    '🤗',
    '🫣',
    '😩',
    '🥺',
    '😖',
    '😔',
]

function getRandomDifferent(arr: Array<any>, lasts: Array<string>) {
    if (arr.length === 0) {
        return null
    } else if (arr.length === 1) {
        return arr[0]
    } else {
        let num = 0
        do {
            num = Math.floor(Math.random() * arr.length)
        } while (lasts.includes(arr[num]))
        return arr[num]
    }
}

function create_file(file: string) {
    if (!fs.existsSync(hash_file)) {
        fs.writeFileSync(hash_file, '')
        return false
    }
    return true
}

function food_menus_exists(food_menus: any): boolean {
    if (!create_file(hash_file)) return false
    const content = fs.readFileSync(hash_file, { encoding: 'utf-8' })
    const hash = createHash('sha1', { encoding: 'utf-8' })
        .update(JSON.stringify(food_menus))
        .digest('hex')
    return hash === content
}

function store_menus(food_menus: any) {
    create_file(hash_file)
    const hash = createHash('sha1', { encoding: 'utf-8' })
        .update(JSON.stringify(food_menus))
        .digest('hex')
    fs.writeFileSync(hash_file, hash, { encoding: 'utf-8' })
}

export async function update_foods(
    fromCommand: boolean,
    channel: TextBasedChannel
) {
    const food_results: any[] = await retrieveFood()
    if (!fromCommand) {
        if (food_menus_exists(food_results)) return null
        store_menus(food_results)
    }

    const embeds: EmbedBuilder[] = []
    try {
        await (
            await channel.messages.fetch({ limit: 10 })
        )?.forEach(async (msg) => {
            if (
                msg?.author.id === config.DISCORD_CLIENT_ID &&
                msg.embeds.length > 0
            ) {
                await msg.edit({
                    components: [],
                })
            }
        })
    } catch (error) {
        console.log(error)
    }

    const actionRow = new ActionRowBuilder()
    actionRow.addComponents(
        new ButtonBuilder()
            .setURL('https://g.co/kgs/4hsF4Pm')
            .setLabel('La Rose des Sables 2 🍕')
            .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
            .setURL('https://break-food-montpellier.eatbu.com/?lang=fr')
            .setLabel('Break Food 🍔')
            .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
            .setURL('https://www.kfc.fr/nos-restaurants/kfc-montpellier-fac')
            .setLabel('KFC 🐓')
            .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
            .setURL(
                'https://pitaya-thaistreetfood.com/r/pitaya-montpellier-flandre'
            )
            .setLabel('Pitaya 🍜')
            .setStyle(ButtonStyle.Link)
    )
    const emotes: string[] = []
    for (let i = 0; i < food_results.length; i++) {
        const result = food_results[i]
        const restaurantName = Object.keys(result)[0]
        const sections = result[restaurantName].sections as Array<any>
        result[restaurantName].sections = sections.sort((a, b) => {
            let countA = 0
            let countB = 0
            for (let i = 0; i < a.foodOptions.length; i++)
                countA += a.foodOptions[i].foods.length
            for (let i = 0; i < b.foodOptions.length; i++)
                countB += b.foodOptions[i].foods.length
            return countB - countA
        })
        const emote = getRandomDifferent(emojis, emotes)
        emotes.push(emote)

        embeds.push(
            new EmbedBuilder()
                .setTitle(`${restaurantName} ${emote}`)
                .setDescription(
                    '⬇️ **' + result[restaurantName].date_title + '**'
                )
                .setFields(
                    result[restaurantName].sections.map((section: any) => {
                        let sectionString = ''
                        for (let i = 0; i < section.foodOptions.length; i++) {
                            const foodOption = section.foodOptions[i]
                            sectionString += (
                                foodOption.foods as string[]
                            ).join('\n')
                            if (i !== section.foodOptions.length - 1)
                                sectionString += '\n\n'
                        }

                        return {
                            name: '➡️ ' + section.title,
                            value: sectionString,
                            inline: true,
                        }
                    })
                )
                .setColor('#fc9356')
                .setFooter({
                    text:
                        'Made with ❤️ by @wh0w | ' +
                        new Date().toLocaleString(),
                })
        )
    }

    return {
        embeds: embeds,
        components: [actionRow],
    }
}

export async function run_update(client: Client) {
    const guild = client.guilds.cache.get(config.DISCORD_SERVER_ID)
    const channel = guild?.channels.cache.get(
        config.DISCORD_CHANNEL_ID
    ) as GuildTextBasedChannel

    channel.sendTyping()
    const result = (await update_foods(false, channel)) as MessageCreateOptions
    if (result) channel.send(result)
}
