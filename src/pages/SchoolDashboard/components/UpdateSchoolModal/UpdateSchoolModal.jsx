import React from 'react'
import { Form, Formik, Field } from 'formik'
import cx from 'classnames'
import { get } from 'lodash'
import duck from '../../../../duck'
import CloseIcon from '../../../../assets/SchoolDashboard/icons/CloseIcon'
import * as Yup from 'yup'

import './UpdateSchoolModal.scss'
import '../../SchoolDashboard.common.scss'
import '../modal.scss'
import updateSchool from '../../../../queries/schoolDashboard/updateSchoolDoc'

const stringRequired = Yup.string().required('Required')

const FeedbackFormValidationSchema = Yup.object().shape({
    name: stringRequired,
    phone: stringRequired,
    email: stringRequired,
})

const updateSchoolModal = ({
    schoolDetails = null,
    isModalVisible = false,
    closeModal,
    updateSchoolStatus
}) => {
    const isLoading = get(updateSchoolStatus, 'loading')
    const onSubmit = async (value) => {
        const input ={
            coordinatorName: value.name,
            coordinatorEmail: value.email,
            coordinatorPhone: {
                number: value.phone,
                countryCode: '+91'
            }
        }
        await updateSchool(get(schoolDetails, 'id'), input).call()
        closeModal(true)
    }

    return (
        <div className={cx('modal-Backdrop', isModalVisible && 'modal-Backdrop-visible')}>
            <div className={cx('modalBox', isModalVisible && 'modalBox-visible')}>
                {isLoading ? (
                <>
                    <div className='loading-container show'>
                        <div className='loading-bar-container'>
                            <div />
                        </div>
                    </div>
                </>
                ) : (null)}
                <div style={{ position: 'relative' }}>
                    <div className={cx('modal-header-container')}>
                        <div className={cx('updateSM-header-details')}>
                            <div className={cx('updateSM-details-container')}>
                               Update School Co-ordinator
                            </div>
                        </div>
                        <CloseIcon className='modal-closeIcon' onClick={() => closeModal(false)}/>
                    </div>
                    <div className={cx('updateSM-modal-content-container')} style={{ width: '100%', paddingTop: 0 }}>
                        <Formik
                            initialValues={{
                                name: get(schoolDetails, 'coordinatorName'),
                                phone: get(schoolDetails, 'coordinatorPhone.number'),
                                email: get(schoolDetails, 'coordinatorEmail'),
                            }}
                            validationSchema={FeedbackFormValidationSchema}
                            onSubmit={onSubmit}
                        >
                            {({ handleSubmit, values, handleChange, errors, touched, setFieldValue, validateForm }) => (
                            <>
                            <Form className='' style={{ width: '100%' }}>
                                <>
                                    <div className='updateSM-form-row'>
                                        <span className='updateSM-form-label'>Name </span>
                                        <Field
                                            className='updateSM-form-input'
                                            placeholder="Name"
                                            value={values.name}
                                            name='name' 
                                            onChange={handleChange}
                                        />
                                        {touched.name && errors.name ? (
                                <div style={{ fontSize: 'small', color: 'red' }} >{errors.name}</div>) : null}
                                    </div>
                                    <div className='updateSM-form-row'>
                                        <span className='updateSM-form-label'>Phone </span>
                                        <Field
                                            className='updateSM-form-input'
                                            placeholder="Phone"
                                            value={values.phone}
                                            name='phone' 
                                            onChange={handleChange}
                                        />
                                        {touched.phone && errors.phone ? (
                                <div style={{ fontSize: 'small', color: 'red' }} >{errors.name}</div>) : null}
                                    </div>
                                    <div className='updateSM-form-row'>
                                        <span className='updateSM-form-label'>Email </span>
                                        <Field
                                            className='updateSM-form-input'
                                            placeholder="Email"
                                            value={values.email}
                                            name='email' 
                                            onChange={handleChange}
                                        />
                                        {touched.email && errors.email ? (
                                <div style={{ fontSize: 'small', color: 'red' }} >{errors.email}</div>) : null}
                                    </div>
                                </>
                            </Form>
                            <div className='modal-footer-container updateSM-footer-w100'>
                                <button
                                    className='school-dashboard-secondary-btn'
                                    style={{ marginRight: '8px' }}
                                    onClick={() => {
                                        closeModal()
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className='modal-footer-btn'
                                    style={{ borderRadius: '8px' }}
                                    onClick={() => {
                                        validateForm()
                                        handleSubmit()
                                    }}
                                >
                                    Update
                                </button>
                            </div>
                            </>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default updateSchoolModal