import React from 'react'
import StarIcon from '../starIcon'
import { motion } from 'framer-motion'
import { useState } from 'react'
const Ratings = ({reviewEval,updateSelectedRating,selectedRating,handleRated,isRated}) => {
    const [hover,setHover] = useState(0)
    const currentSelectedRating = hover || selectedRating
    return (
        <div className="sf-default-rating-container--ratings">
            <div className="sf-default-rating-container--ratings-reviews">
                {reviewEval.map((item, index) => {
                    index += 1
                    const isSelected = currentSelectedRating && (index <= currentSelectedRating)
                    return (
                        <motion.div
                        key={index}
                        className={`sf-default-rating-container--ratings--item ${isSelected ? 'selected-rating' : ''}`}
                        onClick={() => {
                            isRated && handleRated()
                            updateSelectedRating(index)
                        }}
                        onMouseEnter={() => setHover(index)}
                        onMouseLeave={() => setHover(0)}
                        >
                            <StarIcon />
                        </motion.div>  
                    )  
                })}
            </div>
            <motion.div
                key={currentSelectedRating}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                className="sf-default-rating-container--ratings-label">
                    {currentSelectedRating ? reviewEval[currentSelectedRating - 1].label : 'Rating'}
            </motion.div>
        </div>

    )
}

export default Ratings