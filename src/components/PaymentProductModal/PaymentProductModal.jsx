import React, { Component } from 'react'
import PopUp from '../PopUp/PopUp'
import styles from './PaymentProductModal.module.scss'
import { ReactComponent as PaymentSuccessDrop } from '../../assets/payment_success_drop.svg'
import {ActionButton} from "../Buttons";
import cx from "classnames";
import {ReactComponent as Product1} from '../../assets/product1.svg'
import {ReactComponent as Product2} from '../../assets/product2.svg'
import {ReactComponent as Product3} from '../../assets/product3.svg'
import fetchProducts from "../../queries/fetchProducts";
import config, {GIFT_VOUCHER_AMOUNT, product1, product2, product3, productTypes} from "../../config";
import addZeroes from '../../utils/addZeros'

const buttonTextProps = {
    hideIconContainer: true,
    buttonTextCenterAligned: true
}

class PaymentProductModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            products: [],
            selectedProductName: product1
        }
    }

    async componentDidMount() {
        if (!this.props.productSuccess) {
            // await fetchProducts(config.MENTEE).call()
        }
        this.setFields()
        this.setState({
            isLoading: false
        })
    }

    componentDidUpdate (prevProps) {
        // write code here
    }

    setFields = () => {
        const { product, discount } = this.props
        let products  = product && product.toJS()
        let discounts  = discount && discount.toJS()
        let isSelected = true
        products.forEach(productItem => {
            productItem.isSelected = isSelected
            isSelected = false
            if(productItem.type === productTypes[0]){
                productItem.productName = product1
            } else if (productItem.type === productTypes[1]){
                productItem.productName = product2
            } else if (productItem.type === productTypes[2]){
                productItem.productName = product3
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

        products = products.sort((a, b) => b.createdAt - a.createdAt)
        this.setState({
            products
        })
    }

    bookSession = () => {
        this.props.closePaymentProductModal()
        this.props.showPaymentPopupState(this.state.products, this.state.selectedProductName)
    }

    chooseProduct = (productId) =>  {
        // write here
        let {products, selectedProductName} = this.state
        products.forEach(product => {
            if(product.id === productId){
                product.isSelected = true
                selectedProductName = product.productName
            }
            else
                product.isSelected = false
        })
        this.setState({products, selectedProductName})
    }

    render () {
        const { visible, closePaymentProductModal } = this.props
        const { products } = this.state
        return (
            <PopUp
                showPopup={visible}
                closePopUp={closePaymentProductModal}
            >
                <div className={styles.mainContainer}>
                    <div className={styles.paymentSuccessDrop}>
                        <PaymentSuccessDrop />
                    </div>
                    <div className={styles.paymentSuccessContainer}>
                        Choose your course
                    </div>
                    <div className={styles.paymentProductContainer}>
                        {products
                            .filter(product => productTypes.slice(0, 3).includes(product.type))
                            .map(productItem => (
                            <div className={cx(styles.paymentProductBox, productItem.isSelected && styles.selectedPaymentProductBox)}>
                                <div className={styles.productIcon}>
                                    {productItem.type === productTypes[0] && <Product1 />}
                                    {productItem.type === productTypes[1] && <Product2 />}
                                    {productItem.type === productTypes[2] && <Product3 />}
                                </div>
                                <div className={styles.productName}>
                                    {productItem.productName}
                                </div>
                                <div className={styles.productPriceContainer}>
                                    {productItem.discountPrice > 0 &&
                                        <div className={styles.productPrice}>
                                            ₹ {productItem.price}
                                        </div>
                                    }
                                    <div className={styles.discountedProductPrice}>
                                        ₹ {productItem.totalCharge % 1 != 0 ? Number.parseFloat(productItem.totalCharge).toFixed(2) : productItem.totalCharge}
                                    </div>
                                </div>
                                <div className={styles.chooseProductButton}>
                                    <div
                                        onClick={() => this.chooseProduct(productItem.id)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            zIndex: '9999999'
                                        }}
                                    >
                                        <ActionButton
                                            {...buttonTextProps}
                                            title={'Choose'}
                                            active={productItem.isSelected}
                                            hoverToCursor={true}
                                            isChooseProductButton={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.paymentSuccessActionContainer}>
                        <div
                            onClick={this.bookSession}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                zIndex: '9999999'
                            }}
                        >
                            <ActionButton
                                {...buttonTextProps}
                                title={'Checkout'}
                                active={true}
                                hoverToCursor={true}
                            />
                        </div>
                    </div>
                </div>
            </PopUp>
        )
    }
}

export default PaymentProductModal
