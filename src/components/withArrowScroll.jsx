import React, { Component } from 'react'

const withArrowScroll = (ComponentToEnhance, scrollId, scrollPerEvent = 60) => class NoScrollBar extends Component {
  componentDidMount() {
    const scrollElem = document.getElementById(scrollId)
    this.arrowKeys = window.addEventListener('keydown', e => {
      if (e.code === "ArrowUp") {
        scrollElem.scrollBy(0, scrollPerEvent * -1)
      } else if (e.code === "ArrowDown") {
        scrollElem.scrollBy(0, scrollPerEvent)
      }
    })
  }


  componentWillUnmount() {
    window.removeEventListener('keydown', this.arrowKeys)
  }

  render() {
    return <ComponentToEnhance {...this.props} />
  }
}

export default withArrowScroll
