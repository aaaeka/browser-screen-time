import * as React from 'react'
import Utils from '../utils'
import { WebsiteData } from '../types'

interface AppTimeProps {
    websiteData: WebsiteData;
}

export default function AppTime(props: AppTimeProps) {
    return (
        <div className="app">
            <span className="bubble" style={{ background: props.websiteData.color }}></span>
            <span className="url" title={props.websiteData.url}>{props.websiteData.url}</span>
            <span className="time">{`${Utils.formatTime(props.websiteData.time)}`}</span>
        </div>
    )
}