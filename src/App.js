import React, { Component } from 'react';
import './App.css';
import 'react-notifications/lib/notifications.css';
import { Header } from './components/header/Header';
import { Loading } from './containers/loading/Loading';
import { Login } from './containers/login/Login';
import { NotificationContainer } from 'react-notifications';
import { Voting } from './containers/voting/Voting';

const IOSTABC_API_URL = 'https://www.iostabc.com/api/producers?sort_by=votes&order=desc';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: 'loading'
    };

    setTimeout(() => {
      this.setState({ screen: 'login' });
    }, 2000);

  }

  render() {
    return (
      <div className="App" >
        <Header />
        <div className="app-content">
          {({
            'loading': <Loading />,
            'login': <Login onLoginSuccess={() => this.setState({ screen: 'voting' })} />,
            'voting': <Voting apiUrl={IOSTABC_API_URL} />
          })[this.state.screen]}
        </div>
        <NotificationContainer />
      </div>
    );
  }
}

export default App;
