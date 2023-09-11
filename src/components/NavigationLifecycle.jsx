import React, { Component } from 'react'

export default class NavigationLifecycle extends Component {
  componentDidMount() {
    this.props.onEnter()
  }
  componentWillUnmount() {
    this.props.onExit()
  }
  render() {
    return (
      <></>
    )
  }
}
