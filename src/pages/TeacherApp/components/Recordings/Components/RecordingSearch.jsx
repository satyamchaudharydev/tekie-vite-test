import React from "react";
import "./RecordingSearch.scss";
import { get } from "lodash";

import BatchIcon from "../../../../../assets/teacherApp/classroom/Batch.svg";
import SearchIcon from "../../../../../assets/teacherApp/classroom/Search.svg";
function RecordingSearchComponent({ setSearchTerm, value }) {
  const className = value.classnameDetails && value.classnameDetails.toJS();
  const className1 = get(className, "classroomData.classroomTitle", "");
  return (
    <>
      <section class="recording_container">
        <div class="main_container_recording">
          <div class="title_section">
            <div class="recording_section_title">
              Completed Session Recordings
            </div>
            <div class="current_class">
              <div>
                <img style={{ marginRight: "8px" }} src={BatchIcon} />
              </div>
              <div>{className1}</div>
            </div>
          </div>
          <div class="search_bar">
            <input
              class="input_search_tag"
              placeholder="Search"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img src={SearchIcon} />
          </div>
        </div>
      </section>
    </>
  );
}

export default RecordingSearchComponent;
