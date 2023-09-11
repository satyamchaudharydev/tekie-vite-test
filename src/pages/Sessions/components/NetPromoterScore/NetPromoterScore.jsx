import React from 'react'
import cx from 'classnames'
import { range, get } from 'lodash'
import gql from 'graphql-tag'
import { motion } from 'framer-motion'
import withScale from '../../../../utils/withScale'
import addNetPromoterScore from '../../../../queries/addNetPromoterScore'
import { ActionButton } from '../../../../components/Buttons'
import { Toaster, getToasterBasedOnType } from '../../../../components/Toaster'
import className from './NetPromoterScore.module.scss'
import NpsMcqModal from './components/NpsMcqModal'
import npsMCQModalStyle from './components/NpsMcqModal.module.scss'
import { ReactComponent as Emoji1 } from './assets/emoji1.svg'
import { ReactComponent as Emoji2 } from './assets/emoji2.svg'
import { ReactComponent as Emoji3 } from './assets/emoji3.svg'
import { ReactComponent as Emoji4 } from './assets/emoji4.svg'
import { ReactComponent as Emoji5 } from './assets/emoji5.svg'
import { ReactComponent as Emoji6 } from './assets/emoji6.svg'
import { ReactComponent as Emoji7 } from './assets/emoji7.svg'
import { ReactComponent as Emoji8 } from './assets/emoji8.svg'
import { ReactComponent as Emoji9 } from './assets/emoji9.svg'
import { ReactComponent as Emoji10 } from './assets/emoji10.svg'
import getConstants from './constants'
import requestToGraphql from '../../../../utils/requestToGraphql'
import { Button3D } from '../../../../photon'
import SimpleButtonLoader from '../../../../components/SimpleButtonLoader'
import { getActiveBatchDetail } from '../../../../utils/multipleBatch-utils'

const emojiIcon = [<Emoji1 />, <Emoji2 />, <Emoji3 />, <Emoji4 />, <Emoji5 />, <Emoji6 />, <Emoji7 />, <Emoji8 />, <Emoji9 />, <Emoji10 />]

const NetPromoterScore = (props) => {
  const [goodNpsPrimaryTitles, goodNpsSecondaryTitles, avgNpsPrimaryTitles, avgNpsSecondaryTitles, mbNpsPrimaryTitles, mbNpsSecondaryTitles] = getConstants(props.name)
  const [score, setScore] = React.useState(0)
  const [visible, setVisible] = React.useState(true)
  const [rating, setRating] = React.useState(10)
  const [goodNpsScoreMcq, setGoodNpsScoreMcq] = React.useState([
    {
      optionNumber: 1,
      id: "likedMentor",
      mcqOptionName: "Mentor",
      isSelected: false,
    },
    {
      optionNumber: 2,
      id: "likedAnimatedVideos",
      mcqOptionName: "Animated videos",
      isSelected: false
    },
    {
      optionNumber: 3,
      id: "likedChats",
      mcqOptionName: "Chats",
      isSelected: false
    },
    {
      optionNumber: 4,
      id: "likedCodingProjects",
      mcqOptionName: "Coding Projects",
      isSelected: false
    },
    {
      optionNumber: 5,
      id: "easySessionScheduling",
      mcqOptionName: "Easy session scheduling",
      isSelected: false
    },
  ])
  const [avgNpsScoreMcq, setAvgNpsScoreMcq] = React.useState([
    {
      optionNumber: 1,
      id: "mentorIssue",
      mcqOptionName: "Mentor issue",
      isSelected: false
    },
    {
      optionNumber: 2,
      id: "techIssue",
      mcqOptionName: "Tech issue",
      isSelected: false
    },
    {
      optionNumber: 3,
      id: "contentIssue",
      mcqOptionName: "Content",
      isSelected: false
    },
    {
      optionNumber: 4,
      id: "tooManyCalls",
      mcqOptionName: "Too many calls",
      isSelected: false
    },
  ])
  const [npsStep, setNpsStep] = React.useState(0)
  const [extraInfo, setExtraInfo] = React.useState('')

  let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches

  React.useEffect(() => {
    const { hasNPSAdded } = props
    let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches
    if (hasNPSAdded && isMobile === true) {
      props.handleFlash()
    }
  }, [get(props, 'hasNPSAdded')])


  React.useLayoutEffect(() => {
    const slider = document.getElementById("myRange");
    if (slider && slider.value) {
      try {
        const min = slider.min;
        const max = slider.max;
        const value = slider.value;
        const inactiveColor = "#DCDCDC";
        const primaryColor = "#00ADE6";
        slider.style.background = `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${((value -
          min) /
          (max - min)) *
          100}%, ${inactiveColor} ${((value - min) / (max - min)) *
          100}%, ${inactiveColor} 100%)`;

        slider.oninput = function () {
          this.style.background = `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${((this
            .value -
            this.min) /
            (this.max - this.min)) *
            100}%, ${inactiveColor} ${((this.value - this.min) /
              (this.max - this.min)) *
            100}%, ${inactiveColor} 100%)`;
        };
      } catch (e) {
        console.log(e)
      }
    }
  }, [rating])

  const getNpsBGColour = i => {
    const bgColors = ['linear-gradient(#FF9E8A, #FFA385)', 'linear-gradient(rgb(255 183 162), rgb(255, 166, 131))', 'linear-gradient(#FFAE7D, #FFB179)',
      'linear-gradient(#FFB476, #FFB873)', 'linear-gradient(#FFBC70, #FFC06C)', 'linear-gradient(#FFC46A, #FFC766)', 'linear-gradient(#FDCB64, #EDD160)',
      'linear-gradient(#E2D55D, #D2DB59)', 'linear-gradient(#C5Df55, #B6E551)', 'linear-gradient(#A9EA4E, #98F049)']
    return bgColors[i - 1]
  };
  const getNpsColor = i => {
    const styles = {};
    if (i >= 0 && i <= 6) {
      styles.color = '#FF5744';
      styles.opacity = 1;
    } else if (i > 6 && i <= 8) {
      styles.color = '#FAAD14';
      styles.opacity = 1;
    } else {
      styles.color = '#65DA7A';
      styles.opacity = 1;
    }
    return styles;
  };

  const onRatingChange = (rating) => {
    setRating(rating)
  };
  const renderNpsContent = () => {
    if (npsStep === 0) {
      return (
        <div className={className.options}>
          <div className={className.emojiRatingsContainer}>
            {range(1, 11).map(i => (
              <div className={className.emojiContainer}>
                <motion.div
                  style={{
                    ...(i === score ? styles.active : {}),
                    ...(i === 0 ? { marginLeft: 0 } : {}),
                    background: getNpsBGColour(i)
                  }}
                  onClick={() => {
                    setScore(i)
                    setNpsStep(npsStep => npsStep + 1)
                  }}
                  className={cx(className.option, i === score && className.optionActive)}
                >
                  {i}
                </motion.div>
              </div>
            ))}
          </div>
          <div className={className.satisfiedTextContainer}>
            <p>NOT SATISFIED</p>
            <p>TOTALLY SATISFIED</p>
          </div>
        </div>
      )
    }
    if (npsStep === 1) {
      return (
        <>
          <NpsMcqModal
            goodNpsScoreMcq={goodNpsScoreMcq}
            avgNpsScoreMcq={avgNpsScoreMcq}
            setGoodNpsScoreMcq={setGoodNpsScoreMcq}
            setAvgNpsScoreMcq={setAvgNpsScoreMcq}
            rating={score}
            setExtraInfo={(info) => {
              setExtraInfo(info || '')
            }}
            setNpsStep={() => setNpsStep(npsStep => npsStep + 1)}
          />
          <textarea
            placeholder='Tell us more (optional)'
            className={className.textArea}
            rows="9"
            cols="50"
            value={extraInfo}
            onChange={(e) => {
              let userInput = e.target.value
              userInput = userInput.charAt(0).toUpperCase() + userInput.slice(1)
              setExtraInfo(userInput)
            }}></textarea>
        </>
      )
    }
  }
  const addNpsValue = async (sessionId = '', batchType = false, device = 'pc') => {
    let { cancelNps } = props
    let npsInputObject = {}
    goodNpsScoreMcq.forEach(item => {
      if (item.isSelected) {
        npsInputObject[item.id] = item.isSelected
      }
    })
    avgNpsScoreMcq.forEach(item => {
      if (item.isSelected) {
        npsInputObject[item.id] = item.isSelected
      }
    })
    if (extraInfo.length > 0) {
      npsInputObject['feedbackByMentee'] = extraInfo
    }
    if (device === 'pc') {
      npsInputObject['score'] = +score
      await addNetPromoterScore(props.userId, npsInputObject, sessionId, props.courseId, batchType).call()
    }
    else if (device === "mobile") {
      npsInputObject['score'] = +rating
      await addNetPromoterScore(props.userId, npsInputObject, sessionId, props.courseId, batchType).call()
    }
    setVisible(false)
  }
  const submitNPS = async (device) => {
    let { NPSMentorMenteeSession, sessionDetails, studentProfile } = props
    const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile, '[0].batch'))
    let mentorSession = NPSMentorMenteeSession.toJS()
    let menteeMentorId = get(mentorSession[0], 'id')
    if (menteeMentorId) {
      addNpsValue(menteeMentorId, false, device)
    }
    else if (studentProfile && get(batchDetail, 'id') && sessionDetails) {
      const completedSession = get(sessionDetails, 'completedSessions', [])
      const topicId = get(completedSession[completedSession.length - 1], 'topicId')
      if (topicId) {
        await requestToGraphql(gql`{
            batchSessions(
              filter: { and: [{ batch_some: { id: "${get(batchDetail, 'id')}" } }, { topic_some: { id: "${topicId}" } }] }
            ) {
              id
            }
          }
        `).then(async (res) => {
          if (get(res, 'data.batchSessions', []).length > 0) {

            addNpsValue(get(res, 'data.batchSessions[0].id'), true, device)
          } else {
            addNpsValue(null, false, device)
          }
        })
      }
    } else {
      addNpsValue(null, false, device)
    }
  }
  const renderMobileNpsContent = () => {
    if (npsStep === 0) {
      return (
        <div style={styles.mbOptions}>
          <div className={className.emojiRatingsContainer}>
          </div>
          <div className={className.slidecontainer}><input type="range" min="1" max="10" step="1" className={className.slider} value={rating} id="myRange" onChange={({ target: { value: radius } }) => {
            onRatingChange(radius);
          }} /></div>
          <div className={className.ratingContainer}>
            {range(0, 11).map(i => (
              <div className={className.sliderText}>{emojiIcon[i]}</div>
            ))
            }
          </div>
          <div className={className.mbNumberRatingsContainer}>
            {range(1, 11).map(i => (
              <motion.div
                style={{
                  ...getNpsColor(i)
                }}
                onClick={() => {
                  setScore(i)
                }}
              >
                {i}
              </motion.div>
            ))}
          </div>
        </div>
      )
    }
    if (npsStep === 1) {
      return (
        <NpsMcqModal
          goodNpsScoreMcq={goodNpsScoreMcq}
          avgNpsScoreMcq={avgNpsScoreMcq}
          setGoodNpsScoreMcq={setGoodNpsScoreMcq}
          setAvgNpsScoreMcq={setAvgNpsScoreMcq}
          rating={rating}
          isMobile={true}
          setExtraInfo={(info) => {
            setExtraInfo(info || "");
          }}
          setNpsStep={() => setNpsStep((npsStep) => npsStep + 1)}
        />
      );
    }
    if (npsStep === 2) {
      return (
        <div style={{ display: 'flex', height: '100%', marginBottom: '25px' }}>
          <textarea
            placeholder="Tell us more (optional)"
            className={className.mbTextArea}
            rows="8"
            cols="50"
            value={extraInfo}
            onChange={(e) => {
              let userInput = e.target.value
              userInput = userInput.charAt(0).toUpperCase() + userInput.slice(1)
              setExtraInfo(userInput)
            }}
          ></textarea>
        </div>
      );
    }
    if (npsStep === 3) {
      return (
        <></>
        // <div className={className.thankYouContainer}>
        //   {rating === 0 ? emojiIcon[rating]: emojiIcon[rating-1]}
        //   <p>{rating}</p>
        // </div>
      )
    }
  }
  const renderNpsModalHeaders = () => (
    <>
      {
        score > 8 ?
          <>
            <div
              style={{
                fontFamily: `${npsStep >= 1 ? "Gilroy" : "Nunito"}`,
                fontWeight: 800
              }}
              className={
                npsStep === 3 ? className.thankYouPrimaryTitle : className.primaryQuestion
              }
            >
              {goodNpsPrimaryTitles[npsStep]}
            </div>
            <div
              style={{
                ...styles.secondryQuestion,
                fontFamily: `${npsStep >= 1 ? "Gilroy" : "Nunito"}`,
              }}
            >
              {goodNpsSecondaryTitles[npsStep]}
            </div>
          </> :
          <>
            <span
              style={{
                fontFamily: `${npsStep >= 0 ? "Gilroy" : "Nunito"}`,
              }}
              className={
                npsStep === 3 ? className.thankYouPrimaryTitle : className.primaryQuestion
              }
            >
              {avgNpsPrimaryTitles[npsStep]}{" "}
              {avgNpsSecondaryTitles[npsStep]}
            </span>
          </>
      }</>
  )
  const renderButtons = () => (
    <>
      {npsStep === 1 ? (
        <div className={className.btnContainer}>
          <button
            className={className.controlButton}
            onClick={() => { setNpsStep(step => step - 1) }}>BACK</button>
          <div>
            <button
              className={className.controlButton}
              onClick={() => cancelNps()}>CANCEL</button>
            <button
              className={className.submitButton}
              onClick={() => {
                if (npsStep === 1) {
                  submitNPS("pc");
                }
                setNpsStep((npsStep) => npsStep + 1);
              }}>SUBMIT REVIEW</button>
          </div>
        </div>
      ) : npsStep === 2 ? (
        <div className={className.btnContainer} style={{ justifyContent: 'center' }}>
          <button
            className={className.thankYouContainersubmitButton}
            onClick={() => {
              cancelNps();
            }}>Done
            {/* <SimpleButtonLoader
              showLoader={true}
              style={styles.loader}
            /> */}
          </button>
        </div>
      ) : null}
    </>
  )

  const { styles, cancelNps, isNPSLoading } = props
  return (
    <>
      {isMobile ? (
        <div className={className.npsContainer}>
          <div
            className={`${npsStep === 3
              ? className.mbThankYouNpsBody
              : className.mbNpsBody
              } ${npsStep === 0 && className.firstNpsBody}`}
          >
            <div>
              <div
                className={
                  npsStep === 0
                    ? className.mbFirstStepPrimaryTitle
                    : npsStep === 3
                      ? className.mbThankYouTextContainer
                      : className.mbPrimaryQuestion
                }
                style={{
                  fontFamily: `${npsStep >= 0 && npsStep !== 3 ? "Gilroy" : "Nunito"}`,
                  color: `${npsStep >= 1 ? "#00ADE6" : "#012A38"}`,
                  opacity: `${npsStep >= 1 ? 1 : 0.8}`,
                }}
              >
                {goodNpsPrimaryTitles[npsStep]}
              </div>
              {npsStep < 3 ? (
                <div
                  className={
                    npsStep === 0
                      ? className.mbFirstStepSecondryTitle
                      : className.mbSecondryQuestion
                  }
                  style={{
                    fontFamily: `${npsStep >= 1 ? "Gilroy" : "Nunito"}`,
                    color: `${npsStep >= 1 ? "#00ADE6" : "#012A38"}`,
                    opacity: `${npsStep >= 1 ? 1 : 0.8}`,
                  }}
                >
                  {goodNpsSecondaryTitles[npsStep]}
                </div>
              ) : null}
            </div>
            {renderMobileNpsContent()}
            <div
              className={
                npsStep === 0
                  ? className.mbFirstStepButtonsContainer
                  : className.mbButtonsContainer
              }
              style={{
                marginTop: `${npsStep === 3 ? "32px" : ""}`,
                justifyContent: `${npsStep === 3 ? "center" : ""}`,
              }}
            >
              {npsStep > 0 && npsStep < 3 ? (
                <button
                  className={className.mbBackButton}
                  onClick={() => {
                    if (npsStep > 0) {
                      setNpsStep((npsStep) => npsStep - 1);
                    }
                  }}
                >
                  BACK
                </button>
              ) : null}
              <div
                className={
                  npsStep === 0 ? className.mbSubmitBtnContainer : null
                }
              >
                {npsStep < 3 && (
                  <button
                    className={
                      npsStep === 0
                        ? className.mbFirstStepCancelButton
                        : className.mbControlButton
                    }
                    onClick={() => cancelNps()}
                  >
                    {npsStep === 0 ? "CANCEL REVIEW" : "CANCEL"}
                  </button>
                )}
                <ActionButton
                  title={npsStep === 3 ? "DONE" : "SUBMIT REVIEW"}
                  hideIconContainer
                  style={{
                    ...styles.mbSubmitButton,
                    width: `${npsStep === 3 ? "fit-content" : ""}`,
                    marginRight: `${npsStep === 3 || npsStep === 0 ? "0px" : "20px"
                      }`,
                    marginBottom: `${npsStep === 3 ? "30px" : "20px"}`,
                  }}
                  textStyle={{
                    marginLeft: 0,
                    marginRight: 0,
                    fontFamily: "Nunito",
                    fontStyle: "normal",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                  onClick={() => {
                    if (npsStep === 3) {
                      cancelNps();
                    } else if (npsStep === 2) {
                      submitNPS("mobile");
                    }
                    setNpsStep((npsStep) => npsStep + 1);
                  }}
                  // showLoader={isNPSLoading}
                  loaderStyle={styles.loader}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={className.npsContainerWrapper}>
          <div style={styles.container}>
            
            <motion.div
              style={styles.popup}
              initial={styles.hide}
              animate={
                visible
                  ? {
                    x: 0,
                  }
                  : styles.hide
              }
              className={className.popup}
            >
              {npsStep === 0 && (
                <div
                  className={className.closeIconContainer}
                  onClick={() => cancelNps()}
                >
                  <div className={className.closeIcon}>X</div>
                </div>
              )}
              {npsStep < 2 ? renderNpsModalHeaders() :
                <div className={className.thankYouContainer}>
                  <p>Thank you for your feedback.</p>
                </div>
              }
              {renderNpsContent()}
              {renderButtons()}
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  loader: {
    left: 7,
  },
  submitButton: {
    width: 'fit-content',
    padding: '0px 16px',
    height: 53,
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'center',
    marginRight: '20px',
    marginTop: '20px',
    marginBottom: '20px',
    background: 'conic-gradient(from -3.29deg at 100% -13%, #35E4E9 0deg, #00ADE6 360deg)',
    boxShadow: 'none',
  },
  mbSubmitButton: {
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    marginBottom: '20px',
    marginRight: '20px',
    width: '110.18px',
    height: '38.41px',
    padding: "0px 18px",
    fontSize: '14px',
    fontFamily: 'Nunito',
    fontStyle: 'normal',
    fontWeight: 'bold',
    lineHeight: '120%',
    letterSpacing: '0.03em',
    boxShadow: 'none',
    background: 'conic-gradient(from -3.29deg at 100% -13%, #35E4E9 0deg, #00ADE6 360deg)',
  },
  label: {
    fontFamily: 'Nunito',
    fontSize: 22,
    fontWeight: 300,
    lineheight: 1.36,
    color: '#504f4f'
  },
  labels: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15
  },
  active: {
    backgroundImage: 'linear-gradient(to bottom, #00ade6 -90%, #34e4ea 50%)',
    boxShadow: '0 3px 6px 0 rgba(0, 0, 0, 0.04)',
    color: '#fff'
  },
  mbOptions: {
    paddingLeft: '4.6px',
    paddingRight: '4.6px',
    width: '85%'
  },
  primaryQuestion: {
    fontFamily: 'Gilroy',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: '.5px',
    display: 'flex',
    color: '#00ADE6',
    paddingTop: '30px',
    paddingLeft: '37.56px',
    paddingRight: '37.56px',
    lineHeight: '130%',
  },
  secondryQuestion: {
    fontFamily: 'Gilroy',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: '.5px',
    textAlign: 'center',
    display: 'flex',
    color: '#00ADE6',
    paddingLeft: '37.56px',
    paddingRight: '37.56px',
    lineHeight: '130%',
  },
  cancel: {
    fontFamily: 'Nunito',
    fontSize: 28,
    color: '#38b9e4',
    position: 'absolute',
    right: 11.5,
    cursor: 'pointer',
    top: 0
  },
  popup: {
    position: 'relative',
    backgroundColor: '#ffffff',
    pointerEvents: 'auto !important',
    right: 0,
    bottom: 40,
    display: 'flex',
    flexDirection: 'column',
    padding: 30,
  },
  hide: {
    x: 900
  },
  container: {
    width: '100%',
    height: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    overflow: 'hidden'
  },
}

export default withScale(NetPromoterScore, styles)