import './Voting.scss';
import 'react-tabs/style/react-tabs.css';

import React, { Component } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Loading } from '../loading/Loading';
import { PrepsList } from './components/PrepsList';
import { LogsList } from './components/LogsList';
const electron = window.require('electron');

export class Voting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            preps: {},
            favorites: {},
            stakes: {},
            logs: []
        };
    }

    componentDidMount() {
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

        electron.ipcRenderer.send('/logs');
        electron.ipcRenderer.on('/logs', (event, logItem) => {
            let logs = this.state.logs;
            logs.push(logItem);
            this.setState({ logs: logs });
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

    render() {
        const self = this;
        return <div className="voting-container">
            <h2>Manage your votes</h2>
            <div className="votes-controls">
                <Tabs defaultIndex={1}>
                    <TabList>
                        <Tab>Favorite</Tab>
                        <Tab>All</Tab>
                        <Tab>Logs</Tab>
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
                    <TabPanel>
                        <LogsList
                            logs={self.state.logs}
                            onClearLogs={self.clearLogs} />
                    </TabPanel>
                    {self.state.loading && <Loading />}
                </Tabs>
            </div>
        </div>
    }
}