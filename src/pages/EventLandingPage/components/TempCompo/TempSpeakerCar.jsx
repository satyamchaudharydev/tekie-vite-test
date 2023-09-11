import React from 'react';
import Carousel, { CarouselItem } from "./TempCar";
import "./styles.scss";
import carousel_img from '../../../../../src/assets/eventPage/carousel_img.svg'
import carousel_linkedin from '../../../../../src/assets/eventPage/carousel_linkedin.svg'


export default function TempSpeakerCar() {
  return (
    <>
      <p className="Carousel_head">About Speakers</p>
      <Carousel limitShow={2} forBanner={false}>
        <CarouselItem>
          <img src={carousel_img} alt='MainCarousel_ui' className="MainCarousel_ui" />
          <div className="MainCarousel_text">
            <p className='MainCarousel_profile'>UI Developer @ Tekie</p>
            <p className='MainCarousel_name'>John Doe</p>
            <p className='MainCarousel_desc'>Amet minim mollit non deserunt</p>
            <p className='MainCarousel_desc'>sit aliqua dolor do amet sint. Velit</p>
            <p className='MainCarousel_desc'>consequat duis enim velit mollit.</p>
          </div>
          <img src={carousel_linkedin} alt='MainCarousel_linkedin' className='MainCarousel_linkedin' />
        </CarouselItem>
        <CarouselItem>
          <img src={carousel_img} alt='MainCarousel_ui' className="MainCarousel_ui" />
          <div className="MainCarousel_text">
            <p className='MainCarousel_profile'>UI Developer @ Tekie</p>
            <p className='MainCarousel_name'>John Doe</p>
            <p className='MainCarousel_desc'>Amet minim mollit non deserunt</p>
            <p className='MainCarousel_desc'>sit aliqua dolor do amet sint. Velit</p>
            <p className='MainCarousel_desc'>consequat duis enim velit mollit.</p>
          </div>
          <img src={carousel_linkedin} alt='MainCarousel_linkedin' className='MainCarousel_linkedin' />
        </CarouselItem>
        <CarouselItem>
          <img src={carousel_img} alt='MainCarousel_ui' className="MainCarousel_ui" />
          <div className="MainCarousel_text">
            <p className='MainCarousel_profile'>UI Developer @ Tekie</p>
            <p className='MainCarousel_name'>John Doe</p>
            <p className='MainCarousel_desc'>Amet minim mollit non deserunt</p>
            <p className='MainCarousel_desc'>sit aliqua dolor do amet sint. Velit</p>
            <p className='MainCarousel_desc'>consequat duis enim velit mollit.</p>
          </div>
          <img src={carousel_linkedin} alt='MainCarousel_linkedin' className='MainCarousel_linkedin' />
        </CarouselItem>
        <CarouselItem>
          <img src={carousel_img} alt='MainCarousel_ui' className="MainCarousel_ui" />
          <div className="MainCarousel_text">
            <p className='MainCarousel_profile'>UI Developer @ Tekie</p>
            <p className='MainCarousel_name'>John Doe</p>
            <p className='MainCarousel_desc'>Amet minim mollit non deserunt</p>
            <p className='MainCarousel_desc'>sit aliqua dolor do amet sint. Velit</p>
            <p className='MainCarousel_desc'>consequat duis enim velit mollit.</p>
          </div>
          <img src={carousel_linkedin} alt='MainCarousel_linkedin' className='MainCarousel_linkedin' />
        </CarouselItem>
        <CarouselItem>
          <img src={carousel_img} alt='MainCarousel_ui' className="MainCarousel_ui" />
          <div className="MainCarousel_text">
            <p className='MainCarousel_profile'>UI Developer @ Tekie</p>
            <p className='MainCarousel_name'>John Doe</p>
            <p className='MainCarousel_desc'>Amet minim mollit non deserunt</p>
            <p className='MainCarousel_desc'>sit aliqua dolor do amet sint. Velit</p>
            <p className='MainCarousel_desc'>consequat duis enim velit mollit.</p>
          </div>
          <img src={carousel_linkedin} alt='MainCarousel_linkedin' className='MainCarousel_linkedin' />
        </CarouselItem>
        <CarouselItem>
          <img src={carousel_img} alt='MainCarousel_ui' className="MainCarousel_ui" />
          <div className="MainCarousel_text">
            <p className='MainCarousel_profile'>UI Developer @ Tekie</p>
            <p className='MainCarousel_name'>John Doe</p>
            <p className='MainCarousel_desc'>Amet minim mollit non deserunt</p>
            <p className='MainCarousel_desc'>sit aliqua dolor do amet sint. Velit</p>
            <p className='MainCarousel_desc'>consequat duis enim velit mollit.</p>
          </div>
          <img src={carousel_linkedin} alt='MainCarousel_linkedin' className='MainCarousel_linkedin' />
        </CarouselItem>
        <CarouselItem>
          <img src={carousel_img} alt='MainCarousel_ui' className="MainCarousel_ui" />
          <div className="MainCarousel_text">
            <p className='MainCarousel_profile'>UI Developer @ Tekie</p>
            <p className='MainCarousel_name'>John Doe</p>
            <p className='MainCarousel_desc'>Amet minim mollit non deserunt</p>
            <p className='MainCarousel_desc'>sit aliqua dolor do amet sint. Velit</p>
            <p className='MainCarousel_desc'>consequat duis enim velit mollit.</p>
          </div>
          <img src={carousel_linkedin} alt='MainCarousel_linkedin' className='MainCarousel_linkedin' />
        </CarouselItem>
        <CarouselItem>
          <img src={carousel_img} alt='MainCarousel_ui' className="MainCarousel_ui" />
          <div className="MainCarousel_text">
            <p className='MainCarousel_profile'>UI Developer @ Tekie</p>
            <p className='MainCarousel_name'>John Doe</p>
            <p className='MainCarousel_desc'>Amet minim mollit non deserunt</p>
            <p className='MainCarousel_desc'>sit aliqua dolor do amet sint. Velit</p>
            <p className='MainCarousel_desc'>consequat duis enim velit mollit.</p>
          </div>
          <img src={carousel_linkedin} alt='MainCarousel_linkedin' className='MainCarousel_linkedin' />
        </CarouselItem>
      </Carousel>
    </>
  );
}
