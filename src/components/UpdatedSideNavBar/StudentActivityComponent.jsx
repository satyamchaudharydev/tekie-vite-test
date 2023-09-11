import React from "react"
import { ScatteredArrowIcon } from "../../constants/icons"
import Toggle from "../../pages/Editor/components/Toggle"
import LoadingSpinner from "../../pages/TeacherApp/components/Loader/LoadingSpinner"
import hs from "../../utils/scale"
import styles from  './MainSideBar.module.scss'


const StudentActivityComponent = ({showStudentActivity,handleToggle,isStudentActivityLoading}) => {
    return(
        <>
            <div className={styles.activityContainer} style={{background : `${showStudentActivity ? 'linear-gradient(256.65deg, rgba(255, 255, 255, 0) 3.84%, #ECFFFC 99.11%)' : ' linear-gradient(256.65deg, rgba(255, 255, 255, 0) 3.84%, #E3E3E3 99.11%)'}`}}>
                <div className={styles.studentActivityText}>
                    <ScatteredArrowIcon fill={showStudentActivity ? '#01AA93' : '#403F3F'} height='25' width="25"/>
                    <p style={{color: `${showStudentActivity ? '#01AA93' : '#403F3F'} `}}>Show Student Activity</p>
                </div>
                <div className={styles.updatedText}>
                    <p>Updates every 15 seconds</p>
                </div>
                <div  className={styles.activityToggle}>
                    {isStudentActivityLoading ? 
                       <LoadingSpinner height={hs(27)} width={hs(27)} /> 
                    :<Toggle label={showStudentActivity ? 'Disable' : 'Enable'} toggleState={showStudentActivity} handleToggle={handleToggle} mode='attendance' />}
                </div>
            </div>
        </>
    )
}

export default StudentActivityComponent