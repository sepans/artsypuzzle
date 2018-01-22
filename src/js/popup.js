import "../css/popup.css";
//import hello from "./popup/example";
import makePuzzle from './artsy'

console.log('POPUP')

const btn = document.getElementById('make-puzzle')
console.log('btn', btn)

btn.addEventListener('click', () => {
	makePuzzle()
})
