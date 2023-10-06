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

		// Check if userInput is empty or only contains whitespace characters
		if (!userInput.trim()) {
			console.log(colors.green('Bot: Please provide a non-empty input.'))
			continue // Skip the rest of the loop iteration
		}

		messages.push({ content: userInput })

		try {
			const result = await client.generateMessage({
				model: MODEL_NAME,
				prompt: { messages },
				maxTokens: 500, // default 200, max 500
				temperature: 0.35, // 0 to 1, default 0.7, lower -> factual, higher -> creative
				top_k: 40,
				top_p: 0.65, // 0 to 1, default 0.9, higher -> repetitive, lower -> diverse
				candidate_count: 1,
			})
			const botResponse = result[0].candidates[0].content
			console.log(
				colors.green('Bot (') +
					messages.length +
					colors.green('): ') +
					botResponse
			)
			messages.push({ content: botResponse })
		} catch (error) {
			console.error(colors.red(error))
			console.log(colors.green('Bot: Again, please.'))
		}

		if (userInput.toLowerCase() === 'exit') {
			let output = ''
			let d = new Date()
			let yy = d.getFullYear().toString().slice(-2) // Get last 2 digits of the year
			let mm = ('0' + (d.getMonth() + 1)).slice(-2) // Month is zero-based, so add 1
			let dd = ('0' + d.getDate()).slice(-2)
			let hh = ('0' + d.getHours()).slice(-2)
			let m = ('0' + d.getMinutes()).slice(-2)
			let filename = `.\\logs\\log${yy}${mm}${dd}${hh}${m}`
			// console.log(filename)
			messages.forEach((m) => {
				output = output + m.content + '\n\n'
			})
			// console.log(output)
			logMessages(filename, output)
			console.log(colors.green('Bot: Session saved in ' + filename + '.'))
			return
		}
	}
}

async function logMessages(filename, message) {
	try {
		fs.appendFile(filename, message)
	} catch (err) {
		console.log(err)
	}
}

main()
