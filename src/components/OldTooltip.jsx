import React, { Component } from 'react'
import withScale from '../utils/withScale'
import { motion } from 'framer-motion'

class Tooltip extends Component {
  state = {
    visible: false
  }
  

  render() {
    const { children, styles } = this.props
    return (
      <div style={{ position: 'relative' }}>
        <motion.div style={styles.toolTipContainer} animate={this.state.visible ? {opacity: 1,} : {opacity: 0}} initial={{ opacity: 0 }}>
          <div style={styles.tooltip}>Clear</div>
        </motion.div>
        <div
          onMouseOver={() => {this.setState({ visible: true })}}
          onMouseOut={() => {this.setState({ visible: false })}}
        >
          {children}
        </div>
      </div>
    )
  }
}

const styles = {
  toolTipContainer: {
    position: 'absolute',
    top: 33.25,
    left: -33.25,
    pointerEvents: 'none',
    zIndex: 99
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingLeft: 13,
    paddingRight: 13,
    paddingTop: 7,
    paddingBottom: 7,
    fontSize: 14,
    letterSpacing: '1.1px',
    color: 'white',
  }
}
export default withScale(Tooltip, styles)
