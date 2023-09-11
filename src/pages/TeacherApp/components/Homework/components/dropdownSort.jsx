import React,{useState} from "react"
import "./dropdownSort.scss"
import DropdownIcon from "../../../../../assets/teacherApp/classroom/Chevron Down.svg"


function Sort({setFilter}) {

    const selectedSort = document.querySelector(".selectedSort");
    const optionsContainerSort = document.querySelector(".options-containerSort");
    

    function clicker(e,filterName) {
        selectedSort.innerHTML = e.target.innerText;
       optionsContainerSort && optionsContainerSort.classList.remove("activeSort");
        setFilter(filterName)
    }

    function clicks(){
        optionsContainerSort &&   optionsContainerSort.classList.toggle("activeSort");
    }

    return <>
        <div class="containerSort">
            <div class="select-boxSort">
                <div class="options-containerSort">
                    <div onClick={(e) => clicker(e ,"Attempted")} class="optionSort">
                        <input
                            type="radio"
                            class="radioSort"
                            id="automobiles"
                            name="categorySort"
                        />
                        Attempted
                    </div>
                    <div onClick={(e) => clicker(e , "Unattempted")} class="optionSort">
                        <input
                            type="radio"
                            class="radioSort"
                            id="automobiles"
                            name="categorySort"
                        />
                        Unattempted
                    </div>
                    <div onClick={(e) => clicker(e,"Attempting")} class="optionSort">
                        <input
                            type="radio"
                            class="radioSort"
                            id="automobiles"
                            name="categorySort"
                        />
                        Attempting
                    </div>             
                </div>
                <div onClick={() => clicks()} class="selectedSort">
                    Filter By
                </div>
            </div>
        </div>
    </>
}


export default Sort