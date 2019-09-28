import './Loading.css';
import React, { Component } from 'react';
import loading from './loading.svg';

export class Loading extends Component {
    render() {
        return <div className="loading-container">
            <img src={loading} width="60" height="60" alt="logo" />
        </div>;
    }
}