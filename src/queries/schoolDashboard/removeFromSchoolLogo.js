import gql from 'graphql-tag'
import duck from '../../duck'

const removeSchoolLogo = async ({
  fileId,
  schoolId
}) => {
  return duck.query({
    query: gql`
    mutation{
        removeFromSchoolLogo(
          schoolId: "${schoolId}"
          fileId: "${fileId}",
        ){
            school {
              id
            }
        }
      }
  `,
    type: 'removeSchoolLogo/delete',
    key: 'removeSchoolLogo',
  })
}

export default removeSchoolLogo
