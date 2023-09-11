import { get } from "lodash";
import { buddyQueries } from "../../constants/buddyLogin";


const buddyQueryStatusGetter=({buddyId,queryName,buddyQueriesTracker,componentId})=>{
    if(queryName===buddyQueries.USER_LEARNING_OBJECTIVES || queryName===buddyQueries.USER_VIDEOS||queryName===buddyQueries.USER_BLOCKBASED_PRACTICES){
        return get(buddyQueriesTracker, `${buddyId}.${queryName}.${componentId}`)
    }
    return get(buddyQueriesTracker, `${buddyId}.${queryName}`)
}

const buddyQueryStatusSetter=({buddyId,queryName,buddyQueriesTracker,componentId})=>{
    if(queryName===buddyQueries.USER_LEARNING_OBJECTIVES || queryName===buddyQueries.USER_VIDEOS||queryName===buddyQueries.USER_BLOCKBASED_PRACTICES){
        localStorage.setItem('buddyQueriesTracker', JSON.stringify({ ...JSON.parse(localStorage.getItem('buddyQueriesTracker')), [buddyId]: { ...buddyQueriesTracker[buddyId], [queryName]: {...buddyQueriesTracker[buddyId][queryName],[componentId]:true} } }))
        return 
    }
    localStorage.setItem('buddyQueriesTracker', JSON.stringify({ ...JSON.parse(localStorage.getItem('buddyQueriesTracker')), [buddyId]: { ...buddyQueriesTracker[buddyId], [queryName]: true } }))
}



export {buddyQueryStatusGetter,buddyQueryStatusSetter}