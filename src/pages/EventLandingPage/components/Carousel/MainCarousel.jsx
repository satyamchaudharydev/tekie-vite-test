import React from "react";
import Carousel, { CarouselItem } from "./Carousel";
import "./styles.scss";
import carousel_img from "../../../../../src/assets/eventPage/carousel_img.svg";
import carousel_linkedin from "../../../../../src/assets/eventPage/carousel_linkedin.svg";
import getPath from "../../../../utils/getPath";
import { get } from "lodash";

export default function ({ data = [] }) {
  return (
    <div className="App">
      <p className="Carousel_head">About Speakers</p>
      <Carousel
        limitShow={2}
        forBanner={false}
        forEvents={false}
        forSpeakers={true}
      >
        {data.map(({ about, linkedInLink, organization, roleAtOrganization, user }) => (
          <CarouselItem>
            <img
              src={getPath(get(user, 'profilePic.uri'))}
              alt="EventSpeakers_ui"
              className="EventSpeakers_ui"
            />
            <div className="EventSpeakers_text">
              <p className="EventSpeakers_profile">{roleAtOrganization} @ {organization}</p>
              <p className="EventSpeakers_name">{get(user, 'name')}</p>
              <div className="EventSpeakers_desc">
                {about}
              </div>
              <a href={linkedInLink}>
                <img
                src={carousel_linkedin}
                alt="EventSpeakers_linkedin"
                className="EventSpeakers_linkedin"
              />
              </a>
            </div>
          </CarouselItem>
        ))}
        {/* <CarouselItem>
          <img
            src={carousel_img}
            alt="EventSpeakers_ui"
            className="EventSpeakers_ui"
          />
          <div className="EventSpeakers_text">
            <p className="EventSpeakers_profile">UI Developer @ Tekie</p>
            <p className="EventSpeakers_name">John Doe</p>
            <div className="EventSpeakers_desc">
              Amet minim mollit non deserunt sit aliqua dolor do amet sint.
              Velit consequat duis enim velit mollit.
            </div>
            <img
              src={carousel_linkedin}
              alt="EventSpeakers_linkedin"
              className="EventSpeakers_linkedin"
            />
          </div>
        </CarouselItem> */}
        {/* <CarouselItem>
          <img
            src={carousel_img}
            alt="EventSpeakers_ui"
            className="EventSpeakers_ui"
          />
          <div className="EventSpeakers_text">
            <p className="EventSpeakers_profile">UI Developer @ Tekie</p>
            <p className="EventSpeakers_name">John Doe</p>
            <div className="EventSpeakers_desc">
              Amet minim mollit non deserunt sit aliqua dolor do amet sint.
              Velit consequat duis enim velit mollit.
            </div>
            <img
              src={carousel_linkedin}
              alt="EventSpeakers_linkedin"
              className="EventSpeakers_linkedin"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <img
            src={carousel_img}
            alt="EventSpeakers_ui"
            className="EventSpeakers_ui"
          />
          <div className="EventSpeakers_text">
            <p className="EventSpeakers_profile">UI Developer @ Tekie</p>
            <p className="EventSpeakers_name">John Doe</p>
            <div className="EventSpeakers_desc">
              Amet minim mollit non deserunt sit aliqua dolor do amet sint.
              Velit consequat duis enim velit mollit.
            </div>
            <img
              src={carousel_linkedin}
              alt="EventSpeakers_linkedin"
              className="EventSpeakers_linkedin"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <img
            src={carousel_img}
            alt="EventSpeakers_ui"
            className="EventSpeakers_ui"
          />
          <div className="EventSpeakers_text">
            <p className="EventSpeakers_profile">UI Developer @ Tekie</p>
            <p className="EventSpeakers_name">John Doe</p>
            <div className="EventSpeakers_desc">
              Amet minim mollit non deserunt sit aliqua dolor do amet sint.
              Velit consequat duis enim velit mollit.
            </div>
            <img
              src={carousel_linkedin}
              alt="EventSpeakers_linkedin"
              className="EventSpeakers_linkedin"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <img
            src={carousel_img}
            alt="EventSpeakers_ui"
            className="EventSpeakers_ui"
          />
          <div className="EventSpeakers_text">
            <p className="EventSpeakers_profile">UI Developer @ Tekie</p>
            <p className="EventSpeakers_name">John Doe</p>
            <div className="EventSpeakers_desc">
              Amet minim mollit non deserunt sit aliqua dolor do amet sint.
              Velit consequat duis enim velit mollit.
            </div>
            <img
              src={carousel_linkedin}
              alt="EventSpeakers_linkedin"
              className="EventSpeakers_linkedin"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <img
            src={carousel_img}
            alt="EventSpeakers_ui"
            className="EventSpeakers_ui"
          />
          <div className="EventSpeakers_text">
            <p className="EventSpeakers_profile">UI Developer @ Tekie</p>
            <p className="EventSpeakers_name">John Doe</p>
            <div className="EventSpeakers_desc">
              Amet minim mollit non deserunt sit aliqua dolor do amet sint.
              Velit consequat duis enim velit mollit.
            </div>
            <img
              src={carousel_linkedin}
              alt="EventSpeakers_linkedin"
              className="EventSpeakers_linkedin"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <img
            src={carousel_img}
            alt="EventSpeakers_ui"
            className="EventSpeakers_ui"
          />
          <div className="EventSpeakers_text">
            <p className="EventSpeakers_profile">UI Developer @ Tekie</p>
            <p className="EventSpeakers_name">John Doe</p>
            <div className="EventSpeakers_desc">
              Amet minim mollit non deserunt sit aliqua dolor do amet sint.
              Velit consequat duis enim velit mollit.
            </div>
            <img
              src={carousel_linkedin}
              alt="EventSpeakers_linkedin"
              className="EventSpeakers_linkedin"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <img
            src={carousel_img}
            alt="EventSpeakers_ui"
            className="EventSpeakers_ui"
          />
          <div className="EventSpeakers_text">
            <p className="EventSpeakers_profile">UI Developer @ Tekie</p>
            <p className="EventSpeakers_name">John Doe</p>
            <div className="EventSpeakers_desc">
              Amet minim mollit non deserunt sit aliqua dolor do amet sint.
              Velit consequat duis enim velit mollit.
            </div>
            <img
              src={carousel_linkedin}
              alt="EventSpeakers_linkedin"
              className="EventSpeakers_linkedin"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <img
            src={carousel_img}
            alt="EventSpeakers_ui"
            className="EventSpeakers_ui"
          />
          <div className="EventSpeakers_text">
            <p className="EventSpeakers_profile">UI Developer @ Tekie</p>
            <p className="EventSpeakers_name">John Doe</p>
            <div className="EventSpeakers_desc">
              Amet minim mollit non deserunt sit aliqua dolor do amet sint.
              Velit consequat duis enim velit mollit.
            </div>
            <img
              src={carousel_linkedin}
              alt="EventSpeakers_linkedin"
              className="EventSpeakers_linkedin"
            />
          </div>
        </CarouselItem> */}
      </Carousel>
    </div>
  );
}
