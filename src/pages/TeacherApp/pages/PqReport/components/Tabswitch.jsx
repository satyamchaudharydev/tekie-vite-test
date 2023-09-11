import React,{useState} from "react";
import { get } from "lodash";
import "./Tabswitch.scss";
import Select from "react-select";
import getThemeColor from "../../../../../utils/teacherApp/getThemeColor";
function Tabswitch({ setRoute, route, newTopicDetailDataPq,setCurrentStudentId }) {
  const studentList = get(newTopicDetailDataPq, "batch.students", []);
  const [currentValue , setCurrentValue] = useState()

 

  const customStyles = {
    option: (styles) => ({
      ...styles,
      cursor: 'pointer',
      fontFamily: 'Inter',
      fontSize: '13px',
    }),
    control: (styles) => ({
      ...styles,
      cursor: 'pointer',
      fontFamily: 'Inter',
      minHeight: '32px',
      maxHeight: '32px',
      border: '1px solid #EEEEEE',
      boxShadow: '0 0 0 0px black',
      borderRadius: '8px',
      
      '&:hover': {
        border: '1px solid #EEEEEE',
        boxShadow: '0 0 0 0px black',
      }
    }),
    placeholder: (styles) => ({
      ...styles,
      fontSize: '13px',
      top: '45%',
      color: 'black',
    }),
    singleValue: (styles) => ({
      ...styles,
      fontSize: '13px',
      top: '45%',
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      padding: '0px 8px 0px',
      color: '#757575',
      height: '16',
      width: '16',
      '&:hover': {
        color: '#0C0C0C'
      },
      'svg > path': {
        height: '16',
      }
    })
  }
  const newStyles = {
    ...customStyles,
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      cursor: 'pointer',
      fontFamily: 'Inter',
      fontSize: '14px',
      backgroundColor: isSelected ? getThemeColor() : null,
      color: isSelected ?"#EEEEEE": "rgba(0,0,0,0.4)",
      '&:hover': {
        backgroundColor: getThemeColor(),
        color: "#FFFFFF"
      }
    }),
    indicatorSeparator:(styles) => ({
      ...styles,
      display:'none'
    }),
    control: (styles) => ({
      ...styles,
      cursor: 'pointer',
      fontFamily: 'Inter',
      minHeight: '36px',
      maxHeight: '36px',
      border: '1px solid #EEEEEE',
      boxShadow: '0 0 0 0px black',
      borderRadius: '8px',
      '&:hover': {
        border: '1px solid #EEEEEE',
        boxShadow: '0 0 0 0px black',
      }
    }),
    placeholder: (styles) => ({
      ...styles,
      fontSize: '14px',
      top: '50%',
      color: 'rgba(0,0,0,0.4)',
      fontWeight: '400'
    }),
    singleValue: (styles) => ({
      ...styles,
      fontSize: '14px',
      top: '50%',
      color:"rgba(0,0,0,0.4)",
    }),
    // dropdownIndicator: (styles) => ({
    //   ...styles,
    //   padding: '4px 8px 8px',
    //   color: '#AAA',
    //   height: '16',
    //   width: '16',
    //   '&:hover': {
    //     color: '#AAA'
    //   },
    //   'svg > path': {
    //     height: '16',
    //   }
    // }),
    valueContainer: (styles) => ({
      ...styles,
      padding: '0px 0px 8px 12px'
    }),
    input: (styles) => ({
      ...styles,
      color: 'transparent'
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '140px',
      "::-webkit-scrollbar": {
        width: "4px"
      },
      "::-webkit-scrollbar-thumb": {
        background: "#8C61CB"
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: "#8C61CB"
      },
    })
  }
  

  function studentListMaker() {
    let newArray = [];
    for (let index = 0; index < studentList.length; index++) {
      const element = studentList[index];
      
      newArray.push({ value: element.user.id, label: element.user.name ,id:element.user.id});
      
    }

    return newArray;
  }
  function firstStudentMaker(is) {
    
    let newArray = [];
    if (studentList.length > 0) {
      const element = studentList[0];
      newArray.push({ value: element.user.id, label: element.user.name });
    }

    return newArray[0];
  }
 

  const MyComponent = () => {
    return (
      <>
        <Select
          options={studentListMaker()}
          defaultValue={firstStudentMaker()}
          className="select__list"
          isSearchable={false}
          value = {currentValue}
          styles={newStyles}
          onChange={(values)=>{
            
            setCurrentValue(values)
            setCurrentStudentId(values.id)}}
        />
      </>
    );
  };

  return (
    <>
      <div style={{ height: "30px" }}>
        <div
          style={{
            display: "flex",
            marginTop: "30px",
            
            width: "100%",
          }}
        >
          <div
            style={{ color: route === "questions" ? "#8c61cb" : "#212121" }}
            onClick={() => setRoute("questions")}
            className="questions__pq"
          >
            Questions
            {route === "questions" && (
              <hr
                style={{
                  border: "2px solid #8c61cb",
                  backgroundColor: "#8c61cb",
                  marginTop: "5px",
                  borderRadius:"30px"
                }}
              ></hr>
            )}
          </div>
          <div
            style={{
              color: route === "students" ? "#8c61cb" : "#212121",
              opacity: route === "students" ? "1" : "0.4",
            }}
            onClick={() => setRoute("students")}
            className="students__pq"
          >
            Student-wise
            {route === "students" && (
              <hr
                style={{
                  border: "2px solid #8c61cb",
                  backgroundColor: "#8c61cb",
                  marginTop: "5px",
                }}
              ></hr>
            )}
          </div>
        </div>
       {route === "students" && <MyComponent />} 
      </div>
    </>
  );
}

export default Tabswitch;
