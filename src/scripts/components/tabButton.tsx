import * as React from 'react'

interface TabButtonProps {
    tabIndex: number,
    selectedIndex: number,
    shortName: string,
    fullName: string,
    onClick: Function
}

export default function TabButton(props: TabButtonProps) {
    return (
        <button 
            className={`${props.shortName} ${props.tabIndex === props.selectedIndex ? 'active': ''}`}
            onClick={() => props.onClick()} >
            {props.fullName}
        </button>
    )
}