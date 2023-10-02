import fs from 'fs'
import { TextServiceClient } from '@google-ai/generativelanguage'
import { GoogleAuth } from 'google-auth-library'
import readlineSync from 'readline-sync'
import colors from 'colors'
import dotenv from 'dotenv'

dotenv.config()

const MODEL_NAME = 'models/text-bison-001'
const GOOGLEAI_API_KEY = process.env.GOOGLEAI_API_KEY

const client = new TextServiceClient({
	authClient: new GoogleAuth().fromAPIKey(GOOGLEAI_API_KEY),
})

function main() {
	// fs.readFile('package.json', 'utf8', (err, data) => {
	// 	if (err) {
	// 		console.error('Error reading package.json:', err)
	// 		return
	// 	}

	// 	try {
	// 		const packageJson = JSON.parse(data)
	// 		const { name, version } = packageJson
	// 		const message = `${name} ${version} ready.`

	// 		console.log(colors.bold.green(message))
	// 	} catch (parseError) {
	// 		console.error('Error parsing package.json:', parseError)
	// 	}
	// })

	while (true) {
		let userInput = readlineSync.question(colors.yellow('You: '))
		let result = client.generateText({
			// required, which model to use to generate the result
			model: MODEL_NAME,
			// optional, 0.0 always uses the highest-probability result
			temperature: 0.5,
			prompt: {
				text: userInput,
			},
		})
		console.log(result[0].candidates[0].output)
		if (userInput.toLowerCase() === 'exit') {
			return
		}
	}
}

main()
