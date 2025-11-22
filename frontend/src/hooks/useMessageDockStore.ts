import { useSyncExternalStore } from "react"

type DockState = {
  isDockOpen: boolean
}

type DockStore = DockState & {
  toggleDock: () => void
  openDock: () => void
  closeDock: () => void
}

const store = {
  state: { isDockOpen: true } as DockState,
  listeners: new Set<() => void>(),
}

const subscribe = (listener: () => void) => {
  store.listeners.add(listener)
  return () => store.listeners.delete(listener)
}

const getSnapshot = () => store.state

const setState = (next: Partial<DockState>) => {
  store.state = { ...store.state, ...next }
  store.listeners.forEach((listener) => listener())
}

export function useMessageDockStore(): DockStore {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const toggleDock = () => setState({ isDockOpen: !store.state.isDockOpen })
  const openDock = () => setState({ isDockOpen: true })
  const closeDock = () => setState({ isDockOpen: false })

  return { ...state, toggleDock, openDock, closeDock }
}
