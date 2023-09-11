import React, { memo, useEffect, useRef, useState } from "react";
import styles from "./SlideHeader.module.scss";
import { ReactComponent as Left } from "../../../../../assets/Left.svg";
import { ReactComponent as Right } from "../../../../../assets/RightSlide.svg";
import { ReactComponent as QuestionMark } from "../../../../../assets/QuestionMark.svg";
import { get } from "lodash";
import { motion } from "framer-motion";
import { checkIfEmbedEnabled } from "../../../../../utils/teacherApp/checkForEmbed";

function SlideHeader({
  tabArr,
  currentLearningSlide,
  updateLearningSlideList,
  revisitRoute,
  maxTabsPerFrame,
  skipSlideRange,
  incrementFrame,
  // practiceQuestions,
  setFrame = () => {},
}) {
  const rightArrowRef = useRef()
  const leftArrowRef = useRef()
  const getanimationVariants = () =>
    currentLearningSlide === 0
      ? {
          initial: {
            opacity: 0,
          },
          animate: {
            opacity: 1,
            transition: {
              duration: 0.8,
              ease: [0.65, 0.25, 0.35, 0.17],
            },
          },
        }
      : {
          initial: {
            opacity: 0.35,
            x: animationDirection ? "125%" : "-125%",
          },
          animate: {
            x: "0%",
            opacity: 1,
            transition: {
              duration: 1,
              ease: [0.65, 0.25, 0.35, 0.17],
            },
          },
        };
  const tabsContainer = useRef();
  const [activeFrame, setActiveFrame] = useState(
    Math.floor(currentLearningSlide / maxTabsPerFrame)
  );
  const [lastActiveSlide, setLastActiveSlide] = useState(-1);
  const [progressBar, setProgressBar] = useState();
  const [animationDirection, setAnimationDirection] = useState(true);

  const getProgessBarWidth = () => {
    if (revisitRoute || checkIfEmbedEnabled()) {
      setProgressBar(100);
      return;
    }
    if (currentLearningSlide < lastActiveSlide) {
      let currentSlideFrame = Math.floor(
        currentLearningSlide / maxTabsPerFrame
      );
      let lastActiveSlideFrame = Math.floor(lastActiveSlide / maxTabsPerFrame);
      if (currentSlideFrame < lastActiveSlideFrame) {
        setProgressBar(100);
      } else
        setProgressBar(
          (get(
            tabsContainer,
            `current.children[${lastActiveSlide -
              activeFrame * maxTabsPerFrame}].offsetLeft`
          ) /
            get(tabsContainer, "current.clientWidth")) *
            100
        );
    } else {
      setProgressBar(
        (get(
          tabsContainer,
          `current.children[${currentLearningSlide -
            activeFrame * maxTabsPerFrame}].offsetLeft`
        ) /
          get(tabsContainer, "current.clientWidth")) *
          100
      );
    }
  };

  useEffect(() => {
    if (isNaN(progressBar)) getProgessBarWidth();
  }, [progressBar]);

  useEffect(() => {
    getProgessBarWidth();
  }, [tabsContainer.current, currentLearningSlide]);

  useEffect(() => {
    if (!currentLearningSlide || currentLearningSlide <= lastActiveSlide)
      return;
    setLastActiveSlide(currentLearningSlide);
  }, [currentLearningSlide]);

  useEffect(() => {
    if (!currentLearningSlide || lastActiveSlide >= 0) return;
    setLastActiveSlide(currentLearningSlide);
    setActiveFrame(Math.floor(currentLearningSlide / maxTabsPerFrame));
  }, [currentLearningSlide]);

  useEffect(() => {
    if (incrementFrame) {
      setActiveFrame(activeFrame + 1);
      setFrame(false);
    }
  }, [incrementFrame]);

  //FUNTIONS for switching between slides
  const decrementSlide = () => {
    if (currentLearningSlide === 0) return;
    if (activeFrame * maxTabsPerFrame === currentLearningSlide) {
      if ((activeFrame + 1) * maxTabsPerFrame >= tabArr.length) {
        return skipSlides("back");
      }
      setActiveFrame((prevFrame) => prevFrame - 1);
      setAnimationDirection(false);
    }
    updateLearningSlideList("back");
  };

  const skipSlides = (type) => {
    setActiveFrame((prevFrame) =>
      type === "back" ? prevFrame - 1 : prevFrame + 1
    );
    setAnimationDirection(type !== "back");
    updateLearningSlideList(
      type,
      type === "back"
        ? currentLearningSlide - Math.abs(skipSlideRange + 1)
        : currentLearningSlide + Math.abs(skipSlideRange + 1)
    );
  };

  const incrementSlide = () => {
    if (currentLearningSlide === tabArr.length - 1) return;
    if (
      !(revisitRoute || checkIfEmbedEnabled()) &&
      isPracticeQuestion() &&
      get(tabArr[currentLearningSlide], "status") !== "complete"
    ) {
      return;
    }
    if (
      currentLearningSlide - activeFrame * maxTabsPerFrame ===
      maxTabsPerFrame - 1
    ) {
      if ((activeFrame + 2) * maxTabsPerFrame >= tabArr.length) {
        return skipSlides("next");
      }
      setActiveFrame((prevFrame) => prevFrame + 1);
      if (!animationDirection) setAnimationDirection(true);
    }
    updateLearningSlideList("next");
  };
  const onKeyupOperation = (e) => {
    if (e.key) {
      switch (e.key) {
        case 'ArrowRight':
          if (rightArrowRef.current) rightArrowRef.current.click()
          break;
        case 'ArrowLeft':
          if (leftArrowRef.current) leftArrowRef.current.click()
          break;
        default:
          break
      }
    }
  }
  useEffect(() => {
  window.addEventListener("keyup", onKeyupOperation)
  return () => window.removeEventListener("keyup", onKeyupOperation)
  }, [])
  const isPracticeQuestion = () =>
    get(tabArr[currentLearningSlide], "learningSlide.type") ===
    "practiceQuestion";

  //checking if Last Slide or first slide
  const checkSlide = (type) => {
    if (revisitRoute || checkIfEmbedEnabled()) return false
    if (type === "last") {
      return (
        (isPracticeQuestion() &&
          get(tabArr[currentLearningSlide], "status") !== "complete") ||
        currentLearningSlide === tabArr.length - 1
      );
    }
    return !currentLearningSlide;
  };

  const checkIfActiveSlide = (slideIndex) => {
    return activeFrame * maxTabsPerFrame + slideIndex === currentLearningSlide;
  };

  const redirectToTab = (slideIndex) => {
    if (maxTabsPerFrame * activeFrame + slideIndex === currentLearningSlide)
      return;
    if (
      !(revisitRoute || checkIfEmbedEnabled()) &&
      maxTabsPerFrame * activeFrame + slideIndex >
        Math.max(lastActiveSlide, currentLearningSlide)
    )
      return;
    if (
      !(revisitRoute || checkIfEmbedEnabled()) &&
      isPracticeQuestion() &&
      get(tabArr[currentLearningSlide], "status") !== "complete"
    ) {
      if (slideIndex > currentLearningSlide % maxTabsPerFrame) return;
    }
    if (activeFrame * maxTabsPerFrame + slideIndex > currentLearningSlide)
      updateLearningSlideList(
        "next",
        activeFrame * maxTabsPerFrame + slideIndex
      );
    else
      updateLearningSlideList(
        "back",
        activeFrame * maxTabsPerFrame + slideIndex
      );
  };

  const getStatusAndAttemptNumber = (slideIndex, learningSlide) => {
    // let questionIndex = 0;
    let slideIdx = activeFrame * maxTabsPerFrame + slideIndex;
    let lastFrameLow = tabArr.length - maxTabsPerFrame;
    if (slideIdx >= lastFrameLow && slideIdx <= lastFrameLow + skipSlideRange) {
      slideIdx = slideIdx - skipSlideRange;
    }
    const slideDetail = tabArr[slideIdx]
    if (get(learningSlide, "learningSlide.id") &&
      (get(learningSlide, "learningSlide.pqQuestion", []).length || get(learningSlide, 'learningSlide.practiceQuestions', [].length))) {
      return {
        status: get(learningSlide, "status"),
        attemptNumber: get(learningSlide, "attemptNumber"),
      };
    }
    return {
      status: get(slideDetail, "status", 'incomplete'),
      attemptNumber: get(slideDetail, "attemptNumber", 0),
    };
    // for (
    //   let questionPointer = 0;
    //   questionPointer < slideIdx;
    //   questionPointer++
    // ) {
    //   if (
    //     questionPointer >= lastFrameLow &&
    //     questionPointer <= lastFrameLow + skipSlideRange
    //   )
    //     continue;
    //   if (
    //     get(tabArr[questionPointer], "learningSlide.type") ===
    //     "practiceQuestion"
    //   ) {
    //     questionIndex++;
    //   }
    // }
    // return {
    //   status: get(tabArr[slideIdx], "status"),
    //   attemptNumber: get(practiceQuestions[questionIndex], "attemptNumber"),
    // };
  };

  const getBGColor = (slideIndex, isQuestion, learningSlide) => {
    if (!isQuestion) {
      if (revisitRoute || checkIfEmbedEnabled()) return "#7dc7ec";
      if (
        activeFrame * maxTabsPerFrame + slideIndex >
        Math.max(lastActiveSlide, currentLearningSlide)
      )
        return "#DCDCDC";
      return "#7dc7ec";
    } else {
      let answerStatusData = getStatusAndAttemptNumber(slideIndex, learningSlide);

      if (answerStatusData.status !== "complete") {
        if (activeFrame * maxTabsPerFrame + slideIndex === currentLearningSlide)
          return "#7dc7ec";
        return (revisitRoute || checkIfEmbedEnabled()) ? "#7dc7ec" : "#DCDCDC";
      }
      if (answerStatusData.attemptNumber === 1) {
        return "#01AA93";
      }
      if (answerStatusData.attemptNumber === 2) {
        return "#8c61cb";
      }
      if (answerStatusData.attemptNumber >= 3) {
        return "#FAAD14";
      } else return "#7dc7ec";
    }
  };

  const renderSlideIndicators = (singleTab, slideIndex) => {
    let slideType = get(singleTab, "learningSlide.type");
    if (slideType === "grid" || slideType === 'googleSlides')
      return (
        <div
          style={{
            backgroundColor: getBGColor(slideIndex),
            cursor:
              getBGColor(slideIndex) === "#7dc7ec" ? "pointer" : "inherit",
          }}
          className={`${styles.slideGridIndicator} ${checkIfActiveSlide(
            slideIndex
          ) && styles.activeSlideGrid}`}
          onClick={() => {
            redirectToTab(slideIndex);
          }}
        ></div>
      );
    return (
      <div
        className={`${styles.slidePQIndicatorContainer} ${checkIfActiveSlide(
          slideIndex
        ) && styles.activeSlidePQ}`}
        onClick={() => {
          redirectToTab(slideIndex);
        }}
      >
        <div
          className={`${styles.slidePQIndicator}`}
          style={{
            backgroundColor: getBGColor(slideIndex, "PQ", singleTab),
          }}
        >
          <QuestionMark />
        </div>
      </div>
    );
  };

 const getClassname = () => {
    if (activeFrame === 0) {
      if (tabArr.length < maxTabsPerFrame) {
        return null;
      }
      if (tabArr.length === (activeFrame + 1) * maxTabsPerFrame) return null;
      return !(revisitRoute || checkIfEmbedEnabled()) && lastActiveSlide < (activeFrame + 1) * maxTabsPerFrame
        ? styles.afterEffectsIncomplete
        : styles.afterEffects;
    }
    if ((activeFrame + 1) * maxTabsPerFrame >= tabArr.length) {
      return styles.beforeEffects;
    }
    return !(revisitRoute || checkIfEmbedEnabled()) &&
      lastActiveSlide < (activeFrame + 1) * maxTabsPerFrame
      ? styles.dualEffectsIncomplete
      : styles.dualEffects;
  };

  const getSlicedArray = () => {
    return tabArr.slice(
      activeFrame * maxTabsPerFrame,
      activeFrame * maxTabsPerFrame + maxTabsPerFrame
    );
  };


  return (
    <div className={styles.headerWrapper}>
      <div
        className={`${styles.leftButtonWrapper} ${checkSlide("first") &&
          styles.disabled}`}
        onClick={decrementSlide}
        ref={leftArrowRef}
      >
        <Left />
      </div>
      {/* <div className={`${styles.outerWrapper} ${getClassname()}`}> */}
      <motion.div
        className={`${styles.slideHeaderContentWrapper} ${getClassname()}`}
        ref={tabsContainer}
        variants={getanimationVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        key={activeFrame}
      >
        {getSlicedArray().map((singleTab, slideIndex) =>
          renderSlideIndicators(singleTab, slideIndex)
        )}
        <div className={styles.sliderHeaderProgressBarOuter}>
          <div
            className={styles.sliderHeaderProgressBarInner}
            style={{ width: progressBar + "%" }}
          ></div>
        </div>
      </motion.div>
      {/* </div> */}
      <div
        className={`${styles.rightButtonWrapper} ${checkSlide("last") &&
          styles.disabled}`}
        onClick={incrementSlide}
        ref={rightArrowRef}
      >
        <Right />
      </div>
    </div>
  );
}

export default memo(SlideHeader);
