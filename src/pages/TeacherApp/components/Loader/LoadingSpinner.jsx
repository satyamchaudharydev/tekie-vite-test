import React from 'react'
import Lottie from 'react-lottie'
import getThemeColor from '../../../../utils/teacherApp/getThemeColor'
import loadingLottie from '../../constants/lottie/loadingLottie.json'

import './spinner.scss'

const LoadingSpinner = (props) => {
    const renderLottie = () => <Lottie
                isClickToPauseDisabled
                options={{
                autoplay: true,
                animationData: props.lottieType || loadingLottie,
                loop: true,
                // rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
                }}
                style={{ marginBottom: '20px', opacity: '0.6', height: props.onlyLottie ? '40%' : '100%', width: props.onlyLottie ? '30%' : '100%' }}
            />
    if (props.onlyLottie) {
        return renderLottie()
    }
    
    return (
        <div className='loader-container' style={{
            position: props.position ? props.position : 'relative',
            height: props.height ? props.height : '36px',
            width: props.width ? props.width : 'fit-content',
            left: props.left ? props.left : '0px',
            marginLeft: props.left ? props.marginLeft : '0px',
            marginRight: props.left ? props.marginRight : '0px',
            top: props.top ? props.top : '0px',
            transform: props.transform ? props.transform : '',
            flexDirection: props.flexDirection || 'row'
        }}>
            {props.showLottie ? renderLottie() : (
                <svg width={props.height ? props.height : '36px'}
                    height={props.width ? props.width : '36px'} viewBox="-10 -5 80 75" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <animateTransform attributeName="transform" type="rotate" values="0 33 33;270 33 33" begin="0s" dur="1.4s" fill="freeze" repeatCount="indefinite" />
                        <circle fill="none" stroke-width="10" stroke-linecap="round" cx="33" cy="33" r="30" stroke-dasharray="187" stroke-dashoffset="610">
                            <animate attributeName="stroke" values={props.color ? props.color : getThemeColor()} begin="0s" dur="5.6s" fill="freeze" repeatCount="indefinite" />
                            <animateTransform attributeName="transform" type="rotate" values="0 33 33;135 33 33;450 33 33" begin="0s" dur="1.4s" fill="freeze" repeatCount="indefinite" />
                            <animate attributeName="stroke-dashoffset" values="187;46.75;187" begin="0s" dur="1.4s" fill="freeze" repeatCount="indefinite" />
                        </circle>
                    </g>
                </svg>
            )}
            {/* <div className="Spinner"
                style={{
                    height: ,
                    width: ,
                }}
            >
                <div className="Spinner-line Spinner-line--animation" style={{ borderColor: props.color ? props.color : '#8C61CB' }}>
                    <div className="Spinner-line-cog">
                        <div 
                            className="Spinner-line-cog-inner Spinner-line-cog-inner--left"
                            style={{ borderWidth : props.borderWidth ? props.borderWidth : '3px' }}
                        ></div>
                    </div>
                    <div className="Spinner-line-ticker">
                        <div 
                            className="Spinner-line-cog-inner Spinner-line-cog-inner--center"
                            style={{ borderWidth : props.borderWidth ? props.borderWidth : '3px' }}
                        ></div>
                    </div>
                    <div className="Spinner-line-cog">
                        <div 
                            className="Spinner-line-cog-inner Spinner-line-cog-inner--right"
                            style={{ borderWidth : props.borderWidth ? props.borderWidth : '3px' }}
                        ></div>
                    </div>
                </div>

            </div> */}
            {props.children}
        </div >
    )
}

export default LoadingSpinner