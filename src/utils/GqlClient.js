import { print } from 'graphql/language/printer'
import extractFiles from './extract-files'
import fetch from 'isomorphic-fetch'
import FormData from 'form-data'
import { isString } from 'lodash'
import ALLOWED_FILE_TYPE from '../constants/allowedFileType'
// import requestErrorHandler from './requestErrorHandler'

export default class GqlClient {
  constructor({ url, config, errorHandler }) {
    this.url = url
    this.config = config
    this.errorHandler = errorHandler
  }

  logoutIfUserTokenIsInvalid = (errors) => {
    if (errors && Array.isArray(errors)) {
      errors.forEach((error) => {
        let errorMessage = error;
        if (typeof error === 'object') {
          errorMessage = error.message || error.code;
        }
        // if ((errorMessage === 'User is not authenticated') || (errorMessage === 'UnauthenticatedUserError')) {
        //   if (typeof window !== 'undefined' && window.store) {
        //     window.store.dispatch({ type: "LOGOUT" });
        //   } else {
        //     localStorage.clear();
        //   }
        // }
      })
    } else if (errors && (typeof errors === 'string') && (errors === 'User is not authenticated')) {
      // if (typeof window !== 'undefined' && window.store) {
      //   window.store.dispatch({ type: "LOGOUT" });
      // } else {
      //   localStorage.clear();
      // }
    }
  }

  async query(query, variables, options) {
    const { headers, ...others } = options
    let apiBaseURL = this.url;
    // Extracts all files from variables and replaces them
    // with null
    const files = extractFiles(variables)
    let fetchOptions

    // uncomment below to debug query

    // Creates a stringfied query
    const graphqlQuery = JSON.stringify({
      query: isString(query) ? query : print(query), // "print" changes graphql AST into normal string
      variables
    })
    

    // Uncomment to the debug👇

    // (headers, JSON.stringify(variables, null, 2))
    // console.log(
    //   print(query),
    //   JSON.stringify(variables)
    // )


    // Checks if there are any files in the query
    // if there is then ...
    if (files.length) {
      apiBaseURL = this.config.apiUrl || this.url;
      // ...then creates a form object
      const body = new FormData()
      // appends query into body
      body.append('operations', graphqlQuery)
      // apppend files into body
      files.forEach(({ path, file }) => {
        if (path === 'file') {
          // If file type is of other type,
          // then we are extracting the type and creating a new File with type
          if (file.name) {
            const fileType = file.name.split('.')[1]
            if (fileType && ALLOWED_FILE_TYPE.includes(fileType)) {
              const newFile = new File([file], file.name, { type: `application/${fileType}` })
              file = newFile
            }
          }
        }
        body.append(path, file)
      })
      // sets fetchOptions
      fetchOptions = {
        method: 'POST',
        body,
        ...options
      }
    } else {
      // sets fetchOption without any body append
      // because there are no files here and we
      // directly assign body to graphqlQuery
      fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: graphqlQuery,
        ...others
      }
    }
    try {
      // fetches the Data
      // console.log(graphqlQuery)
      const response = await fetch(apiBaseURL, fetchOptions);
      const result = await response.json()
      // console.log(JSON.stringify(result, null, 2))
      // Checks if there are any error in result
      if (result.errors) {
        // throw the result
        this.logoutIfUserTokenIsInvalid(result.errors)
        throw result
      }
      // otherwise just normally return them
      return result
    } catch (e) {
      // For other normal errors
      // just throw them
      // requestErrorHandler(e)
      const errorStatus = this.errorHandler(e)
      this.logoutIfUserTokenIsInvalid(errorStatus);
      throw Object({
        status: errorStatus,
        ...e,
      });
    }
  }
}
