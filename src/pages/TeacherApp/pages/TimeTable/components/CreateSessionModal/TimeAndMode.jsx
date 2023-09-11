import React, { useState, useEffect } from 'react'
import { setHours, setMinutes } from 'date-fns'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import Dropdown, { customStyles } from '../../../../components/Dropdowns/Dropdown'
import {
    sessionOptions,
} from '../../../../components/Dropdowns/fillerData'
const modeContainerStyles = {
    ...customStyles,
    dropdownIndicator: (styles) => ({
        ...styles,
        padding: '4px 2px 8px',
        color: '#0c0c0c',
        height: '16',
        width: '16',
        '&:hover': {
            color: '#0c0c0c'
        },
        'svg > path': {
            height: '16',
        }
    })
}

const TimeAndMode = ({ dayTimeObj, dayTimeGrid, setDayTimeGrid, columns }) => {
    const [startTime, setStartTime] = useState(new Date())
    const [endTime, setEndTime] = useState(moment(startTime).add(30, 'm').toDate())

    useEffect(() => {
        if (!dayTimeObj.isChecked) return
        if (dayTimeObj.startTime && dayTimeObj.endTime) return
        let currentDayIndex
        for (let pointer = 0; pointer < dayTimeGrid.length; pointer++) {
            if (dayTimeGrid[pointer].day === dayTimeObj.day) {
                currentDayIndex = pointer
            }
        }
        setDayTimeGrid(prevDayTimeGrid => {
            if (!dayTimeObj.startTime)
                dayTimeObj.startTime = startTime.toISOString()
            if (!dayTimeObj.endTime)
                dayTimeObj.endTime = !dayTimeObj.endTime && endTime.toISOString()
            prevDayTimeGrid[currentDayIndex] = dayTimeObj
            return prevDayTimeGrid
        })
    }, [dayTimeGrid])

    const getIncludeTimes = (startDate) => {
        const includeTimesList = []
        for(let i= 30; i<=91; i++){
          const endTime = moment(startDate).add(i, 'm').toDate()
          includeTimesList.push(endTime);
        }
        return includeTimesList
      }

    useEffect(() => {    
        const newEndTime= moment(startTime).add(30, 'm').toDate()
        const updatedDayTimeGrid = dayTimeGrid.map(obj => obj.day === dayTimeObj.day ? { ...obj, endTime: moment(newEndTime).format() } : obj)
        setDayTimeGrid(updatedDayTimeGrid)
        setEndTime(newEndTime)
    }, [startTime])

    const handleStartTime = (date) => {  
        const updatedDayTimeGrid = dayTimeGrid.map(obj => obj.day === dayTimeObj.day ? { ...obj, startTime: moment(date).format() } : obj)
        setDayTimeGrid(updatedDayTimeGrid)
        setStartTime(date)
    }

    const handleEndTime = (date) => {
        const updatedDayTimeGrid = dayTimeGrid.map(obj => obj.day === dayTimeObj.day ? { ...obj, endTime: moment(date).format() } : obj)
        setDayTimeGrid(updatedDayTimeGrid)
        setEndTime(date)
    }

    const handleMode = (e) => {
        const updatedDayTimeGrid = dayTimeGrid.map(obj => obj.day === dayTimeObj.day ? { ...obj, mode: e.value } : obj)
        setDayTimeGrid(updatedDayTimeGrid)
    }

    return <div className='time-grid'>
        <div className='time-grid-container'>
            <DatePicker
                disabled={!dayTimeObj.isChecked}
                className='time-container'
                selected={startTime}
                onChange={(date) => handleStartTime(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
            />
        </div>
        <div className='time-grid-container'>
            <DatePicker
                disabled={!dayTimeObj.isChecked}
                className='time-container'
                selected={endTime}
                onChange={(date) => handleEndTime(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                includeTimes={getIncludeTimes(startTime)}
                dateFormat="h:mm aa"
            />
        </div>
        {/* Render this div conditionally */}
        {columns.mode && <div className='time-grid-container'>
            <Dropdown
                defaultValues={'online'}
                className='mode-container'
                placeholder='Online'
                isMulti={false}
                options={sessionOptions}
                styles={modeContainerStyles}
                menuIsOpen={true}
                onChange={(e) => handleMode(e)}
                components={{ IndicatorSeparator: () => null }}
            ></Dropdown>
        </div>}
        {/* Render this div conditionally */}
    </div>
}

export default TimeAndMode