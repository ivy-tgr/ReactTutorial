import { createRoot } from 'react-dom/client'

const INITIALIZATION = Symbol('phase.initialization')
const UPDATE = Symbol('phase.update')
type Phase = typeof INITIALIZATION | typeof UPDATE
let phase: Phase
let hookIndex = 0
const states: Array<[any, (newState: any) => void]> = []

// 🐨 make a hookIndex variable here that starts at 0
// 🐨 make a variable called "states" which is an array of arrays (one for each
// return value of a useState call)


export function useState<State>(initialState: State) {
	let id = hookIndex++
	// 🐨 create a variable called "id" and assign it to "hookIndex++"
	if (phase === INITIALIZATION) {



		states[id] = [
			initialState,
			(newState: State) => {
				states[id][0] = newState
				render(UPDATE)

			}
		]
	}
	// 🐨 return the value at states[id] instead of the old variables
	return states[id] as [State, (newState: State) => void]
}

function Counter() {
	const [count, setCount] = useState(0)
	const increment = () => setCount(count + 1)

	const [enabled, setEnabled] = useState(true)
	const toggle = () => setEnabled(!enabled)

	return (
		<div className="counter">
			<button onClick={toggle}>{enabled ? 'Disable' : 'Enable'}</button>
			<button disabled={!enabled} onClick={increment}>
				{count}
			</button>
		</div>
	)
}

const rootEl = document.createElement('div')
document.body.append(rootEl)
const appRoot = createRoot(rootEl)

function render(newPhase: Phase) {
	hookIndex = 0;
	phase = newPhase
	appRoot.render(<Counter />)
}

render(INITIALIZATION)
