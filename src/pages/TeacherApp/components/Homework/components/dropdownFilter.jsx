import React,{useState} from "react"
import "./dropdownFilter.scss"
import DropdownIcon from "../../../../../assets/teacherApp/classroom/Chevron Down.svg"


function Filter({setSort}) {

    const selectedFilter = document.querySelector(".selectedFilter");
    const optionsContainerFilter = document.querySelector(".options-containerFilter");
    

    
    function clicker(e,sortName) {
        selectedFilter.innerHTML = e.target.innerText;
      optionsContainerFilter &&  optionsContainerFilter.classList.remove("activeFilter");
        setSort(sortName)
    }


    return <>
        <div class="containerFilter">
            <div class="select-boxFilter">
                <div class="options-containerFilter">
                    <div onClick={(e) => clicker(e,"ascending")} class="optionFilter">
                        <input
                            type="radio"
                            class="radioFilter"
                            id="automobiles"
                            name="categoryFilter"
                        />
                        Name ascending
                    </div>

                    <div onClick={(e) => clicker(e ,"descending")} class="optionFilter">
                        <input type="radio" class="radioFilter" id="tutorials" name="categoryFilter" />
                        Name desending
                    </div>
                </div>

                <div onClick={() => {
                   optionsContainerFilter && optionsContainerFilter.classList.toggle("activeFilter");
             

                }} class="selectedFilter">
                    Sort By

                </div>
            </div>
        </div>
    </>
}


export default Filter