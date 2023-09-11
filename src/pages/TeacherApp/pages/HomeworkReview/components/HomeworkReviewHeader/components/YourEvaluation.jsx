import React, { useEffect, useState } from "react";
import "./YourEvaluation.scss";
import EvaluationStar from "../../HomeworkReviewImages/evaluationStar.svg";
import { get } from "lodash";
import Button from "../../../../../components/Button/Button";
import fetchEvaluationData from "../../../../../../../queries/teacherApp/fetchEvaluationData";
import { EvaluationContextProvider } from "../../../../Classroom/components/EvaluationModal/contexts/EvaluationContext";
import EvaluationModal from "../../../../Classroom/components/EvaluationModal/EvaluationModal";
import { getsortedEvaluationData } from "../../../../Classroom/ClassroomDetails/ClassroomDetails.helpers";

function YourEvaluation({ star, tags, comment, ...props }) {
  const [isStartEvaluationButtonClicked, setIsStartEvaluationButtonClicked] = useState(false)
  const [isFetchingEvaluationData, setIsFetchingEvaluationData] = useState(null)
  const [evaluationData, setEvalautionData] = useState({})
  const [evaluationModalDetails,setEvaluationModalDetails] = useState({ isOpen: false })

  useEffect(() => {
    if (isStartEvaluationButtonClicked) {
      if (get(props.evaluationDataFetchStatus, 'loading')) {
        setIsFetchingEvaluationData(true)
      } else {
        if (get(props.evaluationDataFetchStatus, 'success')) {
          setEvaluationDataFromProps()
        }
        setIsFetchingEvaluationData(false)
      }
    }
  }, [props.evaluationDataFetchStatus, props.evaluationData])

  const openEvaluationModal = () => {
    const userIds = get(props, 'attendence', []).map(item => get(item, 'student.studentData.id'))
    setIsStartEvaluationButtonClicked(true)
    fetchEvaluationData(userIds, get(props, 'topicId'), get(props, 'courseId'))
  }
  
  const getPresentStudents = () => get(props, 'attendance') && get(props, 'attendance').filter(item => get(item, 'isPresent'))

  const setEvaluationDataFromProps = () => {
    const evaluationDataFromProps = get(props, 'evaluationData');
    const evaluationDataFromPropsTemp = { ...evaluationDataFromProps };
    const blockBasedPracticeComponent =
      get(props, 'topicComponentRule') &&
      get(props, 'topicComponentRule').filter(
        (rule) => get(rule, "componentName") === "blockBasedPractice" || get(rule, "componentName") === "homeworkPractice"
      );
    const getsortedEvaluationDataTemp = getsortedEvaluationData(evaluationDataFromProps, blockBasedPracticeComponent);
    evaluationDataFromPropsTemp.blockBasedPracitce = getsortedEvaluationDataTemp;
    setEvalautionData(evaluationDataFromPropsTemp)
    if (isStartEvaluationButtonClicked) {
      setEvaluationModalDetails({ ...evaluationModalDetails, isOpen: true, evaluationType: get(props, 'evaluationType'), currentPracticeQuestion: get(props, 'currentPracticeQuestion') })
    }
  }

  const closeEvaluationModal = () => {
    setEvaluationModalDetails({ ...evaluationModalDetails, isOpen: false })
    setIsStartEvaluationButtonClicked(false)
  }

  return (
    <div className="evaluationContainer">
      <div className="evaluationContainerHeader">Your Evaluation</div>
      <div className="evaluationBodyContainer">
        {star ? (
          <div className="evaluationStarsContainer">
            <div className="starsContainer">
              {[...Array(star).keys()].map((item) => (
                <img src={EvaluationStar} alt="star" />
              ))}
            </div>
            <h3>{star} STARS</h3>
          </div>
        ) : (
          <div className="notYetEvaluatedContainer">
            <h5 style={{ margin: "0" }}>This answer is not yet evaluated.</h5>
            <Button
              text='Evaluate Answer'
              isLoading={isFetchingEvaluationData}
              onBtnClick={() => openEvaluationModal()}
            />
          </div>
        )}
        {tags && tags.length ? (
          <div className="tagContainer">
            <p>Tags:</p>
            <div>
              {tags.map((item) => (
                <span>{get(item, "name")}</span>
              ))}
            </div>
          </div>
        ) : null}
        {comment && comment.length ? (
          <div className="commentContainer">
            <p>Comments Given:</p>
            <p className="commentText">{decodeURIComponent(comment)}</p>
          </div>
        ) : null}
      </div>
      {get(evaluationModalDetails, 'isOpen') && <EvaluationContextProvider>
        <EvaluationModal
          evaluationModalDetails={evaluationModalDetails}
          setEvaluationModalDetails={setEvaluationModalDetails}
          topicDetails={{ title: get(props, 'topicTitle'), topicId: get(props, 'topicId') }}
          students={getPresentStudents()}
          courseId={get(props, 'courseId')}
          assignmentData={evaluationData}
          openedFromStudentPerformance={true}
          closeEvaluationModal={closeEvaluationModal}
          currentStudent={get(props, 'selectedStudent')}
        />
      </EvaluationContextProvider>}
    </div>
  );
}

export default YourEvaluation;
