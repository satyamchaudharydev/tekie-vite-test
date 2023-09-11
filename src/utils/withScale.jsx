import React, { Component } from 'react'
import { debounce, isNumber } from 'lodash'
import { hs, hsm } from './size'

const toObject = (keys = [], values = []) => {
  const object = {}
  for (const [i, key] of keys.entries()) {
    if (window.innerWidth < 900) {
      const mobileKey = key + 'M'
      if (keys.includes(mobileKey)) {
        object[key] = values[keys.indexOf(mobileKey)]
      } else {
        object[key] = values[i]
      }
    } else {
      object[key] = values[i]
    }
  }
  return object
}

class Resizer extends Component {
  state = {
    styles: this.props.styles
  }

  componentDidMount() {
    const { styles } = this.props
    const resizedStyles = this.resizeStyles(styles)
    this.setState({ styles: resizedStyles })  
    if (this.props.shouldScale) {
      window.addEventListener('resize', debounce(() => {
        const resizedStyles = this.resizeStyles(styles)
        this.setState({ styles: resizedStyles })  
      }, 30))
    }
  }

  resizeStyles(styles) {
    const resizedStyles = []
    const styleValues = Object.values(styles)
    for (const style of styleValues) {
      const resizedStyle = []
      const properties = Object.values(style)
      for (const property of properties) {
        if (isNumber(property)) {
          if (window.innerWidth < 900) {
            resizedStyle.push(hsm(property))
          } else {
            resizedStyle.push(hs(property))
          }
          continue;
        }
        resizedStyle.push(property)
      }
      resizedStyles.push(toObject(Object.keys(style), resizedStyle))
    }
    return toObject(Object.keys(styles), resizedStyles)
  }


  render() {
    const { ComponentToResize, styles, shouldScale, ...props } = this.props
    
    return (
      <ComponentToResize {...props} styles={this.state.styles} />
    )
  }
}


const withScale = (ComponentToResize, styles, shouldScale = true, factor=1) => 
  (props) => <Resizer {...props} ComponentToResize={ComponentToResize} styles={styles} shouldScale={shouldScale} />
  
export default withScale
