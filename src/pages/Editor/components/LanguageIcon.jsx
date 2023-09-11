import React from 'react'
import { ReactComponent as Web } from "../../../assets/editor/web.svg";
import { ReactComponent as Python } from "../../../assets/editor/python.svg";
import { ReactComponent as Blockly } from "../../../assets/editor/blockly.svg";
import { ReactComponent as Java } from "../../../assets/editor/java.svg";
import { ReactComponent as CodeOrg } from "../../../assets/editor/codeOrg.svg";

import styles from "../styles.module.scss";
import hs from '../../../utils/scale';

function LanguageIcon({ mode, full, height, width }) {
    // on basis of language, show the icon
    let icon;
    if (mode === 'CodeOrg') {
        // icon = <CodeOrg />
    }
    if (mode === 'python') {
        icon = <Python />
    } else if (mode === 'blockly') {
        // icon = <Blockly />
    } else if (mode === 'web' || mode === 'markup') {
        icon = <Web />
    }
    return (
        <div className={styles.languageIcon} style={full ? { height: '100%', width: '100%' } : { height: hs(height), width: hs(width) }}>
            {icon}
        </div>
    )
}

export default LanguageIcon