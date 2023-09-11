import React from 'react';
import Carousel, { CarouselItem } from "./TempCar";
import "./styles.scss";
import bg_triangle from '../../../../../src/assets/eventPage/bg_triangle.svg'
import decorator from '../../../../../src/assets/eventPage/decorator.svg'
import firstPrize from '../../../../../src/assets/eventPage/firstPrize.svg'
import secondPrize from '../../../../../src/assets/eventPage/secondPrize.svg'
import thirdPrize from '../../../../../src/assets/eventPage/thirdPrize.svg'
import forthPrize from '../../../../../src/assets/eventPage/forthPrize.svg'
import fifthPrize from '../../../../../src/assets/eventPage/fifthPrize.svg'



export default function TempWinnerCar() {
  const data = {
    firstWinnerName: 'Aseem Patil', firstWinnerImg: firstPrize,
    secondWinnerName: 'John Done', secondWinnerImg: secondPrize,
    thirdWinnerName: 'Rakesh Gupta', thirdWinnerImg: thirdPrize,
    fourthWinnerName: 'Fourth', fourthWinnerImg: forthPrize,
    fifthWinnerName: 'Fifth', fifthWinnerImg: fifthPrize,

    sixthWinnerName: 'Aseem Patil', sixthWinnerImg: firstPrize,
    seventhWinnerName: 'Aseem Patil', seventhWinnerImg: firstPrize,
    eightWinnerName: 'Aseem Patil', eightWinnerImg: firstPrize,
    ninthWinnerName: 'Aseem Patil', ninthWinnerImg: firstPrize,
    tenthWinnerName: 'Aseem Patil', tenthWinnerImg: firstPrize,

    posixthWinnerName: 'Aseem Patil', posixthWinnerImg: firstPrize,
    poseventhWinnerName: 'Aseem Patil', poseventhWinnerImg: firstPrize,
    poeightWinnerName: 'Aseem Patil', poeightWinnerImg: firstPrize,
    poninthWinnerName: 'Aseem Patil', poninthWinnerImg: firstPrize,
    potenthWinnerName: 'Aseem Patil', potenthWinnerImg: firstPrize,

    unsixthWinnerName: 'Aseem Patil', unsixthWinnerImg: firstPrize,
    unseventhWinnerName: 'Aseem Patil', unseventhWinnerImg: firstPrize,
    uneightWinnerName: 'Aseem Patil', uneightWinnerImg: firstPrize,
    unninthWinnerName: 'Aseem Patil', unninthWinnerImg: firstPrize,
    untenthWinnerName: 'Aseem Patil', untenthWinnerImg: firstPrize,
  }
  console.log( Object.keys(data).length)
  let numInvisible = 0;
  if(Object.keys(data).length === 6 || Object.keys(data).length === 10){
    numInvisible = 4
  }else if (Object.keys(data).length > 10 && Object.keys(data).length <= 20){
    numInvisible = 3
  }else if (Object.keys(data).length > 20 && Object.keys(data).length <= 30){
    numInvisible = 2
  }else if (Object.keys(data).length > 30 && Object.keys(data).length <= 40){
    numInvisible = 1
  }
  return (
    <div className="Winner_App">
      <img src={decorator} alt='triangle'  className='decorator_2'/>
      <p className="WinnerCarousel_head">Winners<span style={{color: 'white', marginLeft: '10px'}}> from Spy Squad Game</span></p>
      <Carousel limitShow={2} forBanner={true} forWinner={true} numInvisible={numInvisible}>
        {(Object.keys(data).length === 6) ? <CarouselItem  forWinner={true}>
            <div>
                <img src={data.secondWinnerImg} alt='secondPrize'  className='secondPrize'/>
                <img src={data.firstWinnerImg} alt='firstPrize'  className='firstPrize'/>
                <img src={data.thirdWinnerImg} alt='thirdPrize'  className='thirdPrize'/>
            </div>
            <div>
              <p className="secondHead">2nd Prize</p>
              <p className="secondName">{data.secondWinnerName}</p>
              <p className="firstHead">1st Prize</p>
              <p className="firstName">{data.firstWinnerName}</p>
              <p className="thirdHead">3rd prize</p>
              <p className="thirdName">{data.thirdWinnerName}</p>
            </div>
        </CarouselItem> : <CarouselItem invisible={true} ></CarouselItem>}
        {(Object.keys(data).length > 6) ? <CarouselItem  forWinner={true}>
            <div className="winner_first_section">
                <img src={data.secondWinnerImg} alt='secondPrize'  className='secondPrize'/>
                <img src={data.firstWinnerImg} alt='firstPrize'  className='firstPrize'/>
                <img src={data.thirdWinnerImg} alt='thirdPrize'  className='thirdPrize'/>
            </div>
            <div className='winner_first_sec_text'>
              <p className="secondHead">2nd Prize</p>
              <p className="secondName">{data.secondWinnerName}</p>
              <p className="firstHead">1st Prize</p>
              <p className="firstName">{data.firstWinnerName}</p>
              <p className="thirdHead">3rd prize</p>
              <p className="thirdName">{data.thirdWinnerName}</p>
            </div>
            <div className="winner_second_section">
                <img src={data.fourthWinnerImg} alt='forthPrize'  className='forthPrize'/>
                <img src={data.fifthWinnerImg} alt='fifthPrize'  className='fifthPrize'/>
            </div>
            <div className='winner_second_sec_text'>
              <p className="forthHead">4th prize</p>
              <p className="forthName">{data.fourthWinnerName}</p>
              <p className="fifthHead">5th prize</p>
              <p className="fifthName">{data.fifthWinnerName}</p>
            </div>
        </CarouselItem> : <CarouselItem invisible={true} ></CarouselItem>}
        {(Object.keys(data).length > 10) ? <CarouselItem  forWinner={true}>
            <div className="winner_first_section">
                <img src={data.secondWinnerImg} alt='secondPrize'  className='secondPrize'/>
                <img src={data.firstWinnerImg} alt='firstPrize'  className='firstPrize'/>
                <img src={data.thirdWinnerImg} alt='thirdPrize'  className='thirdPrize'/>
            </div>
            <div className='winner_first_sec_text'>
              <p className="secondHead">2nd Prize</p>
              <p className="secondName">{data.secondWinnerName}</p>
              <p className="firstHead">1st Prize</p>
              <p className="firstName">{data.firstWinnerName}</p>
              <p className="thirdHead">3rd prize</p>
              <p className="thirdName">{data.thirdWinnerName}</p>
            </div>
            <div className="winner_second_section">
                <img src={data.fourthWinnerImg} alt='forthPrize'  className='forthPrize'/>
                <img src={data.fifthWinnerImg} alt='fifthPrize'  className='fifthPrize'/>
            </div>
            <div className='winner_second_sec_text'>
              <p className="forthHead">4th prize</p>
              <p className="forthName">{data.fourthWinnerName}</p>
              <p className="fifthHead">5th prize</p>
              <p className="fifthName">{data.fifthWinnerName}</p>
            </div>
        </CarouselItem> : <CarouselItem invisible={true} ></CarouselItem>}
        {(Object.keys(data).length > 20) ? <CarouselItem  forWinner={true}>
            <div className="winner_first_section">
                <img src={data.secondWinnerImg} alt='secondPrize'  className='secondPrize'/>
                <img src={data.firstWinnerImg} alt='firstPrize'  className='firstPrize'/>
                <img src={data.thirdWinnerImg} alt='thirdPrize'  className='thirdPrize'/>
            </div>
            <div className='winner_first_sec_text'>
              <p className="secondHead">2nd Prize</p>
              <p className="secondName">{data.secondWinnerName}</p>
              <p className="firstHead">1st Prize</p>
              <p className="firstName">{data.firstWinnerName}</p>
              <p className="thirdHead">3rd prize</p>
              <p className="thirdName">{data.thirdWinnerName}</p>
            </div>
            <div className="winner_second_section">
                <img src={data.fourthWinnerImg} alt='forthPrize'  className='forthPrize'/>
                <img src={data.fifthWinnerImg} alt='fifthPrize'  className='fifthPrize'/>
            </div>
            <div className='winner_second_sec_text'>
              <p className="forthHead">4th prize</p>
              <p className="forthName">{data.fourthWinnerName}</p>
              <p className="fifthHead">5th prize</p>
              <p className="fifthName">{data.fifthWinnerName}</p>
            </div>
        </CarouselItem> : <CarouselItem invisible={true} ></CarouselItem>}
        {(Object.keys(data).length > 30) ? <CarouselItem  forWinner={true}>
            <div className="winner_first_section">
                <img src={data.secondWinnerImg} alt='secondPrize'  className='secondPrize'/>
                <img src={data.firstWinnerImg} alt='firstPrize'  className='firstPrize'/>
                <img src={data.thirdWinnerImg} alt='thirdPrize'  className='thirdPrize'/>
            </div>
            <div className='winner_first_sec_text'>
              <p className="secondHead">2nd Prize</p>
              <p className="secondName">{data.secondWinnerName}</p>
              <p className="firstHead">1st Prize</p>
              <p className="firstName">{data.firstWinnerName}</p>
              <p className="thirdHead">3rd prize</p>
              <p className="thirdName">{data.thirdWinnerName}</p>
            </div>
            <div className="winner_second_section">
                <img src={data.fourthWinnerImg} alt='forthPrize'  className='forthPrize'/>
                <img src={data.fifthWinnerImg} alt='fifthPrize'  className='fifthPrize'/>
            </div>
            <div className='winner_second_sec_text'>
              <p className="forthHead">4th prize</p>
              <p className="forthName">{data.fourthWinnerName}</p>
              <p className="fifthHead">5th prize</p>
              <p className="fifthName">{data.fifthWinnerName}</p>
            </div>
        </CarouselItem> : <CarouselItem invisible={true} ></CarouselItem>}
      </Carousel>
      <img src={decorator} alt='triangle'  className='decorator_1'/>
    </div>
  );
}
