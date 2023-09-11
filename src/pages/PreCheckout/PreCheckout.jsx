import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import styles from './PreCheckout.module.scss'
import { Toaster } from '../../components/Toaster'
import config from "../../config";
import PurchaseReviewForm from "../../components/PurchaseReviewForm";
import { BuyNowGA } from '../../utils/analytics/ga'
import withArrowScroll from '../../components/withArrowScroll'

class PreCheckout extends Component {
    constructor(props) {
        super(props);
        this.bookSessionRef = React.createRef()
        this.state = {
            showBookSessionModal: false,
            showEditSessionModal: false,
            topicDetails: {},
            selectedDate: new Date(),
            defaultDate: new Date(),
            topicIdToBook: '',
            sessionIdToEdit: '',
            currentTopicDetails: {},
            showCancelPopup: false,
            deleteTopicId: '',
            showPaymentModal: false,
            showPaymentSuccessModal: false,
            showPaymentFailureModal: false,
            courseTitle: '',
            lastSessionDate: null,
            welcomeCreditsVisible: false,
            mentorFeedbackVisible: true,
            showPaymentProductModal: false
        }
    }

    componentDidMount() {
        const { product, history } = this.props
        // fetchMenteeCourseSyllabus()
        // fetchSessionHomepage(config.MENTEE, this.props.loggedInUser.get('id'), true).call()
        const productInfo = product && product.toJS() && product.toJS().length && product.toJS()[0]
        this.setState({
            courseTitle: productInfo.title,
        })
    }

    componentDidUpdate(prevProps) {
    }

    isLoading = () => {
        const { menteeCourseSyllabusStatus } = this.props
        if (menteeCourseSyllabusStatus && menteeCourseSyllabusStatus.getIn(['loading'])) {
            return true
        }
        return false
    }

    closePaymentPopupState = () => {
        this.props.history.push(`/sessions`)
        BuyNowGA("Buy Now Popup Close")
        this.setState({
            showPaymentModal: false,
        })
    }

    showPaymentPopupState = async (products) => {
        const pathname = this.props.location && this.props.location.pathname
        if (!this.state.showPaymentModal && pathname === '/sessions') {
            this.props.history.push(`/checkout`)
        }
        BuyNowGA("Pre checkout Now Popup Open")
        this.setState({
            products
        }, () => {
            this.setState({
                showPaymentModal: true,
            })
        })
    }

    closePaymentSuccessPopupState = () => {
        this.setState({
            showPaymentSuccessModal: false
        })
    }

    closePaymentFailurePopupState = () => {
        this.setState({
            showPaymentFailureModal: false
        })
    }

    showPaymentSuccessPopupState = () => {
        this.setState({
            showPaymentSuccessModal: true
        })
    }

    showPaymentFailurePopupState = () => {
        this.setState({
            showPaymentFailureModal: true
        })
    }

    closePaymentProductModal = () => {
        this.setState({
            showPaymentProductModal: false
        })
    }

    showPaymentProductModal = () => {
        this.setState({
            showPaymentProductModal: true
        })
    }

    render() {
        const { menteeCourseSyllabus, history } = this.props
        const sessions = menteeCourseSyllabus.toJS()[0]
        return (
            <div className={styles.container}>

                <div className={styles.container}>
                    <PurchaseReviewForm
                        visible={this.state.showPaymentModal}
                        closePaymentPopup={this.closePaymentPopupState}
                        showPaymentPopupState={this.showPaymentPopupState}
                        showLoader={false}
                        product={this.props.product}
                        products={this.state.products}
                        userBillingDetails={this.props.userBillingDetails}
                        studentProfile={this.props.studentProfile}
                        parentDetails={this.props.parentDetails}
                        discount={this.props.discount}
                        accountProfileSuccess={this.props.accountProfileSuccess}
                        studentProfileSuccess={this.props.studentProfileSuccess}
                        productSuccess={this.props.productSuccess}
                        discountSuccess={this.props.discountSuccess}
                        paymentRequest={this.props.paymentRequest}
                        paymentResponse={this.props.paymentResponse}
                        loggedInUser={this.props.loggedInUser}
                        showPaymentSuccessPopupState={this.showPaymentSuccessPopupState}
                        showPaymentFailurePopupState={this.showPaymentFailurePopupState}
                        closePaymentFailurePopup={this.closePaymentFailurePopupState}
                        closePaymentSuccessPopup={this.closePaymentSuccessPopupState}
                        profile={this.props.profile}
                        invitedUsers={this.props.invitedUsers}
                        userCredit={this.props.userCredit}
                        invitedUsersStatus={this.props.invitedUsersStatus}
                    />
                </div>
            </div>
        )
    }
}

PreCheckout.defaultProps = {
    menteeCourseSyllabus: []
}

export default withArrowScroll(withRouter(PreCheckout), 'tk-route-container')
