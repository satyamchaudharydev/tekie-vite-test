import React from 'react';
import "./mobileNavbar.scss"
import downArrow from "../../../../assets/eventPage/downArrow.svg"
import cross from "../../../../assets/eventPage/cross.png"
import { Link } from 'react-router-dom';
import { WAITINGMODAL_ROUTE } from '../../../../config';


function MobileNavbar({ clickerCourses,clickerResources , click,clickedCourses,clickedResources}) {
    
    return <>
        <div class="lp-mobile-navbar-container">
            <div onClick={() => click()} class="lp-close-mobile-navbar">
                <img src={cross} alt="close" />
            </div>
            <div class='lp-mobile-navbar-bottom-container'>
                <div class="lp-mobile-navbar-navlinks">
                    {/* <button class="lp-mobile-navbar-button"> <a href="/student-community" class="lp-mobile-navbar-link">Why Tekie</a></button> */}

                    <div class="lp-mobile-navbar-dropdown-menu">

                        <button onClick={()=>clickerCourses()} class="lp-mobile-navbar-menu-btn">
                            <p class="lp-mobile-navbar-link">Courses</p>
                            <img class='lp-mb-arrow' src={downArrow} alt="arrow-down" />
                        </button>
                        <div style={{display : clickedCourses ? "block" :"none"}} class="lp-mobile-navbar-menu-content">
                            <a class="lp-mobile-navbar-link courseName" href="/course/code-with-koi">Building Logic and Algorithmic Thinking</a>
                            <a class="lp-mobile-navbar-link courseName" href="/course/koi-and-newt">Intro to Coding (with Blockly)</a>
                            <a class="lp-mobile-navbar-link courseName" href="/course/tales-of-oak">Intro to Coding (with Python)</a>
                            <a class="lp-mobile-navbar-link courseName" href="/course/mae-walker-the-search">Web Development Specialisation</a>
                        </div>
                    </div>
                    <button class="lp-mobile-navbar-button"> <a href="/student-community" class="lp-mobile-navbar-link">Community</a></button>
                    {/* <button class="lp-mobile-navbar-button"> <a href="/student-community" class="lp-mobile-navbar-link">Events</a></button> */}
                    <div class="lp-mobile-navbar-dropdown-menu">
                        <button onClick={()=>clickerResources()} class="lp-mobile-navbar-menu-resources-btn">
                            <p class="lp-mobile-navbar-link">Resources</p>
                            <img class='lp-mb-arrow' src={downArrow} alt="arrow-down" />
                        </button>
                        <div style={{display : clickedResources ? "block" :"none"}} class="lp-mobile-navbar-menu-resources-content">
                            <a class="lp-mobile-navbar-link" href="/code-playground">Code Playground</a>
                            <a class="lp-mobile-navbar-link" href="/cheatsheet">Cheat Sheet</a>
                        </div>
                    </div>
                </div>
                <div class="lp-mobile-navbar-buttons">
                    <Link to='/login' style={{ textDecoration: "none" }} >
                        <button class="lp-mobile-navbar-login">Login</button>
                    </Link>
                    {/* <a href={WAITINGMODAL_ROUTE} style={{ textDecoration: "none" }} class="book-a-free-class-btn">
                        <div class='btn-sd-blue-container'>
                            <div class="loader hide"></div>
                            <span>Get in Touch</span>
                            <div class="btn-arrow">
                                <svg viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.841146 8.11182H10.1495L6.08281 12.1785C5.75781 12.5035 5.75781 13.0368 6.08281 13.3618C6.40781 13.6868 6.93281 13.6868 7.25781 13.3618L12.7495 7.87015C13.0745 7.54515 13.0745 7.02015 12.7495 6.69515L7.26615 1.19515C7.11045 1.03911 6.89908 0.951416 6.67865 0.951416C6.45821 0.951416 6.24684 1.03911 6.09115 1.19515C5.76615 1.52015 5.76615 2.04515 6.09115 2.37015L10.1495 6.44515H0.841146C0.382812 6.44515 0.0078125 6.82015 0.0078125 7.27849C0.0078125 7.73682 0.382812 8.11182 0.841146 8.11182Z" fill="white" />
                                </svg>
                            </div>
                        </div>
                    </a> */}
                </div>
            </div>
        </div>
    </>
}

export default MobileNavbar;

