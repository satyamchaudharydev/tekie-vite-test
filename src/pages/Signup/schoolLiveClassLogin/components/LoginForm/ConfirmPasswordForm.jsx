import { get } from 'lodash'
import React from 'react'
import { avatarsRelativePath } from '../../../../../utils/constants/studentProfileAvatars'
import './LoginForm.scss'

const ConfirmPasswordForm=(props)=>{
const {selectedStudentDetails}=props
console.log("confirm pasword")

    return <div className={'school-live-class-login-confirmPasswordFormContainer'}>
       <div className={'school-live-class-login-selectedStudentContainer'}>
                            <div className={'school-live-class-login-avatarAndNameContainer'}>
                                <img className={'school-live-class-login-avatar'} src={avatarsRelativePath[get(selectedStudentDetails, 'avatar')]} alt='student-avatar' />
                                <div className={'school-live-class-login-rollNoAndNameContainer'}>
                                    <span>{get(selectedStudentDetails, 'rollNo')} - </span>
                                    <span className={'school-live-class-login-studentName'}>{get(selectedStudentDetails, 'name')}</span>
                                </div>
                            </div>
                        </div>
                        <input/>
    </div>
}


export default ConfirmPasswordForm