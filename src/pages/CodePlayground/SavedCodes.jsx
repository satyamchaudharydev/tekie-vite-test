import React, { Component } from "react";
import cx from "classnames";
import updateSaveCode from "../../queries/saveCode/updateSaveCode";
import SyntaxHighlighter from '../../utils/react-syntax-highlighter/dist/esm'
import { dracula } from '../../utils/react-syntax-highlighter/dist/esm/styles/hljs'
import styles from "./CodePlayground.module.scss";
import { get } from "lodash";
import { Link } from "react-router-dom";

const terminalStyles = {
    height: '100%',
    padding: 0,
    marginTop: 0,
    marginBottom: 0,
    border: '#aaacae',
    backgroundColor: '#092732',
    fontFamily: 'Monaco',
    fontSize: '16px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.3',
    letterSpacing: 'normal',
    whiteSpace: 'pre-wrap'
}
class SavedCodes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  openMore = (e) => {
    e.preventDefault();
    e.persist();
    e.stopPropagation();
    const { showMore } = this.state;
    this.setState({
      showMore: !showMore,
    });
  };

  handleShowConfirmMsg = (e) => {
    e.preventDefault();
    e.persist();
    e.stopPropagation();
    this.setState({
      showMore: false,
    });
    this.props.handleShowConfirmMsg(get(this.props, "code.id"));
  };

  requestForPostingInCommunity = async (userSavedCodeId) => {
    if (userSavedCodeId) {
      await updateSaveCode(userSavedCodeId, {
              hasRequestedByMentee: true,
      }).call();
    }
  }

  checkIfCodeIsInReview = () => {
    const { code } = this.props
    if (get(code, 'hasRequestedByMentee', false) &&
      (get(code, 'isApprovedForDisplay') === 'pending')
    ) {
      return true
    }
    if (
      get(code, 'isApprovedForDisplay') === 'accepted' &&
      get(code, 'userApprovedCode') && get(code, 'userApprovedCode.status') === 'unpublished'
    ) {
      return true
    }
    return false
  }

  checkIfCodeIsPublished = () => {
    const { code } = this.props
    if ( get(code, 'userApprovedCode') && get(code, 'userApprovedCode.status') === 'published') {
      return true
    }
    return false
  }

  checkIfCodeReviewNotRequested = () => {
    const { code } = this.props
    if ( !get(code, 'hasRequestedByMentee', false) &&
      get(code, 'isApprovedForDisplay', 'pending') === 'pending'
    ) {
      return true
    }
    return false
  }

  getBorderColorBasedOnStatus = () => {
    if (this.checkIfCodeReviewNotRequested()) {
      return ''
    }
    if (this.checkIfCodeIsPublished()) {
      return '#57C3BC'
    }
    if (this.checkIfCodeIsInReview()) {
      return '#FBBD00'
    }
    return ''
  }

  getActionButtonBasedOnStatus = () => {
    const { code, savedCodeUpdateStatus } = this.props
    const savedCodeUpdateLoading = savedCodeUpdateStatus && get(savedCodeUpdateStatus.toJS(), 'loading');
    if (this.checkIfCodeIsPublished()) {
      return (
        <Link
          className={cx(styles.show, styles.communityBtn)}
          to={`/student-community/${get(code, 'userApprovedCode.id')}`}
        >
          View In Community
        </Link>
      )
    }
    if (this.checkIfCodeReviewNotRequested()) {
      return (
        <button
          className={cx(styles.show, styles.communityBtn)}
          onClick={() => { this.requestForPostingInCommunity(get(code, 'id')) }}
          style={{
            opacity: `${savedCodeUpdateLoading ? 0.5 : 1}`,
            pointerEvents: `${savedCodeUpdateLoading ? 'none' : ''}`
          }}
        >
          Post In Community
        </button>
      )
    }
    if (this.checkIfCodeIsInReview()) {
      return (
        <div className={cx(styles.show, styles.reviewTag)}>
          In Review
        </div>
      )
    }
    return ''
  }

  render() {
    const { code } = this.props;
    return (
      <div className={styles.savedCodeContainer}>
          <div
            className={styles.fileName}
            style={{ borderColor: `${this.getBorderColorBasedOnStatus()}`}}
          >
            <span>
              {get(code, "fileName") && get(code, "fileName").slice(0, 10)}
            </span>
          </div>
          <div
            className={styles.description}
            style={{ borderColor: `${this.getBorderColorBasedOnStatus()}`}}
          >
            <Link
              to={{
                pathname: `/code-playground/${code.id}`,
                state: {
                  showCode: code,
                  isCodePublished: this.checkIfCodeIsPublished()
                },
              }}
            >
              <div className={styles.codeContainer}>
                <SyntaxHighlighter
                  language='python'
                  style={dracula}
                  customStyle={terminalStyles}
                >
                  {get(code, 'code','').replace(/\r/g, '\n')}
                </SyntaxHighlighter>
              </div>
            </Link>
            <div className={cx(styles.actionContainer)}>
              {this.getActionButtonBasedOnStatus()}
              <button
              className={cx(styles.icons, styles.deleteIcon, styles.show, styles.showMoreButton)}
              // onClick={this.openMore}
              onClick={this.handleShowConfirmMsg}
              />
            </div>
              {/* <div className={styles.showMoreWrap}>
                <div
                  className={cx(
                    styles.showMore,
                    this.state.showMore ? styles.show : styles.hide
                  )}
                > */}
              {/* <span className={cx(styles.icons, styles.shareIcon)} onClick={this.handleEdit}/>
                                <span className={styles.vl}/> */}
              {/* <span
                    className={cx(styles.icons, styles.deleteIcon)}
                    onClick={this.handleShowConfirmMsg}
                  />
                </div>
              </div> */}
          </div>
      </div>
    );
  }
}

export default SavedCodes;
