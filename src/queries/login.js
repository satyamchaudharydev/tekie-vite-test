import gql from 'graphql-tag'
import duck from '../duck'

const login = async (email, password, key) =>
  duck.query({
    query: gql`
      mutation login($input: LoginInput) {
        login(input: $input) {
          id
          name
          email
          token
          isSetPassword
          role
          createdAt
        }
      }
    `,
    variables: {
      input: {
        email,
        password,
      },
      tokenType: 'appTokenOnly'
    },
    type: 'user/fetch',
    key: key || 'loggedinUser'
  })

export default login
