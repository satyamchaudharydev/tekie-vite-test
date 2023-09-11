import gql from 'graphql-tag'
import duck from '../../duck';


const getCourses = async () => {

    return duck.query({
        query: gql`
     {courses(filter:{ status: published }) { 
         id
        title
        minGrade
        maxGrade
       }}
    `,
        type: 'courses/fetch',
        key: 'teacherAppCourses'
    })
}
export default getCourses
