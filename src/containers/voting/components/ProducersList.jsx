import ReactSlider from 'react-slider';
import Dropdown from '../../../components/dropdown/Dropdown';
import React, { Component } from 'react';

export class ProducersList extends Component {
    render() {
        const self = this;
        return <div className="producers-list">
            {Object.keys(self.props.producers).length
                ? <div>{
                    Object.keys(self.props.producers).map((key) =>
                        <div title={key} key={key} className="producer-item">
                            <Dropdown items={[{
                                key: key,
                                name: self.props.favorites[key] ? 'Remove from favorites' : 'Add to favorites',
                                action: () => self.props.onSetFavorite(key, !self.props.favorites[key])
                            }]} />
                            <div className="label">{self.props.producers[key]}</div>
                            <ReactSlider
                                value={self.props.stakes[key]}
                                onChange={value => this.props.onSetStake(key, value)}
                                className="horizontal-slider"
                                renderThumb={(props, state) => {
                                    let currentStakeValue = self.props.stakes;
                                    if (currentStakeValue[key] !== state.valueNow) {
                                        currentStakeValue[key] = state.valueNow;
                                        self.setState({ stakeValue: currentStakeValue });
                                    }
                                    return <div {...props}></div>
                                }}
                            />
                            <div className="percent-label">{`${(self.props.stakes[key] || 0)}%`}</div>
                        </div>
                    )}
                </div>
                : null}
        </div>;
    }
}