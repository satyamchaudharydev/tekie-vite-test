import React, { useEffect, useState, useRef } from "react";
import { filter, get } from "lodash";
import CreateMentorModal from "../../components/CreateMentorModal/CreateMentorModal";
import CreateStudentModal from "../../components/CreateStudentModal/CreateStudentModal";
import AdminSearchBar from "./components/AdminSearchBar";
import AdminFilter from "./components/AdminFilter";
import AdminStudentTableButton from "./components/AdminStudentTableButton";
import fetchClassroomStudentsData from "../../../../queries/teacherApp/adminapp/fetchStudentDetails";
import fetchClassroomGrades from "../../../../queries/teacherApp/adminapp/fetchSchoolGrades";
import { Toaster, getToasterBasedOnType } from "../../../../components/Toaster";
import FilterModal from "../../pages/TimeTable/components/FilterModal/FilterModal";
import "./styles.scss";
import AllStudentIcon from "./icons";
import { GRADES, SECTIONS } from "./constants";

const tableColumns = [
  "S.No",
  "Student Name",
  "Grades",
  "Roll No.",
  "Parents Name",
  "Email",
  "Phone No.",
  "Action",
];

function Student(props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [individualStudentData, setIndividualStudentData] = useState({});
  const [reload, setReload] = useState(false);
  const [filterOptionsCollection, setFilterOptionsCollection] = useState(
    []
  );

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [editOrAdd, setEditOrAdd] = useState("add");
  const [filterGrades, setFilterGrades] = useState({
    startDate: ``,
    endDate: ``,
    grades: [],
    sections: [],
    courses: [],
    sessionStatus: [],
  });

 

  const studentsData =
    props.classroomStudentsData && props.classroomStudentsData.toJS();

  const classroomGrades =
    props.classroomGrades && props.classroomGrades.toJS()[0];

  const filterGrades1 = filterGrades.grades;
  const filterSection = filterGrades.sections;
  const filterOptions = [GRADES, SECTIONS];
  const filterByCollection = {};

  

  useEffect(() => {
    const newFunction = async () => await fetchClassroomGrades();
    newFunction();
  }, []);

  const classroomGradeStatus =
    props.classroomGradesFetchStatus && props.classroomGradesFetchStatus.toJS();
  useEffect(() => {
    if (
      get(classroomGrades, "classes[0].grade") !== undefined &&
      get(classroomGrades, "classes[0].section") !== undefined
    )
      setFilterGrades({
        ...filterGrades,
        grades: [
          ...filterGrades.grades,
          get(classroomGrades, "classes[0].grade"),
        ],
        sections: [
          ...filterGrades.sections,
          get(classroomGrades, "classes[0].section"),
        ],
      });
  }, [get(classroomGradeStatus, "success", "") === true]);

  useEffect(() => {
    if (props.classroomGrades.toJS()[0] !== undefined) {
      const extractGrades = (classroomGrades) => {
        const arrayGrade = [];
        const arraySection = [];
        for (let index = 0; index < classroomGrades.length; index++) {
          const element = classroomGrades[index];
          const grade = get(element, "grade", "");
          const section = get(element, "section", "");
          arrayGrade.push({
            value: grade,
            label: `${grade}`,
            isChecked: false,
          });
          arraySection.push({
            value: section,
            label: `${section}`,
            isChecked: false,
          });
        }
        function uniqueBtKeepLast(data, key) {
          return [...new Map(data.map((x) => [key(x), x])).values()];
        }
        const newArray = uniqueBtKeepLast(arrayGrade, (it) => it.value);
        const newArraySection = uniqueBtKeepLast(
          arraySection,
          (it) => it.value
        );
        return {
          ...filterOptionsCollection,
          [GRADES]: newArray,
          [SECTIONS]: newArraySection,
        };
      };

      setFilterOptionsCollection(
        extractGrades(props.classroomGrades.toJS()[0].classes)
      );
    }
  }, [props.classroomGrades]);

  useEffect(() => {
    if (
      props.addStudentError &&
      props.addStudentError.toJS().length > 0 &&
      props.addStudentError.toJS()[props.addStudentError.toJS().length - 1]
        .error.errors[0]
    ) {
      getToasterBasedOnType({
        type: "error",
        message: props.addStudentError.toJS()[
          props.addStudentError.toJS().length - 1
        ].error.errors[0].message,
      });
    }
  }, [props.addStudentError]);
  useEffect(() => {
    if (
      props.updateStudentError &&
      props.updateStudentError.toJS().length > 0 &&
      props.updateStudentError.toJS()[
        props.updateStudentError.toJS().length - 1
      ].error.errors[0]
    ) {
      getToasterBasedOnType({
        type: "error",
        message: props.updateStudentError.toJS()[
          props.updateStudentError.toJS().length - 1
        ].error.errors[0].message,
      });
    }
  }, [props.updateStudentError]);

  useEffect(() => {
    if (
      props.addStudentStatus &&
      !get(props.addStudentStatus.toJS(), "loading") &&
      get(props.addStudentStatus.toJS(), "success")
    ) {
      getToasterBasedOnType({
        type: "success",
        message: "Student added successfully",
      });
      closeModal();
    }
  }, [props.addStudentStatus]);
  useEffect(() => {
    if (
      props.updateStudentStatus &&
      !get(props.updateStudentStatus.toJS(), "loading") &&
      get(props.updateStudentStatus.toJS(), "success")
    ) {
      getToasterBasedOnType({
        type: "success",
        message: "Student updated successfully",
      });
    }
  }, [props.updateStudentStatus]);

 
  useEffect(() => {
    fetchClassroomStudentsData(filterGrades1, filterSection, searchTerm);
  }, [
    filterGrades1,
    filterSection,
    searchTerm,
    studentsData.length,
    reload,
  ]);

  useEffect(() => {
    if (
      props.updateStudentStatus &&
      get(props.updateStudentStatus.toJS(), "success", "")
    ) {
      fetchClassroomStudentsData(filterGrades1, filterSection, searchTerm);
    }
  }, [props.updateStudentStatus]);

  function closeModal() {
    setModalOpen(false);
  }

  const RenderHeader = () => {
    return (
      <>
        <span>{`Home > Teacher`}</span>
      </>
    );
  };

  const RenderTeacherTable = () => {
    return (
      <>
        <table className="teacher__table__container">
          <thead>
            <tr className="teacher__table__header__row">
              {tableColumns.map((column) => {
                return <th key={column}>{column}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {studentsData.map((data, idx) => {
              return (
                <tr className="teacher-table-data-row" key={idx}>
                  <td>{idx + 1}</td>
                  <td>{get(data, "singleStudentName.name")}</td>
                  <td>{`${get(data, "grade")}-${get(data, "section")}`}</td>
                  <td>{get(data, "rollNo")}</td>
                  <td>{get(data, "parents[0].user.name")}</td>
                  <td>{get(data, "parents[0].user.email")}</td>
                  <td>{get(data, "parents[0].user.phone.number")}</td>
                  <td
                    onClick={() => {
                      setModalOpen(true);
                      setIndividualStudentData(data);
                      setEditOrAdd("edit");
                    }}
                  >
                    Edit Details
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* </div> */}
        </table>
      </>
    );
  };

  return (
    <>
      <div className="teacher-main-container">
        {modalOpen === true && (
          <CreateStudentModal
            closeModal={closeModal}
            value={props}
            individualStudentData={individualStudentData}
            editOrAdd={editOrAdd}
            setReload={setReload}
          />
        )}
        
        <div className="teacher-header">
          <RenderHeader />
        </div>
        <div className="teacher-table-main-container">
          <div className="student_list_title_container">
            <span className="student_title_list">Student List</span>
            <div className="student_title_box">
              <AllStudentIcon />
              <span className="grade_text_box">
                Grade <span style={{ color: "black" }}>All</span>
              </span>
            </div>
          </div>
          <div className="admin_search_filter_area">
            <AdminSearchBar setSearchTerm={setSearchTerm} />
            <div className="admin_table_buttons_container">
              <AdminFilter setIsFilterModalVisible={setIsFilterModalVisible} />
              <AdminStudentTableButton
                setModalOpen={setModalOpen}
                setIndividualStudentData={setIndividualStudentData}
                setEditOrAdd={setEditOrAdd}
              />
            </div>
          </div>
          {isFilterModalVisible && (
            <FilterModal
              setIsFilterModalVisible={setIsFilterModalVisible}
              filterOptions={filterOptions}
              filterOptionsCollection={filterOptionsCollection}
              setFilterOptionsCollection={setFilterOptionsCollection}
              fetchedCourses={props.classroomStudentsData}
              setFilterClassroomSessionQuery={setFilterGrades}
              students={true}
            />
          )}
          <RenderTeacherTable />
        </div>
      </div>
    </>
  );
}

export default Student;
