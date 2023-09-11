import React from 'react'
import hs, { hsFor1280 } from '../../../../utils/scale';
import styles from './DetailedReport.module.scss'
const ProgressBarHorizontal=({ done = 0,text='1st Try',tryNos='one' })=>{
    const [style, setStyle] = React.useState({});
	setTimeout(() => {
		const newStyle = {
			opacity: 1,
			width: `${done?done:1}%`
		}
		
		setStyle(newStyle);
	}, 200);

    return done > 0 && <div className={styles.progressHorizontal}>
    <div className={`${styles.progressDoneHorizontal} ${styles[tryNos]} ${done===100&&styles.fullProgressDone}`} style={style}>
    <span className={styles.progressPercentageHorizontal} style={{position:' relative',display:'inline-block'}}>{done}%</span>
    <span className={styles.barRightText} style={{position:' relative',right:text==='Incorrect'?hsFor1280(-51):hsFor1280(-45),display:'inline-block',minWidth:hs(48),whiteSpace:'nowrap'}}>{text}</span>
    </div>

</div>
}

export default ProgressBarHorizontal