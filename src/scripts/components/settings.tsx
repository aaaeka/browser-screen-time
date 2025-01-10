import React, { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'
import SettingsStorage from '../settingsStorage'
import { SettingsData, SettingsDataType, SettingsChangeEvent } from '../types'

const Settings = () => {
    const [settings, setSettings] = useState<SettingsData | null>(null);

    useEffect(() => {
        const setInitialSettings = async () => {
            setSettings(await SettingsStorage.get());
        }

        setInitialSettings();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        if (event.target.type === 'checkbox') {
            event = event as React.ChangeEvent<HTMLInputElement>;
            changeSettings(event.target.name, event.target.checked);
        } else {
            changeSettings(event.target.name, event.target.value);
        }
    }

    const changeSettings = (key: string, value: SettingsDataType): void => {
        if (!settings) {
            return;
        }

        SettingsStorage.set(key, value);

        const currentSettings = { ...settings };
        currentSettings[key] = value;

        setSettings(currentSettings);

        const msg: SettingsChangeEvent = {
            type: 'settings',
            settings: currentSettings
        }

        // Send settings change message to background or popup
        browser.runtime.sendMessage(msg);
    }

    return (
        <div className="settings">
            {settings && (
                <form>
                    <h1>Settings</h1>
                    <h2>General</h2>
                    <p>Consider the browser idle after</p>
                    <select name="idleTimer" value={settings.idleTimer as string} onChange={handleChange}>
                        <option value="15">15 seconds</option>
                        <option value="20">20 seconds</option>
                        <option value="30">30 seconds</option>
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                    </select>
                    <br />
                    <input type="checkbox" name="videoCheck" checked={settings.videoCheck as boolean} onChange={handleChange} />
                    <label htmlFor="videoCheck">Continue counting time when watching a video</label>
                    <br />
                    <h2>Notifications</h2>
                    <input type="checkbox" name="notifications" checked={settings.notifications as boolean} onChange={handleChange} />
                    <label htmlFor="notifications">Notify me when I spend too much time on one site</label>
                    <br />
                    <div className={`${!settings.notifications ? 'disabled' : ''}`}>
                        <p>Remind me every</p>
                        <select name="notificationTimer" value={settings.notificationTimer as string} onChange={handleChange}>
                            <option value="900">15 minutes</option>
                            <option value="1800">30 minutes</option>
                            <option value="3600">1 hour</option>
                            <option value="7200">2 hours</option>
                            <option value="10800">3 hours</option>
                            <option value="14400">4 hours</option>
                        </select>
                    </div>
                </form>
            )}
            <footer>made by <a href="https://github.com/aaaeka" style={{ color: "#227C9D" }}>aaaeka</a> | <a href="https://github.com/aaaeka/browser-screen-time" style={{ color: "#17C3B2" }}>source code</a> | <a href="http://www.gnu.org/licenses/lgpl-3.0.html" style={{ color: "#FE6D73" }}>license</a></footer>
        </div>
    )
}

export default Settings;
