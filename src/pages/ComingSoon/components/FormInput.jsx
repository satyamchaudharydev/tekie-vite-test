import { useField } from 'formik'
import React from 'react'
import styles from '../ComingSoon.module.scss'
import cx from 'classnames'

const FormInput = ({ textArea, ...props }) => {
    const [field, meta] = useField(props)
    return (
        <div>
            {
                textArea === 'text' ? (
                    <div className={styles.textAreaFieldWraper}>
                    <textarea
                        className={styles.inputField}
                        {...field}
                        {...props}
                    >
                    </textarea>
                    </div>
                ) : (
                    <div className={styles.inputFieldWrapper}>
                    <input
                        className={cx(styles.inputField, props.readOnly && styles.disabledInput)}
                        {...field}
                        {...props}
                    >
                    </input>
                    </div>
                )
            }
            {meta.touched && meta.error ? (
        <div style={{ fontSize: 'small', color: 'red' }} >{meta.error}</div>) : null}
        </div>
    )
}

export default FormInput
