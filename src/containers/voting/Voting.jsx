import './Voting.scss';
import 'react-tabs/style/react-tabs.css';

import React, { Component } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Loading } from '../loading/Loading';
import { ProducersList } from './components/ProducersList';
const electron = window.require('electron');

export class Voting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            producers: {},
            favorites: {},
            stakes: {}
        };
    }

    componentDidMount() {
        electron.ipcRenderer.send('/producers');
        electron.ipcRenderer.on('/producers', (event, data) => {
            let producers = this.state.producers;
            this.setState({
                producers: Object.assign(producers, data.producers),
                loading: Object.keys(producers).length < data.total
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
            alias: this.state.producers[address],
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
                        <ProducersList
                            favorites={self.state.favorites}
                            producers={self.state.favorites}
                            stakes={self.state.stakes}
                            onSetStake={self.setStake.bind(self)}
                            onSetFavorite={self.setFavorite.bind(self)}
                        />
                    </TabPanel>
                    <TabPanel>
                        <ProducersList
                            favorites={self.state.favorites}
                            producers={self.state.producers}
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