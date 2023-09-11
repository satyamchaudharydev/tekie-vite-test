import gql from 'graphql-tag'
import duck from '../../duck'

const fetchCurrentCourse = (force = false) => duck.query ({
    query : gql`
        {
            courses(filter: { and: [{ title: "python" }, {status:published}] }) {
                id
            }
        }
    `,
    type: 'courses/fetch',
    key: 'courses',
    force
})


export default fetchCurrentCourse
