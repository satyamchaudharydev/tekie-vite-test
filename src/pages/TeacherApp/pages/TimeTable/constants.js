import { COURSE, GRADES, SECTIONS, SESSION_STATUS } from "../../constants/timeTable/filterBy"

export const ALL_SELECTED = "Select all"

export const QUERY_KEY_MAP = {
    [GRADES]: 'grades',
    [SECTIONS]: 'sections',
    [SESSION_STATUS]: 'sessionStatus',
    [COURSE]: 'courses'
}

export const sessionStatus = {
    allotted: "allotted",
    started: "started",
    completed: "completed"
}

export const sessionStatusesArray = Object.keys(sessionStatus);

export const sessionStartedOrCompleted = Object.keys(sessionStatus).filter(status => status !== 'allotted');

export const ALLOTED = 'allotted'
