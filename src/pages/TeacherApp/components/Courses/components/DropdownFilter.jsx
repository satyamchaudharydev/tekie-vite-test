import React from "react"
import "./DropdownFilter.scss"

function Sort() {

    const selectedSort1 = document.querySelector(".selectedSort1");
    const optionsContainerSort1 = document.querySelector(".options-containerSort1");

    function clicker(e) {
        selectedSort1.innerHTML = e.target.innerText;
        optionsContainerSort1.classList.remove("activeSort1");
    }

    function clicks(){
        optionsContainerSort1.classList.toggle("activeSort1");
    }

    return <>
        <div class="containerSort1">


            <div class="select-boxSort1">
                <div class="options-containerSort1">

                    <div onClick={(e) => clicker(e)} class="optionSort1">
                        <input
                            type="radio"
                            class="radioSort1"
                            id="automobiles"
                            name="categorySort1"
                        />
                        Automobiles
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionSort1">
                        <input type="radio" class="radioSort1" id="film" name="categorySort1" />
                        Film & Animation
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionSort1">
                        <input type="radio" class="radioSort1" id="science" name="categorySort1" />
                        Science & Technology
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionSort1">
                        <input type="radio" class="radioSort1" id="art" name="categorySort1" />
                        Art
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionSort1">
                        <input type="radio" class="radioSort1" id="music" name="categorySort1" />
                        Music
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionSort1">
                        <input type="radio" class="radioSort1" id="travel" name="categorySort1" />
                        Travel & Events
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionSort1">
                        <input type="radio" class="radioSort1" id="sports" name="categorySort1" />
                        Sports
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionSort1">
                        <input type="radio" class="radioSort1" id="news" name="categorySort1" />
                        News & Politics
                    </div>

                    <div onClick={(e) => clicker(e)} class="optionSort1">
                        <input type="radio" class="radioSort1" id="tutorials" name="categorySort1" />
                        Tutorials
                    </div>
                </div>

                <div onClick={() => clicks()} class="selectedSort1">
                    Select Video CategorySort1
                </div>
            </div>
        </div>
    </>
}


export default Sort