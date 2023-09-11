import React, { useState } from 'react'
import styles from './styles.module.scss'

const StripedProgressBar = (props) => {
    const [style, setStyle] = useState({})
    setTimeout(() => {
		const newStyle = {
			opacity: 1,
			width: `${done}%`,
		
		}
		
		setStyle(newStyle);
	}, 200);
    const {done}=props

    return <div className={styles.demoPreview}>
    <div className={`${styles.progress} ${styles.progressStriped} ${styles.active}`}>
        <div style={style} className={styles.progressBar}><span>Primary</span></div>
      </div>
  </div>
}

export default StripedProgressBar