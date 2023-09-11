import React,{useEffect,useState} from 'react'
import classNames from 'classnames'
import styles from './WrongAnswer.module.scss'
import get from 'lodash/get'
import { ReactComponent as DropIcon } from '../../../../../assets/wrongDropIcon.svg'
import UpdatedButton from '../../../../../components/Buttons/UpdatedButton/UpdatedButton'
import { WrongAnswerIcon } from '../../../../../constants/icons'
import { checkIfEmbedEnabled } from '../../../../../utils/teacherApp/checkForEmbed'
 
const WrongAnswer=(props)=>{
    const [slidInComponent, setSlidInComponent] = useState(false)
    useEffect(() => {
        if(props.visible){
            setSlidInComponent(true)
        }
        else{
            setSlidInComponent(false)
        }
    }, [props.visible])
    if (get(props, 'isUpdatedDesign') && !props.isMobile && props.visible) {
        let hintText = 'Hint'
        if (!props.isHintTextExist) {
            hintText = 'Help'
        }
        return (
            <div className={classNames(styles.wrongAnswerUpdatedContainer, checkIfEmbedEnabled() && styles.wrongAnswerUpdatedContainerForTeacherApp)} >
                <div className={classNames(styles.wrongAnswerText)}><WrongAnswerIcon /> <span>Oops! </span> Wrong Answer</div>
            {
                get(props, 'showHelp') && (
                    <div className={classNames(styles.explanation)}>
                            <span>Try Again </span> or Click on <span>{' '}{hintText}!{' '}</span> button to solve this question
                    </div>
                )
            }
            {
                !get(props, 'showHelp') && (
                    <div className={classNames(styles.explanation)}>
                            <span>Try Again </span>
                    </div>
                )
            }
            <div className={classNames(styles.actionButtons)}>
                {
                    get(props, 'showHelp') && (
                        <>
                            <UpdatedButton onBtnClick={() => props.openHintOverLay()} text={hintText} type={'secondary'}></UpdatedButton>
                            <div className={styles.footerBtnSeparator} />
                        </>
                    )
                }
                <UpdatedButton isDisabled={get(props, 'checkIfAnotherAnsSelected')}
                  onBtnClick={() => !get(props, 'checkIfAnotherAnsSelected') && props.onCheckButtonClick()}
                  text={'Check'} type={get(props, 'checkIfAnotherAnsSelected') ? 'disabled' : 'primary'}
                ></UpdatedButton>
            </div>
        </div>
        )
    }
    if(props.visible){
            return(
            <div className={classNames({ [styles.slideIn]: slidInComponent,
            [styles.slideOut]:!slidInComponent,
                [styles.wrongAnswerContainer]: !props.isMobile, [styles.mbWrongAnswerContainer]: props.isMobile})}>
                    Oops, wrong answer!
                <div className={props.isMobile ? styles.mbWrongAnswerIcon : styles.wrongAnswerIcon}>
                    <DropIcon />
                </div>
            </div>
        )
    }
    else{
        return null
    }
}

export default WrongAnswer
