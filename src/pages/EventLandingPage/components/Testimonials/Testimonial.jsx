import React from 'react';
import './testimonials.styles.scss';
import modelbg from '../../../../assets/semiback.png'

const Testimonials = ({ testimonial }) => {
    return(
        <div className='testimonial-box'>
            <div className='testimony'>
                {testimonial.detailedText}
            </div>
            <div className='testimony-author-details'>
                {/* {testimonial.author ? <div className='testimony-author'>~ {testimonial.author}</div> : <div className='testimony-author'></div>} */}
                <div className='testimony-name'>{testimonial.parentName}</div>
                <div className='testimony-grade'>{testimonial.moreInfo}</div>
            </div>
            <img src={modelbg} className='modelbg' alt='modelbg' />
            <img src={testimonial.image} className='model' alt='model' />
        </div>
    )
}

export default Testimonials;