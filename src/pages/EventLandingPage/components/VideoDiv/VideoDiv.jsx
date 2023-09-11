import React from 'react';
import screenSHot from '../../../../assets/eventShot.png';
import ForwardArrow from '../../../../assets/Forward1.png';
import VideoPlay from '../../../../assets/video-play.png';
import YoutubeEmbed from '../../../LandingPage/components/YoutubeEmbed';
import CustomButton from '../CustomButton/CustomButton';
import './VideoDiv.styles.scss'

const VideoDiv = () => {
    const[showVideo, setShowVideo] = React.useState(false)
    return(
        <div className='videoDiv'>
            <div className='mask'>
                <div className='videoDiv-heading'>
                    <span>Catch a glimpse of our</span>
                    <span>Community Events</span>
                </div>
                <div className='videoDiv-content'>Students all over India are <br class="only-phone"/> Upskilling and winning prizes <br class="only-phone" /> every weekend with Tekie</div>
                <CustomButton type='video' content="Watch Video" clickEvent={() => setShowVideo(!showVideo)} img={ForwardArrow} />
                {/* <button onClick={() => setShowVideo(!showVideo)} className='videoDiv-button'>Watch Video<img src={ForwardArrow} alt='arrow' className='forward-arrow-video-div' /></button> */}
            </div>
            <img src={screenSHot} alt='screen shot' className='screenShot' />
            <img onClick={() => setShowVideo(!showVideo)} src={VideoPlay} alt='Video-play' className='video-play'/>
            <div style={{ zIndex: 9999 }}><YoutubeEmbed visible={showVideo} id='mhgymw0f4D4'  close={() =>  setShowVideo(!showVideo)}/></div>
        </div>
    )
}

export default VideoDiv;