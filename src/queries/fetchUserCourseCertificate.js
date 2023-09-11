import gql from 'graphql-tag'
import duck from '../duck'

const fetchUserCourseCertificate = (
    code,
) => {
  return duck.createQuery({
    query: gql`
    {
        userCourseCertificate: getCourseCertificate(input:{code:"${code}"}) {
            name
            userId
            courseId
            courseName
            courseDuration
            courseEndingDate
            mentors
            proficiency
            projectsCount
            courseThumbnail {
              id
              uri
            }
            certificate {
              id
              uri
            }
        }
    }
    `,
    key: "userCourseCertificate",
    type: "userCourseCertificate/fetch",
  });
}

export default fetchUserCourseCertificate
