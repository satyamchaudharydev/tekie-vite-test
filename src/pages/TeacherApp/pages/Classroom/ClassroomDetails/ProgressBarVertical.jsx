import React from 'react'
import UpdatedToolTip from '../../../../../components/UpdatedToolTip/UpdatedToolTip';
import { hsFor1280 } from '../../../../../utils/scale';
import StudentListTooltip from '../../../components/StudentListTooltip';
import styles from './classroomDetails.module.scss'

const ProgressBarVertical = ({doneText, done = 0,text='',tryNos='one', list=[], showTooltip }) => {
    const [style, setStyle] = React.useState({});
    const [isShowTooltip, setisShowTooltip] = React.useState();
    let showTimeout;
    let hideTimeout;

    setTimeout(() => {
        const newStyle = {
            opacity: 1,
            height: `${done?done:1}%`,
            zIndex: '0',
        }
        setStyle(newStyle);
    }, 200);

    const showTip = () => {
        clearTimeout(hideTimeout)
        showTimeout = setTimeout(() => {
            setisShowTooltip(true);
        }, 50);
    };
    
    const hideTip = () => {
        hideTimeout = setTimeout(() => {
            clearInterval(showTimeout);
            setisShowTooltip(false);
        }, 50);
    };

    const triesTooltip = (data, heading) => (
        <StudentListTooltip
            heading={heading}
            list={data}
            assignmentKey='tries'
        />
    )

    const renderProgressDone = () => (
        <span className={styles.progressPercentage} style={{position:' relative',top: hsFor1280(-16),display:' inline-block',textAlign: 'center',minWidth:'max-content'}}>{doneText} %</span>
    )

    const renderProgressDoneWithTooltip = () => {
        return (
            <UpdatedToolTip
                tipColor={"#4A336C"}
                delay={'50'}
                hideDelay={'50'}
                direction="bottomLeft"
                content={triesTooltip(list, text)}
                isShowTooltip={isShowTooltip}
                fromProgress
            >
                {renderProgressDone()}
            </UpdatedToolTip>
        )
    }

    return (
        <div>
            <div className={styles.progress}>
                <div
                    className={`${styles.progressDone} ${styles[tryNos]}`}
                    style={style} 
                    onMouseEnter={showTip}
                    onMouseLeave={hideTip}
                >
                    {(showTooltip && list.length)  ? renderProgressDoneWithTooltip() : renderProgressDone()}
                </div>
            </div>
            <p className={styles.barBottomText}>{text}</p>
        </div>
    )
}

export default ProgressBarVertical