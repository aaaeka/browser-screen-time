import * as React from 'react'
import { isEqual, isAfter } from 'date-fns'
import Utils from '../utils'
import CounterStorage from '../counterStorage'
import Counter from '../counter'
import { CounterTimespanInterval, WebsiteData } from '../types'

import NamedField from './namedField'
import TabButton from './tabButton'
import TimeCircle from './timeCircle'
import AppTime from './appTime'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'

interface InfoProps {
}

interface InfoState {
    selectedTab: number,
    dateInterval: CounterTimespanInterval,
    availableDates: Array<Date>,
    counter: Counter
}

export default class Info extends React.Component<InfoProps, InfoState> {
    constructor(props: InfoProps) {
        super(props);

        this.state = {
            selectedTab: 0,
            dateInterval: [new Date, new Date],
            availableDates: null,
            counter: null
        }
    }

    async componentDidMount(): Promise<void> {
        this.setState({
            availableDates: await CounterStorage.getSavedDates(),
            counter: await CounterStorage.get(this.state.dateInterval)
        });
    }

    changeTab(newTab: number): void {
        if (newTab === this.state.selectedTab) {
            return;
        }

        this.setState({
            selectedTab: newTab
        });

        if (newTab === 0) {
            this.onDateChange([this.state.dateInterval[0], this.state.dateInterval[0]]);
        }
    }

    async onDateChange(interval: CounterTimespanInterval): Promise<void> {
        if (isAfter(interval[0], interval[1])) {
            interval[1] = interval[0];
        }

        this.setState({
            dateInterval: interval,
            counter: await CounterStorage.get(interval)
        });
    }

    render() {
        const tabButtons = [
            {
                key: 0,
                shortName: 'single',
                fullName: 'Single day'
            },
            {
                key: 1,
                shortName: 'timespan',
                fullName: 'Timespan'
            }
        ].map(value =>
            <TabButton
                key={value.key}
                tabIndex={value.key}
                selectedIndex={this.state.selectedTab}
                shortName={value.shortName}
                fullName={value.fullName}
                onClick={() => { this.changeTab(value.key) }}
            />
        );

        let timespanSelect: JSX.Element;
        if (this.state.selectedTab === 0) {
            timespanSelect = (
                <div className="timeSelect single">
                    <NamedField title="Select day" centerTitle>
                        <DatePicker
                            selected={this.state.dateInterval[0]}
                            onChange={(date: Date) => this.onDateChange([date, date])}
                            includeDates={this.state.availableDates}
                        />
                    </NamedField>
                </div>
            );
        } else {
            timespanSelect = (
                <div className="timeSelect timespan">
                    <NamedField title="From" centerTitle>
                        <DatePicker
                            selected={this.state.dateInterval[0]}
                            onChange={(date: Date) => this.onDateChange([date, this.state.dateInterval[1]])}
                            includeDates={this.state.availableDates}
                        />
                    </NamedField>
                    <span>-</span>
                    <NamedField title="To" centerTitle>
                        <DatePicker
                            selected={this.state.dateInterval[1]}
                            onChange={(date: Date) => this.onDateChange([this.state.dateInterval[0], date])}
                            includeDates={this.state.availableDates}
                            minDate={this.state.dateInterval[0]}
                        />
                    </NamedField>
                </div>
            );
        }

        const appSidebar = this.state.counter ? this.state.counter.sort().map((data: WebsiteData, index: number) => (
            <AppTime key={index} websiteData={data} />
        )) : null;


        return (
            <div className="info">
                <div className="left">
                    <div className="tabButtons">
                        {tabButtons}
                    </div>
                    {timespanSelect}
                    <TimeCircle
                        netTime={this.state.counter ? this.state.counter.netTime : null}
                        subtitle={isEqual(this.state.dateInterval[0], this.state.dateInterval[1]) ?
                            Utils.formatDateShort(this.state.dateInterval[0]) :
                            `${Utils.formatDateShort(this.state.dateInterval[0])} - ${Utils.formatDateShort(this.state.dateInterval[1])}`}
                        mostUsedSites={this.state.counter ? this.state.counter.mostUsed() : null}
                    />
                </div>
                <div className="right">
                    <NamedField title="App time">
                        <div className="appTime">
                            {appSidebar}
                        </div>
                    </NamedField>
                </div>
            </div>
        )
    }
}