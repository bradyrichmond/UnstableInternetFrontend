import { useMemo } from "react"
import { EntryType } from "./types/EntryType"

interface MetricsProps {
    data: EntryType[]
}

const Metrics = ({ data }: MetricsProps) => {
    const googlePings = useMemo(() => {
        const mapPing = data.map((d: EntryType) => d.google)
        const sortedPing = mapPing.sort((a,b) => (a.latency ?? 0) - (b.latency ?? 0)).filter((p) => p.latency && p.latency !== -1)
        const totalPings = mapPing.reduce((a,b) => a + (b.latency ?? 0), 0)
        const average = Math.floor(totalPings / data.length)

        return { high: sortedPing[sortedPing.length - 1].latency, average, low: sortedPing[0].latency}
    }, [data])

    const gatewayPings = useMemo(() => {
        const mapPing = data.map((d: EntryType) => d.gateway)
        const sortedPing = mapPing.sort((a,b) => (a.latency ?? 0) - (b.latency ?? 0)).filter((p) => p.latency && p.latency !== -1)
        const totalPings = mapPing.reduce((a,b) => a + (b.latency ?? 0), 0)
        const average = Math.floor(totalPings / data.length)

        return { high: sortedPing[sortedPing.length - 1].latency, average, low: sortedPing[0].latency}
    }, [data])

    return (
        <div style={{ width: '150px' }}>
            <MetricsPingItem label='8.8.8.8' {...googlePings} />
            <MetricsPingItem label='Gateway' {...gatewayPings} />
        </div>
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