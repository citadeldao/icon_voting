import './Login.scss';
import React, { Component } from 'react';
import { IconWallet } from 'icon-sdk-js';
import logo from "../../logo.svg";
import { NotificationManager } from 'react-notifications';
import { Loading } from '../loading/Loading';
const { ipcRenderer } = window.require('electron');

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

    componentDidMount() {
        if (this.state.keystore && this.state.password) {
            this.login();
        }
    }

    login() {
        let self = this;
        if (self.state && self.state.keystore && self.state.password) {
            self.setState({ loading: true });
            ipcRenderer.send('/keystore', self.state.keystore, self.state.password)
            ipcRenderer.once('/keystore', (event, privateKey) => {
                self.setState({ wallet: IconWallet.loadPrivateKey(privateKey) }, () => {
                    localStorage.setItem('keystore', self.state.keystore);
                    localStorage.setItem('password', self.state.password);
                    NotificationManager.success(self.state.wallet.getAddress());
                    if (self.props.onLoginSuccess) {
                        self.props.onLoginSuccess(self.state.wallet);
                    }
                });
            });
            ipcRenderer.once('/error', () => self.setState({ loading: false }));
        }
        else {
            NotificationManager.warning('Failed(no keystore specified)');
            return false;
        }
    }

    render() {
        let self = this;
        return <div className="login-container">
            <h1>Sign in</h1>
            <p>Automate the ICX voting process in a few steps.</p>
            <p>Fill your details below to log in to the ICON system.</p>
            <div className="login-form">
                <div className={`password-input ${this.state.showPassword ? 'show-password' : ''}`}>
                    <input type={this.state.showPassword ? 'text' : 'password'}
                        placeholder="Your ICX password"
                        onChange={(e) => { self.setState({ password: e.target.value }) }} />
                    <svg
                        onClick={() => this.setState({ showPassword: !this.state.showPassword })}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 5C7.55979 5 3.69529 7.45258 1.67405 11.0762C1.18059 11.9608 1.18059 13.0392 1.67405 13.9238C3.69529 17.5474 7.55979 20 12 20C16.4402 20 20.3047 17.5474 22.3259 13.9238C22.8194 13.0392 22.8194 11.9608 22.3259 11.0762C20.3047 7.45258 16.4402 5 12 5ZM12 17.5C9.23998 17.5 6.99998 15.26 6.99998 12.5C6.99998 9.74 9.23998 7.5 12 7.5C14.76 7.5 17 9.74 17 12.5C17 15.26 14.76 17.5 12 17.5ZM12 9.5C10.34 9.5 8.99998 10.84 8.99998 12.5C8.99998 14.16 10.34 15.5 12 15.5C13.66 15.5 15 14.16 15 12.5C15 10.84 13.66 9.5 12 9.5Z" />
                    </svg>
                </div>

                <div className="file-input input"
                    onClick={() => this.refs.keystoreFile.click()}>
                    <input type="file"
                        ref="keystoreFile"
                        onChange={(e) => {
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
                    <span className="file-input-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.9256 11.4402C19.6327 11.1473 19.1578 11.1473 18.8649 11.4402L11.2635 19.0416C9.7008 20.6043 7.16936 20.6043 5.60666 19.0416C4.04395 17.4789 4.04395 14.9475 5.60666 13.3848L14.4455 4.54594C15.4213 3.57013 17.0052 3.57013 17.981 4.54594C18.9568 5.52175 18.9568 7.10567 17.981 8.08147L10.5564 15.5061C10.1675 15.895 9.53463 15.8985 9.14219 15.5061C8.74975 15.1137 8.75328 14.4808 9.14219 14.0919L15.3294 7.9047C15.6223 7.6118 15.6223 7.13693 15.3294 6.84404C15.0365 6.55114 14.5616 6.55114 14.2687 6.84404L8.08153 13.0312C7.10572 14.007 7.10572 15.5909 8.08153 16.5668C9.05734 17.5426 10.6413 17.5426 11.6171 16.5668L19.0417 9.14213C20.6044 7.57943 20.6044 5.04799 19.0417 3.48528C17.479 1.92257 14.9475 1.92257 13.3848 3.48528L4.546 12.3241C2.39639 14.4737 2.39993 17.9562 4.546 20.1023C6.69206 22.2484 10.1746 22.2519 12.3242 20.1023L19.9256 12.5009C20.2185 12.208 20.2185 11.7331 19.9256 11.4402Z" fill="#90A4AE" />
                        </svg>
                        {!this.state.keystore && <span>
                            <span className="accent">&nbsp;Add or drop</span> your keystore file
                        </span>}
                        {this.state.keystore && <span>&nbsp;Keystore uploaded!</span>}
                    </span>
                </div>
                {!self.state.loading && <button onClick={self.login.bind(self)}>Start</button>}
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