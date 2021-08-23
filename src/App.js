import React, { Component } from 'react'
import { IonPhaser } from '@ion-phaser/react'
import socket from './api/socket'


class App extends Component {
  state = {
    initialize: false,
    isLoaded: true

  }

  componentDidMount() {
    if (socket) {
      this.setState({ isLoaded: false })
    }
  }

  render() {
    const { initialize, isLoaded } = this.state
    const { game } = this.props
    return (
      <>
        {isLoaded ? 'Loader' : <IonPhaser game={game} initialize={initialize} />}
      </>

    )
  }
}

export default App;
