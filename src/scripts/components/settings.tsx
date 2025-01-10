import React from 'react'
import browser from 'webextension-polyfill'
import SettingsStorage from '../settingsStorage'
import { SettingsData, SettingsDataType, SettingsChangeEvent } from '../types'

interface SettingsProps {
}

interface SettingsState {
    settings: SettingsData
}

export default class Settings extends React.Component<SettingsProps, SettingsState> {
    constructor(props: SettingsProps) {
        super(props);

        this.state = {
            settings: null
        };

        this.handleChange = this.handleChange.bind(this);
    }

    async componentDidMount() {
        this.setState({
            settings: await SettingsStorage.get()
        });
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) {
        if (event.target.type === 'checkbox') {
            event = event as React.ChangeEvent<HTMLInputElement>;
            this.changeSettings(event.target.name, event.target.checked);
        } else {
            this.changeSettings(event.target.name, event.target.value);
        }
    }

    changeSettings(key: string, value: SettingsDataType): void {
        SettingsStorage.set(key, value);

        let currentSettings = this.state.settings;
        currentSettings[key] = value;

        this.setState({
            settings: currentSettings
        });

        const msg: SettingsChangeEvent = {
            type: 'settings',
            settings: currentSettings
        }

        // Send settings change message to background or popup
        browser.runtime.sendMessage(msg);
    }

    render() {
        const mainContent = this.state.settings ? (
            <form>
                <h1>Settings</h1>
                <h2>General</h2>
                <p>Consider the browser idle after</p>
                <select name="idleTimer" value={this.state.settings.idleTimer as string} onChange={this.handleChange}>
                    <option value="15">15 seconds</option>
                    <option value="20">20 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                </select>
                <br />
                <input type="checkbox" name="videoCheck" checked={this.state.settings.videoCheck as boolean} onChange={this.handleChange} />
                <label htmlFor="videoCheck">Continue counting time when watching a video</label>
                <br />
                <h2>Notifications</h2>
                <input type="checkbox" name="notifications" checked={this.state.settings.notifications as boolean} onChange={this.handleChange} />
                <label htmlFor="notifications">Notify me when I spend too much time on one site</label>
                <br />
                <div className={`${!this.state.settings.notifications ? 'disabled' : ''}`}>
                    <p>Remind me every</p>
                    <select name="notificationTimer" value={this.state.settings.notificationTimer as string} onChange={this.handleChange}>
                        <option value="900">15 minutes</option>
                        <option value="1800">30 minutes</option>
                        <option value="3600">1 hour</option>
                        <option value="7200">2 hours</option>
                        <option value="10800">3 hours</option>
                        <option value="14400">4 hours</option>
                    </select>
                </div>
            </form>
        ) : null;

        return (
            <div className="settings">
                {mainContent}
                <footer>made by <a href="https://github.com/aaaeka" style={{ color: "#227C9D" }}>aaaeka</a> | <a href="https://github.com/aaaeka/browser-screen-time" style={{ color: "#17C3B2" }}>source code</a> | <a href="http://www.gnu.org/licenses/lgpl-3.0.html" style={{ color: "#FE6D73" }}>license</a></footer>
            </div>
        )
    }
}
