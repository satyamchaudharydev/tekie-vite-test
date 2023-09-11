import React from "react"
import "./HomeworkProgressBar.scss"


function HomeworkProgressBar() {
    return <>
    
        <section className="homework_progress_bar_section">
        <span className="Loading_homework_text">Loading Homework</span>
            <div className="homework_progress_bar">
            <div className="progress-bar">
                <div className="progress-bar-value"></div>
            </div>
            </div>
            
        </section>
    </>
}

export default HomeworkProgressBar