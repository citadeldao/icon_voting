import React, { Component } from 'react';

export class LogsList extends Component {
    render() {
        const self = this;
        return <div className="logs-list">
            <button onClick={(e) => {
                if (e) {
                    e.preventDefault();
                }
                if (this.props.onClearLogs) {
                    this.props.onClearLogs();
                }
            }}>Clear</button>
            {self.props.logs && self.props.logs.map((logItem, i) => (
                <div title={logItem} key={i} className="log-item">
                    <div className="label">> {logItem}</div>
                </div>))}
        </div>;
    }
}