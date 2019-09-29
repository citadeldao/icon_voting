import './Voting.scss';
import 'react-tabs/style/react-tabs.css';

import React, { Component } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Loading } from '../loading/Loading';
import ReactSlider from 'react-slider';
import Axios from 'axios';

export class Voting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            producers: {},
            sliderValue: {}
        };

        this.updateProducers(props.apiUrl);
    }

    updateProducers(apiUrl, page = 1) {
        //TODO: Reimplement, should interact through node.js part
        return Axios.get(apiUrl, {
            params: {
                page: page
            }
        })
            .then(resp => {
                const data = resp.data;
                let producers = this.state.producers;
                data.producers.forEach(producer => producers[producer.account] = producer.alias || producer.account);
                console.log(producers);
                this.setState({ producers: producers, loading: true }, () => {
                    if (page * data.size < data.total) {
                        this.updateProducers(apiUrl, page + 1);
                    }
                    else {
                        this.setState({ loading: false });
                    }
                });
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
                        {Object.keys(self.state.producers).length && <div>{
                            Object.keys(self.state.producers).map((key) =>
                                <div title={key} key={key} className="producer-item">
                                    <div className="label">{self.state.producers[key]}</div>
                                    <ReactSlider
                                        className="horizontal-slider"
                                        renderThumb={(props, state) => {
                                            let currentSliderValue = self.state.sliderValue;
                                            if (currentSliderValue[key] != state.valueNow) {
                                                currentSliderValue[key] = state.valueNow;
                                                self.setState({ sliderValue: currentSliderValue });
                                            }
                                            return <div {...props}></div>
                                        }}
                                    />
                                    <div className="percent-label">{`${(self.state.sliderValue[key] || 0)}%`}</div>
                                </div>
                            )}
                        </div>}
                        {self.state.loading && <Loading />}

                    </TabPanel>
                </Tabs>
            </div>
        </div>
    }
}