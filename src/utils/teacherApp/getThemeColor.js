import { List } from "immutable";
import { get } from "lodash";
import exportedVariables from '../../../src/pages/TeacherApp/variables/_variables.scss'
import config from "../../config";
import { filterKey } from '../../utils/data-utils';


const getThemeColor = () => {
    let loggedInUser
    if (window !== undefined) {
        
        const user = filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List([])
        loggedInUser = user.toJS()[0]
    }
    
    const root = document.documentElement;
    switch (get(loggedInUser, 'role')) {
        case 'mentor': {
            const isSchoolTrainer = get(loggedInUser, "roles", []).includes(config.SCHOOL_TRAINER) 
            if (get(loggedInUser, 'secondaryRole') === 'schoolTeacher' || isSchoolTrainer) {
                root.style.setProperty('--accent-color', exportedVariables.schoolTeacher)
                root.style.setProperty('--accent-color-110', exportedVariables.schoolTeacher110)
            }else{
                root.style.setProperty('--accent-color', exportedVariables.schoolAdmin)
                root.style.setProperty('--accent-color-110', exportedVariables.schoolAdmin110)
            }
            return exportedVariables.schoolTeacher
        }
        case 'schoolAdmin': {
            root.style.setProperty('--accent-color', exportedVariables.schoolAdmin)
            root.style.setProperty('--accent-color-110', exportedVariables.schoolAdmin110)
            return exportedVariables.schoolAdmin
        }
        default: {
            root.style.setProperty('--accent-color', exportedVariables.schoolTeacher)
            root.style.setProperty('--accent-color-110', exportedVariables.schoolTeacher110)
            return exportedVariables.schoolTeacher

        }
    }
}

export default getThemeColor