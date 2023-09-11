import gql from "graphql-tag";
import { get } from "lodash"
import config from "../config"
import { environments, studentAppSubDomains } from "../constants";
import { batchType, documentType } from "../constants/batchConst"
import extractSubdomain, { isSubDomainActive,isLocalHost } from "./extractSubdomain";
import requestToGraphql from "./requestToGraphql";

export const getBaseRedirectUrl = (shouldRedirectToStudentApp = false, checkForLocalHost=false) => {
    const extractedDomain =  extractSubdomain() || ''
    let redirectBaseUrl = ''
    const { dev, staging, preProd } = environments
    switch (true) {
        case extractedDomain.includes(dev):
            redirectBaseUrl = `https://${shouldRedirectToStudentApp ? 'student-' : ''}dev.tekie.in/`
            break;
        case extractedDomain.includes(staging):
            redirectBaseUrl = `https://${shouldRedirectToStudentApp ? 'student-' : ''}staging.tekie.in/`
            break;
        case extractedDomain.includes(preProd):
            redirectBaseUrl = `https://${shouldRedirectToStudentApp ? 'student-' : ''}preprod.tekie.in/`
            break;
        default:
            redirectBaseUrl = `https://${shouldRedirectToStudentApp ? 'student' : 'www'}.tekie.in/`
            break;
    }
    return redirectBaseUrl
}

export const redirectToLoginPage = () => {
    const extractedDomain =  extractSubdomain()
    const isLocal = isLocalHost()
    const { dev, staging, preProd } = environments
    if(isLocal) return `${import.meta.env.REACT_APP_TEKIE_WEB_URL}/login`
    switch (true) {
        case extractedDomain.includes(dev):
            return `https://dev.tekie.in/login`
        case extractedDomain.includes(staging):
            return `https://staging.tekie.in/login`
        case extractedDomain.includes(preProd):
            return `https://preprod.tekie.in/login`
        default:
            return `https://www.tekie.in/login`

    }
}
const redirectUser = async (userConnectId, redirectBaseUrl) => {
    try {
        let magicLinkToken = await requestToGraphql(gql`{
            getMagicLink(input: { userId: "${userConnectId}" }) {
                linkToken
            }
        }`)
        if (get(magicLinkToken, 'data.getMagicLink[0].linkToken')) {
            magicLinkToken = get(magicLinkToken, 'data.getMagicLink[0].linkToken')
            if (magicLinkToken && typeof magicLinkToken === 'string') {
                let redirectUrl = `${redirectBaseUrl}login?authToken=${magicLinkToken}`;
                window.store.dispatch({ type: 'LOGOUT' })
                window.open(redirectUrl, "_self")
            }
        }
    } catch (e) {
        console.log('Something went wrong')
    }
}

const redirectByUserType = async (user, userId) => {
    if (typeof window === 'undefined') return null;
    const extractedDomain = extractSubdomain()
    const { dev, staging, preProd } = environments
    const isProduction = import.meta.env.REACT_APP_NODE_ENV === 'production'
    if (!(extractedDomain.includes(dev) || extractedDomain.includes(staging) || extractedDomain.includes(preProd) || isProduction)) return null;
    if (get(window, 'location.host', '').includes('localhost')) return null
    let studentSchool;
    let studentBatch;
    let userConnectId;
    if (get(user, 'role') === config.MENTEE && get(user, 'studentProfile')) {
        studentSchool = get(user, 'studentProfile.school.id')
        studentBatch = get(user, 'studentProfile.batch')
        userConnectId = get(user, 'id')
    } else {
        const child = get(user, 'parent.parentProfile.children', []).length > 1 && userId
            ? get(user, 'parent.parentProfile.children', []).find(child => get(child, 'user.id') === userId)
            : get(user, 'parent.parentProfile.children[0]')
        studentSchool = get(child, 'school.id')
        studentBatch = get(child, 'batch')
        userConnectId = get(child, 'user.id')
    }
    let isB2cStudent = false
    const isB2bStudent = studentSchool && get(studentBatch, 'type', '') === batchType.b2b && get(studentBatch, 'documentType', '') === documentType.classroom
    if (!isB2bStudent) isB2cStudent = true;
    const isStudentApp = isSubDomainActive && studentAppSubDomains.includes(extractSubdomain())
    let shouldRedirect = false;
    if (userConnectId) {
        if (isStudentApp && isB2cStudent) {
            console.log('Redirect to Tekie App')
            const redirectBaseUrl = getBaseRedirectUrl(false)
            await redirectUser(userConnectId, redirectBaseUrl)
            shouldRedirect = true;
        } else if (!isStudentApp && isB2bStudent) {
            console.log('Redirect to Student App')
            const redirectBaseUrl = getBaseRedirectUrl(true)
            await redirectUser(userConnectId, redirectBaseUrl)
            shouldRedirect = true;
        }
    }
    return shouldRedirect;
}

export default redirectByUserType;
