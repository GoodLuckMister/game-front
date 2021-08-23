import React, { Component } from 'react'
import { IonPhaser } from '@ion-phaser/react'

class App extends Component {
  state = {
    initialize: false,
  }
  render() {
    const { initialize } = this.state
    const { game } = this.props
    return (
      <IonPhaser game={game} initialize={initialize} />
    )
  }
}
export default App;
