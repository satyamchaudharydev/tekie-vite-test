import React  from "react"
import "./TabSwitch.scss"

function TabSwitch({setRoute,clicker}){



let tabIndicator = document.querySelector(".animation");
let tabsPane= document.querySelectorAll(".tab_switch_individual_container");



// function clicker(value,route){
//     setRoute(route)
//     for(let i=0; i<tabsPane.length;i++){
        

//         if(tabsPane[i].classList.contains("active")){
//             tabsPane[i].classList.remove("active")
//         } 
//         if(value === i){
//             tabsPane[i].classList.add("active")
//         }
//         if(value === i){
            
//             if(i===0){
//                 tabIndicator.style.width = "32%"
//                 tabIndicator.style.left = "0px"
//             }
//             if(i===1){
//                 tabIndicator.style.width = "23%"
//                 tabIndicator.style.left = "39.3%"

//             }
//             if(i===2){
//                 tabIndicator.style.width = "23%"
//                 tabIndicator.style.left = "69.2%"
//             }
//         }
//     }
// }


    return <>
        <section class="tab_switch">
            <div onClick={()=>clicker(0,"Courses",tabsPane,tabIndicator)} class="tab_switch_individual_container active"> Course Progress</div>
            <div onClick={()=>clicker(1,"Recording",tabsPane,tabIndicator)} class="tab_switch_individual_container">Recordings</div>
            <div onClick={()=>clicker(2,"Homework",tabsPane,tabIndicator)} class="tab_switch_individual_container"> Homework</div>
            <div class="animation"></div>
        </section>
        </>
}

export default TabSwitch