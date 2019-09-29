import './Login.scss';
import React, { Component } from 'react';
import { IconWallet } from 'icon-sdk-js';
import logo from "../../logo.svg";
import { NotificationManager } from 'react-notifications';
import { Loading } from '../loading/Loading';

export class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keystore: localStorage.getItem('keystore'),
            password: localStorage.getItem('password'),
            wallet: localStorage.getItem('wallet'),
            loading: false
        }
    }

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
                <input type="password" placeholder="ICX password" onChange={(e) => { self.setState({ password: e.target.value }) }} />
                <button onClick={() => {

                    Promise.resolve()
                        .then(() => new Promise(resolve => self.setState({ loading: true }, resolve)))
                        .then(() => {
                            if (self.state && self.state.keystore) {
                                let wallet = IconWallet.loadKeystore(self.state.keystore, self.state.password);
                                self.setState({ wallet: wallet });
                                return true;
                            }
                            else {
                                NotificationManager.warning('Failed(no keystore specified)');
                                return false;
                            }
                        })
                        .catch(err => {
                            let errText = typeof (err) == 'string' ? err.split(/\[(.*)\]/).pop() : err;
                            NotificationManager.warning(errText);
                            return false;
                        })
                        .then(success => {
                            self.setState({ loading: false });

                            if (success) {
                                localStorage.setItem('keystore', self.state.keystore);
                                localStorage.setItem('password', self.state.password);
                                NotificationManager.success(self.state.wallet.getAddress());
                                if (self.props.onLoginSuccess) {
                                    self.props.onLoginSuccess();
                                }
                            }
                        })
                }}>Start</button>
            </div>

            {self.state.loading && <Loading />}

            <div className="footer">
                <div className="logo-container">
                    <img src={logo} height="50px" alt="paradigm" />
                    <p>Made by Paradigm</p>
                </div>
            </div>
        </div>
    }
}