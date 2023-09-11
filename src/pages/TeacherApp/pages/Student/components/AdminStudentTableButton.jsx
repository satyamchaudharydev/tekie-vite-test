import React from "react";
import "./AdminStudentTableButton.scss";
function AdminStudentTableButton({
  setModalOpen,
  setIsFilterModalVisible,
  setIndividualStudentData,
  setEditOrAdd
}) {
  const AddIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8 3C8.27614 3 8.5 3.22386 8.5 3.5V12.5C8.5 12.7761 8.27614 13 8 13C7.72386 13 7.5 12.7761 7.5 12.5V3.5C7.5 3.22386 7.72386 3 8 3Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3 8C3 7.72386 3.22386 7.5 3.5 7.5H12.5C12.7761 7.5 13 7.72386 13 8C13 8.27614 12.7761 8.5 12.5 8.5H3.5C3.22386 8.5 3 8.27614 3 8Z"
        fill="white"
      />
    </svg>
  );

  return (
    <>
      {/* <button className='bulk_students_button'>
      <BulkStudentIcon /> <span style={{marginLeft:"10px"}}>Add Bulk Students</span> 
   </button> */}
      <button
        onClick={() => {
          setModalOpen(true);
          setEditOrAdd('add')
          
        }}
        class="individual_student_button"
      >
        <div className="addIcon_image_container">
          <AddIcon />
        </div>
        <span style={{ marginLeft: "10px" }}>Add a Student</span>
      </button>
    </>
  );
}

export default AdminStudentTableButton;
