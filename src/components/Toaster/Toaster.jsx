import React from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './Toaster.scss'

const getToasterBasedOnType = (props) => {
    switch (props.type) {
        case 'success':
            return toast.success(props.message, {
                className: props.className || 'successToaster',
                autoClose: props.autoClose || 2000,
                toastId: props.toastId || ''
            })

        case 'error':
            return toast.error(props.message, {
                className: props.className || 'errorToaster',
                autoClose: props.autoClose || 4000
            })
        case 'info':
            return toast.info(props.message, {
                className: 'loadingToaster',
                autoClose: props.autoClose || 4000
            })
        case 'loading':
            return toast.error(props.message, {
                className: 'loadingToaster',
                autoClose: props.autoClose || 2000
            })

        default:
            break
    }
}

const Toaster = () => {
    return (
        <ToastContainer
            position='top-right'
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            style={{ zIndex: 9999999 }}
            rtl={false}
            draggable
        />
    )
}

export {
    Toaster,
    getToasterBasedOnType
}
