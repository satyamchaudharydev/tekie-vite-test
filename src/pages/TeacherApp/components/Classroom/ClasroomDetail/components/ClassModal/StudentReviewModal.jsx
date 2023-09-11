import React,{useState, useEffect} from 'react'
import moment from 'moment'
import getPath from '../../../../../../../utils/getPath'
import studentReviewByMentors from '../../../../../../../queries/teacherApp/classDetailPage/fetchReviewsByMentors'
import LoadingSpinner from '../../../../Loader/LoadingSpinner'
import { CloseIcon, PingIcon } from '../../../../../../../constants/icons'
import ping from '../../../../../../../assets/ping.svg'
import { Toaster, getToasterBasedOnType } from '../../../../../../../components/Toaster'
import styles from './ClassModal.module.scss'
import addStudentReviewByMentor from '../../../../../../../queries/teacherApp/classDetailPage/addStudentReviewByMentor'
import { get } from 'lodash'

const Review = ({review, mentorName}) => {
    const[reviewedBy, setReviewedBy] = useState({})
    const[reviewType, setReviewType] = useState('')
    const[reviewText, setReviewText] = useState('')
    const[createdAt, setCreatedAt] = useState('')
    const[mentorPic, setMentorPic] = useState('')
    const[topic, setTopic] = useState('')

    useEffect(() => {
        if(review){
            if(review.reviewType === "positive"){
                setReviewType("Positive")
            }else{
                setReviewType("Negative")
            }
            setReviewText(review.reviewText)
            if(review.topic){
                setTopic(review.topic.title)
            }
            if(review.createdAt){
                const createdAt = moment(review.createdAt).format("DD MMM")
                setCreatedAt(createdAt)
            }
            if(review.reviewedBy){
                setReviewedBy(review.reviewedBy)
            }
            if(review && review.reviewedBy && review.reviewedBy.profilePic && review.reviewedBy.profilePic.uri){
                setMentorPic(getPath(review.reviewedBy.profilePic.uri))
            }
        }
    })

    return(
        <div className={styles.ModalReviewContainer}>
            {mentorPic !== '' ? (
                   <img src={mentorPic} alt='studentImage' className={styles.Modal_ReviewImg}  />
            ): (
                <div className={styles.Modal_ReviewImg2}>{mentorName.charAt(0)}</div>
            )}
                <div style={{marginLeft: '8px', marginRight: '16px'}}>
                    <div className={styles.Modal_ReviewName}>{reviewedBy.name}</div>
                    <div className={styles.Modal_ReviewStatus}>{reviewType === 'Positive' ? (
                        <>{reviewType}<span role="img" alt="tick" style={{paddingLeft: '2px', fontSize: '10px'}}>✅</span></>
                    )
                    :
                    (
                        <>{reviewType}<span role="img" alt="tick" style={{paddingLeft: '2px', fontSize: '10px'}}>❌</span></>
                    )}</div>
                </div>
                <div>
                    <div className={styles.Modal_ReviewDate}><span style={{marginRight:'0px'}}>
                        {createdAt}</span><div className={styles.Modal_dot}/><span>Session-{topic}</span></div>
                    <p className={styles.ModalReview}>{reviewText}</p>
                </div>
        </div>
    )
}
const LineBreak = () => {
    return(
        <div className={styles.Modal_LineBreak}/>
    )
}
const StudentReviewModal = ({selectedStudent, setOpenModal, loggedInUser, batchId, topicId,mentorName, classroomTitle,reviewStatus}) => {
    const [review, setReview] = React.useState('')
    const [reviewType, setReviewType] = React.useState('')
    const [isSending, setIsSending] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [reviews, setReviews] = React.useState([])


    useEffect(() => {
        setLoading(true)
        studentReviewByMentors(selectedStudent.user.id).then(res => {
            setReviews(res.studentReviewByMentors)
        })
        setLoading(false)
    },[])

    const handleReview = (e) => {
        setReview(e.target.value)
    }

    const handleReviewType = (type) => {
        if(type === reviewType){
            setReviewType('')
        }else{
            setReviewType(type)
        }
    }

    const renderReviews = () => {
        if(reviews){
            let n = review.length - 1
            return(
                <>
                    {reviews.map((review, key) => (
                        <>
                            <Review review={review} mentorName={mentorName} />
                            {key !== n && <LineBreak />}
                        </>
                    ))}
                </>
            )
        }
    }

    const submitReview = async() => {
        setIsSending(true)
        const input = {
            reviewType: reviewType,
            reviewText: review.trim()
        }
        if(reviewType == ''){
            getToasterBasedOnType({
                type: 'error',
                message: "Review Type field can't be empty"
            })
            setIsSending(false)
        }else{
            await addStudentReviewByMentor(input, topicId, selectedStudent.user.id, batchId,loggedInUser).then(res => {
                setIsSending(false)
                setOpenModal(false)
            })
        }
    }

    const blankReview = () => {
        getToasterBasedOnType({
            type: 'error',
            message: "Review Field can't be empty"
        })
    }
    return(
        <div className={styles.Modal_main}>
            <div className={styles.Modal_body}>
                <div className={styles.Modal_header2}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <div className={styles.Modal_imageContainer2}>
                            {/* <img src={ping} alt='notice' className={styles.Modal_HeaderImage2} /> */}
                            <PingIcon/>
                        </div>
                        <div>
                            <div className={styles.Modal_HeaderTitle}>Student review</div>
                            <div className={styles.Modal_HeaderTitleSub}><span style={{marginRight: '8px'}}>{get(selectedStudent,'user.name','')} </span>{classroomTitle}</div>
                        </div>
                    </div>
                    <div onClick={() => setOpenModal(false)} className={styles.Modal_HeaderCross} >
                        <CloseIcon />
                    </div>
                    {/* <img onClick={() => setOpenModal(false)} src={close} alt='cross' className={styles.Modal_HeaderCross} /> */}
                </div>
                <div className={styles.Modal_mid}>
                    <div className={styles.Modal_ReviewHeading}>Type of Review<span className={styles.Modal_Star} style={{color: 'red'}}>*</span></div>
                    <div style={{display: 'flex', marginTop: '8px'}}>
                        <div className={reviewType === 'positive' ? styles.Module_ReviewDivActive : styles.Module_ReviewDiv } onClick={() => handleReviewType('positive')}>Positive<span role="img" alt="tick" style={{paddingLeft: '4px'}}>✅</span></div>
                        <div className={reviewType === 'negative' ? styles.Module_ReviewDivActive : styles.Module_ReviewDiv } onClick={() => handleReviewType('negative')}>Negative<span role="img" alt="tick" style={{paddingLeft: '4px'}}>❌</span></div>
                    </div>
                    <div className={styles.Modal_Label2} style={{marginTop: '16px'}}>Add Review<span className={styles.Modal_Star}>*</span></div>
                    <textarea value={review} onChange={(e) => handleReview(e)} className={styles.Modal_inputMessage} placeholder='Type Here'></textarea>
                    {get(reviewStatus, 'loading', true) === true ? (
                        <LoadingSpinner
                        width='100%'
                        top='10px'
                        height={'24px'}
                      />
                    ): (
                        <>
                            {reviews.length > 0 &&  <div className={styles.Modal_Label} style={{marginTop: '20px'}}>Previous added review</div>}
                            {reviews.length === 0 &&(
                            <div className={styles.Modal_noReview}>Add first review for this student</div>
                                )}
                            <div className={styles.ModalReviews}>
                                {renderReviews()}
                            </div>
                        </>
                    )}
                </div>
                <div className={styles.Modal_footer}>
                    <button className={styles.Modal_footerButton} onClick={() => review.trim() !=='' ? submitReview() : blankReview()}>
                    {
                    isSending && (
                      <LoadingSpinner
                        width={'14px'}
                        height={'14px'}
                        color={'white'}
                      />
                    )
                  }
                    <span  style={{marginLeft: '10px'}}>{isSending ? 'Processing...':'Submit Review'}</span>                 
                    </button>
                </div>
            </div>
            
        </div>
    )
}

export default StudentReviewModal