import React from 'react'
import SimpleButtonLoader from '../../../../components/SimpleButtonLoader';
import './customButton.scss'

const CustomButton = ({content, img,type, clickEvent = () => {}, showLoader}) => {
    let classUsed = '';
    if(type === 'banner') {
        classUsed = 'banner-btn'
    }

    if(type === 'video') {
        classUsed = 'videoDiv-button'
    }

    if(type === 'join') {
        classUsed = 'custom-button-1'
    }
    if (type === 'register') classUsed = 'custom-button-register'
    if(type === 'detail') {
        classUsed = 'custom-button-2'
    }

    return(
        <button onClick={() => clickEvent()} className={`${type !== 'detail' && 'custom-event-buttons'} ${classUsed}`}><span>{content}</span>
            {showLoader ? (
                <SimpleButtonLoader
                    noGradient
                    showLoader={true}
                    style={{ left: 7 }}
                />
            ) : (
                img && <img src={img} alt='arrow' />
            )}
            {type === 'banner' && (
                <svg xmlns="http://www.w3.org/2000/svg" className='bannerIcon' width="14" height="15" viewBox="0 0 14 15" fill="none">
                <path d="M6.2863 1.04618L6.2863 11.0194L1.92916 6.66225C1.58094 6.31403 1.00951 6.31403 0.6613 6.66225C0.313085 7.01046 0.313085 7.57296 0.6613 7.92118L6.54523 13.8051C6.89344 14.1533 7.45594 14.1533 7.80416 13.8051L13.697 7.93011C13.8642 7.76329 13.9582 7.53682 13.9582 7.30064C13.9582 7.06447 13.8642 6.83799 13.697 6.67118C13.3488 6.32296 12.7863 6.32296 12.4381 6.67118L8.07201 11.0194V1.04618C8.07201 0.555106 7.67023 0.15332 7.17916 0.15332C6.68808 0.15332 6.2863 0.555106 6.2863 1.04618Z" fill="white"/>
                </svg>
            )}
        </button>
    )
}

export default CustomButton