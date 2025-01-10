import React from 'react'
import Utils from '../utils'
import { WebsiteData } from '../types'

interface AppTimeProps {
    websiteData: WebsiteData;
}

const AppTime = ({ websiteData }: AppTimeProps) => {
    return (
        <div className="app">
            <span className="bubble" style={{ background: websiteData.color }}></span>
            <span className="url" title={websiteData.url}>{websiteData.url}</span>
            <span className="time">{`${Utils.formatTime(websiteData.time)}`}</span>
        </div>
    )
}

export default AppTime;
