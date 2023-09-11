import gql from 'graphql-tag'
import duck from '../../duck'

const fetchEbooks = (bookIds) => {
    // console.log(bookIds)
    return duck.createQuery({
        query: gql`
            query{
            eBookCourses(filter:{
            id_in: ${JSON.stringify(bookIds)}
                }) {
            id
            ebook {
            id
            title
            resourceURL
            category
                    thumbnail {
                uri
            }
            }
        }
            
            }
        `,
        type: "ebooks/fetch",
        key: "ebooks"
    })
    
}

export default fetchEbooks