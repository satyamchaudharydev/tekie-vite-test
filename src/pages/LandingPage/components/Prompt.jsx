import React, { Component } from 'react'
import './Prompt.scss'
import { hs, hsm } from '../../../utils/size'
import { motion } from 'framer-motion'

const variants = {
  hide: top => ({
    y: (top + 40) * -1,
    opacity: 0
  }),
  show: {
    y: 0,
    opacity: 1
  }
}
export default class Prompt extends Component {
  state = {
    visible: false,
    text: '',
    error: true,
    top: typeof window !== 'undefined' 
      ? window.innerWidth > 1100 ?  hs(30 + 20) : hsm(33 + 20)
      : hs(30 + 20)
  }

  componentDidMount() {
    this.props.onRef(this)
    this.setOffset()
  }

  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  open(text, error=true, timeout=5000) {
    clearTimeout(this.timer)
    this.setState({error}, () => {
      this.setState({ visible: true, text, })
    })
    this.timer = setTimeout(() => {
      this.setOffset()
      this.setState({ visible: false })
    }, timeout)
  }

  close() {
    this.setState({ visible: false })
  }

  setOffset = () => {
    const landingPrompt = document.querySelector('#__landing_prompt')
    if (landingPrompt) {
      const { offsetHeight } = landingPrompt
      if (offsetHeight) {
        this.setState({ top: offsetHeight + 59 })
      }
    }
  }

  render() {
    return (
      <motion.div
        className={'landing-page-prompt-container'}
        variants={variants}
        initial='hide'
        style={this.state.visible ? { pointerEvents: 'auto' } : { pointerEvents: 'none' }}
        custom={this.state.top}
        animate={this.state.visible ? 'show' : 'hide'}
      >
        
        <div className={'landing-page-prompt-prompt'} id="__landing_prompt">
          {this.state.error && (
            <div className={'landing-page-prompt-caution'}></div>
          )}
          <span>{this.state.text}</span>
        </div>
      </motion.div>
    )
  }
}
