import React, { Component } from 'react'
import { ActionButton, PaymentButton } from '../Buttons'
import PopUp from '../PopUp/PopUp'
import styles from './PurchaseForm.module.scss'
import fetchProducts from "../../queries/fetchProducts";
import config, { GIFT_VOUCHER_AMOUNT, product1, product2, product3, product4, product5, product6, product7, product8, product9, product10, product11, product12, product30, productTypes, schoolDiscountCoupons, schoolsProductAllowed } from "../../config";
import fetchStudentProfile from "../../queries/fetchStudentProfile";
import fetchDiscountForProduct from "../../queries/fetchDiscountForProduct";
import SimpleButtonLoader from "../SimpleButtonLoader";
import { ReactComponent as GraduationDrop } from '../../assets/graduation_drop.svg'
import { ReactComponent as DiscountIcon } from '../../assets/discount_icon.svg'
import fetchPaymentRequest from "../../queries/fetchPaymentRequest";
import fetchPaymentResponse from "../../queries/fetchPaymentResponse";
import fetchMenteeCourseSyllabus from "../../queries/sessions/fetchMenteeCourseSyllabus";
import CreditIcon from "../Buttons/CreditButton/CreditIcon";
import CheckBox from "../CheckBox/checkBox";
import cx from "classnames";
import fetchUserInvites from "../../queries/fetchInvitedUsers";
import fetchUserCredit from "../../queries/fetchUserCredit";
import { BuyNowGA } from '../../utils/analytics/ga';
import Select, { components } from 'react-select';
import addZeroes from '../../utils/addZeros'
import { Helmet } from 'react-helmet';
import qs from 'query-string';
import { Toaster, getToasterBasedOnType } from '../Toaster';
import { Link } from 'react-router-dom';

const colourStyles = {
    indicatorSeparator: styles => ({
        ...styles,
        display: 'none'
    }),
    control: styles => ({
        ...styles, backgroundColor: 'white',
        borderColor: '#00ade6',
        borderRadius: '8px',
        color: '#504f4f',
        '&:hover': {
            borderColor: '#00ade6'
        }
    }),
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

class PurchaseForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            name: '',
            contact: '',
            email: '',
            courseTitle: '',
            productId: '',
            price: 0,
            discount: 0,
            totalCharge: 0,
            couponCode: '',
            couponLoading: false,
            couponCodeError: '',
            couponCodeSuccess: '',
            appliedCouponCode: '',
            confirmPaymentLoading: false,
            isCreditUsed: true,
            userCredit: 0,
            products: [],
            schoolName: '',
            code: null
        }
    }

    async componentDidMount() {
        if (!this.props.accountProfileSuccess) {
            await fetchStudentProfile(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id)
        }
        if (!this.props.productSuccess) {
            await fetchProducts(config.MENTEE).call()
        }

        if (this.props.invitedUsersStatus && this.props.invitedUsersStatus.toJS() && !this.props.invitedUsersStatus.toJS().userInvite) {
            await fetchUserInvites(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id).call()
        }
        const selectedProductName = qs.parse(window.location.search).productName
        this.setFields(selectedProductName)
        const schoolName = qs.parse(window.location.search).schoolName
        const code = qs.parse(window.location.search).code
        if (schoolName) {
            if (schoolDiscountCoupons[schoolName]) {
                this.setState({
                    schoolName,
                    couponCode: schoolDiscountCoupons[schoolName],
                    appliedCouponCode: schoolDiscountCoupons[schoolName],
                    userCredit: 0,
                })
            }
        } else {
            this.setState({
                schoolName: '',
                couponCode: '',
                appliedCouponCode: ''
            })
        }

        if (code) {
            this.setState({
                couponCode: code,
                appliedCouponCode: code,
                code: code
            }, () => {
                this.applyCouponCode()
            })
        }
        this.setState({
            isLoading: false
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.discount !== this.props.discount) {
            const selectedProductName = qs.parse(window.location.search).productName

            this.setFields(selectedProductName)
        }
        if (prevState.schoolName !== this.state.schoolName) {
            const selectedProductName = qs.parse(window.location.search).productName
            this.setFields(selectedProductName)
        }

        if (prevState.code !== this.state.code) {
            const selectedProductName = qs.parse(window.location.search).productName
            this.setFields(selectedProductName)
        }
    }

    setFields = (selectedProductName = '') => {
        const { userBillingDetails, profile, product, discount, parentDetails, userCredit } = this.props
        let products = this.props.products
        let discounts = discount && discount.toJS()
        if (!products || (products && !products.length)) {
            products = product && product.toJS()
            let isSelected = true
            if (selectedProductName || this.state.productId) isSelected = false
            products.forEach(productItem => {
                productItem.isSelected = isSelected
                isSelected = false
                if (productItem.type === productTypes[0]) {
                    productItem.productName = product1
                } else if (productItem.type === productTypes[1]) {
                    productItem.productName = product2
                } else if (productItem.type === productTypes[2]) {
                    productItem.productName = product3
                } else if (productItem.type === productTypes[3]) {
                    productItem.productName = product4
                } else if (productItem.type === productTypes[4]) {
                    productItem.productName = product5
                } else if (productItem.type === productTypes[5]) {
                    productItem.productName = product6
                } else if (productItem.type === productTypes[6]) {
                    productItem.productName = product7
                } else if (productItem.type === productTypes[7]) {
                    productItem.productName = product8
                } else if (productItem.type === productTypes[8]) {
                    productItem.productName = product9
                } else if (productItem.type === productTypes[9]) {
                    productItem.productName = product10
                } else if (productItem.type === productTypes[10]) {
                    productItem.productName = product11
                } else if (productItem.type === productTypes[11]) {
                    productItem.productName = product12
                } else if (productItem.type === productTypes[12]) {
                    productItem.productName = product30
                }

                if (this.state.productId && productItem.id === this.state.productId) {
                    productItem.isSelected = true
                } else if (selectedProductName && productItem.productName === selectedProductName) {
                    productItem.isSelected = true
                }
                let defaultDiscount = {};
                productItem.discounts && productItem.discounts.length > 0 &&
                    productItem.discounts.forEach(productDiscountItem => {
                        const discountItem = discounts.filter(disc => disc.id === productDiscountItem.id)
                        if (this.state.schoolName) {
                            if (schoolDiscountCoupons[this.state.schoolName]) {
                                if (discountItem && discountItem.length && schoolDiscountCoupons[this.state.schoolName] === discountItem[0].code) {
                                    defaultDiscount = discountItem[0]
                                }
                            }
                        } else {
                            if (discountItem && discountItem.length && discountItem[0].isDefault) {
                                defaultDiscount = discountItem[0]
                            }
                        }
                    })

                let price = productItem.price && productItem.price.amount
                let discountPrice = 0;
                if (defaultDiscount && defaultDiscount.percentage && new Date(defaultDiscount.expiryDate) > new Date()) {
                    discountPrice = Math.round(price * defaultDiscount.percentage * 0.01)
                }
                let totalCharge = price
                if (price && discountPrice && (totalCharge - discountPrice) > 0) {
                    totalCharge = totalCharge - discountPrice
                }

                if (price && price.toString().includes('.')) {
                    price = addZeroes(price)
                }

                if (totalCharge < 0) totalCharge = 0

                if (discountPrice && discountPrice.toString().includes('.')) {
                    discountPrice = addZeroes(discountPrice)
                }

                if (totalCharge && totalCharge.toString().includes('.')) {
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
        let userCreditAmount = userCreditToJS && userCreditToJS.length > 0 ?
            userCreditToJS[0] ?
                userCreditToJS[0].credits || 0
                : 0
            : 0
        if (this.state.schoolName) {
            userCreditAmount = 0
        }
        let userCreditToAvail = 0
        let productInfo = {}
        products.forEach(productItem => {
            if (productItem.isSelected) {
                productInfo = productItem
            }
        })

        let price = productInfo.price

        let defaultDiscount = {}
        let appliedCouponCode = ''
        productInfo.discounts && productInfo.discounts.length > 0 &&
            productInfo.discounts.forEach(productDiscountItem => {
                const discountItem = discounts.filter(disc => disc.id === productDiscountItem.id)
                if (this.state.schoolName) {
                    if (schoolDiscountCoupons[this.state.schoolName]) {
                        if (discountItem && discountItem.length && schoolDiscountCoupons[this.state.schoolName] === discountItem[0].code) {
                            defaultDiscount = discountItem[0]
                            appliedCouponCode = discountItem[0].code
                        }
                    }
                } else {
                    if (discountItem && discountItem.length && discountItem[0].isDefault) {
                        defaultDiscount = discountItem[0]
                        appliedCouponCode = discountItem[0].code
                    }
                }
            })
        let discountPrice = 0;
        if (defaultDiscount && defaultDiscount.percentage && new Date(defaultDiscount.expiryDate) > new Date()) {
            discountPrice = Math.round(price * defaultDiscount.percentage * 0.01)
        }

        let totalCharge = price
        if (price && discountPrice && (totalCharge - discountPrice) > 0) {
            totalCharge = totalCharge - discountPrice
        }

        if (price && price.toString().includes('.')) {
            price = addZeroes(price)
        }

        if (fromReferral && !giftVoucherApplied) {
            totalCharge = totalCharge - GIFT_VOUCHER_AMOUNT
        }

        if (userCreditAmount > 0 && totalCharge > 0) {
            if (totalCharge >= userCreditAmount) {
                userCreditToAvail = userCreditAmount
                totalCharge = totalCharge - userCreditToAvail
            } else {
                userCreditToAvail = parseInt(totalCharge)
                totalCharge = totalCharge - userCreditToAvail
            }
        }

        if (totalCharge < 0) totalCharge = 0

        if (discountPrice && discountPrice.toString().includes('.')) {
            discountPrice = addZeroes(discountPrice)
        }

        if (totalCharge && totalCharge.toString().includes('.')) {
            totalCharge = addZeroes(totalCharge)
        }
        products = products.sort((a, b) => b.createdAt - a.createdAt)
        this.setState({
            name: userBillingDetails && userBillingDetails.toJS() && userBillingDetails.toJS().name,
            contact: parentDetails && parentDetails.toJS() && parentDetails.toJS().phone && parentDetails.toJS().phone.countryCode + ' ' + parentDetails.toJS().phone.number,
            email: parentDetails && parentDetails.toJS() && parentDetails.toJS().email,
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
        if (this.state.schoolName) {
            this.setState({
                isCreditUsed: false
            })
        }
    }

    updatePromoCode = (e) => {
        this.setState({
            couponCode: e && e.target && e.target.value
        })
    }

    applyCouponCode = async () => {
        this.setState({
            couponLoading: true,
            couponCodeError: '',
            couponCodeSuccess: ''
        })

        if (this.state.couponCode) {
            const { products } = this.state
            let selectedProductId = '';
            products.forEach(product => {
                if (product.isSelected) {
                    selectedProductId = product.id
                }
            })
            await fetchDiscountForProduct(this.state.couponCode, selectedProductId, true).call()
            const { discount } = this.props
            const discountInfo = discount && discount.toJS() && discount.toJS().length && discount.toJS().filter(coupon => coupon.code === this.state.couponCode && coupon.product && coupon.product.id === selectedProductId)
            let discountPrice = 0
            if (discountInfo && !discountInfo.length) {
                this.setState({
                    couponCodeError: 'Coupon does not exist'
                })
            }
            if (discountInfo && discountInfo.length > 0 && new Date(discountInfo[0].expiryDate) < new Date()) {
                this.setState({
                    couponCodeError: 'Coupon is expired'
                })
            }
            if (discountInfo && discountInfo.length > 0 && discountInfo[0].percentage && new Date(discountInfo[0].expiryDate) > new Date()) {
                discountPrice = Math.round(parseFloat(this.state.price) * discountInfo[0].percentage * 0.01)
            }
            if (parseFloat(discountPrice) > 0 && parseFloat(this.state.price) - parseFloat(discountPrice) > 0) {
                let totalCharge = parseFloat(this.state.price) - parseFloat(discountPrice)
                let userCreditToAvail = 0
                const { fromReferral, giftVoucherApplied, userCredit, isCreditUsed } = this.state

                if (fromReferral && !giftVoucherApplied) {
                    totalCharge = totalCharge - GIFT_VOUCHER_AMOUNT
                }

                if (userCredit > 0 && totalCharge > 0) {
                    if (totalCharge >= userCredit) {
                        userCreditToAvail = userCredit
                        if (isCreditUsed) totalCharge = totalCharge - userCreditToAvail
                    } else {
                        userCreditToAvail = parseInt(totalCharge)
                        if (isCreditUsed) totalCharge = totalCharge - userCreditToAvail
                    }
                }

                if (totalCharge < 0) totalCharge = 0

                if (totalCharge.toString().includes('.')) {
                    totalCharge = addZeroes(totalCharge)
                }

                if (discountPrice.toString().includes('.')) {
                    discountPrice = addZeroes(discountPrice)
                }

                const couponCodeSuccess = 'Coupon has been applied successfully'

                this.setState({
                    discount: discountPrice,
                    totalCharge,
                    appliedCouponCode: this.state.couponCode,
                    userCreditToAvail,
                    couponCodeSuccess
                })
            }
        }
        this.setState({
            couponLoading: false
        })
    }

    confirmPayment = async () => {
        const { menteeCourseSyllabus } = this.props
        if (menteeCourseSyllabus && menteeCourseSyllabus.toJS() &&
            menteeCourseSyllabus.toJS()[0] && menteeCourseSyllabus.toJS()[0].isPaid) {
            getToasterBasedOnType({
                type: 'error',
                message: 'You have already purchased this course'
            })
            return false
        }

        this.setState({
            confirmPaymentLoading: true
        })
        await fetchPaymentRequest(this.state.productId, this.state.appliedCouponCode, this.state.isCreditUsed, true).call()
        const { paymentRequest } = this.props
        const paymentRequestJs = paymentRequest && paymentRequest.toJS()
        const payUPayload = {
            key: import.meta.env.REACT_APP_PAYU_KEY,
            txnid: paymentRequestJs.txnId,
            hash: paymentRequestJs.hash,
            amount: Number.parseFloat(addZeroes(paymentRequestJs.amount)).toFixed(2),
            firstname: paymentRequestJs.firstName,
            email: paymentRequestJs.email,
            phone: paymentRequestJs.phone && paymentRequestJs.phone.number,
            productinfo: paymentRequestJs.productInfo,
            surl: import.meta.env.REACT_APP_TEKIE_WEB_URL + '/settings/payment',
            furl: import.meta.env.REACT_APP_TEKIE_WEB_URL + '/settings/payment',

        }

        const handler = {
            responseHandler: async (response) => {
                this.setState({
                    isLoading: true,
                })
                // your payment response Code goes here, BOLT is the response object
                if (response && response.response && response.response.txnid) {
                    const { paymentResponseStatus } = this.props

                    if ((!paymentResponseStatus || !paymentResponseStatus[response.response.txnid] ||
                        (!paymentResponseStatus[response.response.txnid].loading &&
                            !paymentResponseStatus[response.response.txnid].success)) &&
                        !this.isPaymentResponseCalled
                    ) {
                        this.isPaymentResponseCalled = true
                        await fetchPaymentResponse(
                            response.response.txnid,
                            response.response.hash,
                            response.response.status,
                            response.response.payuMoneyId,
                            true).call()
                        const { paymentResponse } = this.props
                        if (paymentResponse && paymentResponse.toJS() && paymentResponse.toJS().result && paymentResponse.toJS().result === true) {

                            this.props.closePaymentFailurePopup()
                            await fetchMenteeCourseSyllabus(true).call()
                            fetchUserCredit(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id).call()
                            this.props.closePaymentPopup(true, false)
                            this.props.showPaymentSuccessPopupState()
                            BuyNowGA("Course Purchased")
                        } else {
                            this.props.closePaymentSuccessPopup()
                            this.props.closePaymentPopup(false, true)
                            this.props.showPaymentFailurePopupState()
                        }
                        this.isPaymentResponseCalled = false
                    }
                }
                this.setState({
                    isLoading: false,
                })
            },
            catchException: (e) => {
                // the code you use to handle the integration errors goes here
                this.props.closePaymentPopup()

            }
        }
        if (payUPayload && payUPayload.txnid) {
            if (payUPayload.amount > 1) {
                window.bolt && window.bolt.launch(payUPayload, handler);
            } else {
                this.props.closePaymentFailurePopup()
                await fetchMenteeCourseSyllabus(true).call()
                fetchUserCredit(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id).call()
                this.props.closePaymentPopup()
                this.props.showPaymentSuccessPopupState()
            }
        }
        this.setState({
            confirmPaymentLoading: false,
            isLoading: false,
        })
    }

    toggleIsCreditUsed = () => {
        let totalCharge = this.state.totalCharge
        let userCreditToAvail = this.state.userCreditToAvail
        this.setState({
            isCreditUsed: !this.state.isCreditUsed
        }, () => {
            if (!!this.state.isCreditUsed) {
                totalCharge = totalCharge - userCreditToAvail
            } else {
                totalCharge = totalCharge + userCreditToAvail
            }
            if (totalCharge.toString().includes('.')) {
                totalCharge = addZeroes(totalCharge)
            }
            this.setState({
                totalCharge
            })
        })
    }

    onProductChange = (value) => {
        let { products } = this.state
        products.forEach(productInfo => {
            if (productInfo.id === value.id) {
                productInfo.isSelected = true
                let price = productInfo.price
                let discounts = this.props.discount && this.props.discount.toJS()
                let defaultDiscount = {}
                let appliedCouponCode = ''
                productInfo.discounts && productInfo.discounts.length > 0 &&
                    productInfo.discounts.forEach(productDiscountItem => {
                        const discountItem = discounts.filter(disc => disc.id === productDiscountItem.id)
                        if (this.state.schoolName) {
                            if (discountItem && discountItem.length && schoolDiscountCoupons[this.state.schoolName] === discountItem[0].code) {
                                defaultDiscount = discountItem[0]
                                appliedCouponCode = discountItem[0].code
                            }
                        } else {
                            if (discountItem && discountItem.length && discountItem[0].isDefault) {
                                defaultDiscount = discountItem[0]
                                appliedCouponCode = discountItem[0].code
                            }
                        }
                    })
                let discountPrice = 0;
                if (defaultDiscount && defaultDiscount.percentage && new Date(defaultDiscount.expiryDate) > new Date()) {
                    discountPrice = Math.round(price * defaultDiscount.percentage * 0.01)
                }

                let totalCharge = price
                if (price && discountPrice && (totalCharge - discountPrice) > 0) {
                    totalCharge = totalCharge - discountPrice
                }

                if (price && price.toString().includes('.')) {
                    price = addZeroes(price)
                }

                const { fromReferral, giftVoucherApplied, userCredit, isCreditUsed } = this.state

                if (fromReferral && !giftVoucherApplied) {
                    totalCharge = totalCharge - GIFT_VOUCHER_AMOUNT
                }
                let userCreditToAvail = 0
                if (userCredit > 0 && totalCharge > 0) {
                    if (totalCharge >= userCredit) {
                        userCreditToAvail = userCredit
                        if (isCreditUsed) totalCharge = totalCharge - userCreditToAvail
                    } else {
                        userCreditToAvail = parseInt(totalCharge)
                        if (isCreditUsed) totalCharge = totalCharge - userCreditToAvail
                    }
                }

                if (totalCharge < 0) totalCharge = 0

                if (totalCharge.toString().includes('.')) {
                    totalCharge = addZeroes(totalCharge)
                }

                if (discountPrice.toString().includes('.')) {
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

            } else {
                productInfo.isSelected = false
            }
        })
        products = products.sort((a, b) => b.createdAt - a.createdAt)
        this.setState({
            products,
            couponCodeError: '',
            couponCodeSuccess: ''
        })
    }

    render() {
        const { visible, closePaymentPopup } = this.props
        const { name, contact, email, courseTitle, price, discount, totalCharge, couponLoading, couponCodeError, giftVoucherApplied, fromReferral, userCredit, userCreditToAvail, products, couponCodeSuccess } = this.state
        products.forEach(productItem => {
            productItem.label = productItem.productName
        })

        return (
            <div className={styles.container}>

                <Helmet>
                    <script id="bolt" src={import.meta.env.REACT_APP_PAYU_URL} bolt-color="#00ade6"></script>
                </Helmet>
                <div className={styles.tekieLogo}>
                    <Link to="/">
                        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}></div>
                    </Link>
                </div>
                {this.state.isLoading ?
                    <div className={styles.loaderContainer}>
                        <SimpleButtonLoader
                            showLoader={this.state.isLoading}
                        />
                    </div>
                    :
                    <div className={styles.mainContainer}>
                        <div className={styles.leftContainer}>
                            <div className={styles.graduationDrop}>
                                <GraduationDrop />
                            </div>
                            <div className={styles.leftTitleText}>
                                {courseTitle}
                            </div>
                            <div className={styles.leftHeaderText}>
                                39 Live Sessions | 1-2 session per week
                            </div>

                            <div className={styles.leftSubHeaderText}>Get a 100% <a className={styles.highlightText} href={'/refund'} target={'_blank'}>refund</a> before 21 days</div>
                        </div>
                        <div className={styles.middleContainer} />
                        <div className={styles.rightContainer}>
                            <div className={styles.billingDetailContainer}>
                                <div className={styles.billingDetailTitle}>
                                    Billing Details
                                </div>
                                <div className={styles.billingDetailRow}>
                                    <div className={styles.billingDetailRowLeft}>
                                        Kid Name:
                                    </div>
                                    <div className={styles.billingDetailRowRight}>
                                        {name}
                                    </div>
                                </div>
                                <div className={styles.billingDetailRow}>
                                    <div className={styles.billingDetailRowLeft}>
                                        Contact No:
                                    </div>
                                    <div className={styles.billingDetailRowRight}>
                                        {contact}
                                    </div>
                                </div>
                                <div className={cx(styles.billingDetailRow)}>
                                    <div className={styles.billingDetailRowLeft}>
                                        Email ID:
                                    </div>
                                    <div className={styles.billingDetailRowRight}>
                                        {email}
                                    </div>
                                </div>
                                <div className={cx(styles.mobilePadding)} />
                            </div>
                            <div className={styles.pricingContainer}>
                                <div className={styles.billingDetailTitle}>
                                    Pricing Details
                                </div>
                                <div className={styles.pricingDetailRow}>
                                    <div className={styles.pricingDetailRowLeft}>
                                        <Select
                                            options={products.filter(product => {
                                                if (this.state.schoolName) {
                                                    if (schoolsProductAllowed[this.state.schoolName]) {
                                                        const productsTypeAllowed = schoolsProductAllowed[this.state.schoolName]
                                                        if (!productsTypeAllowed.includes(product.type)) {
                                                            return false
                                                        }
                                                    }
                                                } else {
                                                    if (productTypes.slice(0, 3).includes(product.type)) {
                                                        return true
                                                    }
                                                    return false
                                                }
                                                return true
                                            })}
                                            defaultValue={products.filter(product => product.isSelected)}
                                            value={products.filter(product => product.isSelected)}
                                            onChange={(values) => this.onProductChange(values)}
                                            isSearchable={false}
                                            styles={colourStyles}
                                        />
                                    </div>
                                    <div className={styles.pricingDetailRowRight}>
                                        ₹ {price}
                                    </div>
                                </div>
                                <div className={styles.discountRow}>
                                    <div className={styles.discountDetailRow}>
                                        <div className={styles.discountDetailRowLeftContainer}>
                                            <div className={styles.discountDetailRowLeft}>
                                                Special Discount
                                            </div>
                                            <div className={styles.discountIcon}>
                                                <DiscountIcon />
                                            </div>
                                        </div>
                                        <div className={styles.discountDetailRowLeft}>
                                            - ₹ {discount % 1 != 0 ? Number.parseFloat(discount).toFixed(2) : discount}
                                        </div>
                                    </div>
                                    <div className={styles.discountOrContainer}>
                                        <div className={styles.discountOrText}>
                                            Or
                                        </div>
                                    </div>
                                    <div className={styles.applyDiscountParentContainer}>
                                        <div className={styles.applyDiscountContainer}>
                                            <div className={styles.applyDiscountLeftContainer}>
                                                <input placeholder="Add a promo code" value={this.state.couponCode} className={styles.inputDiscount} onChange={(e) => this.updatePromoCode(e)}></input>
                                            </div>
                                            {couponLoading ?
                                                <div className={styles.applyDiscountRightontainer}>
                                                    <SimpleButtonLoader
                                                        showLoader={this.state.couponLoading}
                                                    />
                                                </div>
                                                :
                                                <div className={styles.applyDiscountRightontainer} onClick={() => this.applyCouponCode()}>
                                                    Apply
                                                </div>
                                            }
                                        </div>
                                        <div className={styles.errorDiscountContainer}>
                                            {couponCodeError}
                                        </div>
                                        <div className={styles.successDiscountContainer}>
                                            {couponCodeSuccess}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.referralDetailParentRow}>
                                    {fromReferral && !giftVoucherApplied &&
                                        <div className={styles.referralDetailRow}>
                                            <div className={styles.discountDetailRowLeft}>
                                                Gift Voucher applied
                                            </div>
                                            <div className={styles.discountDetailRowLeft}>
                                                - ₹ {GIFT_VOUCHER_AMOUNT}
                                            </div>
                                        </div>}

                                    {!!userCredit && !!userCreditToAvail &&
                                        <div className={cx(styles.referralDetailRow, !this.state.isCreditUsed && styles.opacity)}>
                                            <div className={styles.discountDetailRowLeft}>
                                                <div className={styles.checkBoxContainer}>
                                                    <CheckBox onChange={this.toggleIsCreditUsed} value={this.state.isCreditUsed} />
                                                </div>
                                                <div className={styles.discountDetailRowLeft} style={{ whiteSpace: 'pre' }}> Use </div>
                                                <div className={styles.creditIconContainer}>
                                                    <CreditIcon />
                                                </div>
                                                <div className={styles.discountDetailRowLeft} style={{ whiteSpace: 'pre' }}> (Bal. {userCredit})</div>
                                            </div>
                                            {!!this.state.isCreditUsed &&
                                                <div className={styles.discountDetailRowLeft}>
                                                    - ₹ {userCreditToAvail}
                                                </div>}
                                        </div>}
                                </div>
                                <div className={styles.referralDetailParentLine}>
                                    <div className={styles.line} />
                                </div>



                                <div className={cx(styles.totalChargeRow)}>
                                    <div className={styles.pricingDetailRowLeft}>
                                        Total Charges:
                                    </div>
                                    <div className={styles.pricingDetailRowRight}>
                                        ₹ {totalCharge % 1 != 0 ? Number.parseFloat(totalCharge).toFixed(2) : totalCharge}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.pricingActionText}>
                                <div className={styles.totalPriceContainer}>
                                    <div className={styles.totalPriceText}>
                                        Your Total: ₹ {totalCharge % 1 != 0 ? Number.parseFloat(totalCharge).toFixed(2) : totalCharge}
                                    </div>
                                </div>

                                {this.state.confirmPaymentLoading ?
                                    <SimpleButtonLoader
                                        showLoader={this.state.confirmPaymentLoading}
                                    />
                                    :
                                    <div onClick={this.confirmPayment}>
                                        <PaymentButton
                                            title='Make Payment'
                                        />
                                    </div>
                                }
                            </div>
                            <div className={styles.emptypricingActionText} />
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default PurchaseForm