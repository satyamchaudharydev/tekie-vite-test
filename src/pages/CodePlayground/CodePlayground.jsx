import React, { Component, Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { get, sortBy } from "lodash";
import cx from "classnames";
import qs from 'query-string'
import styles from "./CodePlayground.module.scss";
import withArrowScroll from "../../components/withArrowScroll";
import moment from "moment";
import SavedCodes from "./SavedCodes";
import fetchSaveCode from "../../queries/saveCode/fetchSavedCode";
import SimpleButtonLoader from "../../components/SimpleButtonLoader";
import { Toaster, getToasterBasedOnType } from "../../components/Toaster";
import deleteSaveCode from "../../queries/saveCode/deleteSaveCode";
import SubmitOverlayMenu from "../Quiz/components/SubmitOverlayMenu";
import requestToGraphql from "../../utils/requestToGraphql";

class CodePlayground extends Component {
  constructor(props) {
    super(props);
    this.state = {
      savedCode: null,
      dateWise: {},
      showConfirmMsg: false,
      perPage: 12,
      currentPage: 1,
      fileContains: '',
      fromDate: '',
      toDate: ''
    };
  }

  callFetchSavedCode = () => {
    fetchSaveCode({
      userId: get(this.props.loggedInUser.toJS(), "id"),
      first: this.state.perPage,
      skip: this.state.currentPage - 1,
      fileNameContains: this.state.fileContains,
      fromDate: this.state.fromDate ? new Date(this.state.fromDate).toISOString() : null,
      toDate: this.state.toDate ? new Date(this.state.toDate).toISOString() : null,
    }).call();
  }

  componentDidMount() {
    const codePlaygroundParams = qs.parse(window.location.search)
    const { chat: chatCode } = codePlaygroundParams
    if (chatCode && chatCode.length) {
      this.fetchCodeFromChat(chatCode)
    } else {
      // this.callFetchSavedCode()
    }
  }

  async fetchCodeFromChat (id) {
    const res = await requestToGraphql(`{
      message(id: "${id}") {
        terminalInput
      }
    }`)
    const code = get(res, 'data.message.terminalInput')
    this.setState({
      codeString: code,
      outputCodeString: code,
    })
  }

  componentDidUpdate(prevProps) {
    const savedCodeStatusPrev =
      get(prevProps, "savedCodeStatus") &&
      get(prevProps, "savedCodeStatus").toJS();
    const savedCodeStatus =
      get(this.props, "savedCodeStatus") &&
      get(this.props, "savedCodeStatus").toJS();
    const prevDeleteStatus =
      get(prevProps, "savedCodeDeleteStatus") &&
      get(prevProps, "savedCodeDeleteStatus").toJS();
    const prevUpdateStatus =
      get(prevProps, "savedCodeUpdateStatus") &&
      get(prevProps, "savedCodeUpdateStatus").toJS();
    const deleteStatus =
      get(this.props, "savedCodeDeleteStatus") &&
      get(this.props, "savedCodeDeleteStatus").toJS();
    const updateStatus =
      get(this.props, "savedCodeUpdateStatus") &&
      get(this.props, "savedCodeUpdateStatus").toJS();
    if (
      get(savedCodeStatusPrev, "fetchSavedCode.loading") &&
      get(savedCodeStatus, "fetchSavedCode.success")
    ) {
      this.convertDateWise();
    }
    if (get(prevDeleteStatus, "loading") && get(deleteStatus, "success")) {
      this.convertDateWise();
      getToasterBasedOnType({
        type: "success",
        message: "File Deleted"
      });
      this.closeOverlay()
    }
    if (get(prevUpdateStatus, "loading") && get(updateStatus, "success")) {
      this.convertDateWise();
      getToasterBasedOnType({
        type: "success",
        message: "Review Requested!"
      });
    }
  }

  convertDateWise = () => {
    const savedCode =
      get(this.props, "savedCode") && get(this.props, "savedCode").toJS();
    const dateWise = {};
    const dateFormat = "MM-DD-YYYY";
    if (savedCode && Array.isArray(savedCode)) {
      savedCode.forEach(code => {
        const createdAt = moment(get(code, "createdAt")).format(dateFormat);
        if (dateWise[createdAt]) {
          dateWise[createdAt].push(code);
        } else {
          dateWise[createdAt] = [code];
        }
        dateWise[createdAt] = dateWise[createdAt].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      });
    }
    this.setState({
      dateWise: { ...dateWise }
    });
  };

  renderSavedCodes = () => {
    const totalSavedCodes = get(this.props.totalSavedCodes.toJS(), '0.count');
    const { dateWise } = this.state;
    if (!totalSavedCodes || !Object.keys(dateWise).length) {
      return <div>
        <div className={styles.savedCodeEmptyIcon}></div>
        <p className={styles.savedCodeEmptyInfo}>Oops! Nothing to see here...</p>
        <p className={styles.savedCodeEmptyMsg}>Write your first code now!</p>
        <Link to="/code-playground">
            <button className={cx(styles.addButton, styles.emptyPageAddBtn)} />
          </Link>
      </div>;
    }
    return sortBy(Object.keys(dateWise), date => -moment(date)).map((date,index) => (
      <Fragment
        key={index}
      >
        <div className={styles.hl}>
          <span>{moment(date).format('DD-MM-YYYY')} </span>
        </div>
        <div className={styles.savedCodesFileWrap}>
          {dateWise[date].map(code => (
            <SavedCodes
              key={get(code, 'id')}
              code={code}
              savedCodeUpdateStatus={this.props.savedCodeUpdateStatus}
              handleShowConfirmMsg={this.handleShowConfirmMsg} />
          ))}
        </div>
        <Link to="/code-playground">
            <button className={styles.addButton} />
          </Link>
      </Fragment>
    ));
  };

  handleShowConfirmMsg = id => {
    this.setState({
      showConfirmMsg: true,
      codeToDelete: id
    })
  }

  closeOverlay = () => {
    this.setState({
      showConfirmMsg: false,
      codeToDelete: null
    });
  };

  handleDelete = () => {
    deleteSaveCode(get(this.state, 'codeToDelete')).call();
  };

  renderPagesCount = () => {
    const totalSavedCodes = get(this.props.totalSavedCodes.toJS(), '0.count');
    if (totalSavedCodes <= this.state.perPage) {
      return null
    }
    const pages = []
    for(let i=0; i < Math.ceil(totalSavedCodes / this.state.perPage); i++) {
      pages.push(
        <div
          className={styles.pages}
          style={{
            color: this.state.currentPage - 1 === i ? '#43aee6' : '#d9d9d9',
            borderColor: this.state.currentPage - 1 === i ? '#1890ff' : '#d9d9d9' 
          }}
          onClick={e => this.pageChange(i + 1)}
        >
          {i + 1}
        </div>
      )
    }
    return pages
  }

  pageChange = page => {
    if (page === this.state.currentPage) {
      return
    }
    this.setState({
      currentPage: page
    }, () => {
      this.callFetchSavedCode()
    })
  }

  handleSearchBoxChange = e => {
    e.persist()
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSearch = e => {
    e.persist()
    if (e.keyCode === 13) {
      if (this.state.fileContains) {
        this.callFetchSavedCode()
      }
    }
  }

  handleDateSearch = () => {
    this.setState({
      currentPage: 1
    }, () => {
      this.callFetchSavedCode()
    })
  }

  render() {
    const user = this.props.loggedInUser.toJS();
    const savedCodeStatus =
      get(this.props, "savedCodeStatus") &&
      get(this.props, "savedCodeStatus").toJS();
    return (
      <div className={styles.container}>
        <div className={styles.searchBar}>
          <p>{get(user, "name")} / All Your Playgrounds</p>
          {/* SearchBar */}
          <div style={{ position: 'relative' }}>
            <input
              type='text'
              placeholder='Search your Playgrounds...'
              className={styles.searchBox}
              name='fileContains'
              value={this.state.fileContains}
              onChange={this.handleSearchBoxChange}
              onKeyUp={this.handleSearch}
            />
            <span className={cx(styles.icons, styles.searchIcon)} onClick={e => this.callFetchSavedCode()}></span>
          </div>
        </div>
        {/* <div className={cx(styles.flexBox, styles.topBar)}>
          <p>Code Playground</p>
        </div> */}
        {/* <div className={cx(styles.flexBox, styles.topBar, styles.dateInputContainer)} style={{ justifyContent: 'center' }}>
        <div>
          <label for='fromDate'> From Date: </label>
          <input
            type='date'
            placeholder='Search your saved files From...'
            className={cx(styles.searchBox, styles.dateInput)}
            value={this.state.fromDate}
            name='fromDate'
            onChange={this.handleSearchBoxChange}
            onKeyUp={this.handleSearch}
          />
        </div>
        <div>
          <label for='toDate'> To Date: </label>
          <input
            type='date'
            placeholder='Search your saved files Till...'
            className={cx(styles.searchBox, styles.dateInput)}
            value={this.state.toDate}
            name='toDate'
            onChange={this.handleSearchBoxChange}
            onKeyUp={this.handleSearch}
          />
        </div>
        <div>
          <button className={styles.searchBtn} onClick={this.handleDateSearch}>
            Search
          </button>
        </div>
        </div> */}
        
        {get(savedCodeStatus, "fetchSavedCode.loading") && (
          <div className={styles.loaderContainer}>
            <SimpleButtonLoader
              showLoader
              style={{
                backgroundImage: "linear-gradient(to bottom, transparent, transparent)"
              }}
            />
          </div>
        )}
        {get(savedCodeStatus, "fetchSavedCode.success") && (
          <div className={styles.savedCodeWrapper}>
            {this.renderSavedCodes()}
            <div className={styles.paginationHolder}>
              {this.renderPagesCount()}
            </div>
          </div>
        )}
        <div
          onClick={e => {
            e.persist()
            if (e.target.className.includes('SubmitOverlayMenu_container')) {
              this.closeOverlay()
            }
          }}
        >
          <SubmitOverlayMenu
            title="Delete Confirm"
            visible={this.state.showConfirmMsg}
            onDelete={this.handleDelete}
            message="Do you want to delete this file?"
            closeOverlay={this.closeOverlay}
            deleteOverlay
            closeImmediately={true}
            style={{
              zIndex: 1000
            }}
          />
        </div>
        <div className={styles.phoneMargin}></div>
      </div>
    );
  }
}

export default withArrowScroll(
  withRouter(CodePlayground),
  "tk-route-container"
);
