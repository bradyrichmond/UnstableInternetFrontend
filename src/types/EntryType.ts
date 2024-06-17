export interface EntryType {
    id: string
    ping_time: number
    gateway: {
        latency: number
        ip: string
    },
    google: {
        latency: number
        ip: string
    }
}