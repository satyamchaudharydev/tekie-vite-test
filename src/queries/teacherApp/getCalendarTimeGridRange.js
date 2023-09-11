import gql from 'graphql-tag'
import { get } from 'lodash';
import duck from '../../duck';

const getCalendarTimeGridRange = (filterQuery, loggedInUser) => {
    
    const startDate = new Date(new Date(filterQuery.startDate).setHours(0, 0, 0, 0)).toISOString()
    // const endDate = new Date(new Date(filterQuery.endDate).setHours(0, 0, 0, 0)).toISOString()
    const schoolId = get(loggedInUser, 'rawData.mentorProfile.schools[0].id')
    return duck.query({
        query: gql`
        {
            timetableSchedules(filter:{
              and:[
                  {
                      type:workingDay
                  }
                {
                  school_some:{
                    id:"${schoolId}"
                  }
                }
                {
                  startDate_gte:"${startDate}"
                }
              ]
            }
            first:1
            ){
              id
              slot0
              slot1
              slot2
              slot3
              slot4
              slot5
              slot6
              slot7
              slot8
              slot9
              slot10
              slot11
              slot12
              slot13
              slot14
              slot15
              slot16
              slot17
              slot18
              slot19
              slot20
              slot21
              slot22
              slot23
            }
          }
    `
    ,
        type: 'calendarTimeRange/fetch',
        key: 'calendarTimeRange'
    })
}

export default getCalendarTimeGridRange