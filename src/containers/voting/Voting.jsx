import './Voting.scss';
import 'react-tabs/style/react-tabs.css';

import React, { Component } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Loading } from '../loading/Loading';
import { PrepsList } from './components/PrepsList';
import { NotificationManager } from 'react-notifications';
const electron = window.require('electron');

export class Voting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            preps: {},
            favorites: {},
            stakes: {}
        };
    }

    componentDidMount() {
        electron.ipcRenderer.send('/preps');
        electron.ipcRenderer.on('/preps', (event, data) => {
            let preps = this.state.preps;
            preps = Object.assign(preps, data.preps);
            NotificationManager.warning(JSON.stringify([Object.keys(preps).length, data.total]))
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
            console.log(favorites)
            this.setState({ favorites: favorites });
        })
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

    render() {
        const self = this;
        return <div className="voting-container">
            <h2>Manage your votes</h2>
            <div className="votes-controls">
                <Tabs defaultIndex={1}>
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
        </div>
    }
}