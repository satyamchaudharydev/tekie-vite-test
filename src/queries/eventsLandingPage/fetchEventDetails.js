import gql from "graphql-tag";
import { get } from "lodash";
import moment from "moment";
import duck from "../../duck";

const getDateFilter = (key, studentProfileId) => {
  let filterQuery = ''
  if (key === 'completed') {
    filterQuery = `{ eventEndTime_lte:"${moment().toISOString()}" }, {registeredUsers_some:{id:"${studentProfileId}"}}`
  } else if (key === 'upcoming') {
    filterQuery = `{ eventStartTime_gte:"${moment().toISOString()}" }`
  }
  return filterQuery
}

const fetchEventsDetails = async (
  idCategory,
  tagId,
  studentProfileId,
  key = "eventsDetails"
) => {
  return duck.query({
    query: gql`
        {
            events(
              orderBy: eventStartTime_DESC
              filter: {and:  [
              ${
                idCategory && idCategory !== 20
                  ? `{ category_some: { id: "${idCategory}"}}`
                  : ""
              }, 
              ${tagId && tagId !== 20 ? `{ tags_some: { id: "${tagId}"}}` : ""},
              { tags_exists: true }
              { category_exists: true }
              { isListedOnWeb: true }
              { status: published }
              ${getDateFilter(key, studentProfileId)}
              ]}) {
              id
              name
              timeZone
              sessionLink
              eventStartTime
              eventEndTime
              summary
              momentFromEventLink
              category{
                id
                title
              }
              eventBanner {
                id
                uri
              }
              eventMobileBanner {
                id
                uri
              }
              listingImage {
                id
                uri
              }
              registeredUsersMeta {
                count
              }
              ${
                studentProfileId
                  ? `registeredUsers(filter: { id: "${studentProfileId}" }) {
                id
              }
              ` : ""
              }
              utm{
                utmSource
                utmCampaign
                utmTerm
                utmMedium
                utmContent
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
            }
          }
        `,
    type: "eventsDetails/fetch",
    key: key,
    changeExtractedData: (extracted, original) => {
      extracted.eventsDetails = get(original, "events");
      return {
        ...extracted,
      };
    },
  });
};

export default fetchEventsDetails;
