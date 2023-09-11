import gql from "graphql-tag"
import duck from "../../duck"

const addSession = (input) => {

    let modifiedInput
    if(input.doReschedule !== true){
        if (input.isRecurring) {
            modifiedInput = { ...input, scheduleSessionType: input.scheduleSessionType.replaceAll('\'', '') }
        } else {
            modifiedInput = { ...input, scheduleSessionType: input.scheduleSessionType.replaceAll('\'', ''), sessionMode: input.sessionMode.replaceAll('\'', '') }
        }
    } else{
        modifiedInput = input
    }
    
    return duck.query({
        query: gql`
        
            mutation($input: ScheduleSessionsInput){
                scheduleSessions(input: $input){
                result
                error
              }
            }
        
        `,
        variables: {
            input:modifiedInput
        },
        type: 'addClassroomSession/add',
        key: 'addClassroomSession'
    })
}

export default addSession