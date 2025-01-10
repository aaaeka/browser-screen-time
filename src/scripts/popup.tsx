import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { subDays } from 'date-fns'
import CounterStorage from './counterStorage'
import Counter from './counter'
import browser from 'webextension-polyfill'
import { WebsiteData, CounterTimespanData } from './types'

import TabButton from './components/tabButton'
import TimeCircle from './components/timeCircle'
import AppTime from './components/appTime'

import '../styles/popup.scss'

interface PopupProps {
}

interface PopupState {
    selectedTab: number,
    counter: Counter,
    mostUsedSites: Array<WebsiteData>
}

class Popup extends React.Component<PopupProps, PopupState> {
    private timespans: Array<CounterTimespanData>;

    constructor(props: PopupProps) {
        super(props);

        this.timespans = [
            {
                interval: [new Date, new Date],
                name: 'today',
                fullName: 'Today'
            },
            {
                interval: [subDays(new Date, 7), new Date],
                name: 'week',
                fullName: 'This week'
            },
            {
                interval: [subDays(new Date, 30), new Date],
                name: 'month',
                fullName: 'This month'
            }
        ]

        this.state = {
            selectedTab: 0,
            counter: null,
            mostUsedSites: null
        }
    }

    async componentDidMount() {
        let counter = await CounterStorage.get(this.timespans[this.state.selectedTab].interval);

        this.setState({
            counter: counter,
            mostUsedSites: counter.mostUsed()
        });
    }

    async changeTab(newTab: number): Promise<void> {
        if (newTab === this.state.selectedTab) {
            return;
        }

        let counter = await CounterStorage.get(this.timespans[newTab].interval);

        this.setState({
            selectedTab: newTab,
            counter: counter,
            mostUsedSites: counter.mostUsed()
        });
    }

    openInfoPage() {
        browser.tabs.create({
            active: true,
            url: 'index.html'
        });
    }

    render() {
        const tabButtons = this.timespans.map((timespan: CounterTimespanData, index: number) => (
            <TabButton
                key={index}
                tabIndex={index}
                selectedIndex={this.state.selectedTab}
                shortName={timespan.name}
                fullName={timespan.fullName}
                onClick={() => { this.changeTab(index) }}
            />
        ));

        const mostUsedSites = this.state.counter ? this.state.mostUsedSites.map((value: WebsiteData, index: number) => (
            <AppTime
                key={index}
                websiteData={value}
            />
        )) : null;

        return (
            <div className="popup">
                <div className="tabButtons">
                    {tabButtons}
                </div>
                <TimeCircle
                    netTime={this.state.counter ? this.state.counter.netTime : null}
                    subtitle={this.timespans[this.state.selectedTab].fullName}
                    mostUsedSites={this.state.mostUsedSites}
                />
                <div className="appTime">
                    {mostUsedSites}
                </div>
                <button className="moreInfoBtn" onClick={() => { this.openInfoPage() }}>More info</button>
            </div>
        )
    }
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
