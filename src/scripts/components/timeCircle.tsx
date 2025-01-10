import React from 'react'
import Utils from '../utils';
import { WebsiteData } from '../types'

interface TimeCircleProps {
    netTime: number,
    subtitle: string,
    mostUsedSites: Array<WebsiteData>
}

const TimeCircle = ({ netTime, subtitle, mostUsedSites }: TimeCircleProps) => {
    const renderCircleSVG = () => {
        const circleRadius = 95;
        const circlePerimeter = 596.9; // 2 * pi * 95
        const circleTags = mostUsedSites ? mostUsedSites.map((value: WebsiteData, index: number) => {
            let amount = value.percentage;
            for (let i = index + 1; i < mostUsedSites.length; i++) {
                amount += mostUsedSites[i].percentage;
            }
            const dashOffset = circlePerimeter - circlePerimeter * amount / 100;
            return (
                <circle
                    key={index}
                    cx="100"
                    cy="100"
                    r={circleRadius}
                    fill="transparent"
                    strokeWidth="10"
                    stroke={value.color}
                    strokeDasharray={circlePerimeter}
                    strokeDashoffset={dashOffset}
                />
            )
        }) : null;
        return circleTags;
    }

    return (
        <div className="timeCircle">
            <svg height="200" width="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderCircleSVG()}
            </svg>
            <span className="timeSpan">{subtitle}</span>
            <span className="netTime">{Utils.formatTime(netTime)}</span>
        </div>
    )
}

export default TimeCircle;
