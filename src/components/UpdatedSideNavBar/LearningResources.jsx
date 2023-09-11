import { motion } from 'framer-motion'
import { get } from 'lodash';
import React, { Component, useState }  from 'react';
import { ChevronRight } from '../../constants/icons';
import LanguageIcon from '../../pages/Editor/components/LanguageIcon';
import { ExternalLinkSvg } from '../../pages/TeacherApp/components/svg';
import { hsFor1280 } from '../../utils/scale';
import { LearningIcon } from './icons';
import styles from  './MainSideBar.module.scss'
import cx from 'classnames'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import { LearningResourcesDropdown } from '../NavBar/ProfileIcon';
import { getThisSession } from '../../pages/UpdatedSessions/utils';

const LearningResources = ({topicId,courseId}) => {
    const [isProfileAndSettingsDropdownVisible, setIsProfileAndSettingsDropdownVisible] = useState(false)
    const dropdownRef = React.useRef(null)
    useOnClickOutside(dropdownRef, () => setIsProfileAndSettingsDropdownVisible(false))
    let coursePackages = window.store.getState().data.getIn(["coursePackages","data"]).toJS()
    let coursesData
    coursesData = coursePackages.map(coursePackage => {
        const coursesData = get(coursePackage,'courses') || get(coursePackage, 'coursesData')
        return coursesData && coursesData.filter(course => course.id === courseId)
    })
    coursesData = get(coursesData,'[0].[0].codingLanguages')
    let coursesUniqueValue = []
    coursesData && coursesData.map(courseData => {
        const courseValue = (get(courseData,'value', '') || '').toLowerCase()
        if (courseValue && courseValue !== 'java') {
            coursesUniqueValue.push(courseData.value)
        }
        return ''
    })
    coursesUniqueValue = [...new Set(coursesUniqueValue)]
    const editorsData = {
        Python : {
            logo: <LanguageIcon mode={'python'} height={24} width={24}/>,
            text: 'Code Playground',
            link: `${window.location.origin}/code-playground?language=python` ,
        },
        JavaScript: {
            logo: <LanguageIcon mode={'markup'} height={24} width={24}/>,
            text: 'Code Playground',
            link: `${window.location.origin}/code-playground?language=markup`,
        },
        Blockly: {
            logo: <LanguageIcon mode={'blockly'} height={24} width={24}/>,
            text: 'Blockly Editor',
            link: `${window.location.origin}/code-playground?language=blockly`,
        },
        CodeOrg: {
            logo: <LanguageIcon mode={'CodeOrg'} height={20} width={20} />,
            text: 'Code.org',
            link: `https://studio.code.org/projects/spritelab/`,
        }
    }
    return (
        <>
            {(coursesUniqueValue.length>1 || (coursesUniqueValue && coursesUniqueValue[0] === 'Python')) &&
                <motion.div
                className={cx(styles.learningContainer)}
                ref={dropdownRef}
                onClick={() => setIsProfileAndSettingsDropdownVisible(!isProfileAndSettingsDropdownVisible)}
                onHoverStart={() => setIsProfileAndSettingsDropdownVisible(true)}
                onHoverEnd={() => setIsProfileAndSettingsDropdownVisible(false)}
                >
                    <LearningIcon width={hsFor1280(20)} height={hsFor1280(20)}/>
                    <p className={styles.title}>Learning Resources</p>
                    <ChevronRight width={hsFor1280(12)} height={hsFor1280(12)} color={'#005773'} />
                    <LearningResourcesDropdown
                        isVisible={isProfileAndSettingsDropdownVisible}
                        containerClassName={cx(styles.learningDropdown,styles.dropDownContainer)}
                        coursesData={coursesUniqueValue}
                    />
                </motion.div>
            }
            {coursesData && (coursesUniqueValue.length>0 && coursesUniqueValue.length<=1) && !(coursesUniqueValue && coursesUniqueValue[0] === 'Python') &&
                <motion.div
                    className={styles.learningContainer}
                    onClick={() => window.open(`${editorsData[coursesUniqueValue[0]] && editorsData[coursesUniqueValue[0]].link}`,'_blank')}
                >
                    <div style={{display:'flex'}}>
                        {editorsData[coursesUniqueValue[0]] && editorsData[coursesUniqueValue[0]].logo}
                        <p className={styles.title}>{editorsData[coursesUniqueValue[0]] && editorsData[coursesUniqueValue[0]].text}</p>
                    </div>
                    <ExternalLinkSvg height={hsFor1280(18)} width={hsFor1280(18)} color="#005773" />
                </motion.div>
            }
            
        </>
    )
}

export default LearningResources