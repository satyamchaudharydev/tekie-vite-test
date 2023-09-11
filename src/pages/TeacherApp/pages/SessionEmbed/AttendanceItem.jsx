import React, { useRef, useState } from 'react'
import styles from './sessionEmbed.module.scss'
import { ReactComponent as User } from '../../../../assets/users.svg';
import { ReactComponent as Warning} from '../../../../assets/warning.svg';
import Tooltip from '../../../../library/Tooltip/Tooltip';
import { get } from 'lodash';

export const AttendanceItem = ({isBuddy,students}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [buddyDetectedTooltip , setbBuddyDetectedTooltip] = useState(false);
   
    const buttonRef = useRef(null);
    const buddyDetectedTooltipRef = useRef(null);
    
    const handleMouseEnter = () => {
        setShowTooltip(true);
      };
      
    const handleMouseLeave = () => {
        setShowTooltip(false);
    };
    
  return (
    <div className={styles.tableData}>
        {isBuddy ?  (
                <>
                    <div
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}   
                        className={styles.buddyLoginActive} >
                        <div 
                          ref={buttonRef}
                          className={styles.userIcon}>
                          <User ></User>
                        </div>
                    </div>
                </>
            ) : null}
        <div className={styles.studentDetail}>                
            {
                students.map((student,index) => {
                const isLoggedIn  = get(student, 'isLoggedIn', false)
                const duplicate  = get(student, 'duplicate', false)
                return <div style={{width: 'fit-content'}}>
                            <div className={styles.attendanceItem} style={{display: 'flex',gap: '10px'}}>{get(student,'rollNo', '')} - {get(student,'user.name')} 
                                {duplicate &&   <div onMouseEnter={() => {
                                    setbBuddyDetectedTooltip(true);
                                    
                                }}className={styles.warningIcon} onMouseLeave={() => 
                                    setbBuddyDetectedTooltip(false)
                                } ref={buddyDetectedTooltipRef}>
                                    <Warning></Warning>
                                </div > }
                              
                            </div>
                        </div>   
                })
            }
        </div>

        <Tooltip
            open={showTooltip}
            anchorEl={buttonRef.current}
            tooltipOnhoverShow={true}
            anchorOrigin={
               { vertical: "top",
                horizontal: "left",}
            }
            transformOrigin={
               { vertical: "top",
                horizontal: "left",}
            }

            handleMouseEnter={() => {
                setShowTooltip(true);
            }}
            handleMouseLeave={() => {
                setShowTooltip(false);
            }}
            type='secondary'
            orientation='bottom'
            offsetX={-70}
            offsetY={-45}
            fullCenter={true}
        >
            <div className={styles.tooltipContent}  >
             <span>
                <User></User>
             </span>
            Buddy Login active!
            </div>

        </Tooltip>

        <Tooltip
            open={buddyDetectedTooltip}
            anchorEl={buddyDetectedTooltipRef.current}
            tooltipOnhoverShow={true}
            anchorOrigin={
               { vertical: "top",
                horizontal: "left",}
            }
            transformOrigin={
               { vertical: "top",
                horizontal: "left",}
            }

            handleMouseEnter={() => {
                setbBuddyDetectedTooltip(true);
            }}
            handleMouseLeave={() => {
                setbBuddyDetectedTooltip(false);
                }}
            type='secondary'
            orientation='bottom'
            offsetX={-70}
            offsetY={-45}
            fullCenter={true}
        >
            <div className={styles.tooltipContent}  >
             <span>
                <Warning></Warning>
             </span>
             Repeated login detected for this student
            </div>

         </Tooltip>
     
    </div>
  )
}
