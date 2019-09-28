import './Login.css';
import React, { Component } from 'react';
import { IconWallet } from 'icon-sdk-js';

export class Login extends Component {
    render() {
        return <div className="login-container">
            <input type="file" onChange={(e) => {
                for (let i = 0; i < e.target.files.length; i++) {
                    let reader = new FileReader();
                    reader.onloadend = (evt) => {
                        if (evt.target.readyState == FileReader.DONE) {
                            this.setState({ keystore: evt.target.result })
                        }
                    }
                    reader.readAsText(e.target.files[i]);
                    break;
                }
            }} />
            <input placeholder="ICX password" onChange={(e) => { this.setState({ password: e.target.value }) }} />
            <button onClick={() => {
                console.log(this.state);
                try {
                    let wallet = IconWallet.loadKeystore(this.state.keystore, this.state.password);
                    alert(`SUCCESS: ${wallet.getAddress()}`);
                }
                catch (err) {
                    alert(`ERROR: ${err}`);
                }
            }}>Start</button>
        </div>
    }
}