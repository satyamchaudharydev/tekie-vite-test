import React, { useState } from 'react'
import { Form, Formik } from 'formik'
import cx from 'classnames'
import { ActionButton } from '../../../components/Buttons'
import { hs } from '../../../utils/size'
import styles from '../ComingSoon.module.scss'
import { get } from 'lodash'
import FormInput from './FormInput'
import Dropzone from './Dropzone'
import * as Yup from 'yup'

const buttonTextProps = {
    hideIconContainer: true,
    buttonTextCenterAligned: true
}

const stringRequired = Yup.string().required('Required')


const FeedbackFormValidationSchema = Yup.object().shape({
    name: stringRequired,
    email: stringRequired,
    subject: stringRequired,
    description: stringRequired
})

const FeedbackForm = (props) => {
    const [files, setFiles] = useState([])
    const { handleSubmit, loggedInUser, loading } = props
    const onSubmit = async (value, { resetForm, setErrors }) => {
        if (files.length > 5) {
            setErrors({ files: 'Maximum 5 files allowed' })
        } else {
            await handleSubmit(value, files, resetForm, setFiles)
        }
    }
    return (
        <Formik
            initialValues={{
                name: get(loggedInUser, 'name'),
                email: get(loggedInUser, 'parent.email'),
                subject: '',
                description: '',
                files: ''
            }}
            validationSchema={FeedbackFormValidationSchema}
            onSubmit={onSubmit}
        >
            {({ handleSubmit, values, handleChange, errors, setFieldValue, validateForm }) => (
            <>
            <Form className={styles.formSection}>
                <>
                <div className={styles.formHeader}>
                    <span className={styles.headerText}>
                    Contact Us
                    </span></div>
                <div className={cx(styles.row)}>
                    <span className={styles.infoTypeText}>Your Name: </span>
                    <FormInput
                        placeholder="Name"
                        value={values.name || ''}
                        name='name' onChange={handleChange}
                        readOnly
                    />
                </div>
                <div className={cx(styles.row, styles.bGcolor)}>
                    <span className={styles.infoTypeText}>Your Email: </span>
                    <FormInput
                        placeholder="Email"
                        value={values.email || ''}
                        name='email' onChange={handleChange}
                        readOnly
                    />
                </div>
                <div className={cx(styles.row, styles.bGcolor)}>
                    <span className={styles.infoTypeText}>Subject: </span>
                    <FormInput
                        placeholder="Subject"
                        value={values.subject || ''}
                        name='subject' onChange={handleChange}
                    />
                </div>
                <div className={cx(styles.row, styles.bGcolor)}>
                    <span className={styles.infoTypeText}>Description: </span>
                    <FormInput
                        placeholder="Description"
                        value={values.description || ''}
                        name='description' onChange={handleChange}
                        textArea='text'
                    />
                </div>
                <div className={cx(styles.row, styles.bGcolor)}>
                    <span className={styles.infoTypeText}>Attachment: </span>
                    <div className={styles.fileUploader} >
                        <Dropzone
                            files={files}
                            setFile={setFiles}
                        />
                        <div style={{
                            fontSize: 'small',
                            color: 'red',
                            marginTop: '8px',
                            width: '100%'
                        }} >
                            {errors && errors.files}
                        </div>
                    </div>
                </div>
                </>
            </Form>
            <div>
                <ActionButton
                    style={{ padding: '0', margin: '0 auto 20px auto' }}
                    {...buttonTextProps}
                    title='Submit'
                    showLoader={loading}
                    onClick={() => {
                        validateForm()
                        handleSubmit()
                    }}
                    textStyle={{ marginLeft: `${hs(24)}px`, marginRight: `${hs(24)}px` }}
                    isPadded
                />
            </div>
            </>
            )}
        </Formik>
    )
}

export default FeedbackForm
