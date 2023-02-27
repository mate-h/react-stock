import { atom, useAtom } from 'jotai'
import { ChartSource, Keyed } from './types'
import { uid } from './util'

const chartAtom = atom({
  id: uid(),
})

const sourcesAtom = atom<Keyed<ChartSource>>({})

export const useChart = () => useAtom(chartAtom)
export const useSources = () => useAtom(sourcesAtom)
