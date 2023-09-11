import React from "react";
import classes from "./SingleStudent.module.scss";

const SingleStudent = ({
  userId,
  avatar,
  grade,
  section,
  name,
  selectedUserId,
  setSelectedUserId,
}) => {
  const isStudentSelected = selectedUserId === userId;

  const renderGradeAndSection = (grade, section) => {
    return `${grade.split("e")[1]}${section}`;
  };

  const selectUser = () => {
    if(userId === selectedUserId) setSelectedUserId("")
    else setSelectedUserId(userId);
  };

  return (
    <div
      className={`${classes.singleStudentWrapper} ${isStudentSelected &&
        classes.selected}`}
      onClick={selectUser}
    >
      <img src={avatar} alt="" />
      <p className={classes.gradeSectionDetails}>
        {renderGradeAndSection(grade, section)} - {name}
      </p>      
    </div>
  );
};

export default SingleStudent;
