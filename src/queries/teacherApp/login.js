import gql from 'graphql-tag'
import duck from '../../duck';

const emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


const login = async (emailOrUsername, password) => {
    const updatedInput = {}
    if (emailRegExp.test(emailOrUsername)) {
        updatedInput.email = emailOrUsername
        updatedInput.password = password
    } else {
        updatedInput.username = emailOrUsername
        updatedInput.password = password
    }
    return duck.query({
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
          country
          campaign{
              type
          }
          phone{
              countryCode
              number
          }
        }
      }
    `,
        variables: {
            input: updatedInput,
            tokenType: 'appTokenOnly'
        },
        type: 'user/fetch',
        key: 'loggedinUser'
    })
}
export default login
