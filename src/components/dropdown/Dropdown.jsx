import './Dropdown.css';
import React, { Component } from 'react';

export default class Dropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMenu: false,
        };

        this.showMenu = this.showMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
    }

    showMenu(event) {
        event.preventDefault();

        let menuLeft = event.clientX;

        this.setState({
            showMenu: true,
            menuLeft: menuLeft,
            menuTop: event.clientY
        }, () => {
            document.addEventListener('click', this.closeMenu);
            let menuLeft = this.state.menuLeft;
            if (menuLeft > window.innerWidth - this.dropdownMenu.clientWidth) {
                menuLeft = window.innerWidth - this.dropdownMenu.clientWidth;
                this.setState({ menuLeft: menuLeft })
            }

        });
    }

    closeMenu(event) {
        if (this.dropdownMenu && !this.dropdownMenu.contains(event.target)) {
            this.setState({ showMenu: false }, () => {
                document.removeEventListener('click', this.closeMenu);
            });
        }
    }

    render() {
        return (
            <div className="dropdown-component">
                <button onClick={this.showMenu}>
                    <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M2 4C3.1 4 4 3.1 4 2C4 0.9 3.1 0 2 0C0.9 0 0 0.9 0 2C0 3.1 0.9 4 2 4ZM2 6C0.9 6 0 6.9 0 8C0 9.1 0.9 10 2 10C3.1 10 4 9.1 4 8C4 6.9 3.1 6 2 6ZM2 12C0.9 12 0 12.9 0 14C0 15.1 0.9 16 2 16C3.1 16 4 15.1 4 14C4 12.9 3.1 12 2 12Z" />
                    </svg>
                </button>

                {
                    this.state.showMenu
                        ? (
                            <div
                                className="menu"
                                style={{
                                    left: this.state.menuLeft,
                                    top: this.state.menuTop
                                }}
                                ref={(element) => {
                                    this.dropdownMenu = element;
                                }}
                            >
                                {this.props.items && this.props.items.map(item =>
                                    <button key={item.key} onClick={(event) => {
                                        if (item.action) {
                                            item.action(item.key);
                                        }
                                        this.setState({ showMenu: false });
                                    }}>{item.name}</button>
                                )}
                            </div>
                        )
                        : (
                            null
                        )
                }
            </div>
        );
    }
}
