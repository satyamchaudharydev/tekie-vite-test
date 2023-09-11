import { get } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { Exclamation, Monitor, PlayIconOutline } from '../../../../../../constants/icons'
import { getColorThemeForCard, getGrade } from '../../utils'
import styles from './ClassCard.module.scss'
import exportedVariables from '../../../../../../../src/pages/TeacherApp/variables/_variables.scss'
import { HomeworkSvg } from '../../../../components/svg'
import moment from 'moment'
import hs from '../../../../../../../src/utils/scale'
import PulsatingDot from '../../../../components/PulsatingDot/PulsatingDot'
const getIconColor = (status) => {
    if (status === 'completed') return '#01AA93'
    if (status === 'allotted') return `${exportedVariables.primaryColor}`
    if (status === 'started') return `${exportedVariables.primaryColor}`
    if (status === 'unattended') return '#FF5744'
}

const getTimeFormat = (dateObj) => {

    return moment(dateObj).format('LT').toLowerCase()
}

const ClassCard = (props) => {
    const [sub30Flag, setSub30Flag] = useState(true)
    const [sub60Flag, setSub60Flag] = useState(false)
    const [withBoxShadow, setWithBoxShadow] = useState(false)
    const [isTooltipVisible, setIsTooltipVisible] = useState(false)
    const [sessionId,setSessionId]=useState('')
    const [endSessionReminderIcon,setEndSessionReminderIcon]=useState(false)

    const cardRef=useRef(null)
    useEffect(() => {
        const elements = document.getElementsByClassName('fc-daygrid-event fc-daygrid-block-event fc-h-event fc-event fc-event-start fc-event-end')
        let count = 1000
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.zIndex = --count
        }
    })

    useEffect(() => {
        if(isTooltipVisible){
            const elements = document.getElementsByClassName('fc-timegrid-event-harness fc-timegrid-event-harness-inset')
            let count = 1000
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.zIndex = --count
            }
        }else{
            const elements = document.getElementsByClassName('fc-timegrid-event-harness fc-timegrid-event-harness-inset')
            let count = 1000
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.zIndex = ++count
            }
        }
    },[isTooltipVisible])

    useEffect(() => {
        const toolTip = document.getElementsByClassName('isTooltip')
        let count = 1000
        for (let i = 0; i < toolTip.length; i++) {
            toolTip[i].style.zIndex = --count
        }
    }, [isTooltipVisible])

  

    const isCurrentTimeBetweenSessionStartAndEndTime = (props.start && props.end) && (props.start.getTime() <= new Date().getTime()) && (props.end.getTime() >= new Date().getTime())

    const difference = (props.start && props.end) && props.end.getTime() - props.start.getTime()

    const isLessThanOneHourSession = (Math.round((difference / 1000) / 60)) <= 30 || (Math.round((difference / 1000) / 60)) <= 59
    const isSub30MinutesSession = (Math.round((difference / 1000) / 60)) <= 30
    if (props.documentType === 'event') {
        return <div className={styles.titleContainer}>({get(props, 'title')})</div>
    }

    const getConditionsForOutlinedCard = (props) => {
        if(sessionId===get(props,'id') && isCurrentTimeBetweenSessionStartAndEndTime) return false
        if(isCurrentTimeBetweenSessionStartAndEndTime && localStorage.getItem('someSessionIsInProgress')!=='true' ) return false
        return (localStorage.getItem('someSessionIsInProgress')==='true' && props.sessionStatus === 'allotted') || isCurrentTimeBetweenSessionStartAndEndTime || (props.isSessionClosestToCurrentTime.isFuture && !props.isSessionClosestToCurrentTime.earliest && props.sessionStatus !== 'completed' && props.sessionStatus !== 'started')
    }

    const getCardIcon = () => {
        if (props.sessionStatus === 'started'){
            return endSessionReminderIcon?<Exclamation height={hs(20)} width={hs(20)}/>:<PulsatingDot/>
        }
        if (props.classType === 'lab' || props.classType === null || props.classType === undefined) return <Monitor color={getConditionsForOutlinedCard(props) ? getIconColor(props.sessionStatus) : 'white'} width={hs(20)} height={hs(20)} />
        return <HomeworkSvg color={getConditionsForOutlinedCard(props) ? getIconColor(props.sessionStatus) : 'white'} height={hs(21)} width={hs(20)} />
    }

    const toggleCardView = () => {
        if (isLessThanOneHourSession) {
            setIsTooltipVisible(true)
            setSub30Flag(false)
            setSub60Flag(true)
            setWithBoxShadow(true)
        }
    }

    useEffect(()=>{
        let delay= props.end.getTime()-new Date().getTime()
        if(delay<0) delay= new Date().getTime() - props.end.getTime()
        let timerId
        if(isCurrentTimeBetweenSessionStartAndEndTime){
            setSessionId(get(props,'id'))
        }
        if(isCurrentTimeBetweenSessionStartAndEndTime && !localStorage.getItem('someSessionIsInProgress')){
            //coz,even if session hasnt started, we want to show it solid purple and not outlined if CurrentTime is in Between SessionStartAndEndTime
            localStorage.setItem('someSessionIsInProgress',true)
            timerId = setTimeout(()=>{
                    if(props.sessionStatus!=='started'){
                        localStorage.removeItem('someSessionIsInProgress')
                    }
            },delay)
        }
        //using a cleanup is causing issues
    },[])

    useEffect(()=>{
        if(props.sessionStatus==='started'){
            const delay= props.end.getTime() + 1800000 //30 min
            let effectiveDelay= new Date(delay).getTime() - new Date().getTime()
            if(effectiveDelay<0){
                effectiveDelay=0
            }
            let timerId;
            timerId = setTimeout(()=>{
                if(props.sessionStatus==='started'){
                    setEndSessionReminderIcon(true)
                }
        },effectiveDelay)     
        }
    },[])

    const getCardHeight=()=>{
        if(cardRef.current){
                const element=cardRef.current.closest('.fc-event-main')
                 if(element) return `${element.offsetHeight}px`
                 return '100%'
        }
        return '100%'
    }


    if (isSub30MinutesSession) {
        return <div style={isSub30MinutesSession ? { position: 'relative', overflow: 'visible'} : {}} onMouseEnter={() => toggleCardView()} onMouseLeave={() => { setSub30Flag(true); setWithBoxShadow(false); setIsTooltipVisible(false) }}>

            <div className={`${styles.cardContainer} ${getColorThemeForCard(props.sessionStatus)} ${((props.isSessionClosestToCurrentTime.earliest && localStorage.getItem('someSessionIsInProgress')!=='true') || (isCurrentTimeBetweenSessionStartAndEndTime && localStorage.getItem('someSessionIsInProgress')!=='true') || (sessionId===get(props,'id'))) ? styles.solidCard : (props.sessionStatus==='allotted' && localStorage.getItem('someSessionIsInProgress')!=='true') ? styles.solidCard: `${styles.cardContainer} ${props.sessionStatus==='allotted' && styles.outlinedCard}`} ${props.isSessionClosestToCurrentTime.isFuture && !props.isSessionClosestToCurrentTime.earliest && props.sessionStatus !== 'completed' && props.sessionStatus !== 'started' && styles.outlinedCard}`}>
                <div className={styles.gradeAndTime}>
                    <span className={styles.sub30CardIcon}>
                        {getCardIcon()}
                    </span>
                    <div className={styles.gradeAndSeparator} style={props.view==='timeGridDay'?{flex:'1 1 5%'}:{}}>

                        {
                            get(props, 'grades', []).map((grade, i) => {
                                if (get(props, 'grades', []).length === 1) {
                                    return <span className={`${styles.sub30ClassGrade}`}>{`${getGrade(grade)}-${props.sections[i]}`}</span>
                                }
                                if (i === get(props, 'grades', []).length - 1) {
                                    return <span className={`${styles.sub30ClassGrade}`}>{`${getGrade(grade)}-${props.sections[i]}`}</span>
                                }
                                return <span className={`${styles.sub30ClassGrade}`}>{`${getGrade(grade)}-${props.sections[i]}, `}</span>
                            })
                        }
                        <span>
                            &#x2022;
                        </span>
                    </div>

                    <p className={styles.sub30GradAndTime}>

                        <span className={styles.sub30ClassTime}>{`${getTimeFormat(props.start, '', props.startMinutes, props.id)} - ${getTimeFormat(props.end, props.start, props.endMinutes, props.id)}`}</span>
                    </p>
                </div>
            </div>

            {isTooltipVisible && <div style={{ height: hs(79),position: 'absolute', top: 0 }} className={`isTooltip ${styles.cardContainer} ${withBoxShadow && styles.withBoxShadow} ${getColorThemeForCard(props.sessionStatus)} ${(props.isSessionClosestToCurrentTime.earliest || isCurrentTimeBetweenSessionStartAndEndTime) ? styles.solidCard : props.sessionStatus==='allotted' ? styles.solidCard: styles.cardContainer} ${getConditionsForOutlinedCard(props) && styles.outlinedCard}`}>
                <div className={`${styles.cardBody} ${styles.lessMargin}`} >
                    <div className={styles.cardIcon}>
                        {getCardIcon()}
                    </div>
                    <div className={styles.gradeAndTitle}>
                        {
                            get(props, 'grades', []).map((grade, i) => {
                                if (get(props, 'grades', []).length === 1) {
                                    return <span className={`${styles.classGrade}`}>{`${getGrade(grade)}-${props.sections[i]}`}</span>
                                }
                                if (i === get(props, 'grades', []).length - 1) {
                                    return <span className={`${styles.classGrade}`}>{`${getGrade(grade)}-${props.sections[i]}`}</span>
                                }
                                return <span className={`${styles.classGrade}`}>{`${getGrade(grade)}-${props.sections[i]}, `}</span>
                            })
                        }
                        {!isLessThanOneHourSession || isSub30MinutesSession || sub60Flag ? <p>{get(props, 'title')}</p> : <p className={styles.classTime} style={{ fontSize: isLessThanOneHourSession ? hs(12) : hs(16) }}>{`${getTimeFormat(props.start, '', props.startMinutes, props.id)} - ${getTimeFormat(props.end, props.start, props.endMinutes, props.id)}`}</p>}
                    </div>
                </div>
                {(!isLessThanOneHourSession || isSub30MinutesSession || sub60Flag) && <span className={`${styles.classTime}`}>{`${getTimeFormat(props.start, '', props.startMinutes, props.id)} - ${getTimeFormat(props.end, props.start, props.endMinutes, props.id)}`}</span>}

            </div>}
        </div>
    }

    return <div ref={cardRef} style={isLessThanOneHourSession ? { position: 'relative', overflow: 'visible',height:getCardHeight() } : {height:getCardHeight()}} onMouseEnter={() => toggleCardView()} onMouseLeave={() => { setSub60Flag(false); setWithBoxShadow(false); setIsTooltipVisible(false) }}>

        {<div className={`${styles.cardContainer} ${getColorThemeForCard(props.sessionStatus)} ${((props.isSessionClosestToCurrentTime.earliest && localStorage.getItem('someSessionIsInProgress')!=='true') || (isCurrentTimeBetweenSessionStartAndEndTime && localStorage.getItem('someSessionIsInProgress')!=='true' ) || (sessionId===get(props,'id'))) ? styles.solidCard : (props.sessionStatus==='allotted' && localStorage.getItem('someSessionIsInProgress')!=='true') ? styles.solidCard: `${styles.cardContainer} ${props.sessionStatus==='allotted' && styles.outlinedCard}`} ${getConditionsForOutlinedCard(props) && styles.outlinedCard}`}>
            <div className={`${styles.cardBody}`} style={isLessThanOneHourSession?{marginBottom:0}:{}}>
                <div className={styles.cardIcon} >
                    {getCardIcon()}
                </div>
                <div className={styles.gradeAndTitle}>
                    {
                        get(props, 'grades', []).map((grade, i) => {
                            if (get(props, 'grades', []).length === 1) {
                                return <span className={`${styles.classGrade}`}>{`${getGrade(grade)}-${props.sections[i]}`}</span>
                            }
                            if (i === get(props, 'grades', []).length - 1) {
                                return <span className={`${styles.classGrade}`}>{`${getGrade(grade)}-${props.sections[i]}`}</span>
                            }
                            return <span className={`${styles.classGrade}`}>{`${getGrade(grade)}-${props.sections[i]}, `}</span>
                        })
                    }
                    {!isLessThanOneHourSession || isSub30MinutesSession ? <p>{get(props, 'title')}</p> : <p className={styles.classTime} style={{ fontSize: isLessThanOneHourSession ? hs(12) : hs(16) }}>{`${getTimeFormat(props.start, '', props.startMinutes, props.id)} - ${getTimeFormat(props.end, props.start, props.endMinutes, props.id)}`}</p>}
                </div>
            </div>
            {(!isLessThanOneHourSession || isSub30MinutesSession) && <span className={styles.classTime}>{`${getTimeFormat(props.start, '', props.startMinutes, props.id)} - ${getTimeFormat(props.end, props.start, props.endMinutes, props.id)}`}</span>}

        </div>}

        {isTooltipVisible && <div style={{ height: hs(81), position: 'absolute', top: '0' }} className={`isTooltip ${styles.cardContainer} ${withBoxShadow && styles.withBoxShadow} ${getColorThemeForCard(props.sessionStatus)} ${((props.isSessionClosestToCurrentTime.earliest && localStorage.getItem('someSessionIsInProgress')!=='true') || isCurrentTimeBetweenSessionStartAndEndTime) ? styles.solidCard : props.sessionStatus==='allotted' ? styles.solidCard: styles.cardContainer} ${getConditionsForOutlinedCard(props) && styles.outlinedCard}`}>
            <div className={`${styles.cardBody} ${styles.lessMargin}`} >
                <div className={styles.cardIcon}>
                    {getCardIcon()}
                </div>
                <div className={styles.gradeAndTitle}>
                    {
                        get(props, 'grades', []).map((grade, i) => {
                            if (get(props, 'grades', []).length === 1) {
                                return <span className={`${styles.classGrade}`}>{`${getGrade(grade)}-${props.sections[i]}`}</span>
                            }
                            if (i === get(props, 'grades', []).length - 1) {
                                return <span className={`${styles.classGrade}`}>{`${getGrade(grade)}-${props.sections[i]}`}</span>
                            }
                            return <span className={`${styles.classGrade}`}>{`${getGrade(grade)}-${props.sections[i]}, `}</span>
                        })
                    }
                    {!isLessThanOneHourSession || isSub30MinutesSession || sub60Flag ? <p>{get(props, 'title')}</p> : <p className={styles.classTime} style={{ fontSize: isLessThanOneHourSession ? hs(12) : hs(16) }}>{`${getTimeFormat(props.start, '', props.startMinutes, props.id)} - ${getTimeFormat(props.end, props.start, props.endMinutes, props.id)}`}</p>}
                </div>
            </div>
            {(!isLessThanOneHourSession || isSub30MinutesSession || sub60Flag) && <span className={`${styles.classTime}`}>{`${getTimeFormat(props.start, '', props.startMinutes, props.id)} - ${getTimeFormat(props.end, props.start, props.endMinutes, props.id)}`}</span>}

        </div>}
    </div>
}

export default ClassCard