import React from 'react'

import Paragraph from '../../../../library/Paragraph';
import Stack from '../../../../library/Stack';
import Button from "../../../../library/Button";
import classes from "./teacherLogin.module.scss";
import { hs } from '../../../../utils/size';
import { ReactComponent as GreenCheck } from "../../../../assets/greenCheck.svg";

function PasswordChanged({ onBackToLoginClick }) {
    return (
        <div className={classes.secondContent}>
            <Stack spacing={6}>
            <div className={classes.linkSentHeading}>
                <p className={classes.gilroy}>Password Changed</p>
                <GreenCheck />
            </div>
            <Paragraph variant="body1">
                Your password was reset successfully, try logging in now.
            </Paragraph>
            </Stack>
            <div style={{ marginTop: hs(58) }}>
            <Button
                type="quaternary"
                block
                size="large"
                onClick={onBackToLoginClick}
            >
                Back to Login
            </Button>
            </div>
        </div>
    )
}

export default PasswordChanged