import React from "react";
import CredentialDisplay from "./components/CredentialDisplay";
import classes from "./CredentialsPopup.module.scss";
import { motion } from "framer-motion";
import { fadeIn, popOut } from "../../constants/animations";
import { ANIMATION_PROPERTIES } from "../../constants/constants";
import { useHistory } from "react-router";
import UpdatedButton from "../../../../../components/Buttons/UpdatedButton/UpdatedButton";
import isBuddyExist from "../../../../../utils/buddyUtils";
import extractSubdomain, { isSubDomainActive } from "../../../../../utils/extractSubdomain";
import { studentAppSubDomains } from '../../../../../constants';

export default function CredentialsPopup({ email, password, onClickFn }) {
  const history = useHistory()
  const clickHandler = () => {
    localStorage.removeItem("showCredentialsModal");
    onClickFn();
    if (isSubDomainActive) {
      if (studentAppSubDomains.includes(extractSubdomain())) history.push('/')
      else history.push('/login')
    }
  };
  const isBuddyExistFlag = isBuddyExist()
  return (
    <>
      <motion.div
        className={classes.CredentialsPopupContainer}
        variants={popOut}
        initial={ANIMATION_PROPERTIES.initial}
        animate={ANIMATION_PROPERTIES.animate}
      >
        <h1 className={classes.modalHeading}>{!isBuddyExistFlag ? "Here’s your login info." : "Grab Your Login IDs!"}</h1>
        <p className={classes.uniqueKeyDescription}>
          {!isBuddyExistFlag
          ? "Note down the login details mentioned below. Use it to log into the app later."
          : "Make sure to get your login details from your teacher at the end of the class!"
          }
        </p>
        {!isBuddyExistFlag ? (
          <div className={classes.emailPasswordContainer}>
            <div className={classes.emailContainer}>
              <p className={classes.emailPassword}>
                Email:
              </p>
              <CredentialDisplay text={email} />
            </div>
            <div className={classes.passwordContainer}>
              <p className={classes.emailPassword}>
                Password:
              </p>
              <CredentialDisplay text={password} />
            </div>
          </div>
        ) : null}
        <div className={classes.popUpButton}>
          <UpdatedButton
            text="Ok, Got It!"
            widthFull={true}
            onBtnClick={() => clickHandler()}
          />
        </div>
      </motion.div>
      <motion.div
        className={classes.modalOverlay}
        variants={fadeIn}
        initial={ANIMATION_PROPERTIES.initial}
        animate={ANIMATION_PROPERTIES.animate}
      ></motion.div>
    </>
  );
}
