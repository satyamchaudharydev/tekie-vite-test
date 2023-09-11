import gql from 'graphql-tag'
import { get } from 'lodash';
import duck from '../../duck'

const getTrendingApprovedCodeQuery = (fetchTrendingPostFilter) => {
    if(fetchTrendingPostFilter) {
        return `
            trendingUserApprovedCode: userApprovedCodes(
                filter: {
                    and: [
                        { status: published },
                        ${fetchTrendingPostFilter}
                    ]
                },
                orderBy: totalReactionCount_DESC,
                first: 1
            ) {
                id
                approvedFileName
            }
        `;
    }
    return ''
}

const fetchApprovedCodes = (
    filter,
    orderBy,
    first,
    skip,
    tokenType,
    fetchTrendingPostFilter = null,
    id = ''
) => {
    const filterQuery = `
        { status: published },
        ${filter}
    `
  return duck.createQuery({
    query: gql`
    {
        userApprovedCodeTagMappingsCount: userApprovedCodeTagMappingsMeta(
            filter:{
                userApprovedCode_some: {status:published}
            }, groupBy: title) {
                groupByData{
                    groupByFieldValue
                    count
                }
        },
        totalApprovedCodes: userApprovedCodesMeta(
            filter: {and:[
                ${filterQuery}
            ]}
            ){
            count
        },
        ${getTrendingApprovedCodeQuery(fetchTrendingPostFilter)}
        userApprovedCodes(
            filter: {
                and: [
                    ${filterQuery}
                ]
            },
            orderBy: ${orderBy},
            first: ${first},
            skip: ${skip * first}
        ){
            id
            approvedCode
            approvedDescription
            approvedFileName
            celebrateReactionCount
            createdAt
            heartReactionCount
            hotReactionCount
            status
            studentGrade
            studentName
            studentAvatar
            totalReactionCount
            updatedAt
            languageType
            userApprovedCodeTagMappings {
                id
                userApprovedCodeTag {
                    codeCount
                    id
                    title
                }
            }
            userApprovedCodeTagMappingsMeta {
                count
            }
        }
    }
    `,
    variables: {
      tokenType,
    },
    changeExtractedData: (extractedData) => {
        if (id === '/trending') {
            return { 
                ...extractedData, 
                approvedCodes: get(extractedData, 'approvedCodes', [])
                    .map((userApprovedCode, order) => ({ ...userApprovedCode, trendingOrder: order}))
            }
        } else {
            return {
                ...extractedData,
                approvedCodes: get(extractedData, 'approvedCodes', [])
                    .map((userApprovedCode, order) => ({ ...userApprovedCode, approvedCodeOrder: order}))
            }
        }
    },
    key: "fetchApprovedCodes" + id ,
    type: "approvedCodes/fetch",
  });
}

export default fetchApprovedCodes
