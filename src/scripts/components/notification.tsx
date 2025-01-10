import React from 'react';

export enum NotificationTypeEnum {
    NONE,
    SUCCESS,
    ERROR
}

export interface NotificationData {
    type: NotificationTypeEnum;
    message: string;
}

const Notification = ({ type, message }: NotificationData) => {
    if (type === NotificationTypeEnum.NONE) {
        return null;
    }

    return (
        <div className={`notification ${type === NotificationTypeEnum.SUCCESS ? 'success' : ''}${type === NotificationTypeEnum.ERROR ? 'error' : ''}`}>
            <p>{message}</p>
        </div>
    );
}

export default Notification;
