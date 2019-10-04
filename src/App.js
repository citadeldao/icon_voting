import React, { Component } from 'react';
import './App.css';
import 'react-notifications/lib/notifications.css';
import { Header } from './components/header/Header';
import { Loading } from './containers/loading/Loading';
import { Login } from './containers/login/Login';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { Voting } from './containers/voting/Voting';
import { LogsList } from './containers/logs/LogsList';
const { ipcRenderer } = window.require('electron');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: 'loading',
      logs: [],
      showLogs: false
    };

    setTimeout(() => {
      this.setState({ screen: 'login' });
    }, 2000);

  }

  componentDidMount() {
    ipcRenderer.on('/error', (event, err) => {
      console.error(err);
      let errText = typeof (err) == 'string'
        ? err.split(/\[(.*)\]/).pop()
        : err
          ? err.message
          : JSON.stringify(err);
      NotificationManager.warning(errText);
    });


    ipcRenderer.on('/logs', (event, logItem) => {
      let logs = this.state.logs;
      logs.push(logItem);
      this.setState({ logs: logs });
    });
  }

  render() {
    return (
      <div className="App" >
        <Header ref="header"
          onShowLogs={() => { this.setState({ showLogs: true }) }} />
        <div className="app-content">
          {this.state.showLogs && <LogsList
            logs={this.state.logs}
            onClearLogs={() => this.setState({ logs: [] })}
            onClose={() => this.setState({ showLogs: false })} />}
          {(!this.state.showLogs && {
            'loading': <Loading />,
            'login': <Login onLoginSuccess={() => {
              this.setState({ screen: 'voting' });
              ipcRenderer.send('/logs');
            }} />,
            'voting': <Voting header={this.refs.header} />,
          }[this.state.screen])}
        </div>
        <NotificationContainer />
      </div>
    );
  }
}

export default App;
