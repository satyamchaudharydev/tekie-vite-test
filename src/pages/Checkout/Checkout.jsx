import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import styles from './Checkout.module.scss'
import PurchaseForm from "../../components/CoursePurchaseForm";
import { BuyNowGA } from '../../utils/analytics/ga'
import withArrowScroll from '../../components/withArrowScroll'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'

class Checkout extends Component {
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
        fetchMenteeCourseSyllabus()
        const pathname = this.props.location && this.props.location.pathname
        if (!this.state.showPaymentModal && pathname === '/checkout') {
            BuyNowGA("Buy Now Popup Open")
            this.setState({
                showPaymentModal: true,
            })
        }
    }

    closePaymentPopupState = (showPaymentSuccessPopup = false, showPaymentFailurePopup = false) => {
        if (showPaymentSuccessPopup) {
            localStorage.setItem('showPaymentSuccessPopup', "show")
            this.props.history.push(`/sessions`)
        } else if (showPaymentFailurePopup) {
            localStorage.setItem('showPaymentFailurePopup', "show")
            this.props.history.push(`/sessions`)
        } else {
            this.props.history.push(`/sessions`)
        }
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
        BuyNowGA("Buy Now Popup Open")
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
        const { menteeCourseSyllabus } = this.props
        return (
            <div className={styles.container}>
                {this.props.loggedInUser && this.state.showPaymentModal &&
                    <PurchaseForm
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
                        menteeCourseSyllabus={menteeCourseSyllabus}
                    />}
            </div>
        )
    }
}



Checkout.defaultProps = {
    menteeCourseSyllabus: []
}

export default withArrowScroll(withRouter(Checkout), 'tk-route-container')
