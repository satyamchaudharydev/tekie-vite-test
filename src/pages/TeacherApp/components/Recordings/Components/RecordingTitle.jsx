import React from "react"
import "./RecordingTitle.scss"
import ClockIcon from "../../../../../assets/teacherApp/classroom/clock.svg"
import ShareIcon from "../../../../../assets/teacherApp/classroom/Component 10 (1).svg"

function RecordingTitleComponent() {
    return <>
     <section class="recording_heading_container">
        <div class="title_main_container_recording">
            <div class="serial_no_recording">S. No.</div>
            <div class="session_name_recording">Session Name</div>
            <div class="session_type_recording">Session Type</div>
            <div class="session_time_recording">
               <img src={ClockIcon} />
                </div>
                <div class="session_date_recording">Date</div>

            </div>
        </section>
    </>
}

export default RecordingTitleComponent