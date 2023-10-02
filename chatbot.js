import fs from 'fs/promises'
import { DiscussServiceClient } from '@google-ai/generativelanguage'
import { GoogleAuth } from 'google-auth-library'
import readlineSync from 'readline-sync'
import colors from 'colors'
import dotenv from 'dotenv'

dotenv.config()

const MODEL_NAME = 'models/chat-bison-001'
const GOOGLEAI_API_KEY = process.env.GOOGLEAI_API_KEY

const client = new DiscussServiceClient({
	authClient: new GoogleAuth().fromAPIKey(GOOGLEAI_API_KEY),
})

async function getTitleMessage() {
	try {
		const data = await fs.readFile('package.json', 'utf8')
		const packageJson = JSON.parse(data)
		const { name, version } = packageJson
		return `${name} ${version} ready`
	} catch (err) {
		console.error('Error reading or parsing package.json:', err)
		return 'Error reading or parsing package.json'
	}
}

async function main() {
	const titleMessage = await getTitleMessage()
	console.log(colors.bold.green(titleMessage))

	const messages = []

	while (true) {
		const userInput = readlineSync.question(colors.yellow('You: '))
		messages.push({ content: userInput })

		try {
			const result = await client.generateMessage({
				model: MODEL_NAME,
				temperature: 0.5,
				prompt: { messages },
			})
			const botResponse = result[0].candidates[0].content
			console.log(colors.green('Bot: ') + botResponse)
			messages.push({ content: botResponse })
		} catch (error) {
			console.error(colors.red(error))
			console.log(colors.green('Again, please.'))
		}

		if (userInput.toLowerCase() === 'exit') {
			return
		}
	}
}

main()
