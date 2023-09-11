import React from 'react'
import widgetConfig from './chatWidgetConfig'

let FRESHCHAT = () => <div />
class ChatWidget extends React.Component {
  state = {
    renderKey: 0,
  }



  render() {
    return <></>
    // return (
    //   <FRESHCHAT
    //     key={this.state.renderKey}
    //     token={`${import.meta.env.REACT_APP_FRESH_CHAT_TOKEN}`}
    //     host="https://wchat.in.freshchat.com"
    //     config={widgetConfig}
    //   />
    // )
  }
}

export default ChatWidget
