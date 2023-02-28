export type Keyed<T> = {
  [name: string]: T
}

export interface CandleDatum {
  date: Date
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export type CandleResolution =
  | '1s'
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '1d'
  | '1w'
  | '1M'

export interface ChartChild {
  chartId: string
}

export interface ChartSourceProps extends ChartChild {
  getCandles: GetCandles
}

// state
export interface ChartSource extends ChartChild {
  id: string
  getCandles: GetCandles
  subscribe: Subscribe
}

export interface ChartType {
  id: string
}

export type Subscribe = (listener: (price: number) => void) => void

export type GetCandles = (props: {
  symbol: string
  type: 'crypto' | 'stock'
  range: [Date, Date]
  resolution: CandleResolution
}) => Promise<CandleDatum[]>
