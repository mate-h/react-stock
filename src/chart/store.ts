import { atom, useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Transform } from './scroll'
import { CandleDatum, CandleResolution, CandleType, ChartSource, Keyed } from './types'
import { uid } from './util'

const chartAtom = atom({
  id: uid(),
})
export const defaultMarket = 'binance';
export const defaultSymbol = 'BTCUSDT';

const sourcesAtom = atom<Keyed<ChartSource>>({})
export const viewModeAtom = atom('candles')
export const symbolSearchAtom = atom(defaultSymbol)
export const candleTypeAtom = atom<CandleType>('crypto')
export const resolutionAtom = atom<CandleResolution>('1m')
export const candlesAtom = atom<CandleDatum[][]>([[]])
export const transformAtom = atom<Transform>({
  x: 0,
  y: 0,
  scale: 1,
})

export const useChart = () => useAtom(chartAtom)
export const useSources = () => useAtom(sourcesAtom)

function error(s: string) {
  console.error(`[react-stock] ${s}`)
}
function warn(s: string) {
  console.warn(`[react-stock] ${s}`)
}

export function useSource() {
  const [chart] = useChart()
  const [sources] = useSources()
  const [source, setSource] = useState<ChartSource>()
  useEffect(() => {
    const source = Object.values(sources).find((s) => s.chartId === chart.id)
    const l = Object.keys(sources).length
    if (!source) {
      error('current source has not been set using the <Source> component')
      return
    }
    if (l > 1) {
      warn('more than one source has been set, using the first one')
    }
    setSource(source)
  }, [sources, chart])
  return source
}
