import React from 'react'



const TeacherAppTimeGridDayHeader
    = () => {

        return <div className='fullcalendar-timeGrid-header-date'>
            <div className='class-status-container' >
                <div className='class-status'>
                    <div className='class-status-badge yet-to-begin'></div>
                    <span className='class-status-text'>Yet to begin</span>
                </div>
                <div className='class-status'>
                    <div className='class-status-badge in-progress'></div>
                    <span className='class-status-text'>In Progress</span>
                </div>
                <div className='class-status'>
                    <div className='class-status-badge completed'></div>
                    <span className='class-status-text'>Completed</span>
                </div>
                <div className='class-status'>
                    <div className='class-status-badge unattended'></div>
                    <span className='class-status-text'>Unattended</span>
                </div>
            </div>
        </div>
    }

export default TeacherAppTimeGridDayHeader
