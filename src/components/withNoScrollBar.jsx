import React, { Component } from 'react'

const withNoScrollBar = (ComponentToEnhance) => class NoScrollBar extends Component {
  componentDidMount() {
    const css = `::-webkit-scrollbar {
      display: none;
    }`
    const head = document.head || document.getElementsByTagName('head')[0]
    const style = document.createElement('style')
    head.appendChild(style);
    style.type = 'text/css'
    if (style.styleSheet){
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }
  componentWillUnmount() {
    const css = `::-webkit-scrollbar {
      display: flex;
    }`
    const head = document.head || document.getElementsByTagName('head')[0]
    const style = document.createElement('style')
    head.appendChild(style);
    style.type = 'text/css'
    if (style.styleSheet){
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }
  render() {
    return <ComponentToEnhance {...this.props} />
  }
}

export default withNoScrollBar
