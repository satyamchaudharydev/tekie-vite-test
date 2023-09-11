import React from 'react'
import { motion } from 'framer-motion'
import { get } from 'lodash'
import { getToasterBasedOnType, Toaster } from '../../../../components/Toaster'
import SignupModal from '../../../Signup/SignupModal'
import Login from '../../../Signup/Login'
import UserWaitListModal from '../../../../components/UserWaitListModal/UserWaitListModal'

const failureToasterProps = e => ({
  type: 'error',
  message: e,
  autoClose: 2000
})

const AuthModalContainer = (props) => {
    const isSignInModalVisible = get(props, 'isSignInModalVisible', false)
    const isSignUpModalVisible = get(props, 'isSignUpModalVisible', false)
    return (
        <div>

            <>
                <motion.div
                    initial={{
                        opacity: isSignInModalVisible ? 1 : 0,
                        display: isSignInModalVisible ? 'block' : 'none'
                    }}
                    animate={{
                        opacity: isSignInModalVisible ? 1 : 0,
                        display: isSignInModalVisible ? 'block' : 'none'
                    }}
                    style={{
                        pointerEvents: isSignInModalVisible ? 'auto' : 'none',
                    }}
                    >
                    <Login
                        visible={isSignInModalVisible}
                        shouldRedirect={false}
                        closeLoginModal={() => props.closeLoginModal()}
                        openSignupModal={() => {
                            props.closeLoginModal()
                            props.openEnrollmentForm()
                        }}
                        prompt={e => {
                            getToasterBasedOnType(failureToasterProps(e, true))
                        }}
                    />
                </motion.div>
                {/* <UserWaitListModal
                    visible={isSignUpModalVisible}
                    closeSignupModal={(status) => {
                        props.closeSignupModal(status)
                    }}
                /> */}
                <SignupModal
                    visible={isSignUpModalVisible}
                    closeSignupModal={(status) => {
                        props.closeSignupModal(status)
                    }}
                />
            </>
        </div>
    )
}

export default AuthModalContainer