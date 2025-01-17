import parse, { NodeType } from 'node-html-parser'

type FoodLink = {
    title: string
    link: string
}

type FoodOptions = {
    foods: string[]
}

const crous_links: FoodLink[] = [
    {
        title: '𝐑𝐞𝐬𝐭𝐨 𝐔 𝐓𝐫𝐢𝐨𝐥𝐞𝐭',
        link: 'https://www.crous-montpellier.fr/restaurant/resto-u-triolet/',
    },
    {
        title: '𝐁𝐫𝐚𝐬𝐬𝐞𝐫𝐢𝐞 𝐓𝐫𝐢𝐨𝐥𝐞𝐭',
        link: 'https://www.crous-montpellier.fr/restaurant/brasserie-triolet/',
    },
    {
        title: '𝐂𝐚𝐟𝐞𝐭’ (𝐒)𝐏𝐀𝐂𝐄',
        link: 'https://www.crous-montpellier.fr/restaurant/cafet-space/',
    },
]

function capitalize(str: string) {
    let finalString = ''
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i)
        if (/^[A-Za-z]$/.test(char)) {
            finalString +=
                char.toUpperCase() +
                (i + 1 <= str.length ? str.slice(i + 1) : '')
            break
        } else finalString += char
    }
    return finalString
}

function formatFood(food: string) {
    let foodStr = food.trim()
    foodStr = capitalize(foodStr)
    if (foodStr.toUpperCase() === foodStr) foodStr = `**${foodStr}**`
    return foodStr.replaceAll(/\s*\(\s*/g, '(').replaceAll(/\s*\)\s*/g, ')')
}

function getFoodOptions(foodStrings: string[]) {
    const foodStringsFinal: string[] = foodStrings.flatMap((item) => {
        const itemNormalized = item.toLowerCase().trim()
        if (itemNormalized.startsWith('ou')) {
            const parts = item.split(' ')
            if (parts.length > 1) {
                return [parts[0], parts.slice(1).join(' ')] // Séparer le premier mot et garder le reste ensemble
            } else return [item]
        }

        return [item]
    })
    const foodOptions: FoodOptions[] = []

    let currentFoods: string[] = []
    for (let i = 0; i < foodStringsFinal.length; i++) {
        let str = foodStringsFinal[i]
        const isLastElement = i === foodStringsFinal.length - 1
        const conservedSeparator = str.toLowerCase().trim().includes('tarif')
        if (
            str.toLowerCase().trim() === 'ou' ||
            !/[a-zA-Z0-9]/.test(str) ||
            conservedSeparator ||
            isLastElement
        ) {
            if (isLastElement || conservedSeparator)
                currentFoods.push(formatFood(str))
            if (currentFoods.length !== 0) {
                foodOptions.push({ foods: [...currentFoods] })
                currentFoods = []
            }
            continue
        }
        currentFoods.push(formatFood(str))
    }
    return foodOptions
}

export async function retrieveFood() {
    const food_found = []
    for (let i = 0; i < crous_links.length; i++) {
        const foodlink = crous_links[i]
        const resp = await fetch(foodlink.link, { method: 'GET' })
        if (resp.status === 200) {
            const text = await resp.text()
            const root = parse(text)
            const date_title = root.querySelector(
                'time.menu_date_title'
            )?.innerText

            const meal = root.querySelector('div.meal')
            const meal_title = meal?.querySelector('div.meal_title')

            const li_list = meal?.querySelectorAll('ul.meal_foodies > li')
            if (!li_list) continue
            const sections = []
            for (let i1 = 0; i1 < li_list.length; i1++) {
                const li1 = li_list[i1]

                let title = null
                let foodOptions = null
                for (let i2 = 0; i2 < li1.childNodes.length; i2++) {
                    const element = li1.childNodes[i2]
                    if (element.nodeType === NodeType.TEXT_NODE) {
                        title = element.innerText
                    } else {
                        const foodStrings = []
                        for (let i3 = 0; i3 < element.childNodes.length; i3++) {
                            const food = element.childNodes[i3]
                            foodStrings.push(food.innerText.trim())
                        }
                        foodOptions = getFoodOptions(foodStrings)
                    }
                }
                sections.push({
                    title: title ? title : 'Unknown',
                    foodOptions: foodOptions ? [...foodOptions] : [],
                })
            }
            const obj: any = {}
            obj[foodlink.title] = {
                link: foodlink.link,
                date_title: date_title,
                sections: sections,
            }
            food_found.push(obj)
        }
    }
    return food_found
}

/* SCHEMA

{
  "resto_u_triolet": {
    "date_title": string,
    "sections": [
        {
            "title": string,
            "foodOptions": [
                {
                    foods: string[]
                }
            ]
        }
    ]
  }
}

*/
