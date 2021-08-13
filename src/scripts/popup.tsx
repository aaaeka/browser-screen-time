import * as React from 'react'
import * as ReactDOM from 'react-dom'
import CounterStorage from './counterStorage'
import { Counter, WebsiteData, CounterTimespans, CounterTimespanData, CounterTimespanKind } from './types'

import TabButton from './components/tabButton'
import TimeCircle from './components/timeCircle'
import AppTime from './components/appTime'

import '../styles/popup.scss'

interface PopupProps {
}

interface PopupState {
    selectedTab: CounterTimespanData,
    counter: Counter,
    mostUsedSites: Array<WebsiteData>
}

class Popup extends React.Component<PopupProps, PopupState> {
    private timespans: CounterTimespans;

    constructor(props: PopupProps) {
        super(props);

        this.timespans = {
            today: {
                kind: CounterTimespanKind.Today,
                name: 'today',
                fullName: 'Today'
            },
            week: {
                kind: CounterTimespanKind.Week,
                name: 'week',
                fullName: 'This week'
            },
            month: {
                kind: CounterTimespanKind.Month,
                name: 'month',
                fullName: 'This month'
            }
        }

        this.state = {
            selectedTab: this.timespans.today,
            counter: null,
            mostUsedSites: null
        }
    }

    async componentDidMount() {
        let counter = await CounterStorage.get(this.state.selectedTab.kind);

        this.setState({ counter: counter,
                        mostUsedSites: CounterStorage.mostUsed(counter)
        });
    }

    async changeTab(newTab: CounterTimespanData): Promise<void> {
        let counter = await CounterStorage.get(newTab.kind);

        this.setState({ 
            selectedTab: newTab,
            counter: counter,
            mostUsedSites: CounterStorage.mostUsed(counter)
        }); 
    }

    render() {
        const tabButtons = [];
        let i = 0;
        for (const timespan of Object.values(this.timespans)) {
            tabButtons.push(
                <TabButton
                    key={i}
                    currentTab={timespan}
                    selectedTab={this.state.selectedTab}
                    onClick={() => { this.changeTab(timespan) }}
                />
            );
            i++;
        }

        const mostUsedSites = this.state.counter ? this.state.mostUsedSites.map((value: WebsiteData, index: number) => (
            <AppTime
                key={index}
                websiteData={value}
            />
        )) : null;

        return (
            <div className="popup">
                <div className="timeSpanButtons">
                    {tabButtons}
                </div>
                <TimeCircle 
                    netTime={this.state.counter ? this.state.counter.netTime : null}
                    mostUsedSites={this.state.mostUsedSites}
                    selectedTab={this.state.selectedTab}
                />
                <div className="appTime">
                    {mostUsedSites}
                </div>
            </div>
        )
    }
}

ReactDOM.render(<Popup />, document.getElementById('root'));