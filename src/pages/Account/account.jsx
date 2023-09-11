import React from 'react'
import classNames from 'classnames'
import styles from "./styles.module.scss";
import { ReactComponent as TriangleBG } from '../../assets/triangleBG.svg'
import { ReactComponent as InfoIcon } from '../../assets/information.svg'
import { ReactComponent as EditIcon } from '../../assets/editAccount.svg'
import CalendarModal from './calendar'
import fetchStudentProfile from '../../queries/fetchStudentProfile'
import { updateUserDetails, updateStudentProfile } from '../../queries/updateUserDetails'
import capitalize from '../../utils/text/capitalize'
import { Map } from 'immutable';
import formatDate from '../../utils/getDate'
import moment from 'moment';
import addToUserStudentProfile from '../../queries/addToUserStudentProfile';
import { get } from 'lodash';
import hs from '../../utils/scale';
import { getToasterBasedOnType } from '../../components/Toaster';

export default class Account extends React.Component {
  state = {
    isEditing: false,
    isCalendarVisible: false,
    selectedDate: new Date(),
    kidDob: '',
    maxDate: new Date(),
    kidEmail: '',
    kidPassword: '',
    kidPasswordConfirm: '',
    kidGender: '',
    kidSchoolName: '',
    kidRollNo: '',
    contactNumberCountryCode: '',
    contactNumber: '',
    passwordMismatch:'',
    errorMessage:'',
  }

  async componentDidMount() {
    if (!this.props.accountProfileSuccess) {
      await fetchStudentProfile(this.props.user.get('id'))
      if (!this.props.user.get('studentProfile')) {
        await addToUserStudentProfile(this.props.user.get('id'))
      }
    } else {
      this.setFields()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if ((!prevProps.accountProfileSuccess && this.props.accountProfileSuccess) ||
      (!prevProps.studentProfileSuccess && this.props.studentProfileSuccess)
    ) {
      this.setFields()
    }
  }
  setFields = () => {
    const { user, studentProfile,parentDetails } = this.props
    this.setState({
      kidEmail: user.get('email')||  get(user && user.toJS(),'parent.parentProfile.user.email')
    })
    this.setState({
      kidGender: user.get('gender'),
      kidDob: user.get('dateOfBirth') && formatDate(user.get('dateOfBirth')),
      kidSchoolName: studentProfile.get('schoolName'),
      kidRollNo: studentProfile.get("rollNo"),
      contactNumberCountryCode: user.getIn(['phone', 'countryCode']),
      contactNumber: user.getIn(['phone', 'number'])
    })
  }
  toggleIsEditing = () => {
    this.setState({
      isEditing: true
    })
    this.setState({passwordMismatch:''})
  }
  openCalendar = () => {
    this.setState({
      isCalendarVisible: true
    })
  }
  closeCalendar = () => {
    this.setState({
      isCalendarVisible: false
    })
  }
  onDateChange = (date) => {
    this.setState({
      kidDob: formatDate(date),
      isCalendarVisible: false
    })
  }
  handleChangeInInputFields = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  toggleEditableForm = (isEditing) => {
    this.setState({
      isEditing: isEditing
    })
  }
  handleSubmitData = async() => {
    this.setState({errorMessage:''})
    const { kidEmail, kidPassword, kidPasswordConfirm, kidDob, kidGender, kidSchoolName, contactNumber, contactNumberCountryCode } = this.state
    const { user, studentProfile } = this.props
    if (kidPassword !== kidPasswordConfirm) {
      this.setState({passwordMismatch:'Password mismatch.'})
      return
    }
    this.toggleEditableForm(false)
    if (kidEmail !== user.get('email') || kidPassword !== user.get('password') || kidGender !== user.get('gender')
      || kidDob !== user.get('dateOfBirth')
    ) {
      const timeInUTC = moment(kidDob).utc()
      const dateOfBirth = kidDob ? { dateOfBirth: timeInUTC } : {}
      const password = kidPassword ? { password: kidPassword } : {}
      const phone = contactNumber ? { phone: { countryCode: contactNumberCountryCode, number: contactNumber } } : {}
      const email = kidEmail !== user.get('email') ? {email: kidEmail && kidEmail.replace(/\s/g, '')} : {}
      const savedPassword = kidPassword ? { savedPassword: kidPassword } : {}
      if(!kidEmail || kidEmail.trim() === ''){
        this.setState({errorMessage: 'Email field cannot be left empty.'})
        return
      }
      if(kidEmail && kidEmail.replace(/\s/g, '').length > 30){
        this.setState({errorMessage: 'Email length cannot exceed 30 characters.'})
        return
      }
      const updateUserInput = {
        ...email, ...dateOfBirth, ...phone,
      }
      const updatePassword = {
        ...password, ...savedPassword, ...email,
      }
      if (kidGender) {
        updateUserInput.gender = kidGender
      }
      const res = Object.keys(updatePassword).length !== 0  && await  updateUserDetails(updatePassword, get(user.toJS(),'parent.parentProfile.user.id') ? get(user.toJS(),'parent.parentProfile.user.id') : get(user.toJS(),'parent.id'))
      const userRes = Object.keys(updateUserInput).length !== 0 && await updateUserDetails(updateUserInput, user.get('id'))
      if (Object.keys(userRes).length !== 0 || Object.keys(res).length !== 0){
        getToasterBasedOnType({
          type: 'success',
          message: 'Successfully updated!'
        })
      }
      const currentError = Object.keys(res).length === 0 && this.props.userError && this.props.userError.toJS() && this.props.userError.toJS().pop()
      currentError && (!this.props.accountProfileSuccess && get(currentError,'error.errors[0].message') === "User with similar email already exist.") ? this.setState({errorMessage: 'Student with similar email already exist.'}) : this.setState({errorMessage:get(currentError,'error.errors[0].message')})
    }
    if (kidSchoolName !== studentProfile.get('schoolName')) {
      updateStudentProfile({ schoolName: kidSchoolName }, user.getIn(['studentProfile', 'id']))
    }

  }
  renderEditableHeader = (headerText) => {
    return (
      <div className={styles.header}>
        <span className={styles.headerText}>
          {headerText}
        </span>
        <div className={styles.infoIcon}>
          <InfoIcon />
          <div className={styles.toolTipContainer}>
            <div className={styles.hoverTextLayout}>
              <span className={styles.hoverText}>
                Set your login credentials here.
              </span>
            </div>
            <div className={styles.toolTipTriangle} />
          </div>
        </div>
        {
          !this.state.isEditing ?
            <div className={styles.editIcon} onClick={this.toggleIsEditing}>
              <EditIcon />
            </div> : (
              <div className={styles.actionButtons}>
                <span className={styles.cancelEditText} onClick={() => this.toggleEditableForm(false)}>
                  Cancel
                </span>
                <span className={styles.submitEditText} onClick={this.handleSubmitData}>
                  Submit
                </span>
              </div>
            )
        }
      </div>
    )
  }
  renderParentInfo = (parent) => {
    return (
      <div className={styles.parentSection}>
        <div className={styles.header}>
          <span className={styles.headerText}>
            Parents Information
          </span>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Name:</span>
            <span className={styles.infoValueText}>{parent.get('name', '')}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Email id:</span>
            <span className={styles.infoValueText}>{parent.get('email', '')}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Contact No:</span>
            <span className={styles.infoValueText}>
              {parent.getIn(['phone', 'countryCode'], '')} {parent.getIn(['phone', 'number'], '')}
            </span>
          </div>
        </div>
      </div>
    )
  }
  renderStaticFormMentee = (user, studentProfile) => {
    const { kidEmail, kidPassword, kidDob, kidGender, kidSchoolName, kidRollNo } = this.state
    return (
      <div className={styles.kidsSection}>
        {user.get('role') === 'mentee' && this.renderEditableHeader(`Kid's Information`)}
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Name:</span>
            <span className={styles.infoValueText}>{user.get('name', '')}</span>
          </div>
          <div className={classNames(styles.row, styles.bGcolor,this.state.errorMessage && styles.errorMessage)}>
            <span className={styles.infoTypeText}>Email id:</span>
            <div style={{marginBottom: this.state.errorMessage ? hs(50) : hs(25)}}>
              <span className={styles.infoValueText}>{(kidEmail && kidEmail.substring(0, 30)) + (kidEmail && kidEmail.length > 30 ?  "..." : '')}</span>
              {this.state.errorMessage && <p style={{color:'red',fontSize: hs(23),margin: 0, marginTop: hs(30)}} className={styles.infoValueText}>{this.state.errorMessage}</p>}
            </div>
          </div>
          <div className={classNames(styles.row, styles.bGcolor)}>
            <span className={styles.infoTypeText}>Roll No:</span>
            <span className={styles.infoValueText}>{kidRollNo}</span>
          </div>
          <div className={classNames(styles.row, styles.bGcolor)}>
            <span className={styles.infoTypeText}>Password:</span>
            <span className={styles.infoValueText}>{kidPassword}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Gender:</span>
            <span className={styles.infoValueText}>{capitalize(kidGender || '')}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Date of Birth:</span>
            <span className={styles.infoValueText}>{kidDob}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Grade:</span>
            <span className={styles.infoValueText}>{studentProfile.get('grade') && studentProfile.get('grade').replace(/[a-zA-Z]/g, '')}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>School Name:</span>
            <span className={styles.infoValueText}>{kidSchoolName}</span>
          </div>
        </div>
      </div>
    )
  }
  renderEditableFormMentee = (user, studentProfile) => {
    const { kidEmail, kidPassword, kidPasswordConfirm, kidDob, kidGender, kidSchoolName } = this.state
    return (
      <div className={styles.kidsSection}>
        {user.get('role') === 'mentee' && this.renderEditableHeader(`Kid's Information`)}
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Name:</span>
            <span className={styles.infoValueText}>{user.get('name', '')}</span>
          </div>
          <div className={classNames(styles.row, styles.bGcolor)}>
            <span className={styles.infoTypeText}>Email id:</span>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="Email"
                className={styles.inputField} value={kidEmail}
                name='kidEmail' onChange={this.handleChangeInInputFields}
                disabled
              >
              </input>
            </div>
          </div>
          <div className={classNames(styles.row, styles.bGcolor)}>
            <span className={styles.infoTypeText}>Password:</span>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="Password" type='password' className={styles.inputField}
                name='kidPassword' onChange={this.handleChangeInInputFields}
                value={kidPassword}
              >
              </input>
            </div>
          </div>
          <div className={classNames(styles.row)} style={{height: this.state.passwordMismatch && hs(120)}}>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="Confirm Password"
                type='password' className={styles.inputField}
                value={kidPasswordConfirm}
                name={'kidPasswordConfirm'} onChange={this.handleChangeInInputFields}
              >
              </input>
            </div>
            {this.state.passwordMismatch && <p className={classNames(styles.inputFieldWrapper) } 
              style={{color:'red',fontSize: hs(23),margin: 0, marginTop: hs(90),width:'auto'}}
            >{this.state.passwordMismatch}</p>}
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Gender:</span>
            <div className={styles.inputFieldWrapper}>
              <input id="femaleGender" type='radio' name="kidGender" value="female" checked={kidGender === 'female'}
                onChange={this.handleChangeInInputFields}
              ></input>
              <label htmlFor="femaleGender" className={classNames(styles.infoTypeText, styles.labelText)}>
                Female
              </label>
              <input id="maleGender" type='radio' name="kidGender" value="male" checked={kidGender === 'male'}
                onChange={this.handleChangeInInputFields}
              ></input>
              <label htmlFor="maleGender" className={classNames(styles.infoTypeText, styles.labelText)}>
                Male
              </label>
              <input id="otherGender" type='radio' name="kidGender" value="others" checked={kidGender === 'others'}
                onChange={this.handleChangeInInputFields}
              ></input>
              <label htmlFor="otherGender" className={classNames(styles.infoTypeText, styles.labelText)}>
                Others
              </label>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Date of Birth:</span>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="Date of birth"
                className={styles.inputField}
                onClick={this.openCalendar}
                onFocus={this.openCalendar}
                value={kidDob}
              ></input>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Grade:</span>
            <span className={styles.infoValueText}>{studentProfile.get('grade') && studentProfile.get('grade').replace(/[a-zA-Z]/g, '')}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>School Name:</span>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="School Name" className={styles.inputField} name={'kidSchoolName'}
                onChange={this.handleChangeInInputFields} value={kidSchoolName}
                disabled
              ></input>
            </div>
          </div>
        </div>
      </div>
    )
  }
  renderStaticFormSelfLearner = (user) => {
    const { kidEmail, kidPassword, kidDob, kidGender, kidSchoolName, kidRollNo,
      contactNumberCountryCode, contactNumber } = this.state
    return (
      <div className={styles.kidsSection}>
        {this.renderEditableHeader(`Personal Information`)}
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Name:</span>
            <span className={styles.infoValueText}>{user.get('name', '')}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Email id:</span>
            <span className={styles.infoValueText}>{kidEmail}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Roll No:</span>
            <span className={styles.infoValueText}>{kidRollNo}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Contact No:</span>
            <span className={styles.infoValueText}>
              {contactNumberCountryCode} {contactNumber}
            </span>
          </div>
          <div className={classNames(styles.row, styles.bGcolor)}>
            <span className={styles.infoTypeText}>Password:</span>
            <span className={styles.infoValueText}>{kidPassword}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Gender:</span>
            <span className={styles.infoValueText}>{capitalize(kidGender || '')}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Date of Birth:</span>
            <span className={styles.infoValueText}>{kidDob}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Institution Name:</span>
            <span className={styles.infoValueText}>{kidSchoolName}</span>
          </div>
        </div>
      </div>
    )
  }
  renderEditableFormSelfLearner = (user, studentProfile) => {
    const { kidEmail, kidPassword, kidPasswordConfirm, kidDob, kidGender,
      kidSchoolName, contactNumberCountryCode, contactNumber } = this.state
    return (
      <div className={styles.kidsSection}>
        {this.renderEditableHeader(`Personal Information`)}
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Name:</span>
            <span className={styles.infoValueText}>{user.get('name', '')}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Email id:</span>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="Email"
                className={styles.inputField} value={kidEmail}
                name='kidEmail' onChange={this.handleChangeInInputFields}
                disabled
              >
              </input>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Contact No:</span>
            <div className={styles.inputFieldWrapper}>
              {/* <input placeholder="Code"
                className={classNames(styles.inputField,styles.countryCode)} value={contactNumberCountryCode}
                name='contactNumberCountryCode' onChange={this.handleChangeInInputFields}
              >
              </input> */}
              <span className={classNames(styles.countryCode)}>
                {contactNumberCountryCode}
              </span>
              <input placeholder="Email"
                className={classNames(styles.inputField, styles.contactNumber)} value={contactNumber}
                name='contactNumber' onChange={this.handleChangeInInputFields}
              >
              </input>
            </div>
          </div>
          <div className={classNames(styles.row, styles.bGcolor)}>
            <span className={styles.infoTypeText}>Password:</span>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="Password" type='password' className={styles.inputField}
                name='kidPassword' onChange={this.handleChangeInInputFields}
                value={kidPassword}
              >
              </input>
            </div>
          </div>
          <div className={classNames(styles.row, styles.bGcolor)}>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="Confirm Password"
                type='password' className={styles.inputField}
                value={kidPasswordConfirm}
                name={'kidPasswordConfirm'} onChange={this.handleChangeInInputFields}
              >
              </input>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Gender:</span>
            <div className={styles.inputFieldWrapper}>
              <input id="femaleGender" type='radio' name="kidGender" value="female" checked={kidGender === 'female'}
                onChange={this.handleChangeInInputFields}
              ></input>
              <label htmlFor="femaleGender" className={classNames(styles.infoTypeText, styles.labelText)}>
                Female
              </label>
              <input id="maleGender" type='radio' name="kidGender" value="male" checked={kidGender === 'male'}
                onChange={this.handleChangeInInputFields}
              ></input>
              <label htmlFor="maleGender" className={classNames(styles.infoTypeText, styles.labelText)}>
                Male
              </label>
              <input id="otherGender" type='radio' name="kidGender" value="others" checked={kidGender === 'others'}
                onChange={this.handleChangeInInputFields}
              ></input>
              <label htmlFor="otherGender" className={classNames(styles.infoTypeText, styles.labelText)}>
                Others
              </label>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>Date of Birth:</span>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="Date of birth"
                className={styles.inputField}
                onClick={this.openCalendar}
                onFocus={this.openCalendar}
                value={kidDob}
                onChange={() => { }}
              ></input>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.infoTypeText}>School Name:</span>
            <div className={styles.inputFieldWrapper}>
              <input placeholder="Institution Name" className={styles.inputField} name={'kidSchoolName'}
                onChange={this.handleChangeInInputFields} value={kidSchoolName}
                disabled
              ></input>
            </div>
          </div>
        </div>
      </div>
    )
  }
  render() {
    const { parentDetails: parent = Map(), user = Map(), studentProfile } = this.props
    const { kidDob, isEditing } = this.state
    return (
      <div className={styles.container}>
        <div className={styles.accountBG}>
          <TriangleBG />
        </div>
        {
          user.get('role') === 'mentee' ? (
            <React.Fragment>
              {this.renderParentInfo(parent)}
              {isEditing ? this.renderEditableFormMentee(user, studentProfile) :
                this.renderStaticFormMentee(user, studentProfile)}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {isEditing ? this.renderEditableFormSelfLearner(user, studentProfile) :
                this.renderStaticFormSelfLearner(user, studentProfile)}
            </React.Fragment>
          )
        }
        {
          this.state.isCalendarVisible && (
            <CalendarModal
              onDateChange={(date) => this.onDateChange(date)}
              selectedDate={new Date(kidDob) || this.state.maxDate}
              closeCalendar={this.closeCalendar}
              maxDate={this.state.maxDate}
            />
          )
        }
      </div>
    )
  }
}
