import React from "react";
import TekieButton from "../../../../../components/Buttons/TekieButton/TekieButton";
import { PlusIcon } from "../../../../../constants/icons";
import hs, { hsFor1280 } from "../../../../../utils/scale";
import "./LoginForm.scss";
import { gtmEvents } from "../../../../../utils/analytics/gtmEvents";
import { fireGtmEvent } from "../../../../../utils/analytics/gtmActions";

const RollNosForm = (props) => {
  const {
    renderOtpOrRollnoInput,
    isStudentSelected,
    setIsStudentSelected,
    buddyLimit,
    totalBuddiesAdded,
    isBuddyLoginEnabled,
    continueButtonHandler = () => {},
    fetchingData,
    loading,
  } = props;

  const renderAddBuddyButton = () => {
    // if (fromCentralizedLogin) return;
    return (
      <>
        {isBuddyLoginEnabled && totalBuddiesAdded < buddyLimit ? (
          <TekieButton
            onBtnClick={() => {
              const addBuddyClickEvent = gtmEvents.addBuddyClick
              fireGtmEvent(addBuddyClickEvent)
              setIsStudentSelected(false);
              renderOtpOrRollnoInput(1);
            }}
            text="Add a Buddy"
            type="secondary"
            widthFull
            leftIcon
          >
            <PlusIcon height={hs(20)} width={hs(20)} />
          </TekieButton>
        ) : null}
      </>
    );
  };

  return (
    <div className={"school-live-class-login-rollNosFormContainer"}>
      {renderOtpOrRollnoInput(1)}
      {isStudentSelected && (
        <div>
          <TekieButton
            isLoading={fetchingData || loading}
            text="Continue"
            widthFull
            onBtnClick={() => continueButtonHandler("buddyLogin")}
            btnBorder="1px solid #00ADE6"
          />
          {isBuddyLoginEnabled && (
            <p className={"school-live-class-login-separatorText"}>or</p>
          )}
          {renderAddBuddyButton()}
          {isBuddyLoginEnabled && totalBuddiesAdded < buddyLimit && (
            <p className={"school-live-class-login-buddyLimit"}>
              You can add upto {`${buddyLimit - totalBuddiesAdded}`} more{" "}
              {buddyLimit - totalBuddiesAdded === 1 ? "buddy" : "buddies"}.
            </p>
          )}
        </div>
      )}
      {/* {!isStudentSelected && <p className={classes.reEnterCode}><LeftArrow/> Re-enter class code</p>} */}
    </div>
  );
};

export default RollNosForm;
