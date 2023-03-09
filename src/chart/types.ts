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

export type CandleType = 'crypto' | 'stock'

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
  unsubscribe: ({ symbol }: { symbol: string }) => void
}

export interface ChartType {
  id: string
}

export type CandleDelta = {
  date: Date
  close: number
}

export type Listener = (d: CandleDelta) => void

export type Subscriber = {
  onUpdate: Listener
  symbol: string
}

export type Subscribe = (props: Subscriber) => void

export type Unsubscribe = (props: { symbol: string }) => void

export type GetCandles = (props: {
  symbol: string
  type: CandleType
  range: [Date, Date]
  resolution: CandleResolution
}) => Promise<CandleDatum[]>
