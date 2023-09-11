import React, { Component } from 'react'
import {ActionButton} from '../Buttons'
import PopUp from '../PopUp/PopUp'
import './LoginForm.scss'

const buttonTextProps = {
    hideIconContainer: true,
    buttonTextCenterAligned: true,
    hoverToCursor: true
}

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.visible && !prevProps.visible) {
            this.setState({
                email: '',
                password: ''
            })
        } else if ((prevState.email.length === 0 && this.state.email.length > 0) &&
            (prevState.password.length === 0 && this.state.password.length > 0)) {
            this.setState({
                email: '',
                password: ''
            })
        }
    }

    handleChange = (event, type) => {
        if (type === 'email') {
            this.setState({
                email: event.target.value
            })
        } else if (type === 'password') {
            this.setState({
                password: event.target.value
            })
        }
    }

    handleSubmit = () => {
        const { onSubmit } = this.props
        onSubmit(this.state.email && this.state.email.trim(), this.state.password)
    }

    render () {
        const { visible, closeLoginPopup, heading, style = {} } = this.props
        return (
            <PopUp
                showPopup={visible}
                closePopUp={closeLoginPopup}
                style={{ position: 'absolute', top: 0, ...style }}
            >
                <div className='mainContainer'>
                    <div className='headingContainer'>{heading}</div>
                    <form  className='formContainer'>
                        <div className='firstField'>
                            <input className='input'
                                   placeholder='Email'
                                   onChange={(event) => this.handleChange(event, 'email')}
                                   value={this.state.email}
                                   type='text'
                            />
                        </div>
                        <div className='field'>
                            <input className='input'
                                   placeholder='Password'
                                   onChange={(event) => this.handleChange(event, 'password')}
                                   value={this.state.password}
                                   type='password'
                            />
                        </div>
                        <div className='submitButtonContainer'>
                            <div>
                                <ActionButton
                                    {...buttonTextProps}
                                    title={
                                        this.props.showBookOption
                                            ? 'Book Session' : 'Start Session'
                                    }
                                    showLoader={this.props.showLoader}
                                    onClick={this.handleSubmit}
                                    isPadded
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </PopUp>
        )
    }
}

export default LoginForm
