import React, { useState, useEffect, useRef } from "react";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { get, sortBy, update } from "lodash";
import PopUp from "../../../../components/PopUp/PopUp";
import Dropdown, { customStyles } from "../Dropdowns/Dropdown";
import { CalenderSvg, CloseSvg } from "../svg";
import "../updatedModalStyles.scss";
import "./createStudentModalStyles.scss";
import addStudentsData from "../../../../queries/teacherApp/adminapp/addStudentDetails";
import updateStudentsData from "../../../../queries/teacherApp/adminapp/updateIndividualStudent";
import { Toaster, getToasterBasedOnType } from "../../../../components/Toaster";
const newStyles = {
  ...customStyles,
  option: (styles, { isSelected }) => ({
    ...styles,
    cursor: "pointer",
    backgroundColor: isSelected ? "#8C61CB" : null,
    "&:hover": {
      backgroundColor: "#f5f5f5",
      color: "#000",
    },
  }),
  control: (styles) => ({
    ...styles,
    cursor: "pointer",
    border: "1px solid #AAAAAA",
    boxShadow: "0 0 0 0px black",
    "&:hover": {
      border: "1px solid #AAAAAA",
      boxShadow: "0 0 0 0px black",
    },
  }),
  input: (styles) => ({
    ...styles,
    color: "transparent",
  }),
};


const CreateStudentModal = (props) => {

  const validationSchema = yup.object().shape({
    selectedSection: yup.object({
      label: yup.string().required(`Section Required`),
    }),
    selectedGrade: yup.object({
      label: yup.string().required(`Grade Required`),
    }),
    classroomName: yup
      .string()
      .trim()
      .required("Classroom Name required")
      .min(3, "Classroom Name (Min. 3 characters)")
      .max(30, "Classroom Name (Max. 30 characters)"),
    studentName: yup
      .string()
      .trim()
      .required("Student Name required")
      .min(3, "Classroom Name (Min. 3 characters)")
      .max(30, "Classroom Name (Max. 30 characters)"),
    parentName: yup
      .string()
      .trim()
      .required("Parent Name required")
      .min(3, "Classroom Name (Min. 3 characters)")
      .max(30, "Classroom Name (Max. 30 characters)"),
    phoneNumber: yup
      .string()
      .required("Phone Number Required")
      .matches(/^[6-9]\d{9}$/, "Phone (Invalid format)"),
    email: yup
      .string()
      .required("Email Required")
      .email("Email (Invalid format)"),
    rollNumber: yup
      .string()
      .required("Roll Number Required")
      .min(1, "Roll Number (Min. 3 characters)")
      .max(30, "Roll Number (Max. 15 characters)"),
    password: yup
      .string()
      .trim()
      .required("Password required")
      .min(3, "Password (Min. 3 characters)")
      .max(30, "Password (Max. 30 characters)"),
    confirmPassword: yup.string().when("password", {
      is: (val) => (val && val.length > 0 ? true : false),
      then: yup.string().oneOf([yup.ref("password")], "Password do not match"),
    }),
  });
  const validationSchemaEdit = yup.object().shape({
    selectedSection: yup.object({
      label: yup.string().required(`Section Required`),
    }),
    selectedGrade: yup.object({
      label: yup.string().required(`Grade Required`),
    }),
    studentName: yup
      .string()
      .trim()
      .required("Student Name required")
      .min(3, "Classroom Name (Min. 3 characters)")
      .max(30, "Classroom Name (Max. 30 characters)"),
    parentName: yup
      .string()
      .trim()
      .required("Parent Name required")
      .min(3, "Classroom Name (Min. 3 characters)")
      .max(30, "Classroom Name (Max. 30 characters)"),
    phoneNumber: yup
      .string()
      .required("Phone Number Required")
      .matches(/^[6-9]\d{9}$/, "Phone (Invalid format)"),
    email: yup
      .string()
      .required("Email Required")
      .email("Email (Invalid format)"),
    password: yup
      .string()
      .trim()
      .required("Password required")
      .min(3, "Password (Min. 3 characters)")
      .max(30, "Password (Max. 30 characters)"),
    confirmPassword: yup.string().when("password", {
      is: (val) => (val && val.length > 0 ? true : false),
      then: yup.string().oneOf([yup.ref("password")], "Password do not match"),
    }),
  });






  const classroomGrades =
    props.value.classroomGrades &&
    props.value.classroomGrades.toJS()[0].classes;
  const formRef = useRef();

  const [value10, setValue10] = useState(false);
  let value11;
  const singleStudent = props.individualStudentData;

  const [initialFormikValues, setInitialFormikValues] = useState(
    props.editOrAdd === "add"
      ? {
        selectedGrade: { value: "", label: "" },
        selectedSection: { value: "", label: "", id: "" },
        classroomName: "",
        studentName: "",
        parentName: "",
        phoneNumber: "",
        email: "",
        rollNumber: "",
        password: "",
        confirmPassword: "",
      }
      : {
        selectedGrade: {
          value: get(singleStudent, "grade", ""),
          label: get(singleStudent, "grade", ""),
        },
        selectedSection: {
          value: get(singleStudent, "section", ""),
          label: get(singleStudent, "section"),
          id: "",
        },
        studentName: get(singleStudent, "singleStudentName.name", ""),
        parentName: get(singleStudent, "parents[0].user.name", ""),
        phoneNumber: get(singleStudent, "parents[0].user.phone.number", ""),
        email: get(singleStudent, "parents[0].user.email", ""),
        rollNumber: get(singleStudent, "rollNo"),
        password: "",
        confirmPassword: "",
      }
  );

  function handleSaveNextClick(values) {
    addStudentsData(values);

  }

  function handleUpdateClick(values, singleData) {
    updateStudentsData(values, singleData);

  }

  const extractGrades = (classroomGrades) => {
    const arrayGrade = [];
    for (let index = 0; index < classroomGrades.length; index++) {
      const element = classroomGrades[index];
      const grade = get(element, "grade", "");

      arrayGrade.push({ value: grade, label: `${grade}` });
    }
    function uniqueBtKeepLast(data, key) {
      return [
        ...(new Map(
          data.map(x => [key(x), x])
        ).values())
      ]
    }

    return uniqueBtKeepLast(arrayGrade, it => it.value)
  };


  const extractSection = (classroomGrades) => {
    const arrayGrade = [];
    for (let index = 0; index < classroomGrades.length; index++) {
      const element = classroomGrades[index];
      const grade = get(element, "section", "");
      arrayGrade.push({ value: grade, label: `${grade}` });
    }

    function uniqueBtKeepLast(data, key) {
      return [
        ...new Map(
          data.map(x => [key(x), x])
        ).values()
      ]
    }
    return uniqueBtKeepLast(arrayGrade, it => it.value)
  };

  const renderModalHeader = () => (
    <>
      <div className="header-icon">
        <CalenderSvg />
      </div>
      <div className="header-details-single">
        <div className="modal__header-title-single">Add a new student</div>
      </div>
    </>
  );

  const renderModalMain = (
    values,
    handleChange,
    setFieldValue,
    touched,
    errors
  ) => {
    value11 =
      props.editOrAdd === "add"
        ? get(values, "classroomName", "").length > 0 &&
        get(values, "confirmPassword", "").length > 0 &&
        get(values, "email", "").length > 0 &&
        get(values, "parentName", "").length > 0 &&
        get(values, "", "password").length > 0 &&
        get(values, "phoneNumber", "").length > 0 &&
        get(values, "rollNumber", "").length > 0 &&
        get(values, "selectedGrade.value", "").length > 0 &&
        get(values, "selectedSection.value", "").length > 0
        :
        get(values, "confirmPassword", "").length > 0 &&
        get(values, "email", "").length > 0 &&
        get(values, "parentName", "").length > 0 &&
        get(values, "", "password").length > 0 &&
        get(values, "phoneNumber", "").length > 0 &&
        get(values, "rollNumber", "").length > 0 &&
        get(values, "selectedGrade.value", "").length > 0 &&
        get(values, "selectedSection.value", "").length > 0;

    if (value11) {
      setValue10(value11);
    } else {
      setValue10(false);
    }

    return (
      <>
        {props.editOrAdd === "add" && (
          <div className="modal__row-single">
            <div className="modal__dropdown-full-input">
              <label>
                School Name
                <span style={{ color: "red" }}>*</span>
              </label>
              <input
                className="modal__full-input"
                name="classroomName"
                // value={individualStudentData.studentName?"": values.classroomName}
                onChange={(e) => setFieldValue("classroomName", e.target.value)}
                placeholder="School Name"
              ></input>
            </div>

            {get(errors, "classroomName") && get(touched, "classroomName") ? (
              <span className="modal__error-span"> {errors.classroomName}</span>
            ) : null}
          </div>
        )}
        <div className="modal__row-double">
          <div className="modal__dropdown">
            <label>
              Grade
              {get(errors, "selectedGrade.label") &&
                get(touched, "selectedGrade.label") ? (
                <span style={{ color: "red" }}>*</span>
              ) : (
                <span style={{ color: "red" }}>*</span>
              )}
            </label>

            <Dropdown
              components={{ IndicatorSeparator: () => null }}
              name="selectedGrade"
              placeholder={
                values.selectedGrade.label
                  ? values.selectedGrade.label
                  : "Grade"
              }
              isMulti={false}
              className="classModal-select"
              classNamePrefix="classModal-select"
              styles={newStyles}
              defaultValue={{
                label: values.selectedGrade.label,
                value: values.selectedGrade.value,
              }}
              options={extractGrades(classroomGrades)}
              onChange={(option) => {
                console.log(option);
                setFieldValue("selectedGrade", {
                  value: option.value,
                  label: option.label,
                });
              }}
            ></Dropdown>
          </div>
          <div className="modal__dropdown">
            <label>
              Section
              <span style={{ color: "red" }}>*</span>
            </label>
            <Dropdown
              components={{ IndicatorSeparator: () => null }}
              name="selectedSection"
              placeholder={
                values.selectedSection.label
                  ? values.selectedSection.label
                  : "Section"
              }
              defaultValue={{
                label: values.selectedSection.label,
                value: values.selectedSection.value,
              }}
              isMulti={false}
              className="classModal-select"
              classNamePrefix="classModal-select"
              styles={newStyles}
              options={extractSection(classroomGrades)}
              onChange={(option) =>
                setFieldValue("selectedSection", {
                  value: option.value,
                  label: option.label,
                })
              }
            ></Dropdown>
          </div>
        </div>

        <div className="modal__row-single-error">
          {get(errors, "selectedGrade") && get(touched, "selectedGrade") ? (
            <span className="modal__error-span">
              {" "}
              {errors.selectedGrade.label}
            </span>
          ) : get(errors, "selectedSection") &&
            get(touched, "selectedSection") ? (
            <span className="modal__error-span">
              {" "}
              {errors.selectedSection.label}
            </span>
          ) : null}
        </div>
        <div className="modal__row-single">
          <div className="modal__dropdown-full-input">
            <label>
              Student Name
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="modal__full-input"
              name="classroomName"
              value={values.studentName}
              placeholder="Student Name"
              onChange={(e) => setFieldValue("studentName", e.target.value)}
            ></input>
          </div>
          {get(errors, "studentName") && get(touched, "studentName") ? (
            <span className="modal__error-span"> {errors.studentName}</span>
          ) : null}
        </div>
        <div className="modal__row-single">
          <div className="modal__dropdown-full-input">
            <label>
              Parent Name
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="modal__full-input"
              name="classroomName"
              value={values.parentName}
              placeholder="Parent Name"
              onChange={(e) => setFieldValue("parentName", e.target.value)}
            ></input>
          </div>
          {get(errors, "parentName") && get(touched, "parentName") ? (
            <span className="modal__error-span"> {errors.parentName}</span>
          ) : null}
        </div>
        <div className="modal__row-single">
          <div className="modal__dropdown-full-input">
            <label>
              Phone Number
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="modal__full-input"
              name="classroomName"
              type="number"
              value={values.phoneNumber}
              onChange={(e) => setFieldValue("phoneNumber", e.target.value)}
              placeholder="Phone number"
            ></input>
          </div>
          {get(errors, "parentName") && get(touched, "parentName") ? (
            <span className="modal__error-span"> {errors.phoneNumber}</span>
          ) : null}
        </div>
        <div className="modal__row-single">
          <div className="modal__dropdown-full-input">
            <label>
              Email
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="modal__full-input"
              name="email"
              value={values.email}
              onChange={(e) => setFieldValue("email", e.target.value)}
              placeholder="Enter Email"
            ></input>
          </div>
          {get(errors, "email") && get(touched, "email") ? (
            <span className="modal__error-span"> {errors.email}</span>
          ) : null}
        </div>

        <div className="modal__row-single">
          <div className="modal__dropdown-full-input">
            <label>
              Roll Number
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="modal__full-input"
              name="rollNumber"
              type="number"
              value={values.rollNumber}
              disabled={props.editOrAdd === "add" ? false : true}
              onChange={(e) => setFieldValue("rollNumber", e.target.value)}
              placeholder="Enter roll no."
            ></input>
          </div>
          {get(errors, "rollNumber") && get(touched, "rollNumber") ? (
            <span className="modal__error-span"> {errors.rollNumber}</span>
          ) : null}
        </div>
        <div className="modal__row-single">
          <div className="modal__dropdown-full-input">
            <label>
              Password
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="modal__full-input"
              name="classroomName"
              type="password"
              value={values.password}
              onChange={(e) => setFieldValue("password", e.target.value)}
              placeholder="Enter password"
            ></input>
          </div>
          {get(errors, "password") && get(touched, "password") ? (
            <span className="modal__error-span"> {errors.password}</span>
          ) : null}
        </div>
        <div className="modal__row-single">
          <div className="modal__dropdown-full-input">
            <label>
              Confirm Password
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="modal__full-input"
              name="classroomName"
              type="password"
              value={values.confirmPassword}
              onChange={(e) => setFieldValue("confirmPassword", e.target.value)}
              placeholder="Confirm password"
            ></input>
          </div>
          {get(errors, "confirmPassword") && get(touched, "confirmPassword") ? (
            <span className="modal__error-span"> {errors.confirmPassword}</span>
          ) : null}
        </div>
      </>
    );
  };

  const renderFooter = (values, handleChange, setFieldValue) => {
    return (
      <>
        {/* {
          tabStates.includes(activeTab) && (
            <> */}
        <button
          className="modal__cancel-btn"
        // disabled={buttonClicked}
        // onClick={() => handleCancelPrevClick(handleChange, setFieldValue)}
        >
          Cancel
        </button>
        <div className="modal__button-container">
          <button
            className="modal__contact-btn"
          // onClick={() => props.showContactInfo()}
          >
            Contact Us
          </button>
          <button
            className={
              // isSubmitting ? 'modal__save-btn-loading' :
              // isNext ? 'modal__next-btn-loading' :
              // activeTab !== 'Step 2' ? 'modal__save-btn' :
              // (activeTab === 'Step 2' && values.selectedCourse.label) ? 'modal__save-btn' :
              value10 ? "modal__save-btn" : "modal__disabled-btn"
            }
            htmlType="submit"
            // disabled={buttonClicked}
            disabled={value10 ? false : true}
            // style={{ backgroundColor : value10 ? "#CCCCCC": "linear-gradient(280.79deg, #1178E6 2.79%, #0296C7 98.42%)"}}
            onClick={async () => {
              // setButtonClicked(true)
              let errors = await formRef.current.validateForm();

              if (
                Object.keys(errors).length === 0 &&
                errors.constructor === Object
              ) {
                props.editOrAdd === "add"
                  ? handleSaveNextClick(values)
                  : handleUpdateClick(values, props.individualStudentData);
              } else {
                console.log("Still errors left in form", errors);
              }
            }}
          >
            {props.editOrAdd === "add" ? "Confirm and Go Next" : "Update"}
          </button>
        </div>
        {/* </>
          )
        } */}
      </>
    );
  };

  return (
    <PopUp showPopup={true}>
      <div className="modal__container-backdrop">
        <div className="teacher-modal-popup">
          <div className="teacher-modal-container">
            <div
              className="modal__close-icon"
              onClick={() => props.closeModal()}
            >
              <CloseSvg />
            </div>
            <div className="modal__header">{renderModalHeader()}</div>
            <Formik
              initialValues={initialFormikValues}
              validationSchema={props.editOrAdd === "add" ? validationSchema : validationSchemaEdit}
              innerRef={formRef}
              validateOnBlur
            >
              {({ values, handleChange, setFieldValue, touched, errors }) => (
                <Form>
                  <div className="modal__fixed-content">
                    {true && (
                      // <div className={activeTab !== 'Step 3' ? 'modal__top-content' : 'modal__top-content-students'}>
                      <div className="top-content">
                        {/* {activeTab === 'Step 1' && renderThumbnailRow(values, setFieldValue)} */}
                        {renderModalMain(
                          values,
                          handleChange,
                          setFieldValue,
                          touched,
                          errors,

                        )}
                      </div>
                    )}
                  </div>
                  <div className="modal__footer">
                    {renderFooter(values, handleChange, setFieldValue)}
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </PopUp>
  );
};

export default CreateStudentModal;
