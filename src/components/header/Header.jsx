import './Header.css';
import React, { Component } from 'react';
import Dropdown from '../dropdown/Dropdown';

export class Header extends Component {
    constructor(props) {
        super(props);
        this.state = { mode: 'unauth' };
    }

    render() {
        switch (this.state.mode) {
            case 'unauth':
                return <div className="header">
                    <h2>Power vote</h2>
                </div>;
            case 'auth':
                return <div className="header-auth">
                    <h2>Power vote</h2>
                    <div className="auth-user">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 8C10.21 8 12 6.205 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.205 5.79 8 8 8ZM8 10C5.335 10 0 11.335 0 14V16H16V14C16 11.335 10.665 10 8 10Z" fill="white" />
                        </svg>
                        <a href="/#">User</a>
                        <svg width="10" height="5" viewBox="0 0 8 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.666748 0.666687L4.00008 4.00002L7.33341 0.666687H0.666748Z" fill="white" />
                        </svg>
                        <Dropdown items={[{
                            key: 'unlogin',
                            name: 'Logount',
                            action: () => {
                                localStorage.removeItem('keystore');
                                localStorage.removeItem('password');
                            }
                        }]} />
                    </div>
                </div>;
            default:
                return <h2>Invalid mode</h2>
        }
    }
}