import React,{useEffect,useState} from 'react'
import classNames from 'classnames'
import styles from './WrongAnswer.module.scss'
import {ReactComponent as DropIcon } from '../../../../assets/wrongDropIcon.svg'
 
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
    if(props.visible){
            return(
            <div  className={classNames({ [styles.slideIn]: slidInComponent,
            [styles.slideOut]:!slidInComponent,
                [styles.wrongAnswerContainer]: true })}>
                    Oops, wrong answer!
                <div className={styles.wrongAnswerIcon}>
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
