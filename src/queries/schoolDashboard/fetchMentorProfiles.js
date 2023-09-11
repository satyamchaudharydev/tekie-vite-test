import gql from 'graphql-tag'
import duck from '../../duck'

const fetchMentorProfiles = (
    schoolId,
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
        totalMentorProfiles: usersMeta(filter: {and: [
            {mentorBatches_some:{
                school_some:{
                    id:"${schoolId}"
                }
            }},
            {role: mentor},
            ${filterQuery}
        ]}) {
            count
        }
        schoolMentorProfiles: users(
            filter: {
                and: [
                    {mentorBatches_some:{
                        school_some:{
                            id:"${schoolId}"
                        }
                    }},
                    {role: mentor},
                    ${filterQuery}
                ]
            },
            orderBy:createdAt_DESC,
            first: ${first},
            skip: ${skip * first}
        ){
            id
            name
            profilePic{
                id
                uri
            }
            mentorProfile{
                experienceYear
                pythonCourseRating5
                pythonCourseRating4
                pythonCourseRating3
                pythonCourseRating2
                pythonCourseRating1
                codingLanguages{
                    value
                }
            }
        }
    }
    `,
        key: "schoolMentorProfiles",
        type: "schoolMentorProfiles/fetch",
    })
}

export default fetchMentorProfiles
