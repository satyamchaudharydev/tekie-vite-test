import React from "react"
import "./DropdownSort.scss"

function Filter1() {

    const selectedFilter1 = document.querySelector(".selectedFilter1");
    const optionsContainerFilter1 = document.querySelector(".options-containerFilter1");

    
    function clicker(e) {
        selectedFilter1.innerHTML = e.target.innerText;
        optionsContainerFilter1.classList.remove("activeFilter1");
    }


    return <>
        <div class="containerFilter1">


            <div class="select-boxFilter1">
                <div class="options-containerFilter1">

                    <div onClick={(e) => clicker(e)} class="optionFilter1">
                        <input
                            type="radio"
                            class="radioFilter1"
                            id="automobiles"
                            name="categoryFilter1"
                        />
                        Automobiles
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionFilter1">
                        <input type="radio" class="radioFilter1" id="film" name="categoryFilter1" />
                        Film & Animation
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionFilter1">
                        <input type="radio" class="radioFilter1" id="science" name="categoryFilter1" />
                        Science & Technology
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionFilter1">
                        <input type="radio" class="radioFilter1" id="art" name="categoryFilter1" />
                        Art
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionFilter1">
                        <input type="radio" class="radioFilter1" id="music" name="categoryFilter1" />
                        Music
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionFilter1">
                        <input type="radio" class="radioFilter1" id="travel" name="categoryFilter1" />
                        Travel & Events
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionFilter1">
                        <input type="radio" class="radioFilter1" id="sports" name="categoryFilter1" />
                        Sports
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionFilter1">
                        <input type="radio" class="radioFilter1" id="news" name="categoryFilter1" />
                        News & Politics
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionFilter1">
                        <input type="radio" class="radioFilter1" id="tutorials" name="categoryFilter1" />
                        Tutorials
                    </div>
                </div>

                <div onClick={() => {
                    optionsContainerFilter1.classList.toggle("activeFilter1");
                    
                }} class="selectedFilter1">
                    Select Video CategoryFilter1
                </div>
            </div>
        </div>
    </>
}


export default Filter1