import React from 'react'
import HomeworkReviewTitle from './components/HomeworkReviewTitle'
import "./HomeworkReviewHeader.scss"
function HomeworkReviewHeader({newTopicDetailData ,currentStartTime,currentStartDate , totalStudent,presentStudent , currentTopicDetailData, prevTopicOrder}) {
  return (
    <div className='main__container__title__homework__review'>
      <HomeworkReviewTitle newTopicDetailData={newTopicDetailData} currentStartTime={currentStartTime} currentStartDate={currentStartDate} totalStudent={totalStudent} presentStudent={presentStudent}
        currentTopicDetailData={currentTopicDetailData} prevTopicOrder={prevTopicOrder} />
      
    </div>
  )
}

export default HomeworkReviewHeader


