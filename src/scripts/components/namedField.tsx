import * as React from 'react';

interface NamedFieldProps {
    title: string,
    children?: JSX.Element | JSX.Element[],
    centerTitle?: boolean
}

export default function NamedField(props: NamedFieldProps) {
    return (
        <div className={`namedField ${props.centerTitle ? "centerTitle" : ""}`} >
            <span className="title">{props.title}</span>
            <div className="content">{props.children}</div>
        </div>
    )
}