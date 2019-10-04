import './Voting.scss';
import 'react-tabs/style/react-tabs.css';

import React, { Component } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Loading } from '../loading/Loading';
import { PrepsList } from './components/PrepsList';

const electron = window.require('electron');

const PARADIGM_CITADEL_ADDRESS = 'hx3aa778e1f00c77d3490e9e625f1f83ed26f90133';

export class Voting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            preps: {},
            favorites: {},
            stakes: {},
            tabIndex: 1,
            // showPromo: !localStorage.getItem('promoAccepted')
        };
    }

    componentDidMount() {
        if (this.props.header) {
            this.props.header.setState({ mode: 'auth' });
        }

        electron.ipcRenderer.send('/preps');
        electron.ipcRenderer.on('/preps', (event, data) => {
            let preps = this.state.preps;
            preps = Object.assign(preps, data.preps);

            this.setState({
                preps: preps,
                loading: Object.keys(preps).length < data.total
            })
        });

        electron.ipcRenderer.send('/stake');
        electron.ipcRenderer.on('/stake', (event, stakes) => {
            this.setState({ stakes: stakes });
        });

        electron.ipcRenderer.send('/favorites');
        electron.ipcRenderer.on('/favorites', (event, favorites) => {
            this.setState({ favorites: favorites });
        });
    }

    setFavorite(address, add) {
        electron.ipcRenderer.send('/favorites', {
            address: address,
            alias: this.state.preps[address],
            add: add
        });
    }

    setStake(address, value) {
        electron.ipcRenderer.send('/stake', { address: address, value: value });
    }

    clearLogs() {
        this.setState({ logs: [] });
    }

    promoClick() {
        if (this.state.stakes && this.state.stakes[PARADIGM_CITADEL_ADDRESS] < 10) {
            this.setStake(PARADIGM_CITADEL_ADDRESS, 10);

            let stakes = this.state.stakes;
            stakes[PARADIGM_CITADEL_ADDRESS] = 10;
            this.setState({ showPromo: false, stakes: stakes });
            localStorage.setItem('promoAccepted', true);
        }
        this.setFavorite(PARADIGM_CITADEL_ADDRESS, true);
    }

    render() {
        const self = this;
        return <div className="voting-container">
            <h2>Manage your votes</h2>
            <div className="votes-controls">
                <Tabs defaultIndex={self.state.tabIndex}
                    onSelect={index => self.setState({ tabIndex: index })}>
                    <TabList>
                        <Tab>Favorite</Tab>
                        <Tab>All</Tab>
                    </TabList>

                    <TabPanel>
                        <PrepsList
                            favorites={self.state.favorites}
                            preps={self.state.favorites}
                            stakes={self.state.stakes}
                            onSetStake={self.setStake.bind(self)}
                            onSetFavorite={self.setFavorite.bind(self)}
                        />
                    </TabPanel>
                    <TabPanel>
                        <PrepsList
                            favorites={self.state.favorites}
                            preps={self.state.preps}
                            stakes={self.state.stakes}
                            onSetStake={self.setStake.bind(self)}
                            onSetFavorite={self.setFavorite.bind(self)}
                        />
                    </TabPanel>
                    {self.state.loading && <Loading />}
                </Tabs>
            </div>
            <div className="promo-container">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18ZM10 15C12.7614 15 15 12.7614 15 10C15 7.23858 12.7614 5 10 5C7.23858 5 5 7.23858 5 10C5 12.7614 7.23858 15 10 15Z" fill="#9E9E9E" />
                </svg>
                <span>Say thanks and vote 10% for Paradigm team</span>
                <button onClick={self.promoClick.bind(self)}>RUN</button>
            </div>
        </div>
    }
}