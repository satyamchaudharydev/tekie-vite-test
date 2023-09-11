import gql from 'graphql-tag'
import duck from '../../duck'

const fetchStudentProfiles = (
    filter,
    first = 0,
    skip = 0,
) => {
    const filterQuery = `
        ${filter}
    `
    return duck.createQuery({
        query: gql`
    {
        
        totalStudentProfiles: studentProfilesMeta(filter: {and: [
            ${filterQuery}
        ]}) {
            count
        }
        schoolStudentProfiles: studentProfiles(
            filter: {
                and: [
                    ${filterQuery}
                ]
            },
            orderBy:createdAt_ASC,
            first: ${first},
            skip: ${skip * first}
        ){
            id
            userData: user{
                id
                name
                email
                profilePic{
                    id
                    uri
                    name
                }
            }
            studentParents: parents {
                userData: user {
                    id
                    name
                    email
                    phone {
                    countryCode
                    number
                    }
                }
            }
            profileAvatarCode
            schoolClass{
                grade
                section
            }
            batch{
                code
            }
        }
    }
    `,
        key: "schoolStudentProfiles",
        type: "schoolStudentProfiles/fetch",
        changeExtractedData: (extractedData, originalData) => {
            if (originalData && originalData.schoolStudentProfiles.length) {
                return {
                    ...extractedData,
                    schoolStudentProfiles: originalData.schoolStudentProfiles
                }
            } else {
                return {
                    ...extractedData,
                    schoolStudentProfiles: []
                }
            }
        },
    })
}

export default fetchStudentProfiles
