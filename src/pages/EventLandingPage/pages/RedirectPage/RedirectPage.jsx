import gql from 'graphql-tag'
import { get } from 'lodash'
import React from 'react'
import qs from 'query-string'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { filterKey } from '../../../../utils/data-utils'
import requestToGraphql from '../../../../utils/requestToGraphql'
import Book from '../../../Book'
import BookEmbed from '../../../Book/component/BookEmbed'
import TekieLoader from '../../../../components/Loading/TekieLoader'
import {redirectToLoginPage } from '../../../../utils/redirectByUserType'

class RedirectPage extends React.PureComponent{
    constructor(props) {
        super(props)
        this.state = {
           bookUrl: ""
        }
    }
    componentDidMount = () => {
        const redirectId = get(this.props, 'match.params.redirectId')
        if (redirectId) {
            requestToGraphql(gql`{
            shortLinks(filter:{
                or: [
                    {
                        id: "${redirectId}"
                    }
                    {
                        slug: "${redirectId}"
                    }
                ]
            }){
                id
                link
            }
            }`).then(res => {
                if (get(res, 'data.shortLinks[0].link')) {
                    const query = qs.parse(get(res, 'data.shortLinks[0].link'))
                    if (get(this.props, 'isLoggedIn') && get(query, 'redirectTo')) {
                        window.location.replace(get(query, 'redirectTo'))
                    } else {
                        if(!get(this.props, 'isLoggedIn')){
                            const redirectUrl = new URL(redirectToLoginPage())
                            redirectUrl.searchParams.set('showAlert', true)
                            redirectUrl.searchParams.set('ebookId',redirectId)
                            window.location.href = `${redirectUrl}`

                        }
                        this.setState({bookUrl: get(res, 'data.shortLinks[0].link')})
                    }
                } else {
                    // if the redirect is from the QR code page, redirect to the comming soon page instead
                    if (get(this.props, 'match.path') === '/s/:redirectId') {
                        this.props.history.push('/qr/comming-soon')
                    } else {
                        this.props.history.push('/')
                    }
                }
            })
        }
    }
    render() {
        return (
            this.state.bookUrl ? <BookEmbed 
                bookUrl={this.state.bookUrl}
            /> : <TekieLoader />
            
        )
    }
}

const mapStateToProps = (state) => ({
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
    loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
})

export default connect(mapStateToProps)(withRouter(RedirectPage))