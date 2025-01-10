import React, { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'
import SettingsStorage from '../settingsStorage'
import { SettingsData, SettingsDataType, SettingsChangeEvent } from '../types'
import { format } from 'date-fns'
import CounterStorage from '../counterStorage'
import Notification, { NotificationData, NotificationTypeEnum } from './notification'

const Settings = () => {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [notification, setNotification] = useState<NotificationData>({ type: NotificationTypeEnum.NONE, message: '' });

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

    const exportData = async () => {
        const exportData = await CounterStorage.getAllJSONString();

        const currentDay = format(new Date(), 'yyyy-MM-dd');
        const fileName = `browser-screen-time-${currentDay}.json`;

        const blob = new Blob([exportData], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setNotification({ type: NotificationTypeEnum.SUCCESS, message: 'Successfully exported time data' });
    }

    const pickFile = (): Promise<object> => {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';

            input.addEventListener('change', (event: Event) => {
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];
                if (!file) {
                    return reject(new Error('No file selected'));
                }

                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const jsonObject = JSON.parse(reader.result as string);
                        resolve(jsonObject);
                    } catch (error) {
                        reject(new Error('Invalid JSON format'));
                    }
                };
                reader.onerror = () => reject(new Error('Error reading file'));
                reader.readAsText(file);
            });

            input.click();
        });
    }

    const overwriteData = async () => {
        try {
            const newData = await pickFile();
            await CounterStorage.overwriteStorage(newData);
            setNotification({ type: NotificationTypeEnum.SUCCESS, message: 'Successfully overwriten time data' });
        } catch (error) {
            setNotification({ type: NotificationTypeEnum.ERROR, message: `Failed to overwrite data: ${error.message}` });
        }
    }

    const mergeData = async () => {
        try {
            const newData = await pickFile();
            await CounterStorage.mergeStorage(newData);
            setNotification({ type: NotificationTypeEnum.SUCCESS, message: 'Successfully merged time data' });
        } catch (error) {
            setNotification({ type: NotificationTypeEnum.ERROR, message: `Failed to merge data: ${error.message}` });
        }
    }

    return (
        <div className="settings">
            <Notification {...notification} />
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
                    <h2>Data</h2>
                    <button className="button" type="button" onClick={exportData}>Export</button>
                    <button className="button" type="button" onClick={overwriteData}>Import (overwrite current time)</button>
                    <button className="button" type="button" onClick={mergeData}>Import (add to current time)</button>
                </form>
            )}
            <footer>made by <a href="https://github.com/aaaeka" style={{ color: "#227C9D" }}>aaaeka</a> | <a href="https://github.com/aaaeka/browser-screen-time" style={{ color: "#17C3B2" }}>source code</a> | <a href="http://www.gnu.org/licenses/lgpl-3.0.html" style={{ color: "#FE6D73" }}>license</a></footer>
        </div>
    )
}

export default Settings;
