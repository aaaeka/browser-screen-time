export interface WebsiteData {
    time: number,
    color: string,
    url: string,
    percentage: number
}

export interface WebsiteMap {
    // Url         Time
    [key: string]: number
}

export type CounterTimespanInterval = [Date, Date];

export interface CounterTimespanData {
    interval: CounterTimespanInterval,
    name: string,
    fullName: string
}

export interface PlayingMedia {
    videoSource: string,
    url: string,
    state: 'playing' | 'paused'
}