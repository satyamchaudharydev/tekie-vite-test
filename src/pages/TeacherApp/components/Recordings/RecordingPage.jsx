import React, { useEffect , useState } from "react"
import "./RecordingPage.scss"
import RecordingTitleComponent from "./Components/RecordingTitle"
import RecordingDescription from "./Components/RecordingDescription"
import RecordingSearchComponent from "./Components/RecordingSearch"
import getRecording from "../../../../queries/teacherApp/fetchRecordingData.js"
import {useLocation} from "react-router-dom"



function RecordingPage(props) {

    const [searchTerm , setSearchTerm] = useState("")
    const {search} = useLocation();
    const batchIdFromQuery = new URLSearchParams(search).get('id');
    

    useEffect(() => {
        getRecording(batchIdFromQuery)
    }, [batchIdFromQuery])

    return <>
        <div class="recording_parent_container">
            <RecordingSearchComponent value={props} setSearchTerm={setSearchTerm}/>
            <RecordingTitleComponent />
            <RecordingDescription value={props} searchTerm={searchTerm}/>
        </div>
    </>
}

export default RecordingPage