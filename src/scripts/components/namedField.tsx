import React, { ReactElement } from 'react';

interface NamedFieldProps {
    title: string,
    children?: ReactElement | ReactElement[],
    centerTitle?: boolean
}

const NamedField = ({ title, children, centerTitle }: NamedFieldProps) => {
    return (
        <div className={`namedField ${centerTitle ? "centerTitle" : ""}`} >
            <span className="title">{title}</span>
            <div className="content">{children}</div>
        </div>
    )
}

export default NamedField;
