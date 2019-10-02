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
            sliderValue: {}
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
        })
    }

    render() {
        const self = this;
        return <div className="voting-container">
            <h2>Manage your votes</h2>
            <div className="votes-controls">
                <Tabs>
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
                                            value={self.state.sliderValue[key]}
                                            className="horizontal-slider"
                                            renderThumb={(props, state) => {
                                                let currentSliderValue = self.state.sliderValue;
                                                if (currentSliderValue[key] !== state.valueNow) {
                                                    currentSliderValue[key] = state.valueNow;
                                                    self.setState({ sliderValue: currentSliderValue });
                                                }
                                                return <div {...props}></div>
                                            }}
                                        />
                                        <div className="percent-label">{`${(self.state.sliderValue[key] || 0)}%`}</div>
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