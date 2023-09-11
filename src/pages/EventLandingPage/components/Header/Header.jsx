import React, { useState } from "react";
import "./header.scss";
import tekieLogo from "../../../../../src/assets/eventPage/tekie.png";
import downArrow from "../../../../../src/assets/eventPage/downArrow.svg";
import isMobile from "../../../../utils/isMobile";
import { Link } from "react-router-dom";
import { PRIMARY_BUTTON_DEFAULT_TEXT, WAITINGMODAL_ROUTE } from "../../../../config";

function Header({ click }) {
  const menuBtns = [
    ...document.querySelectorAll(".lp-header-menu-btn.menu-0"),
    ...document.querySelectorAll(".lp-header-menu-btn.menu-1"),
  ];

  menuBtns.forEach((menuBtn) => {
    let cancelClosing;
    const menu = menuBtn.classList.contains("menu-0")
      ? document.querySelector(".lp-header-menu-content.menu-0")
      : document.querySelector(".lp-header-menu-resources-content");
    menu.addEventListener("mouseover", (e) => {
      if (cancelClosing) {
        clearTimeout(cancelClosing);
      }
    });
    menu.addEventListener("mouseout", (e) => {
      cancelClosing = setTimeout(() => {
        menu.classList.remove("open-events-header");
      }, 300);
    });
    menuBtn.addEventListener("mouseover", (e) => {
      if (cancelClosing) {
        clearTimeout(cancelClosing);
      }
      menu.classList.add("open-events-header");
    });
    menuBtn.addEventListener("mouseout", (e) => {
      cancelClosing = setTimeout(() => {
        menu.classList.remove("open-events-header");
      }, 300);
    });
  });

  return (
    <>
      <div class="lp-header-space"></div>
      <div class="lp-header-container">
        <div class="lp-header">
          <div onClick={() => click()} class="lp-header-hamburger">
            <div class="lp-header-line"></div>
            <div class="lp-header-line"></div>
            <div class="lp-header-line"></div>
          </div>

          <div class="lp-header-logo">
            <a href="/" class="lp-header-logo-link">
              <img src={tekieLogo} alt="Logo" class="lp-header-logo-img" />
            </a>
          </div>

          <div class="lp-header-navlinks">
            {/* <button class="lp-header-navbar-button">
              <a href="/" class="lp-header-link">
                Why Tekie
              </a>
            </button> */}

            <div class="lp-header-dropdown-menu" id="lp-header-courses-link">
              <button class="lp-header-menu-btn menu-0">
                <p class="lp-header-link">Courses</p>
                <img src={downArrow} alt="arrow-down" />
              </button>

              <div class="lp-header-menu-content menu-0">
                <div class="lp-header-link-container">
                  <a
                    class="lp-header-link lp-header-dropdown-link"
                    href="/course/code-with-koi"
                  >
                    Building Logic and Algorithmic Thinking
                  </a>
                </div>
                <div class="lp-header-link-container">
                  <a
                    class="lp-header-link lp-header-dropdown-link"
                    href="/course/koi-and-newt"
                  >
                    Intro to Coding (with Blockly)
                  </a>
                </div>
                <div class="lp-header-link-container">
                  <a
                    class="lp-header-link lp-header-dropdown-link"
                    href="/course/tales-of-oak"
                  >
                    Intro to Coding (with Python)
                  </a>
                </div>
                <div class="lp-header-link-container">
                  <a
                    class="lp-header-link lp-header-dropdown-link"
                    href="/course/mae-walker-the-search"
                  >
                    Web Development Specialisation
                  </a>
                </div>
              </div>
            </div>

            <button class="lp-header-navbar-button">
              {" "}
              <Link to={"/student-community"} class="lp-header-link">
                Community
              </Link>
            </button>
            {/* <button class="lp-header-navbar-button">
              {" "}
              <Link to={"/events"} class="lp-header-link">
                Events
              </Link>
            </button> */}

            <div class="lp-header-dropdown-menu" id="lp-header-resources-link">
              <button class="lp-header-menu-btn menu-1">
                <p class="lp-header-link">Resources</p>
                <img src={downArrow} alt="arrow-down" />
              </button>
              <div class="lp-header-menu-content lp-header-menu-resources-content menu-1">
                <div class="lp-header-link-container">
                  <Link
                    class="lp-header-link lp-header-dropdown-link"
                    to={"/code-playground"}
                  >
                    Code Playground
                  </Link>
                </div>
                <div class="lp-header-link-container">
                  <Link
                    class="lp-header-link lp-header-dropdown-link"
                    to={"/cheatsheet"}
                  >
                    Cheat Sheet
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div class="lp-header-buttons">
            {/* <a
              href={WAITINGMODAL_ROUTE}
              style={{ textDecoration: "none" }}
              class="book-a-free-class-btn"
            >
              <div class="btn-sd-blue-container">
                <div class="loader hide"></div>
                <span>{PRIMARY_BUTTON_DEFAULT_TEXT}</span>
                <div class="btn-arrow">
                  <svg
                    viewBox="0 0 13 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.841146 8.11182H10.1495L6.08281 12.1785C5.75781 12.5035 5.75781 13.0368 6.08281 13.3618C6.40781 13.6868 6.93281 13.6868 7.25781 13.3618L12.7495 7.87015C13.0745 7.54515 13.0745 7.02015 12.7495 6.69515L7.26615 1.19515C7.11045 1.03911 6.89908 0.951416 6.67865 0.951416C6.45821 0.951416 6.24684 1.03911 6.09115 1.19515C5.76615 1.52015 5.76615 2.04515 6.09115 2.37015L10.1495 6.44515H0.841146C0.382812 6.44515 0.0078125 6.82015 0.0078125 7.27849C0.0078125 7.73682 0.382812 8.11182 0.841146 8.11182Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </a> */}
            <Link to={"/login"}>
              <button class="lp-header-login">Login</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
