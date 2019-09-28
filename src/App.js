import React, { Component } from 'react';
import './App.css';
import { Header } from './components/header/Header';
import { Loading } from './containers/loading/Loading';
import { Login } from './containers/login/Login';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: 'loading'
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ screen: 'login' });
    }, 2000);
  }

  render() {
    return (
      <div className="App" >
        <Header />
        <div className="app-content">
          {this.state.screen === 'loading' ? <Loading /> : <Login />}
        </div>

      </div>
    );
  }
}

export default App;
