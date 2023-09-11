import React from "react"
import "./CourseHeading.scss"
import SessionIcon from "../../../../../assets/teacherApp/classroom/Icon.svg"


function CoursesHeading({totalSessions}){
    return <>
      <section className="course_heading_container">
            <div className="heading_name">Sessions</div>
            <div className="total_sessions_number">
              <img style={{marginRight:"10px"}} src={SessionIcon} />
              Total Sessions <span style={{color: 'black', fontWeight: '500', paddingLeft: '3px'}}>{totalSessions}</span>
              </div>
      </section>
    </>
}

export default CoursesHeading