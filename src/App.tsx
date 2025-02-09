import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import ResponsiveChartContainer from './ResponsiveChartContainer'
import { AgChartsReact } from 'ag-charts-react'
import { useWindowSize } from '@uidotdev/usehooks'
import Metrics from './Metrics'
import { EntryType } from './types/EntryType'

enum TIMEFRAMES {
  MINUTE = 60000,
  TENMINUTE = 600000,
  HOUR = 3600000,
  DAY = 8640000,
  WEEK = 60480000,
  MONTH = 262800000
}

function App() {
  const { width } = useWindowSize()
  const [data, setData] = useState<EntryType[]>([])
  const [timeframe, setTimeframe] = useState<number>(TIMEFRAMES.HOUR)
  const [limit, setLimit] = useState<number>(TIMEFRAMES.HOUR / 10000)

  const getDataPoints = useCallback(async () => {
    const after = new Date().getTime() - timeframe
    const response = await fetch(`https://kd741iv5pg.execute-api.us-west-2.amazonaws.com/main?timeframe=${after}&pageSize=${limit + 1}`)
    const fetchedData = await response.json()

    setData(fetchedData)
  }, [timeframe, limit])

  useEffect(() => {
    getDataPoints()
    const getDataInterval = setInterval(getDataPoints, 10000)

    return () => {
      clearInterval(getDataInterval)
    }
  }, [getDataPoints])

  const chartOptions = useMemo(() => {
    const mappedData = data.map((e: EntryType) => {
      const gatewayLatency = Number(e.gateway.latency)
      const googleLatency = Number(e.google.latency)

      return {
        id: e.id,
        ping_time: Number(e.ping_time),
        gateway: {
          latency: gatewayLatency > 0 ? gatewayLatency : undefined,
          ip: e.gateway.ip
        },
        google: {
          latency: googleLatency > 0 ? googleLatency : undefined,
          ip: e.google.ip
        }
      }
    }).sort((a, b) => a.ping_time - b.ping_time)

    return {
      title: { text: 'Latency from my home computer' },
      data: mappedData,
      series: [
        {
          type: 'line',
          xKey: 'ping_time',
          yKey: 'google.latency',
          yName: '8.8.8.8',
          connectMissingData: false
        },
        {
          type: 'line',
          xKey: 'ping_time',
          yKey: 'gateway.latency',
          yName: 'Gateway',
          connectMissingData: false
        }
      ],
      axes: [
        {
          type: 'number',
          position: 'left',
          title: {
            text: 'Latency in ms'
          },
          tick: {
            interval: 100
          }
        },
        {
          type: 'time',
          position: 'bottom'
        }
      ],
      legend: {
        position: 'right'
      }
    }
  }, [data])

  const updateFilter = (filter: TIMEFRAMES) => {
    setTimeframe(filter)
    setLimit(filter / 10000)
  }

  return (
    <ResponsiveChartContainer>
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
          {data.length > 0 && <Metrics data={data}/>}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {chartOptions ?
              // @ts-expect-error want to try this
              <AgChartsReact options={chartOptions} />
              :
              <p>Loading...</p>  
            }
            <div style={{ display: 'flex', flexDirection: width && width < 900 ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <button disabled={timeframe === TIMEFRAMES.MINUTE} onClick={() => updateFilter(TIMEFRAMES.MINUTE)}>Last Minute</button>
              <button disabled={timeframe === TIMEFRAMES.TENMINUTE} onClick={() => updateFilter(TIMEFRAMES.TENMINUTE)}>Last Ten Minutes</button>
              <button disabled={timeframe === TIMEFRAMES.HOUR} onClick={() => updateFilter(TIMEFRAMES.HOUR)}>Last Hour</button>
              <button disabled={timeframe === TIMEFRAMES.DAY} onClick={() => updateFilter(TIMEFRAMES.DAY)}>Last Day</button>
              <button disabled={timeframe === TIMEFRAMES.WEEK} onClick={() => updateFilter(TIMEFRAMES.WEEK)}>Last Week</button>
              <button disabled={timeframe === TIMEFRAMES.MONTH} onClick={() => updateFilter(TIMEFRAMES.MONTH)}>Last Month</button>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveChartContainer>
  )
}

export default App
