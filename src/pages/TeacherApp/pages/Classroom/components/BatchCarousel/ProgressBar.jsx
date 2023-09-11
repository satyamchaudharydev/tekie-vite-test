import React from 'react'
import cx from 'classnames'
import styles from './batchCarousel.module.scss'
const ProgressBar=({done,forClassroomsPage, fromClassroomCoursePage,customStyle,usingForSessionsPage,fromLiveSessionWarning,fromReportCard})=>{
    const [style, setStyle] = React.useState({});
	
	setTimeout(() => {
		const newStyle = {
			...customStyle,
			opacity: 1,
			width: done && done > 100 ? `100%` :`${done}%`,
		}
		
		setStyle(newStyle);
	}, 200);
	const getBgColor = () => {
		if (fromReportCard) {
			return {
				...customStyle,
				width: '45px'
			}
		}
		if (fromLiveSessionWarning) {
			return {
				...customStyle,
				background: '#faad1452'
			}
		}
		if(usingForSessionsPage){
			return {
				...customStyle,
				background: '#01aa9453'
			}
		}
		if (fromClassroomCoursePage && done > 0) {
			return {
				...customStyle,
				background: 'rgba(9, 156, 135, 0.11)'
			}
		}
		if (done > 0) {
			return {
				...customStyle,
				backgroundColor: '#01aa9453'
			}
		}
		return {
			...customStyle,
			backgroundColor: '#ebe8e8'
		}
	}

    return <div className={`${styles.progress} ${forClassroomsPage && styles.forClassroomsPage} ${fromClassroomCoursePage && styles.classroomProgress}`} style={getBgColor()}>
    <div className={`${styles.progressDone} ${forClassroomsPage && styles.forClassroomsPage} ${fromClassroomCoursePage && styles.progressDoneForClassroom} ${done===100&&styles.fullProgressDone}`} style={style}>
    </div>
</div>
}

export default ProgressBar