import { Output, Color } from '..'

async function main() {
	const output = new Output()
	output.write('hell', { x: 1, y: 1, width: 5, height: 1, offset: 0 }, Color.red)
	output.write('hobo', { x: 6, y: 1, width: 5, height: 1, offset: 0 }, Color.lightGray)
	output.write('╩', { x: 6, y: 1, width: 5, height: 1, offset: 0 }, Color.lightGray)
	await output.render()
	// console.log(output.toString())
	await output.delay(1000)
	output.write('yo', { x: 6, y: 3, width: 5, height: 1, offset: 0 }, Color.lightGray)
	await output.render()

	await output.delay(1000)
	output.write('yooo', { x: 6, y: 3, width: 5, height: 1, offset: 0 }, Color.lightGray)
	await output.render()

	const key = await output.getKeyPress()
	output.write('k: ' + key, { x: 6, y: 3, width: 5, height: 1, offset: 0 }, Color.lightGray)
	await output.render()

	await output.delay(1000)
	output.write('yooo', { x: 10, y: 3, width: 5, height: 1, offset: 0 }, Color.lightGray)
	await output.render()

	
}

main()

//
// console.log(`
//      │ Name             │ Alliance    │ Age         │             ▶
// \u001b[2;37m─────╆━━━━━━━━━━━━━━━━━━┷━━━━━━━━━━━━━┷━━━━━━━━━━━━━┷━━━━━━━━━━━━━━━\u001b[0;0m
//    1 ┃ Luke Skywalker     Sith          48
// \u001b[2;0;104m   2 ┃ Obi Wan Kenobi     Jedi          29                          \u001b[0;0;0m
// `)
// console.log(`
// \u001b[2;37m     ║ Name             │ Alliance    │ Age         │             ▶
// \u001b[2;37m═════╬══════════════════╧═════════════╧═════════════╧═══════════════\u001b[0;0m
// \u001b[2;37m   1 ║\u001b[0;0m Luke Skywalker     Sith          48
// \u001b[2;37;104m   2 ║\u001b[2;0;104m Obi Wan Kenobi     Jedi          29                          \u001b[0;0;0m
// `)
