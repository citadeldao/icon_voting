import './Login.scss';
import React, { Component } from 'react';
import { IconWallet } from 'icon-sdk-js';
import logo from "../../logo.svg";
import { NotificationManager } from 'react-notifications';

export class Login extends Component {
    render() {
        let self = this;
        return <div className="login-container">
            <h1>Sign in</h1>
            <p>Automate the ICX voting process in a few steps.</p>
            <p>Fill your details below to log in to the ICON system.</p>
            <div className="login-form">
                <input type="file" onChange={(e) => {
                    for (let i = 0; i < e.target.files.length; i++) {
                        let reader = new FileReader();
                        reader.onloadend = (evt) => {
                            if (evt.target.readyState === FileReader.DONE) {
                                self.setState({ keystore: evt.target.result })
                            }
                        }
                        reader.readAsText(e.target.files[i]);
                        break;
                    }
                }} />
                <input placeholder="ICX password" onChange={(e) => { self.setState({ password: e.target.value }) }} />
                <button onClick={() => {
                    console.log(self.state);
                    try {
                        if (self.state && self.state.keystore) {
                            let wallet = IconWallet.loadKeystore(self.state.keystore, self.state.password);
                            NotificationManager.success(wallet.getAddress());

                        }
                        else {
                            // alert('Loading failed(no keystore specified)');
                            NotificationManager.warning('Loading failed(no keystore specified)');

                        }
                    }
                    catch (err) {
                        let errText = typeof (err) == 'string' && err.split(/\[(.*)\]/).pop() || err;
                        // console.log(err);
                        // alert(`ERROR: ${errText}`);
                        NotificationManager.warning(errText);
                    }
                }}>Start</button>
            </div>

            <div className="footer">
                <div className="logo-container">
                    <img src={logo} height="50px" alt="paradigm" />
                    <p>Made by Paradigm</p>
                </div>
            </div>
        </div>
    }
}