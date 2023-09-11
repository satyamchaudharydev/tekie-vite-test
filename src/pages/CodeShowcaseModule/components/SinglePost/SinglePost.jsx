import React from 'react'
import moment from 'moment'
import { get } from 'lodash'
import SyntaxHighlighter from '../../../../utils/react-syntax-highlighter/dist/esm'
import { StudentCommunityPageEventsGA } from '../../../../utils/analytics/ga'
import { dracula } from '../../../../utils/react-syntax-highlighter/dist/esm/styles/hljs'
import { avatarsRelativePath } from '../../../../utils/constants/studentProfileAvatars'
import { motion } from 'framer-motion'
import { withRouter, Link} from 'react-router-dom'
import { connect } from 'react-redux'
import { filterKey } from '../../../../utils/data-utils'
import { debounce } from 'lodash'

const terminalStyles = {
    height: '100%',
    paddingLeft: '18px',
    paddingTop:0,
    paddingRight: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
    border: '#aaacae',
    backgroundColor: '#002f3e',
    fontFamily: 'Monaco',
    fontSize: '16px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.3',
    letterSpacing: 'normal',
    whiteSpace: 'pre-wrap'
}

const iframeTerminalStyles = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px',
    backgroundColor: 'initial'
}

const SinglePost = props => {
    const getStudentProfileAvatar = (approvedCode) => {
        if (approvedCode) {
            const avatar = get(approvedCode, 'studentAvatar', 'theo') || 'theo';
            return avatarsRelativePath[avatar]
        }
        return avatarsRelativePath.theo
    }
    function decodeURIComponentSafe(str = '') {
        if (!str) {
            return str;
        }
        if (str.includes('%')) return decodeURIComponent(str.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
        return str
    }

    const renderCodeEditor = () => {
        if (get(props, 'approvedCodeData.languageType') === 'markup') { 
            return <iframe
                  srcDoc={decodeURIComponentSafe(get(props, 'approvedCodeData.approvedCode','').replace(/\r/g, '\n'))}
                  style={{ ...terminalStyles, ...iframeTerminalStyles }}
                  title="Preview Editor"
              />
        } else {
            return <SyntaxHighlighter
                        language='python'
                        style={dracula}
                        customStyle={terminalStyles}
                    >
                        {get(props, 'approvedCodeData.approvedCode','').replace(/\r/g, '\n')}
                    </SyntaxHighlighter>
        }
    }
    return (
        <motion.div
            key={props.approvedCodeData.id}
            initial={{
                opacity: props.fade ? 0 : 1
            }}
            animate={{ 
                opacity: 1
            }}
            exit={{ opacity: 0 }}
            className='code-showcase-block'>
            <div className='code-showcase-row' itemScope itemType='https://schema.org/Article'>
                <div itemScope itemType='https://schema.org/Organization' itemProp='publisher' style={{display: 'none'}}>
                    <p itemProp='name'>Tekie.in</p>
                </div>
                { props.getTrendingCodeLabel && props.isDetailedView && props.getTrendingCodeLabel(props.approvedCodeDataIndex, props.approvedCodeData.id, props.trendingUserApprovedCode) }
                {props.isDetailedView && !props.isStatsPage && (
                    <motion.div
                        initial={{
                            opacity: props.fade ? 0 : 1
                        }}
                        animate={{ 
                            opacity: 1
                        }}
                        className='code-showcase-author-details' itemProp='author' itemScope itemType='http://schema.org/Person'>
                        <div className='code-showcase-author-profile-img-container'>
                            <span
                                className='code-showcase-profile-img'
                                style={{ background: `url('${getStudentProfileAvatar(props.approvedCodeData)}')` }}
                            ></span>
                        </div>
                        <div className='code-showcase-author-name' itemProp='name'>{props.approvedCodeData.studentName}</div>
                        <div className='code-showcase-author-grade'>{props.approvedCodeData.studentGrade}</div>
                    </motion.div>
                )}
                <div style={{ width: '100%', overflow: 'hidden'}}>
                <div className='code-showcase-details'>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                        <div style={{ flex: '1 1 80%' }}>
                            <h1 className='code-showcase-title' itemProp='name headline'>{props.approvedCodeData.approvedFileName}</h1>
                                <h2 className='code-showcase-timestamp' itemProp='dateCreated datePublished'>
                                {props.isDetailedView ? (
                                    `posted ${moment.utc(props.approvedCodeData.createdAt).fromNow()}`
                                ) : (
                                    moment.utc(props.approvedCodeData.createdAt).format('DD/MM/YYYY')
                                )}
                            </h2>
                        </div> 
                        <div className='code-showcase-row code-showcase-tags-wrapper' style={{ flexWrap: 'wrap', flex: '1 1 50%', justifyContent: 'flex-start'}}>
                            {get(props, 'approvedCodeData.userApprovedCodeTagMappingsMeta.count') ? props.approvedCodeData.userApprovedCodeTagMappings.map(tagsMapping => (
                                <div
                                key={tagsMapping.id}
                                onClick={() => props.filterApprovedCodeBasedOnTags(tagsMapping.userApprovedCodeTag.title)}
                                className={`code-showcase-tags ${props.selectedTags.includes(tagsMapping.userApprovedCodeTag.title) && 'code-showcase-tags-active'}`}>
                                    {tagsMapping.userApprovedCodeTag.title}
                                </div>
                            )) : <></>}
                        </div>
                    </div>
                    {!props.isDetailedView && (
                        <div className='code-showcase-divider' style={{ width: '100%', marginTop: '5px' }}></div>
                    )}
                    <p className='code-showcase-description'>{props.approvedCodeData.approvedDescription}</p>
                </div>
                {props.isDetailedView && (
                    <motion.div
                        initial={{
                            opacity: props.fade ? 0 : 1
                        }}
                        animate={{ 
                            opacity: 1
                        }}        
                        className='code-showcase-code-view'>
                        {renderCodeEditor()}
                        {/* <SyntaxHighlighter
                            language='python'
                            style={dracula}
                            customStyle={terminalStyles}
                        >
                            {get(props, 'approvedCodeData.approvedCode','').replace(/\r/g, '\n')}
                        </SyntaxHighlighter> */}
                        <Link
                            to={`/student-community/${props.approvedCodeData.id}`}
                            className='code-showcase-playButton'
                            >
                        </Link>
                    </motion.div>    
                )}
                <div className='code-showcase-row code-showcase-details-footer'>
                    <div className='code-showcase-row'>
                    {props.reactions.map(reaction => (
                        <motion.div
                        key={reaction.label}
                        whileTap={{
                            scale: 0.85
                        }}
                        onClick={debounce(() => {
                            StudentCommunityPageEventsGA({
                                action: 'Reaction Clicks',
                                label: `${reaction.label.charAt(0).toUpperCase() + reaction.label.slice(1)} Reaction Click For '${props.approvedCodeData.approvedFileName}' Code`,
                            })
                            props.reactOnApprovedCode(reaction.label, props.approvedCodeData)
                            }, 500)
                        }
                        className={`code-showcase-reactions ${reaction.label}
                        ${(props.approvedCodeData.userReactionLog && props.approvedCodeData.userReactionLog[reaction.label]) && 'active'}`}>
                        <span role='img' aria-label={reaction.label}>{reaction.icon} {props.approvedCodeData[`${reaction.label}ReactionCount`]}</span>
                        </motion.div>
                    ))}
                    </div>
                    <div
                    onClick={() => props.onShareButtonClick(props.approvedCodeData)}
                    className='code-showcase-row code-showcase-share-container'
                    >
                        <span className='code-showcase-shareIcon'></span> Share
                    </div>
                </div>
                </div>
            </div>
            <div className='code-showcase-divider'></div>
        </motion.div>
    )
}

const mapStateToProps = (state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
})

export default connect(mapStateToProps)(withRouter(SinglePost))
