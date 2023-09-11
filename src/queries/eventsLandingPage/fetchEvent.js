import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'

const fetchEvent = async (id, studentId, isLoggedIn, filterDate) => duck.query ({
    query : gql`
    query {
        event(id:"${id}") {
            id
            name
            summary
            overview
            status
            momentFromEventLink
            eventBanner {
                id
                uri
            }
            timeZone
            eventMobileBanner {
            id
            uri
            }
            listingImage {
                id
                uri
            }
            ${studentId ? `registeredUsers(filter: { id: "${studentId}" }) 
            {
                id
              }` : ''}
            prizes {
                id
                image {
                    id
                    uri
                }
                minRank
                maxRank
                title
            }
            eventJoinReasons {
                id
                picture {
                    id
                    uri
                }
                title
            }
            registeredUsersMeta {
                count
            }
            eventTimeTableRule {
                startDate
                endDate
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
            sessionLink
            ${(isLoggedIn && studentId) ? `eventSessions(filter:{ sessionDate_gte:"${filterDate}" }, first: 3, orderBy: sessionDate_ASC) {
                id
                sessionDate
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
                attendance {
                  isPresent
                  student {
                    id
                  }
                }
            }`: ''}
        }
    }
    `,
    type: 'events/fetch',
    key: 'events',
    changeExtractedData: (extracted, original) => {
        // console.log(original, extracted)
        if (get(original, 'event.id')) {
            let eventTable = get(original, 'event.eventTimeTableRule')
            let eventSessions = get(original, 'event.eventSessions')
            let startTime
            let endTime
            let startHour
            let eventDate
            let isRegistered = false
            let isPresent = false
            if (eventSessions && eventSessions.length) {
                eventSessions = eventSessions[0]
                if (Object.keys(eventSessions).length) {
                    let slots = {}
                    for (const key in eventSessions) {
                        if (key !== 'id' && key !== 'sessionDate') {
                            slots[key] = eventSessions[key]
                        }
                    }
                    const slotsLength = Object.keys(slots).length
                    eventDate = get(eventSessions, 'sessionDate')
                    for (let i=0; i<slotsLength; i++) {
                        if (slots[`slot${i}`]) {
                            startTime = new Date(new Date(eventDate).setHours(i, 0, 0, 0))
                            endTime = new Date(new Date(eventDate).setHours(i+1, 0, 0, 0))
                            startHour = i
                            break
                        }
                    }
                }
            }
            if (eventTable && Object.keys(eventTable).length) {
                let slots = {}
                for (const key in eventTable) {
                    if (key !== 'startDate') {
                        slots[key] = eventTable[key]
                    }
                }
                const slotsLength = Object.keys(slots).length
                eventDate = get(eventTable, 'startDate')
                for (let i=0; i<slotsLength; i++) {
                    if (slots[`slot${i}`]) {
                        startTime = new Date(new Date(eventDate).setHours(i, 0, 0, 0))
                        endTime = new Date(new Date(eventDate).setHours(i+1, 0, 0, 0))
                        startHour = i
                        break
                    }
                }
            }
            if (isLoggedIn) {
                isRegistered = get(original, 'event.registeredUsers[0].id') === studentId
            }
            extracted.events = {
                ...original.event,
                isRegistered: isRegistered,
                isPresent: isPresent,
                startTime,
                endTime,
                startHour,
                eventDate: new Date(eventDate)
            }
        }
        return { ...extracted }
    }
})

export default fetchEvent