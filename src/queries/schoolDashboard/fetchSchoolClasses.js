import gql from 'graphql-tag'
import duck from '../../duck'

const fetchSchoolClasses = (
    filter,
    first = 20,
    skip = 0,
) => {
    const filterQuery = `
        ${filter}
    `
  return duck.createQuery({
    query: gql`
    {
        schoolClasses(
            filter: {
                and: [
                    ${filterQuery}
                ]
            },
            orderBy: createdAt_ASC,
            first: ${first},
            skip: ${skip * first}
        ) {
            id
            grade
            section
            school {
                products {
                    course {
                        title
                    }
                }
            }
            studentsMeta {
                count
            }
        }
    }
    `,
    key: "fetchSchoolClasses",
    type: "schoolClasses/fetch",
    changeExtractedData: (extractedData, originalData) => {
        if (originalData && originalData.schoolClasses.length) {
            return {
                ...extractedData,
                schoolClasses: originalData.schoolClasses
            }
        } else {
            return {
                ...extractedData,
                schoolClasses: []
            }
        }
    },
  });
}

export default fetchSchoolClasses
