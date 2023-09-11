import React, { Component } from 'react'
import onScrollStop from '../../utils/scrollStop'
import { debounce } from 'lodash'

class PreserveState extends Component {
  getKey() {
    return `__preserve_prefix__${this.props.id}`
  }

  componentDidMount() {
    let preserved = sessionStorage.getItem(this.getKey())
    const { preserveScroll = [] } = this.props
    // on Scroll stop
    for (const target of preserveScroll) {
      onScrollStop(document.getElementById(target), debounce(() => {
        this.saveState()
      }, 50))
    }
    
    if (preserved) {
      preserved = JSON.parse(preserved, (key, value) => {
        const matches = value && value.match && value.match(/^\$\$Symbol:(.*)$/);
        return matches ? Symbol.for(matches[1]) : value;
      })
      if (preserved.id) {
        const { state, id, scroll } = preserved
        if (this.props.persistIf(id)) {
          this.props.setState(state, () => {
            for (const id of Object.keys(scroll)) {
              document.getElementById(id).scrollTo(scroll[id])
            }
          })
        }
      }
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.saveIf !== this.props.saveIf) {
      this.saveState()
    }
  }

  saveState = () => {
    const { preserveScroll = [] } = this.props
    const scrollPositions = preserveScroll.map(id => {
      if (document.getElementById(id)) {
        return {
          top: document.getElementById(id).scrollTop,
          left: document.getElementById(id).scrollLeft,
        }
      }
      return {
        top: 0,
        left: 0
      }
    })
    if (sessionStorage && (sessionStorage.length > 3)) sessionStorage.clear();
    sessionStorage.setItem(this.getKey(), JSON.stringify({
      state: this.props.state,
      id: this.props.id,
      scroll: preserveScroll
        .reduce(
          (a, c, i) => ({...a, [c]: scrollPositions[i]}),
          {}
        )
    }, (key, value) =>
      typeof value === 'symbol' ? `$$Symbol:${Symbol.keyFor(value)}` : value
    ))
  }

  componentWillUnmount() {
    this.saveState()
  }

  render() {
    return <></>
  }
}

export default PreserveState
