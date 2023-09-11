import React, { useEffect, useState } from "react";
import "./AdminFilter.scss";
import DropdownIcon from "../../../../../assets/teacherApp/classroom/Chevron Down.svg";
import { get } from "lodash";
import getClassroomSessions from "../../../../../queries/teacherApp/getClassroomSessions";

function AdminFilter({
  classroomGrades,
  setFilterName,
  setIsFilterModalVisible,
}) {
  const FilterIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.75 5.25H1.25C1.05109 5.25 0.860322 5.17098 0.71967 5.03033C0.579018 4.88968 0.5 4.69891 0.5 4.5C0.5 4.30109 0.579018 4.11032 0.71967 3.96967C0.860322 3.82902 1.05109 3.75 1.25 3.75H14.75C14.9489 3.75 15.1397 3.82902 15.2803 3.96967C15.421 4.11032 15.5 4.30109 15.5 4.5C15.5 4.69891 15.421 4.88968 15.2803 5.03033C15.1397 5.17098 14.9489 5.25 14.75 5.25Z"
        fill="#00ADE6"
      />
      <path
        d="M12.25 8.75H3.75C3.55109 8.75 3.36032 8.67098 3.21967 8.53033C3.07902 8.38968 3 8.19891 3 8C3 7.80109 3.07902 7.61032 3.21967 7.46967C3.36032 7.32902 3.55109 7.25 3.75 7.25H12.25C12.4489 7.25 12.6397 7.32902 12.7803 7.46967C12.921 7.61032 13 7.80109 13 8C13 8.19891 12.921 8.38968 12.7803 8.53033C12.6397 8.67098 12.4489 8.75 12.25 8.75Z"
        fill="#00ADE6"
      />
      <path
        d="M9.25 12.25H6.75C6.55109 12.25 6.36032 12.171 6.21967 12.0303C6.07902 11.8897 6 11.6989 6 11.5C6 11.3011 6.07902 11.1103 6.21967 10.9697C6.36032 10.829 6.55109 10.75 6.75 10.75H9.25C9.44891 10.75 9.63968 10.829 9.78033 10.9697C9.92098 11.1103 10 11.3011 10 11.5C10 11.6989 9.92098 11.8897 9.78033 12.0303C9.63968 12.171 9.44891 12.25 9.25 12.25Z"
        fill="#00ADE6"
      />
    </svg>
  );
  return (
    <>
      <button 
        className="filter_button_students_table"
        onClick={() => setIsFilterModalVisible(true)}
      >
        <FilterIcon /> <span>Filter</span>
      </button>
    </>
  );
}

export default AdminFilter;
