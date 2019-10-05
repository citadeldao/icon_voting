import './Voting.scss';
import 'react-tabs/style/react-tabs.css';

import React, { Component } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Loading } from '../loading/Loading';
import { PrepsList } from './components/PrepsList';
import { Checkbox } from '../../components/checkbox/Checkbox';
import { NotificationManager } from 'react-notifications';

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
            // promoAccepted: !localStorage.getItem('promoAccepted')
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
        electron.ipcRenderer.on('/stake', (event, stake) => {
            let stakes = this.state.stakes;
            this.setState({ stakes: Object.assign(stakes, stake) });
        });

        electron.ipcRenderer.send('/favorites');
        electron.ipcRenderer.on('/favorites', (event, favorites) => {
            this.setState({ favorites: favorites });
        });
    }

    componentWillUnmount() {
        electron.ipcRenderer.removeAllListeners('/preps');
        electron.ipcRenderer.removeAllListeners('/stake');
        electron.ipcRenderer.removeAllListeners('/favorites');
    }

    setFavorite(address, add) {
        if (this.setFavoriteTimeout) {
            clearTimeout(this.setFavoriteTimeout);
        }
        this.setFavoriteTimeout = setTimeout(() => {
            electron.ipcRenderer.send('/favorites', {
                address: address,
                alias: this.state.preps[address],
                add: add
            });
        }, 500);
    }

    setStake(address, value) {
        electron.ipcRenderer.send('/stake', { address: address, value: value });
    }

    clearLogs() {
        this.setState({ logs: [] });
    }

    promoCheck(checked) {
        if (checked) {
            if (this.state.stakes && this.state.stakes[PARADIGM_CITADEL_ADDRESS] < 10) {
                this.setStake(PARADIGM_CITADEL_ADDRESS, 10);

                let stakes = this.state.stakes;
                stakes[PARADIGM_CITADEL_ADDRESS] = 10;
                this.setState({ promoAccepted: true, stakes: stakes });
                localStorage.setItem('promoAccepted', true);
            }
            this.setFavorite(PARADIGM_CITADEL_ADDRESS, true);
        }
    }

    runNow() {
        electron.ipcRenderer.send('/voter/run');
        electron.ipcRenderer.on('/voter/run', () => {
            NotificationManager.success('Votes update started!');
        })
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(prevState, this.state)
        if (this.state.preps[PARADIGM_CITADEL_ADDRESS] && !this.state.promoAccepted) {
            return this.promoCheck(true);
        }
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
                <Checkbox
                    checked={self.state.stakes[PARADIGM_CITADEL_ADDRESS] >= 10}
                    onCheck={self.promoCheck.bind(self)} />
                <span>Say thanks and vote 10% for Paradigm team</span>
                <button onClick={self.runNow.bind(self)}>RUN</button>
            </div>
        </div>
    }
}