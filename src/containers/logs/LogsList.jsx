import './LogsList.css';
import React, { Component } from 'react';

export class LogsList extends Component {
    render() {
        const self = this;
        return <div className="logs-container">
            <div className="buttons-panel">
                <button onClick={(e) => {
                    if (this.props.onClearLogs) {
                        this.props.onClearLogs();
                    }
                }}>Clear</button>
                <button onClick={(e) => {
                    if (this.props.onClose) {
                        this.props.onClose();
                    }
                }}>Close</button>
            </div>
            <div className="logs-list">
                {self.props.logs && self.props.logs.map((logItem, i) => (
                    <div title={logItem} key={i} className="log-item">
                        <div className="label">> {logItem}</div>
                    </div>))}
            </div>
        </div>;
    }
}