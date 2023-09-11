import gql from 'graphql-tag'
import duck from '../../duck'

export const FETCH_SAVE_CODE_KEY = 'fetchAllSavedCode'


// codeStatus: 'inReview' | 'published'
const fetchSaveCode = ({
    userId,
    first = 10,
    skip = 0,
    languageType,
    fileNameContains,
    fromDate,
    toDate,
    codeStatus,
}) => {
    const filterQuery = `{
        and: [
            {user_some: { id: "${userId}" }}
            ${fileNameContains ? `{ OR: [
                        {code_contains: "${fileNameContains}"}
                        {fileName_contains:"${fileNameContains}"}
                        {description_contains: "${fileNameContains}"}
                    ]}` : ''
        }
            ${fromDate ? `{createdAt_gte: "${fromDate}"}` : ''}
            ${toDate ? `{createdAt_lte: "${toDate}"}` : ''}
            ${languageType ? `{languageType: ${languageType}}` : ''}
            ${codeStatus === 'inReview' ? `{and: [{hasRequestedByMentee: true} {isApprovedForDisplay: pending}]}` : ''}
            ${codeStatus === 'published' ? `{and: [{hasRequestedByMentee: true} {isApprovedForDisplay: accepted}]}` : ''}
        ]
    }`
    return duck.createQuery({
        query: gql`
    {
        totalSavedCodes: userSavedCodesMeta(
            filter:${filterQuery} ){
            count
        },
        totalSavedCodesInReview: userSavedCodesMeta(
            filter: {
                and: [
                    {user_some: { id: "${userId}" }}
                    {hasRequestedByMentee: true}
                    {isApprovedForDisplay: pending}
                ]
            }
        ){
            count
        },
        totalSavedCodesPublished: userSavedCodesMeta(
            filter: {
                and: [
                    {user_some: { id: "${userId}" }}
                    {hasRequestedByMentee: true}
                    {isApprovedForDisplay: accepted}
                ]
            }
        ){
            count
        },
        userSavedCodes(filter: ${filterQuery}
        orderBy: createdAt_DESC
        first: ${first},
        skip: ${skip * first}
        ){
            id
            user{
            id
            name
            }
            code
            fileName
            description
            createdAt
            languageType
            hasRequestedByMentee
            isApprovedForDisplay
            userApprovedCode {
                id
                status
            }
        }
        }
    `,
        key: FETCH_SAVE_CODE_KEY,
        type: 'savedCode/fetch',
    })
}

export default fetchSaveCode
