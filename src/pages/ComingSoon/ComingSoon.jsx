import React, { Component } from 'react'
import styles from './ComingSoon.module.scss'
import Potato from '../../assets/potato'
import FeedbackForm from './components/FeedbackForm'
import FormData from 'form-data'
import { Base64 } from 'js-base64'
import { getToasterBasedOnType, Toaster } from '../../components/Toaster'

const successToasterProps = {
    type: 'success',
    message: 'Request submitted. We\'ll get back to you shortly!'
}

const failureToasterProps = {
    type: 'error',
    message: 'Something went wrong!'
}

class ComingSoon extends Component {
    state = {
        loading: false
    }
    handleSubmit = async (values, files, resetForm, setFiles) => {
        const { email, subject, name, description } = values
        var url = `${import.meta.env.REACT_APP_FRESH_DESK_ENDPOINT}/api/v2/tickets`;
        let body = new FormData()
        body.append('email', email)
        body.append('subject', subject)
        body.append('name', name)
        body.append('description', description)
        body.append('status', 2)
        body.append('priority', 1)
        // body.append('type', 'Question')
        // body.append('custom_fields[cf_summary]', 'Hello')
        // body.append('custom_fields[cf_test]', 'Tech issue')
        // body.append('custom_fields[cf_test_2]', 'Student app')
        // body.append('custom_fields[cf_test_3]', 'Sessions Tab')
        if (files && files.length > 0) {
            files.forEach(file => {
                body.append('attachments[]', file.file)
            })
        }
        this.setState({ loading: true })
        fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Base64.encode(`${import.meta.env.REACT_APP_FRESH_DESK_KEY}:X`)
            },
            body
        }).then(res => {
            if (res.status === 201 && res.statusText === 'Created') {
                this.setState({ loading: false })
                getToasterBasedOnType(successToasterProps)
                resetForm({
                    name: '',
                    email: '',
                    subject: '',
                    description: ''
                })
                setFiles([])
            } else {
                getToasterBasedOnType(failureToasterProps)
            }
        })
    }
    render() {
        const loggedInUser = this.props.loggedInUser && this.props.loggedInUser.toJS()
        return (
            <div className={styles.container}>

                <FeedbackForm
                    loggedInUser={loggedInUser}
                    handleSubmit={this.handleSubmit}
                    loading={this.state.loading}
                />
                {/* <div className={styles.bodyContainer}>
                    <div className={styles.potatoContainer}>
                        <Potato className={styles.potatoIcon}/>
                    </div>
                    <div className={styles.text}>Coming soon... Till then here's a potato.</div>
                </div> */}
            </div>
        )
    }
}

export default ComingSoon
