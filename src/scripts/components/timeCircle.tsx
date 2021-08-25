import * as React from 'react'
import Utils from '../utils';
import { WebsiteData } from '../types'

interface TimeCircleState {
}

interface TimeCircleProps {
    netTime: number,
    subtitle: string,
    mostUsedSites: Array<WebsiteData>
}

export default class TimeCircle extends React.Component<TimeCircleProps, TimeCircleState> {
    renderCircleSVG() {
        const circleRadius = 95;
        const circlePerimeter = 596.9; // 2 * pi * 95
        const circleTags = this.props.mostUsedSites ? this.props.mostUsedSites.map((value: WebsiteData, index: number) => {
            let amount = value.percentage;
            for (let i = index + 1; i < this.props.mostUsedSites.length; i++) {
                amount += this.props.mostUsedSites[i].percentage;
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

    render() {
        return (
            <div className="timeCircle">
                <svg height="200" width="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {this.renderCircleSVG()}
                </svg>
                <span className="timeSpan">{this.props.subtitle}</span>
                <span className="netTime">{Utils.formatTime(this.props.netTime)}</span>
            </div>
        )
    }
}