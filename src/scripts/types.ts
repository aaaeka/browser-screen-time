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

export interface MsgEvent {
    type: string
}

export interface PlayingMedia {
    videoSource: string,
    url: string,
    state: 'playing' | 'paused'
}

export interface PlayingMediaChangeEvent extends MsgEvent {
    type: 'playingMedia',
    playingMedia: PlayingMedia
}

export type SettingsDataType = boolean | number | string;

export interface SettingsData {
    [key: string]: SettingsDataType
}

export interface SettingsChangeEvent extends MsgEvent {
    type: 'settings',
    settings: SettingsData
}