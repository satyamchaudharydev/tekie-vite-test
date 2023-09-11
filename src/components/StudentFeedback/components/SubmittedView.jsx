import React from 'react'
import { ArrowForward } from '../../../constants/icons'
import negativeConji from '../../../assets/conji/negativeConji.png'
import UpdatedButton from '../../Buttons/UpdatedButton/UpdatedButton'
import {motion,AnimatePresence} from 'framer-motion'
import { useHistory } from 'react-router'

function SubmittedView({selectedRating,setIsContinue}) {
  const history = useHistory()
  return (
    <>
    <div className="sf-submitted-view-container">
        <img className="sf-submiited-view-container--conji" src={negativeConji} alt="" srcset="" />
        <h2 className='sf-submitted-view-container--heading'>Thank you for the Feedback!</h2>
        <motion.p
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
          className='sf-submitted-view-container--subheading'>Your feedback help us improve the
        experience for all the students!.
        </motion.p>
      
{/*         
        <UpdatedButton
            text="Continue"
            containerClass="sf-default-form-submit-btn"
            onBtnClick={console.log('clicked')}
          
          rightIcon
        >
            
          <ArrowForward
            color='white'
            />
        </UpdatedButton> */}
    </div>
  
    </>
    

  )
}

export default SubmittedView
