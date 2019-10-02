import './Voting.scss';
import 'react-tabs/style/react-tabs.css';

import React, { Component } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Loading } from '../loading/Loading';
import ReactSlider from 'react-slider';
import Dropdown from '../../components/dropdown/Dropdown';
const electron = window.require('electron');

export class Voting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            producers: {},
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
        })
    }

    addToFavorites() {

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

                    </TabPanel>
                    <TabPanel>
                        {Object.keys(self.state.producers).length
                            ? <div>{
                                Object.keys(self.state.producers).map((key) =>
                                    <div title={key} key={key} className="producer-item">
                                        <Dropdown items={[{
                                            key: key,
                                            name: 'Add to favorites',
                                            action: this.addToFavorites
                                        }]} />
                                        <div className="label">{self.state.producers[key]}</div>
                                        <ReactSlider
                                            value={self.state.stakes[key]}
                                            onChange={this.setStake.bind(this, key)}
                                            className="horizontal-slider"
                                            renderThumb={(props, state) => {
                                                let currentStakeValue = self.state.stakes;
                                                if (currentStakeValue[key] !== state.valueNow) {
                                                    currentStakeValue[key] = state.valueNow;
                                                    self.setState({ stakeValue: currentStakeValue });
                                                }
                                                return <div {...props}></div>
                                            }}
                                        />
                                        <div className="percent-label">{`${(self.state.stakes[key] || 0)}%`}</div>
                                    </div>
                                )}
                            </div>
                            : null}
                        {self.state.loading && <Loading />}

                    </TabPanel>
                </Tabs>
            </div>
        </div>
    }
}