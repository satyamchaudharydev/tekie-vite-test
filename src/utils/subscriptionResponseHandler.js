import { fromJS } from "immutable";
import { get } from "lodash";
import schema from "../duck/schema"

const getSchemaConfig = ({ schemaName }) => schema[schemaName] //Returns the schema config based on the schema name

const getDataBasedOnSchema = ({ response, schemaConfig }) => {
    let responseData
    if (get(schemaConfig, 'alias', []).length) {
        for (const schemaKey of get(schemaConfig, 'alias', [])) {
            responseData = get(response, `data.${schemaKey}.data`)
            if (responseData) break
        }
    }
    return responseData
}

const subscriptionResponseHandler = ({ response, schemaName, key }) => {
    // This function takes the response from the subscription and dump it to duck state
    const responseObject = {}
    if (window) {
        const schemaConfig = getSchemaConfig({ schemaName })
        if (schemaConfig) {
            let responseData = null;
            responseData = get(response, `data.${schemaName}.data`)
            if (!responseData) responseData = getDataBasedOnSchema({ schemaConfig, response })
            if (responseData) {
                if (schemaConfig.type === 'arrayOfObjects') {
                    if (Array.isArray(responseData)) responseObject[schemaName] = responseData
                    else if (Object.keys(responseData).length) responseObject[schemaName] = [responseData]
                } else {
                    if (!Array.isArray(responseData) && Object.keys(responseData).length) responseObject[schemaName] = responseData
                }
            }
            if (Object.keys(responseObject).length) {
                // Setting in the redux state
                window.store.dispatch({
                    autoReducer: true,
                    type: `${schemaName}/fetch/success`,
                    key,
                    payload: fromJS({
                        originalData: {
                            ...responseObject
                        },
                        extractedData: {
                            ...responseObject
                        }
                    }),
                })
            }
        }
    }
    return responseObject;
}

export const subscriptionLoadingHandler = ({ schemaName, key }) => {
    const schemaConfig = getSchemaConfig({ schemaName })
    if (schemaConfig && window) {
        window.store.dispatch({
            key,
            autoReducer: true,
            type: `${schemaName}/fetch/loading`
        });
    }
}

export default subscriptionResponseHandler;
