import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

const INITIALIZATION = Symbol('phase.initialization')
const UPDATE = Symbol('phase.update')
type Phase = typeof INITIALIZATION | typeof UPDATE
let phase: Phase
let hookIndex = 0
const states: Array<[any, (newState: any) => void]> = []
type EffectCallback = () => void
const effects: Array<{
	callback: EffectCallback
	deps?: any[]
	prevDeps?: any[]
	// 🦺 add an optional deps and prevDeps properties which can be arrays of anything
}> = []

export function useState<State>(initialState: State) {
	const id = hookIndex++
	if (phase === INITIALIZATION) {
		states[id] = [
			initialState,
			(newState: State) => {
				states[id][0] = newState
				render(UPDATE)
			},
		]
	}
	return states[id] as [State, (newState: State) => void]
}

// 🐨 add an optional deps argument here
export function useEffect(callback: EffectCallback, deps?: any[]) {
	const id = hookIndex++
	// 🐨 add deps and prevDeps to this object - prevDeps should be "effects[id]?.deps"
	effects[id] = { callback, deps, prevDeps: effects[id]?.deps }
}

function Counter() {
	const [count, setCount] = useState(0)
	const increment = () => setCount(count + 1)

	const [enabled, setEnabled] = useState(true)
	const toggle = () => setEnabled(!enabled)

	useEffect(() => {
		if (enabled) {
			console.info('consider yourself effective!')
		} else {
			console.info('consider yourself ineffective!')
		}
	}, [enabled])

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
	hookIndex = 0
	phase = newPhase
	flushSync(() => {
		appRoot.render(<Counter />)
	})

	for (const effect of effects) {
		if (!effect) continue

		
		const hasDepsChanged = effect.deps? !effect.deps.every((dep, i) => Object.is(dep, effect.prevDeps?.[i])) : true

		// 🐨 Create a "hasDepsChanged" variable to determine whether the effect should be called.
		// If the effect has no deps, "hasDepsChanged" should be true.
		// If the effect does have deps, "hasDepsChanged" should calculate whether any item
		// in the "deps" array is different from the corresponding item in the "prevDeps" array,
		// and return true if so, false otherwise.
		if (hasDepsChanged) {
			effect.callback()
		}
	}
}

render(INITIALIZATION)
