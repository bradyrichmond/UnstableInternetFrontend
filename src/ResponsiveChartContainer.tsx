import { useWindowSize } from '@uidotdev/usehooks'
import { PropsWithChildren } from 'react'

const ResponsiveChartContainer = ({ children }: PropsWithChildren) => {
    const { width } = useWindowSize()

    const mdStyle = {
        width: '75%',
        height: '50%',
        display: 'flex',
        flexDirection: 'column'
    }

    const xsStyle = {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* @ts-expect-error I don't understand why it doesn't like flexDirection */}
            <div style={width && width < 900 ? xsStyle : mdStyle}>
                {children}
            </div>
        </div>
    )
}

export default ResponsiveChartContainer