import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom'
import {ActionButton, PaymentButton} from '../Buttons'
import PopUp from '../PopUp/PopUp'
import styles from './PurchaseReviewForm.module.scss'
import fetchProducts from "../../queries/fetchProducts";
import { filterKey } from '../../utils/data-utils';
import config, {GIFT_VOUCHER_AMOUNT, product1, product2, product3, product4, product5, product6, product7, product8, product9, product10, product11, product12, product30, productTypes, courseName, products, schoolProducts, defaultCoupons} from "../../config";
import fetchStudentProfile from "../../queries/fetchStudentProfile";
import fetchDiscountForProduct from "../../queries/fetchDiscountForProduct";
import SimpleButtonLoader from "../SimpleButtonLoader";
import { ReactComponent as GraduationDrop } from '../../assets/graduation_drop.svg'
import { ReactComponent as DiscountIcon } from '../../assets/discount_icon.svg'
import fetchPaymentRequest from "../../queries/fetchPaymentRequest";
import fetchPaymentResponse from "../../queries/fetchPaymentResponse";
import fetchMenteeCourseSyllabus from "../../queries/sessions/fetchMenteeCourseSyllabus";
import updateSheet from '../../utils/updateSheet';
import CreditIcon from "../Buttons/CreditButton/CreditIcon";
import CheckBox from "../CheckBox/checkBox";
import cx from "classnames";
import fetchUserInvites from "../../queries/fetchInvitedUsers";
import fetchUserCredit from "../../queries/fetchUserCredit";
import signUpMentee from '../../queries/signUpMentee'
import { BuyNowGA } from '../../utils/analytics/ga';
import Select, { components } from 'react-select';
import addZeroes from '../../utils/addZeros'
import {Field, Form, Formik} from "formik";
import {motion} from "framer-motion";
import * as Yup from "yup";
import qs from 'query-string'
import withScale from '../../utils/withScale';
import { Toaster, getToasterBasedOnType } from '../Toaster'

const colourStyles = {
    indicatorSeparator: styles => ({ ...styles,
        display: 'none'
    }),
    control: styles => ({ ...styles, backgroundColor: 'white',
        borderColor: '#31e1e9',
        borderRadius: '8px',
        color: '#504f4f',
        '&:hover': {
            borderColor: '#31e1e9'
        }}),
    singleValue: (provided) => ({
        ...provided,
        color: '#504f4f',
    }),
    option: (styles, { isDisabled, isFocused, isSelected }) => {
        return {
            ...styles,
            backgroundColor: isDisabled
                ? null
                : isSelected
                    ? '#ffffff'
                    : isFocused
                        ? '#e7fbfd'
                        : '#ffffff',
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? '#504f4f'
                    : '#504f4f',
            cursor: isDisabled ? 'not-allowed' : 'default',
            '&:hover': {
                backgroundColor: !isDisabled && '#e7fbfd',
            },
            ':active': {
                ...styles[':active'],
                backgroundColor: !isDisabled && (isSelected ? '#e7fbfd' : '#504f4f'),
            },
        };
    },
};

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const validationMentee = Yup.object().shape({
    parentName: Yup.string()
        .trim()
        .min(3, 'Name cannot be less than 3 letters')
        .max(30, 'Name cannot be more than 30 letters')
        .required('Required*'),
    email: Yup.string()
        .email('Invalid email')
        .trim()
        .required('Required*'),
    parentPhone: Yup.string()
        .trim()
        .required('Required*')
        .length(10, 'Phone number is not valid')
        .matches(phoneRegExp, 'Phone number is not valid'),
    childName: Yup.string()
        .trim()
        .min(3, 'Name cannot be less than 3 letters')
        .max(30, 'Name cannot be more than 30 letters')
        .required('Required*')
});

class PurchaseReviewForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            name: '',
            contact: '',
            email: '',
            courseTitle: '',
            productId: '',
            price: 32760,
            discount: 2457,
            totalCharge: 30303,
            couponCode: '',
            couponLoading: false,
            couponCodeError: '',
            appliedCouponCode: '',
            confirmPaymentLoading: false,
            isCreditUsed: true,
            userCredit: 0,
            products: products,
            activeForm: 0,
            grade: 6,
            parentName: '',
            childName: '',
            parentEmail: '',
            countryCode: '+91',
            parentPhone: '',
            s_email: '',
            s_countryCode: '+91',
            s_phone: '',
            s_name: '',
            selectedProductName: product1,
            schoolName: '',
            code: null
        }
    }

    async componentDidMount() {
        // if (!this.props.accountProfileSuccess) {
        //     await fetchStudentProfile(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id)
        // }
        // if (!this.props.productSuccess) {
        //     await fetchProducts(config.MENTEE).call()
        // }

        // if (this.props.invitedUsersStatus && this.props.invitedUsersStatus.toJS() && !this.props.invitedUsersStatus.toJS().userInvite) {
        //     await fetchUserInvites(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id).call()
        // }

        // this.setFields()
        const schoolName = qs.parse(window.location.search).schoolName
        const code = qs.parse(window.location.search).code
        let selectedProductName= '';
        if(schoolName) {
            if (schoolProducts[schoolName]) {
                this.setState({
                    schoolName,
                    products: schoolProducts[schoolName],
                    price: schoolProducts[schoolName][0].price,
                    discount: schoolProducts[schoolName][0].discountPrice,
                    totalCharge: schoolProducts[schoolName][0].totalCharge,
                })
                if(schoolProducts[schoolName].length === 1){
                    selectedProductName = schoolProducts[schoolName][0].label
                    this.setState({
                        selectedProductName
                    })
                }
            } else {
                this.setState({
                    schoolName,
                    products: schoolProducts['G M Vidyanikethan Public School'],
                    price: 32760,
                    discount: 12600,
                    totalCharge: 20160,
                })
            }
        }

        if (code && defaultCoupons[code]) {
            const price = 32760
            const discount =  price * (defaultCoupons[code] / 100)
            const totalCharge = price - discount
            this.setState({
                price,
                discount,
                totalCharge,
                products: products.map(product => ({
                    ...product,
                    discountPrice: product.price * (defaultCoupons[code] / 100),
                    totalCharge: product.price - (product.price * (defaultCoupons[code] / 100))
                })),
                code,
            })
        }

        this.setState({
            isLoading: false
        })

        if (this.props.isLoggedIn) {
            if(schoolName){
                this.props.history.push(`/checkout?productName=${selectedProductName || this.state.selectedProductName}&schoolName=${schoolName}`)
            } else {
                this.props.history.push(`/checkout?productName=${this.state.selectedProductName}`)
            }
        }
    }

    componentDidUpdate (prevProps) {
        if(prevProps.discount !== this.props.discount){
            this.setFields()
        }

        if (!prevProps.userStatus.get('failure') && this.props.userStatus.get('failure')) {
            getToasterBasedOnType({
                type: 'error',
                message: this.props.error
            })
        }

        if (this.props.isLoggedIn) {
            this.props.history.push('/checkout')
        }
    }

    setFields = () => {
        const { userBillingDetails, profile, product, discount, parentDetails, userCredit } = this.props
        let products = this.props.products
        let discounts  = discount && discount.toJS()
        if(!products || (products && !products.length)){
            products  = this.state.products
            let isSelected = true
            products.forEach(productItem => {
                productItem.isSelected = isSelected
                // isSelected = false
                if(productItem.type === productTypes[0]){
                    productItem.productName = product1
                } else if (productItem.type === productTypes[1]){
                    productItem.productName = product2
                } else if (productItem.type === productTypes[2]){
                    productItem.productName = product3
                } else if (productItem.type === productTypes[3]){
                    productItem.productName = product4
                } else if (productItem.type === productTypes[4]){
                    productItem.productName = product5
                } else if (productItem.type === productTypes[5]){
                    productItem.productName = product6
                } else if (productItem.type === productTypes[6]){
                    productItem.productName = product7
                } else if (productItem.type === productTypes[7]){
                    productItem.productName = product8
                } else if (productItem.type === productTypes[8]){
                    productItem.productName = product9
                } else if (productItem.type === productTypes[9]){
                    productItem.productName = product10
                } else if (productItem.type === productTypes[10]){
                    productItem.productName = product11
                } else if (productItem.type === productTypes[11]){
                    productItem.productName = product12
                } else if (productItem.type === productTypes[12]){
                    productItem.productName = product30
                }
                let defaultDiscount = {};
                productItem.discounts && productItem.discounts.length >0 &&
                productItem.discounts.forEach(productDiscountItem => {
                    const discountItem = discounts.filter(disc => disc.id === productDiscountItem.id)
                    if(discountItem && discountItem.length && discountItem[0].isDefault){
                        defaultDiscount = discountItem[0]
                    }
                })

                let price = productItem.price && productItem.price.amount
                let discountPrice = 0;
                if(defaultDiscount && defaultDiscount.percentage && new Date(defaultDiscount.expiryDate) > new Date()){
                    discountPrice = Math.round(price * defaultDiscount.percentage * 0.01)
                }
                let totalCharge = price
                if(price && discountPrice && (totalCharge - discountPrice) > 0) {
                    totalCharge = totalCharge - discountPrice
                }

                if(price && price.toString().includes('.')){
                    price = addZeroes(price)
                }

                if(totalCharge < 0) totalCharge = 0

                if(discountPrice && discountPrice.toString().includes('.')){
                    discountPrice = addZeroes(discountPrice)
                }

                if(totalCharge && totalCharge.toString().includes('.')){
                    totalCharge = addZeroes(totalCharge)
                }

                productItem.discountPrice = discountPrice
                productItem.totalCharge = totalCharge
                productItem.price = price
            })
        }
        const userProfile = profile && profile.toJS()
        const userCreditToJS = userCredit && userCredit.toJS()
        const fromReferral = userProfile && userProfile.fromReferral

        const giftVoucherApplied = userProfile && userProfile.giftVoucherApplied
        const userCreditAmount = userCreditToJS && userCreditToJS.length > 0 ?
            userCreditToJS[0] ?
                userCreditToJS[0].credits || 0
                : 0
            : 0
        let userCreditToAvail = 0
        let productInfo = {}
        products.forEach(productItem => {
            if(productItem.isSelected){
                productInfo = productItem
            }
        })

        let price = productInfo.price

        let defaultDiscount = {}
        let appliedCouponCode = ''
        productInfo.discounts && productInfo.discounts.length >0 &&
        productInfo.discounts.forEach(productDiscountItem => {
            const discountItem = discounts.filter(disc => disc.id === productDiscountItem.id)
            if(discountItem && discountItem.length && discountItem[0].isDefault){
                defaultDiscount = discountItem[0]
                appliedCouponCode = discountItem[0].code
            }
        })
        let discountPrice = 0;
        if(defaultDiscount && defaultDiscount.percentage && new Date(defaultDiscount.expiryDate) > new Date()){
            discountPrice = Math.round(price * defaultDiscount.percentage * 0.01)
        }

        let totalCharge = price
        if(price && discountPrice && (totalCharge - discountPrice) > 0) {
            totalCharge = totalCharge - discountPrice
        }

        if(price && price.toString().includes('.')){
            price = addZeroes(price)
        }

        if(fromReferral && !giftVoucherApplied) {
            totalCharge = totalCharge - GIFT_VOUCHER_AMOUNT
        }

        if(userCreditAmount > 0 && totalCharge > 0){
            if(totalCharge >= userCreditAmount) {
                userCreditToAvail = userCreditAmount
                totalCharge = totalCharge - userCreditToAvail
            } else {
                userCreditToAvail = parseInt(totalCharge)
                totalCharge = totalCharge - userCreditToAvail
            }
        }

        if(totalCharge < 0) totalCharge = 0

        if(discountPrice && discountPrice.toString().includes('.')){
            discountPrice = addZeroes(discountPrice)
        }

        if(totalCharge && totalCharge.toString().includes('.')){
            totalCharge = addZeroes(totalCharge)
        }
        products = products.sort((a, b) => b.createdAt - a.createdAt)
        this.setState({
            name: userBillingDetails && userBillingDetails.toJS() && userBillingDetails.toJS().name,
            contact: parentDetails && parentDetails.toJS() && parentDetails.toJS().phone && parentDetails.toJS().phone.countryCode + ' ' + parentDetails.toJS().phone.number,
            email:  parentDetails &&parentDetails.toJS() && parentDetails.toJS().email,
            courseTitle: productInfo.title,
            productId: productInfo.id,
            price,
            discount: discountPrice,
            totalCharge,
            fromReferral,
            giftVoucherApplied,
            userCredit: userCreditAmount,
            userCreditToAvail,
            products,
            appliedCouponCode
        })
    }

    updatePromoCode = (e) => {
        this.setState({
            couponCode:  e && e.target && e.target.value
        })
    }

    applyCouponCode = async () => {
        this.setState({
            couponLoading: true,
            couponCodeError: ''
        })

        if (this.state.couponCode) {
            const {products} = this.state
            let selectedProductId = '';
            products.forEach(product => {
                if(product.isSelected) {
                    selectedProductId = product.id
                }
            })
            await fetchDiscountForProduct(this.state.couponCode, selectedProductId, true).call()
            const { discount } = this.props

            const discountInfo  = discount && discount.toJS() && discount.toJS().length && discount.toJS().filter( coupon => coupon.code === this.state.couponCode && coupon.product && coupon.product.id === selectedProductId)
            let discountPrice = 0
            if(discountInfo && !discountInfo.length){
                this.setState({
                    couponCodeError: 'Coupon does not exist'
                })
            }
            if(discountInfo && discountInfo.length > 0 && new Date(discountInfo[0].expiryDate) < new Date()){
                this.setState({
                    couponCodeError: 'Coupon is expired'
                })
            }
            if(discountInfo && discountInfo.length > 0 && discountInfo[0].percentage && new Date(discountInfo[0].expiryDate) > new Date()){
                discountPrice = Math.round(parseFloat(this.state.price) * discountInfo[0].percentage * 0.01)
            }
            if(parseFloat(discountPrice) > 0 && parseFloat(this.state.price) - parseFloat(discountPrice) > 0){
                let totalCharge = parseFloat(this.state.price) - parseFloat(discountPrice)
                let userCreditToAvail = 0
                const {fromReferral, giftVoucherApplied, userCredit, isCreditUsed} = this.state

                if(fromReferral && !giftVoucherApplied) {
                    totalCharge = totalCharge - GIFT_VOUCHER_AMOUNT
                }

                if(userCredit > 0 && totalCharge > 0){
                    if(totalCharge >= userCredit) {
                        userCreditToAvail = userCredit
                        if(isCreditUsed) totalCharge = totalCharge - userCreditToAvail
                    } else {
                        userCreditToAvail = parseInt(totalCharge)
                        if(isCreditUsed) totalCharge = totalCharge - userCreditToAvail
                    }
                }

                if(totalCharge < 0) totalCharge = 0

                if(totalCharge.toString().includes('.')){
                    totalCharge = addZeroes(totalCharge)
                }

                if(discountPrice.toString().includes('.')){
                    discountPrice = addZeroes(discountPrice)
                }

                this.setState({
                    discount: discountPrice,
                    totalCharge,
                    appliedCouponCode: this.state.couponCode,
                    userCreditToAvail
                })
            }
        }
        this.setState({
            couponLoading: false
        })
    }

    confirmPayment = async () => {
        this.setState({
            confirmPaymentLoading: true,
            isLoading: true,
        })

        this.setState({
            confirmPaymentLoading: false,
            isLoading: false,
        })
    }

    signUp = async ({
        parentName, email: parentEmail, countryCode, parentPhone, childName
      }) => {
        this.setState({
            confirmPaymentLoading: true,
            isLoading: true,
        })
        const {
            grade,
        } = this.state
        const params = qs.parse(window.location.search)
        const schoolName = params.schoolName

        await signUpMentee({
            parentName: parentName.trim(),
            childName: childName.trim(),
            parentEmail: parentEmail.trim(),
            parentPhone: {
                number: parentPhone.trim(),
                countryCode: '+91',
            },
            
            isBuyNow: true,
            grade: `Grade${grade}`,
            ...(schoolName ? { schoolName } : {}),
        }).call()
        this.setState({
            confirmPaymentLoading: false,
            isLoading: false,
        })
        if (this.props.isLoggedIn) {
            if (params.redirect) {
                const { redirect, ...restParams } = params
                this.props.history.push(redirect + '?' + qs.stringify(restParams))
            } else {
                let url = `/checkout?productName=${this.state.selectedProductName}`
                if (this.state.schoolName) {
                    url += `&schoolName=${this.state.schoolName}`
                }
                if (this.state.code) {
                    url += `&code=${this.state.code}`
                }
                this.props.history.push(url)
            }
        }
      }

    toggleIsCreditUsed= () => {
        let totalCharge = this.state.totalCharge
        let userCreditToAvail = this.state.userCreditToAvail
        this.setState({
            isCreditUsed: !this.state.isCreditUsed
        }, () =>{
            if(!!this.state.isCreditUsed){
                totalCharge = totalCharge - userCreditToAvail
            }else{
                totalCharge = totalCharge + userCreditToAvail
            }
            if(totalCharge.toString().includes('.')){
                totalCharge = addZeroes(totalCharge)
            }
            this.setState({
                totalCharge
            })
        })
    }

    onProductChange = (value) => {
        let {products, selectedProductName} = this.state
        products.forEach(productInfo => {
            if(productInfo.id === value.id){
                productInfo.isSelected = true
                selectedProductName = productInfo.productName
                let price = productInfo.price
                let discounts  = this.props.discount && this.props.discount.toJS()
                let defaultDiscount = {}
                let appliedCouponCode = ''
                productInfo.discounts && productInfo.discounts.length >0 &&
                productInfo.discounts.forEach(productDiscountItem => {
                    const discountItem = discounts.filter(disc => disc.id === productDiscountItem.id)
                    if(discountItem && discountItem.length && discountItem[0].isDefault){
                        defaultDiscount = discountItem[0]
                        appliedCouponCode = discountItem[0].code
                    }
                })
                let discountPrice = productInfo.discountPrice;
                // if(defaultDiscount && defaultDiscount.percentage && new Date(defaultDiscount.expiryDate) > new Date()){
                //     discountPrice = Math.round(price * defaultDiscount.percentage * 0.01)
                // }

                let totalCharge = price
                if(price && discountPrice && (totalCharge - discountPrice) > 0) {
                    totalCharge = totalCharge - discountPrice
                }

                if(price && price.toString().includes('.')){
                    price = addZeroes(price)
                }

                const {fromReferral, giftVoucherApplied, userCredit, isCreditUsed} = this.state

                if(fromReferral && !giftVoucherApplied) {
                    totalCharge = totalCharge - GIFT_VOUCHER_AMOUNT
                }
                let userCreditToAvail = 0
                if(userCredit > 0 && totalCharge > 0){
                    if(totalCharge >= userCredit) {
                        userCreditToAvail = userCredit
                        if(isCreditUsed) totalCharge = totalCharge - userCreditToAvail
                    } else {
                        userCreditToAvail = parseInt(totalCharge)
                        if(isCreditUsed) totalCharge = totalCharge - userCreditToAvail
                    }
                }

                if(totalCharge < 0) totalCharge = 0

                if(totalCharge.toString().includes('.')){
                    totalCharge = addZeroes(totalCharge)
                }

                if(discountPrice.toString().includes('.')){
                    discountPrice = addZeroes(discountPrice)
                }

                this.setState({
                    productId: productInfo.id,
                    discount: discountPrice,
                    totalCharge,
                    appliedCouponCode,
                    userCreditToAvail,
                    price
                })

            } else{
                productInfo.isSelected = false
            }
        })
        products = products.sort((a, b) => b.createdAt - a.createdAt)
        this.setState({
            products,
            couponCode: '',
            couponCodeError: '',
            selectedProductName
        })
    }

    shouldShowSep = grade => {
        if (grade === 12) {
            return false
        }
        if (grade === this.state.grade) {
            return false
        }
        if (grade === (this.state.grade - 1)) {
            return false
        }
        return true
    }

    render () {
        const { visible, closePaymentPopup } = this.props
        const { name, contact, email, courseTitle, price, discount, totalCharge, couponLoading, couponCodeError, giftVoucherApplied, fromReferral, userCredit, userCreditToAvail, products } = this.state
        products.forEach(productItem => {
            productItem.label = productItem.productName
        })
        return <></>

        // return (
        //     <div className={styles.container}>
                
        //         <div className={styles.tekieLogo}>
        //             <Link to="/">
        //                 <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}></div>
        //             </Link>
        //         </div>
        //         {this.state.isLoading ?
        //             <div className={styles.loaderContainer}>
        //                 <SimpleButtonLoader
        //                     showLoader={this.state.isLoading}
        //                 />
        //             </div>
        //             :
        //             <Formik
        //                 initialValues={{
        //                     parentName: '',
        //                     email: '',
        //                     parentPhone: '',
        //                     childName: ''
        //                 }}
        //                 validationSchema={validationMentee}
        //                 onSubmit={({ parentName, email, countryCode, parentPhone, childName }) => {
        //                     this.signUp({
        //                         parentName, email, countryCode, parentPhone, childName
        //                     })
        //                 }}
        //             >
        //                 {({ errors, touched, isValidating, handleSubmit, values, handleChange}) => (
        //                     <Form style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        //                         <div className={styles.mainContainer}>
        //                             <div className={styles.leftContainer}>
        //                                 <div className={styles.graduationDrop}>
        //                                     <GraduationDrop />
        //                                 </div>
        //                                 <div className={styles.leftTitleText}>
        //                                     {courseTitle || courseName}
        //                                 </div>
        //                                 <div className={styles.leftHeaderText}>
        //                                     39 Live Sessions | 1-2 session per week
        //                                 </div>

        //                                 <div className={styles.leftSubHeaderText}>Get a 100% <a className={styles.highlightText} href={'/refund'} target={'_blank'}>refund</a> before 21 days</div>
        //                             </div>
        //                             <div className={styles.middleContainer} />
        //                             <div className={styles.rightContainer}>    
        //                                 <div className={styles.signUpBodyCheckout}>
        //                                     <div className={styles.row}>
        //                                         <div className={styles.inputColumn}>
        //                                             <Field
        //                                                 name="parentName"
        //                                                 placeholder="Parent Name*"
        //                                                 className={styles.input}
        //                                             />
        //                                             <div className={styles.error}>
        //                                                 {errors.parentName && touched.parentName && errors.parentName}
        //                                             </div>
        //                                         </div>
        //                                         <div className={styles.inputColumn}>
        //                                             <Field
        //                                                 placeholder="Parent Email ID*"
        //                                                 name="email"
        //                                                 className={styles.input}
        //                                             />
        //                                             <div className={styles.error}>
        //                                                 {errors.email && touched.email && errors.email}
        //                                             </div>
        //                                         </div>
        //                                     </div>
        //                                     <div className={styles.row}>
        //                                         <div className={styles.inputColumn}>
        //                                             <div className={styles.inputContainer}>
        //                                                 <input
        //                                                     placeholder="+91"
        //                                                     disabled
        //                                                     className={styles.inputSm}
        //                                                     name="countryCode"
        //                                                     value="+91"
        //                                                 />
        //                                                 <Field
        //                                                     placeholder="Phone Number*"
        //                                                     id="phone"
        //                                                     className={styles.input}
        //                                                     name="parentPhone"
        //                                                 />
        //                                             </div>
        //                                             <div className={styles.error}>
        //                                                 {errors.parentPhone && touched.parentPhone
        //                                                     ? errors.parentPhone
        //                                                     : ''
        //                                                 }
        //                                             </div>
        //                                         </div>
        //                                         <div className={styles.inputColumn}>
        //                                             <Field
        //                                                 placeholder="Student Name*"
        //                                                 className={styles.input}
        //                                                 name="childName"
        //                                             />
        //                                             <div className={styles.error}>
        //                                                 {errors.childName && touched.childName && errors.childName}
        //                                             </div>
        //                                         </div>
        //                                     </div>

        //                                     <div className={styles.label}>
        //                                         Student Grade*
        //                                     </div>
        //                                     <div className={styles.gradesContainer}>
        //                                         {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
        //                                             <>
        //                                                 <motion.div
        //                                                     whileTap={{
        //                                                         scale: 0.9
        //                                                     }}
        //                                                     onClick={() => {
        //                                                         this.setState({ grade: grade })
        //                                                     }}
        //                                                     className={cx(
        //                                                         styles.grade,
        //                                                         this.state.grade === grade && styles.gradeActive)
        //                                                     }>
        //                                                     {grade}
        //                                                 </motion.div>
        //                                                 {this.shouldShowSep(grade) && (
        //                                                     <div className={styles.gradeSep}></div>
        //                                                 )}
        //                                             </>
        //                                         ))}
        //                                     </div>
        //                                 </div>
        //                                 <div className={styles.pricingContainer}>
        //                                     <div className={styles.billingDetailTitle}>
        //                                         Pricing Details
        //                                     </div>
        //                                     <div className={styles.pricingDetailRow}>
        //                                         <div className={styles.pricingDetailRowLeft}>
        //                                             <Select
        //                                                 options={products}
        //                                                 defaultValue={products.filter(product => product.isSelected)}
        //                                                 value={products.filter(product => product.isSelected)}
        //                                                 onChange={(values) => this.onProductChange(values)}
        //                                                 isSearchable={false}
        //                                                 styles={colourStyles}
        //                                             />
        //                                         </div>
        //                                         <div className={styles.pricingDetailRowRight}>
        //                                             ₹ {price}
        //                                         </div>
        //                                     </div>
        //                                     <div className={styles.discountRow}>
        //                                         <div className={styles.discountDetailRow}>
        //                                             <div className={styles.discountDetailRowLeftContainer}>
        //                                                 <div className={styles.discountDetailRowLeft}>
        //                                                     Special Discount
        //                                                 </div>
        //                                                 <div className={styles.discountIcon}>
        //                                                     <DiscountIcon />
        //                                                 </div>
        //                                             </div>
        //                                             <div className={styles.discountDetailRowLeft}>
        //                                                 - ₹ {discount % 1 !== 0 ? Number.parseFloat(discount).toFixed(2) : discount}
        //                                             </div>
        //                                         </div>
        //                                         {/*<div className={styles.discountOrContainer}>
        //                                             Or
        //                                         </div>*/}
        //                                         {/*<div className={styles.applyDiscountParentContainer}>
        //                                             <div className={styles.applyDiscountContainer}>
        //                                                 <div className={styles.applyDiscountLeftContainer}>
        //                                                     <input placeholder="Add a promo code" value={this.state.couponCode} className={styles.inputDiscount} onChange={(e) => this.updatePromoCode(e)}></input>
        //                                                 </div>
        //                                                 {couponLoading ?
        //                                                     <div className={styles.applyDiscountRightontainer}>
        //                                                         <SimpleButtonLoader
        //                                                             showLoader={this.state.couponLoading}
        //                                                         />
        //                                                     </div>
        //                                                     :
        //                                                     <div className={styles.applyDiscountRightontainer} onClick={() => this.applyCouponCode()}>
        //                                                         Apply
        //                                                     </div>
        //                                                 }
        //                                             </div>
        //                                             <div className={styles.errorDiscountContainer}>
        //                                                 {couponCodeError}
        //                                             </div>
        //                                         </div>*/}
        //                                     </div>

        //                                     <div className={styles.referralDetailParentRow}>
        //                                         {fromReferral && !giftVoucherApplied &&
        //                                         <div className={styles.referralDetailRow}>
        //                                             <div className={styles.discountDetailRowLeft}>
        //                                                 Gift Voucher applied
        //                                             </div>
        //                                             <div className={styles.discountDetailRowLeft}>
        //                                                 - ₹ {GIFT_VOUCHER_AMOUNT}
        //                                             </div>
        //                                         </div>}

        //                                         {!!userCredit && !!userCreditToAvail &&
        //                                         <div className={cx(styles.referralDetailRow, !this.state.isCreditUsed && styles.opacity)}>
        //                                             <div className={styles.discountDetailRowLeft}>
        //                                                 <div className={styles.checkBoxContainer}>
        //                                                     <CheckBox onChange={this.toggleIsCreditUsed} value={this.state.isCreditUsed}/>
        //                                                 </div>
        //                                                 <div className={styles.discountDetailRowLeft} style={{whiteSpace: 'pre'}}> Use </div>
        //                                                 <div className={styles.creditIconContainer}>
        //                                                     <CreditIcon />
        //                                                 </div>
        //                                                 <div className={styles.discountDetailRowLeft} style={{whiteSpace: 'pre'}}> (Bal. {userCredit})</div>
        //                                             </div>
        //                                             {!!this.state.isCreditUsed &&
        //                                             <div className={styles.discountDetailRowLeft}>
        //                                                 - ₹ {userCreditToAvail}
        //                                             </div>}
        //                                         </div>}
        //                                     </div>
        //                                     <div className={styles.referralDetailParentLine}>
        //                                         <div className={styles.line} />
        //                                     </div>



        //                                     <div className={styles.totalChargeRow}>
        //                                         <div className={styles.pricingDetailRowLeft}>
        //                                             Total Charges:
        //                                         </div>
        //                                         <div className={styles.pricingDetailRowRight}>
        //                                             ₹ {totalCharge % 1 != 0 ? Number.parseFloat(totalCharge).toFixed(2) : totalCharge}
        //                                         </div>
        //                                     </div>
        //                                 </div>

        //                                 <div className={styles.pricingActionText}>
        //                                     <div className={styles.totalPriceContainer}>
        //                                         <div className={styles.totalPriceText}>
        //                                             Your Total: ₹ {totalCharge % 1 != 0 ? Number.parseFloat(totalCharge).toFixed(2) : totalCharge}
        //                                         </div>
        //                                     </div>

        //                                     {this.state.confirmPaymentLoading ?
        //                                         <SimpleButtonLoader
        //                                             showLoader={this.state.confirmPaymentLoading}
        //                                         />
        //                                         :
        //                                         <div onClick={handleSubmit}>
        //                                             <PaymentButton
        //                                                 title='Proceed To Review'
        //                                             />
        //                                         </div>
        //                                     }
        //                                 </div>
        //                                 <div className={styles.emptypricingActionText} />
        //                             </div>
        //                         </div>
        //                     </Form>
        //                 )}
        //             </Formik>
        //         }
        //     </div>
        // )
    }
}

export default withScale(connect((state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || 
    state.data.getIn(['userChildren', 'data']).size,
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  error: state.data.getIn([
    'errors', 'user/fetch', -1, 'error', 'errors', 0, 'message']),
  ...signUpMentee().mapStateToProps()
}))(withRouter(PurchaseReviewForm)), {})