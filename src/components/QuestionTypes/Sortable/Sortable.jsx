import React from 'react'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import {ReactComponent as ArrangeIcon} from '../../../assets/arrangeIcon.svg'
import styles from './Sortable.module.scss'
import hs from '../../../utils/scale'
import cx from 'classnames'
import arrangeOptionIcon from './assets/arrangeOptionIcon.svg'

const terminalStyles = {
  height: '100%',
  padding: 0,
  paddingRight:0,
  paddingBottom:0,
  marginTop:0,
  marginBottom: 0,
  border:'#aaacae',
  alignItems: 'center',
  display: 'flex',
  backgroundColor: '#002f3e'
}

const updatedTerminalStyles = {
    width: '100%',
    height: '100%',
    marginTop: 0,
    marginBottom: 0,
    paddingRight: 0,
    paddingBottom: 0,
    fontFamily: 'Nunito',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '2',
    letterSpacing: 'normal',
    backgroundColor: '#012A38',
    borderRadius: '5px',
    fontSize: hs(20),
    border: '2px solid #005773',
    boxSizing: 'border-box',
    backdropFilter: 'blur(150px)',
}

const showAnsTerminalStyles = {
    width: '100%',
    height: '100%',
    marginTop: 0,
    marginBottom: 0,
    paddingBottom: 0,
    paddingRight: 16,
    fontFamily: 'Nunito',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '2',
    letterSpacing: 'normal',
    backgroundColor: '#012A38',
    borderRadius: '5px',
    whiteSpace: 'pre-wrap',
    // border: '2px solid #005773',
    borderStyle: 'solid',
    borderColor: 'rgba(0, 87, 115)',
    borderWidth: '2px 2px 1px 2px',
    boxSizing: 'border-box',
    backdropFilter: 'blur(150px)',
}

const SortableItem = SortableElement(({value, withUpdatedDesign, isUpdatedReviewFlow, isSelectedPositionWrong, isSubmittedForReview, isMobile, isLearningSlide }) => (
  <div style={{ position: 'relative', zIndex: 98, }} className={cx({
    [styles.item]: true && !isLearningSlide,
    [styles.itemLearningSlide]: true && isLearningSlide,
    [styles.updatedItem]: withUpdatedDesign && !isLearningSlide,
    [styles.updatedItemLearningSlide]: withUpdatedDesign && isLearningSlide,
    [styles.reviewStyle]: (isSubmittedForReview && withUpdatedDesign),
    [styles.prePadding]: isSelectedPositionWrong,
    [styles.mbSortableItem]: window.innerWidth < 768
  })}>
  {
    isMobile ? 
    (
      <div className={styles.mbArrangeOptionContainer}>
        <img src={arrangeOptionIcon} alt="arrangeOptionIcon" className={styles.mbArrangeOptionIcon}/>
        <SyntaxHighlighter
          codeTagProps={{ style: { fontFamily: `${withUpdatedDesign ? 'Nunito' : 'Monaco'}` } }}
          language="jsx"
          customStyle={(isSubmittedForReview && withUpdatedDesign) ? showAnsTerminalStyles : (withUpdatedDesign ? updatedTerminalStyles : terminalStyles)}
          style={darcula}>
              {value}
          </SyntaxHighlighter>
      </div>
    ) :
    (
  <SyntaxHighlighter
    codeTagProps={{ style: { fontFamily: `${withUpdatedDesign ? 'Nunito' : 'Monaco'}` } }}
    language="jsx"
    customStyle={(isSubmittedForReview && withUpdatedDesign) ? showAnsTerminalStyles : (withUpdatedDesign ? updatedTerminalStyles : terminalStyles)}
    style={darcula}>
        {value}
    </SyntaxHighlighter>
    )
  }
    {(isUpdatedReviewFlow && isSelectedPositionWrong) && (
      <div className={styles.wrongAnswerCheck}> <span /> </div>
    )}
    {!withUpdatedDesign && (
      <div className={styles.arrangeIconContainer}>
      <ArrangeIcon />
      </div>
    )}
  </div>
));

const SortableList = SortableContainer(({items, isSeeAnswers, isSubmittedForReview, withUpdatedDesign, correctOptions = null, isLearningSlide, isMobile}) => {
  const checkIfItemWrong = (item, index) => {
    if (correctOptions && correctOptions.length && item) {
      const filteredOptions = correctOptions.filter(option => option.statement === item.statement)
      if (filteredOptions && filteredOptions.length) {
        if (filteredOptions[0].correctPositions && filteredOptions[0].correctPositions.length) {
          if (filteredOptions[0].correctPositions && filteredOptions[0].correctPositions.indexOf(index) === -1) {
            return true
          }
        } else {
          if (filteredOptions[0].correctPosition && filteredOptions[0].correctPosition !== index) {
            return true
          }
        }
      }
    }
    return false
  }
  const isUpdatedReviewFlow = (isSubmittedForReview && withUpdatedDesign && correctOptions)
  return (
    <ul style={{padding:0,width: '100%'}}>
      {items.map((item, index) => {
          const isSelectedPositionWrong = checkIfItemWrong(item, index+1)
          if (item) {
              return (
                  <SortableItem
                      key={`${index}-${(item.displayOrder || item.correctPosition)}`}
                      index={index}
                      value={item.statement}
                      disabled={isSeeAnswers || isSubmittedForReview}
                      withUpdatedDesign={withUpdatedDesign}
                      isUpdatedReviewFlow={isUpdatedReviewFlow}
                      isSubmittedForReview={isSubmittedForReview}
                      isSelectedPositionWrong={isSelectedPositionWrong}
                      isLearningSlide={isLearningSlide}
                      isMobile={isMobile}
                  />
              )
          }
          return <></>
      })}
    </ul>
  );
});

// class Sortables extends Component {
//   state = {
//       items: [],
//   };
//   onSortEnd = ({oldIndex, newIndex}) => {
//     this.setState(({items}) => ({
//       items: arrayMove(items, oldIndex, newIndex),
//     }));
//   };
//   updateBeforeSortStart=async({node, index, collection, isKeySorting}, event)=>{
//   }
//   render() {
//     return;
//   }
// }

export default SortableList
