import * as React from 'react'
import { CounterTimespanData } from '../types'

interface TabButtonProps {
    currentTab: CounterTimespanData
    selectedTab: CounterTimespanData,
    onClick: Function
}

export default function TabButton(props: TabButtonProps) {
    return (
        <button 
            className={`${props.currentTab.name} ${props.currentTab.name === props.selectedTab.name ? 'active': ''}`}
            onClick={() => props.onClick()} >
            {props.currentTab.fullName}
        </button>
    )
}