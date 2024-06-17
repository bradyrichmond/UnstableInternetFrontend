import { useMemo } from "react"
import { EntryType } from "./types/EntryType"

interface MetricsProps {
    data: EntryType[]
}

const secondsToMinutes = 1/6

const dataToTimeString = (data: EntryType[]) => {
    const rawTime = (data.length * secondsToMinutes)
    const minutes = Math.floor(rawTime)
    const seconds = Math.round((rawTime - minutes) * 60)
    return `${minutes}:${seconds}`
}

const Metrics = ({ data }: MetricsProps) => {
    const filteredData = useMemo(() => {
        return data.filter((p) => p.google.latency)
    }, [data])

    const downtime = useMemo(() => {
        const connectedToGatewayButNotGoogle = data.filter((p) => !p.google.latency && p.gateway.latency)
        const time = dataToTimeString(connectedToGatewayButNotGoogle)
        
        return { 
            time,
            percentage: (connectedToGatewayButNotGoogle.length / data.length).toFixed(4)
        }
    }, [data])

    const googlePings = useMemo(() => {
        if (filteredData.length > 0) {
            const mapPing = filteredData.map((d: EntryType) => d.google)
            const sortedPing = mapPing.sort((a,b) => (a.latency) - (b.latency))
            const totalPings = mapPing.reduce((a,b) => a + (b.latency), 0)
            const average = Math.floor(totalPings / filteredData.length)

            return { high: sortedPing[sortedPing.length - 1].latency, average, low: sortedPing[0].latency}
        }

        return []
    }, [filteredData])

    const gatewayPings = useMemo(() => {
        if (filteredData.length > 0) {
            const mapPing = filteredData.map((d: EntryType) => d.gateway)
            const sortedPing = mapPing.sort((a,b) => (a.latency) - (b.latency))
            const totalPings = mapPing.reduce((a,b) => a + (b.latency), 0)
            const average = Math.floor(totalPings / filteredData.length)

            return { high: sortedPing[sortedPing.length - 1].latency, average, low: sortedPing[0].latency}
        }

        return []
    }, [filteredData])

    return (
        <div style={{ width: '200px' }}>
            <MetricsPingItem label='8.8.8.8' {...googlePings} />
            <MetricsPingItem label='Gateway' {...gatewayPings} />
            <Runtime {...downtime} label='Downtime' />
        </div>
    )
}

interface RuntimeProps {
    label: string
    time: string
    percentage?: string
}

const Runtime = ({ label, time, percentage }: RuntimeProps) => {
    return (
        <>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '2rem' }}>{label}</p>
            <p>Approx. {time}</p>
            {percentage && <p>{percentage}%</p>}
        </>
    )
}

interface MetricsPingItemProps {
    label: string
    high?: number
    low?: number
    average?: number
}

const MetricsPingItem = ({ label, high, low, average }: MetricsPingItemProps) => {
    return (
        <>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '2rem' }}>{label}</p>
            <p>High: {high} ms</p>
            <p>Low: {low} ms</p>
            <p>Average (Mean): {average} ms</p>
        </>
    )
}
export default Metrics