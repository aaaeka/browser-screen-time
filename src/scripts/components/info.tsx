import React, { ReactElement } from 'react'
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

    async refresh(): Promise<void> {
        this.setState({
            counter: await CounterStorage.get(this.state.dateInterval)
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

        let timespanSelect: ReactElement;
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
                <button className="smallButton refresh" onClick={() => { this.refresh() }}>
                    <svg className="icon" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path d="M225.847 111.585c-.165.023-.326.054-.493.07c-.397.04-.794.061-1.192.06h-47.995a12 12 0 0 1 0-24h19.03L181.74 74.26a76 76 0 1 0 0 107.48a12 12 0 0 1 16.97 16.971a100 100 0 1 1 0-141.422l13.457 13.456v-19.03a12 12 0 0 1 24 0v47.996c0 .397-.02.795-.06 1.191c-.016.168-.048.33-.071.495c-.032.223-.058.446-.102.667c-.038.192-.091.38-.14.569c-.046.19-.088.381-.146.57c-.056.187-.127.368-.193.551c-.066.186-.127.373-.203.556c-.071.172-.155.336-.234.504c-.088.188-.172.377-.27.56c-.085.16-.182.31-.274.464c-.108.182-.211.366-.33.543c-.113.17-.24.329-.362.492c-.112.15-.216.304-.336.45c-.234.285-.482.557-.74.819l-.054.06c-.019.02-.04.034-.058.052c-.262.259-.534.506-.819.74c-.15.124-.309.232-.464.347c-.158.118-.313.241-.477.351c-.18.121-.368.226-.553.336c-.151.09-.299.185-.454.268c-.187.1-.379.185-.57.275c-.164.077-.326.16-.494.23c-.186.076-.376.138-.564.206c-.18.064-.36.134-.545.19c-.19.057-.381.1-.573.147c-.188.048-.374.1-.566.139c-.222.044-.445.07-.668.102z" fill="currentColor" /></svg>
                </button>
            </div>
        )
    }
}
