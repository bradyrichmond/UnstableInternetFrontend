import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import ResponsiveChartContainer from './ResponsiveChartContainer'
import { AgChartsReact } from 'ag-charts-react'
import { useWindowSize } from '@uidotdev/usehooks'
import Metrics from './Metrics'
import { EntryType } from './types/EntryType'

enum TIMEFRAMES {
  MINUTE = 6,
  HOUR = 360,
  DAY = 8640,
  WEEK = 60480,
  MONTH = 259200
}

function App() {
  const { width } = useWindowSize()
  const [data, setData] = useState<EntryType[]>([])
  const [limit, setLimit] = useState<number>(TIMEFRAMES.HOUR)

  const getDataPoints = useCallback(async () => {
    const response = await fetch(`https://kd741iv5pg.execute-api.us-west-2.amazonaws.com/main?pageSize=${limit}`)
    const fetchedData = await response.json()

    setData(fetchedData)
  }, [limit])

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
    }).sort((a: EntryType, b: EntryType) => a.ping_time - b.ping_time)

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

  return (
    <ResponsiveChartContainer>
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
          <Metrics data={data}/>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {chartOptions ?
              // @ts-expect-error want to try this
              <AgChartsReact options={chartOptions} />
              :
              <p>Loading...</p>  
            }
            <div style={{ display: 'flex', flexDirection: width && width < 900 ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <button disabled={limit === TIMEFRAMES.MINUTE} onClick={() => setLimit(TIMEFRAMES.MINUTE)}>Last Minute</button>
              <button disabled={limit === TIMEFRAMES.HOUR} onClick={() => setLimit(TIMEFRAMES.HOUR)}>Last Hour</button>
              <button disabled={limit === TIMEFRAMES.DAY} onClick={() => setLimit(TIMEFRAMES.DAY)}>Last Day</button>
              <button disabled={limit === TIMEFRAMES.WEEK} onClick={() => setLimit(TIMEFRAMES.WEEK)}>Last Week</button>
              <button disabled={limit === TIMEFRAMES.MONTH} onClick={() => setLimit(TIMEFRAMES.MONTH)}>Last Month</button>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveChartContainer>
  )
}

export default App
