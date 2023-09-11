import React, { Component } from "react";
// import AceEditor from "react-ace";
import cx from "classnames";
import { get, filter, debounce, forOwn } from "lodash";
import qs from 'query-string'
import { hs } from "../../utils/size";
import 'react-phone-input-2/lib/style.css'
// import "ace-builds/src-noconflict/mode-html";
// import "ace-builds/src-noconflict/theme-nord_dark";
import { Link, withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import 'react-phone-input-2/lib/style.css'
import styles from "./webEditorStyle.module.scss";
import { ArrowIcon } from "../../components/Buttons/ArrowButton";
import ActionButton from "../../components/Buttons/ActionButton";
import SimpleButtonLoader from "../../components/SimpleButtonLoader";
import Header from '../CodeShowcaseModule/components/Header'
import fetchSavedCodeSingle from "../../queries/saveCode/fetchSavedCodeSingle";
import addSaveCode from "../../queries/saveCode/addSaveCode";
import updateSaveCode from "../../queries/saveCode/updateSaveCode";
import { getToasterBasedOnType } from "../../components/Toaster";
import { DesktopOnly, MobileOnly } from '../../components/MediaQuery'
import AuthModalContainer from '../CodeShowcaseModule/components/AuthModalContainer'
import CheckBox from '../../components/CheckBox/checkBox';
import EditorHeader from "./components/EditorHeader";
import "./editor.scss";
import "./resizer.css";
import Output from './Output'
import requestToGraphql from "../../utils/requestToGraphql";
import isMobile from "../../utils/isMobile";
import { checkIfEmbedEnabled } from "../../utils/teacherApp/checkForEmbed";
import PlayButton from "./components/PlayButton";
import OutputHeader from "./components/OutputHeader";
import Dialog from "../../library/Dialog";
import SaveCodeDialog from './components/SaveCodeDialog';
import { CODE_PLAYGROUND, TEACHER_CODE_PLAYGROUND } from "../../constants/routes/routesPaths";
import duck from "../../duck";
import addUserApprovedCodeTags from "../../queries/approvedCodes/addUserApprovedCodeTags";
import PublishDialog from "./components/PublishDialog/PublishDialog";
import Alert from "../../library/Alert/Alert";
import { ReactComponent as CopyIcon } from '../../assets/icons/copy.svg'
import { APPROVED_FOR_DISPLAY, SAVED_CODE_STATUS } from "../../constants/savedCode/savedCodeStatus";
import CodeEditor from "./components/CodeEditor/CodeEditor";
import { addErudaToHead, updateConsole, onLoadErudaConsole, appendClassToCSSElmInCssCode } from './utils/console'
import { CheckmarkCircle, ClipBoardIcon, CopyOutlineIcon } from "../../constants/icons";
import cuid from "cuid";
import getMe from "../../utils/getMe";
import SplitPane from "../../library/SplitPane/SplitPane";


window.languagePluginUrl = "https://dsd4auyo4ifts.cloudfront.net/pyodideBundle/";

const isWASMSupported = () => {
  try {
    if (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    ) {
      if (typeof SharedArrayBuffer === 'undefined') return false
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );
      if (module instanceof WebAssembly.Module)
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
    }
  } catch (e) {
    return false;
  }
};


const failureToasterProps = e => ({
  type: 'error',
  message: e,
  autoClose: 4000
})


const getNumber = (function () {
  var previous = NaN;
  return function () {
    var min = 0;
    var max = 4 + (!isNaN(previous) ? -1 : 0);
    var value = Math.floor(Math.random() * (max - min + 1)) + min;
    if (value >= previous) {
      value += 1;
    }
    previous = value;
    return value;
  };
})();

class Editor extends Component {
  state = {
    codeString: "",
    initialCodeString: '',
    output: [],
    size: [0, 0],
    interpretorCodeString: "",
    interpretor: [],
    interpretorHistory: [],
    currentInterpretorHistory: [],
    currentLineTextInHistory: "",
    loading: false,
    initializingEditor: true,
    showSaveModal: false,
    isPublishDialogOpen: false,
    isPublishing: false,
    mobileOutputShow: false,
    refOutput: false,
    saveCode: {
      fileName: "untitled",
      description: "",
      updatedAt: null,
      hasRequestedByMentee: false,
      isApprovedForDisplay: false,
    },
    isSplitting: false,
    tags: [],
    savingCode: false,
    isSignInModalVisible: false,
    isSignUpModalVisible: false,
    rightAnswerActive: false,
    uniqueId: cuid(),
    outputCodeString: '',
    sizes: [1, 1],
    liveCodeToggle: false,
    isSettingButtonActive: false,
    showLockedAlert: false,
    isPreview: false,
    isCodeGarageButtonTooltipOpen: false,
    copyClicked: false,
    pasteClicked: false,
  };


  interpretorCanMultiline = false;

  currentHistoryIndex = 0;
  currentRuns = 1;

  outputRef = React.createRef()

  outputId = this.props.index
    ? "__editor__outputContainer__" + this.props.index
    : "__editor__outputContainer";
  interpretorId = this.props.index
    ? "__interpretor__" + this.props.index
    : "__interpretor__";

  getEditorId = () => (this.props.editorKey ? this.props.editorKey : "editor");

  async fetchCodeByIdAndSaveInState() {
    const { fromCodeShowCasePage = false } = this.props
    if (fromCodeShowCasePage || !get(this.props, "match.params.id")) return true;
    const { userSavedCode } = await fetchSavedCodeSingle(get(this.props, "match.params.id")).call();
    if (userSavedCode) {
      if (!this.state.initialCodeString) this.setState({ initialCodeString: userSavedCode.code })
      this.setState({
        codeString: userSavedCode.code || "",
        outputCodeString: userSavedCode.code || "",
        saveCode: {
          fileName: userSavedCode.fileName,
          description: userSavedCode.description || "",
          updatedAt: userSavedCode.updatedAt,
          hasRequestedByMentee: userSavedCode.hasRequestedByMentee,
          isApprovedForDisplay: userSavedCode.isApprovedForDisplay,
        },
      });
    }
  }

  async componentDidMount() {
    this.initEditor()

    const codePlaygroundParams = qs.parse(window.location.search)
    const { chat: chatCode, slide: slideId } = codePlaygroundParams

    if (get(this.props, "location.state.showCode")) {
      const showCode = get(this.props, "location.state.showCode");
      this.setState({
        initialCodeString: get(showCode, "code"),
        codeString: get(showCode, "code"),
        outputCodeString: get(showCode, "code"),
        saveCode: {
          fileName: get(showCode, "fileName"),
          description: get(showCode, "description") || "",
          updatedAt: get(showCode, "updatedAt"),
          hasRequestedByMentee: get(showCode, 'hasRequestedByMentee', false),
        },
        saveCodeId: get(showCode, "id"),
      });
    } else if (get(this.props, "match.params.id")) {
      await this.fetchCodeByIdAndSaveInState()

    } else if (chatCode) {
      this.fetchCodeFromChat(chatCode)
    } else if (slideId) {
      this.fetchCodeFromSlide(slideId)
    }

    if (this.props.codeString) {
      this.setState({
        codeString: this.props.codeString,
        outputCodeString: this.props.codeString,
        initialCodeString: this.props.codeString,
      });
    }

    // document
    //   .querySelector(".ace_text-input")
    //   .addEventListener("change", (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //   });

    // if the code is published or in review, show the lock icon
    if (Boolean(this.getSavedCodeStatus())) {
      this.openLockedAlert();
    }

    // there is codeString in the local storage, load it
    if (localStorage.getItem("codeString") && this.props.match.path === CODE_PLAYGROUND) {
      this.setState({
        codeString: localStorage.getItem("codeString"),
        initialCodeString: localStorage.getItem("codeString")
      });
    }
  }

  async fetchCodeFromChat(id) {
    this.setState({ loading: true })
    const res = await requestToGraphql(`{
      message(id: "${id}") {
        terminalOutput
      }
    }`)
    this.setState({ loading: false })
    const code = get(res, 'data.message.terminalOutput')
    this.setState({
      codeString: code,
      initialCodeString: code,
      outputCodeString: code,
    })
  }


  async fetchCodeFromSlide(id) {
    this.setState({ loading: true })
    const res = await requestToGraphql(`{
      learningSlideContent(id:"${id}"){
        id
        codeOutput
      }
    }`)
    this.setState({ loading: false })
    const codeOutput = get(res, 'data.learningSlideContent.codeOutput')
    this.setState({
      codeString: codeOutput,
      outputCodeString: codeOutput,
    })
  }





  initEditor = () => {
    if (
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.codeString
    ) {
      this.setState(
        { codeString: this.props.location.state.codeString },
        () => {
          this.runCode();
        }
      );
    }
    if (this.props.codeString !== undefined) {
      this.setState({
        codeString: this.props.codeString,
        outputCodeString: this.props.codeString,
      });
    } else if (this.props.initialCodeString) {
      this.setState({
        codeString: this.props.initialCodeString,
        outputCodeString: this.props.initialCodeString,
        initialCodeString: this.props.codeString,
      });
    }
  };



  componentDidUpdate(prevProps, prevState) {
    const { shouldUpdate } = this.props;
    const savedCodeStatusPrev =
      get(prevProps, "savedCodeStatus") &&
      get(prevProps, "savedCodeStatus").toJS();
    const savedCodeStatus =
      get(this.props, "savedCodeStatus") &&
      get(this.props, "savedCodeStatus").toJS();
    if (
      get(savedCodeStatusPrev, "fetchSavedCode.loading") &&
      get(savedCodeStatus, "fetchSavedCode.success")
    ) {
      const savedCode =
        get(this.props, "savedCode") && get(this.props, "savedCode").toJS();
      const showCode = filter(
        savedCode,
        (code) => get(code, "id") === get(this.props, "match.params.id")
      );
      if (showCode.length) {
        this.setState({
          codeString: get(showCode, "0.code"),
          outputCodeString: get(showCode, "0.code"),
          saveCode: {
            fileName: get(showCode, "0.fileName"),
            description: get(showCode, "0.description") || "",
            hasRequestedByMentee: get(showCode, '0.hasRequestedByMentee', false)
          },
          isReviewRequested: get(showCode, '0.hasRequestedByMentee', false),
          isCodePublished: get(showCode, '0.userApprovedCode.status', false) === 'published',
          saveCodeId: get(showCode, "0.id"),
        });
      }
    }
    if (shouldUpdate && !prevProps.shouldUpdate) {
      this.setState({
        codeString: this.props.initialCodeString,
        outputCodeString: this.props.initialCodeString,
      });
    }

    if (this.state.size !== prevState.size) {
      window.dispatchEvent(new Event("resize"));
    }

    if (this.props.codeString !== undefined) {
      // if ((this.props.codeString !== this.state.codeString) && this.state.liveCodeToggle) {
      //   this.setState({
      //     codeString: this.props.codeString,
      //     outputCodeString: this.props.codeString,
      //   });
      // }
      if (get(this.props, 'fromReportPage') && (this.props.codeString !== this.state.codeString)) {
        this.setState({
          codeString: this.props.codeString,
          outputCodeString: this.props.codeString,
        });

      }
    }

    if (this.props.isSeeAnswers !== prevProps.isSeeAnswers) {
      if (this.props.isSeeAnswers) {
        this.setState(
          { codeString: this.props.answerCodeSnippet },
          () =>
            this.props.onChange &&
            this.props.onChange(
              this.state.codeString,
              this.props.editorKey
            )
        );
      } else {
        this.setState(
          {
            codeString: this.props.initialCodeString,
          },
          () =>
            this.props.onChange &&
            this.props.onChange(
              this.state.codeString,
              this.props.editorKey
            )
        );
      }
    }

    if (this.props.match.path !== prevProps.match.path) {
      this.setState(
        {
          codeString: "",
          outputCodeString: "",
          output: [],
          size: [0, 0],
          interpretorCodeString: "",
          interpretor: [],
          interpretorHistory: [],
          currentInterpretorHistory: [],
          currentLineTextInHistory: "",
        },
        () => {
          this.initEditor();
        }
      );
    }

    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.fetchCodeByIdAndSaveInState()
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      const userId = getMe().id
      if (!get(this.state, "saveCodeId") && this.props.match.path === CODE_PLAYGROUND && userId && window) {
        localStorage.setItem("codeString", this.state.codeString);
      }
    }
  }

  tagsChangeHandler = (tags) => {
    this.setState({
      tags,
    });
  };

  handleSaveCodeChange = (e) => {
    // e.stopPropagation();
    // e.persist();
    const { saveCode } = this.state;
    this.setState({
      saveCode: {
        ...saveCode,
        [e.target.name]: e.target.value,
      },
    });
  };

  onPreviewClick = () => {
    this.setState({ liveCodeToggle: !this.state.liveCodeToggle, isPreview: !this.state.isPreview });
  }


  openSaveModal = (e) => {
    this.setState({
      showSaveModal: true,
    });
  };

  closeSaveModal = () => {
    this.setState({
      showSaveModal: false,
    });
  };

  checkIfMulitpleChildrenExists = () => {
    const { hasMultipleChildren } = this.props
    if (hasMultipleChildren) {
      this.props.history.push({
        pathname: '/switch-account',
        state: {
          redirectURL: '/code-playground'
        }
      })
    }
  }

  checkIfUserLoggedIn = async () => {
    const { loggedInUserId } = this.props
    if (!loggedInUserId) {
      this.checkIfMulitpleChildrenExists()
      // this.setState({
      //   isSignInModalVisible: true
      // })
      this.props.history.push('/login')
      return false
    }
    return true
  }

  getSavedCodeStatus = () => {
    const { hasRequestedByMentee, isApprovedForDisplay } = this.state.saveCode;
    if (hasRequestedByMentee && isApprovedForDisplay === APPROVED_FOR_DISPLAY.PENDING) {
      return SAVED_CODE_STATUS.IN_REVIEW;
    }

    if (hasRequestedByMentee && isApprovedForDisplay === APPROVED_FOR_DISPLAY.ACCEPTED) {
      return SAVED_CODE_STATUS.PUBLISHED;
    }
  };

  updateSavedCode = async () => {
    this.setState({
      savingCode: true,
    });

    // remove .html from the file name
    const fileName = this.state.saveCode.fileName.replace(/.html/g, "");
    await updateSaveCode(get(this.state, "saveCodeId"), {
      code: this.state.codeString,
      fileName: fileName,
      description: this.state.saveCode.description || '',
    }).call();
    this.setState({
      savingCode: false,
    });

    this.fetchCodeByIdAndSaveInState()

  };

  updateSavedCodefn = this.props.updatedSaveCode || this.updateSavedCode;
  updateSavedCodeDebounced = debounce(this.updateSavedCodefn, 3000);

  saveCode = async (e) => {
    e.preventDefault();
    const isLoggedIn = await this.checkIfUserLoggedIn()
    if (isLoggedIn) {
      if (this.state.savingCode) return;
      this.setState({
        savingCode: true,
      });
      const userId = get(this.props, 'loggedInUserId');
      if (get(this.state, "saveCodeId")) {
        this.updateSavedCode();
      } else {
        // remove .html from the file name
        const fileName = this.state.saveCode.fileName.replace(/.html/g, "");
        const data = await addSaveCode(userId, {
          code: this.state.codeString,
          languageType: "markup",
          fileName: fileName,
          description: this.state.saveCode.description,
        }).call();
        this.setState({
          saveCodeId: get(data, "addUserSavedCode.id"),
          isCodeGarageButtonTooltipOpen: true,
        });
        const urlString = this.props.managementApp ? `${TEACHER_CODE_PLAYGROUND}/${get(data, "addUserSavedCode.id")}?language=${get(data, "addUserSavedCode.languageType")}` : `${CODE_PLAYGROUND}/${get(data, "addUserSavedCode.id")}?language=${get(data, "addUserSavedCode.languageType")}`
        this.props.history.replace(urlString)
      }
      getToasterBasedOnType({
        type: "success",
        autoClose: 10000,
        message: `
            Code Saved!!!
            Click here to see all your saved codes.
          `,
      });
      this.setState({
        showSaveModal: false,
        savingCode: false,
      });

      // remove codeString from local storage
      localStorage.removeItem("codeString");
    }
  };

  openPublishDialog = () => {
    this.setState({
      isPublishDialogOpen: true,
    });
  };

  closePublishDialog = () => {
    this.setState({
      isPublishDialogOpen: false,
    });
  };

  requestForPostingInCommunity = async () => {
    this.setState({
      isPublishing: true,
    });

    // filter tags that have id
    const tagsWithId = this.state.tags.filter((tag) => tag.id);

    // create an array of ids
    const tagIds = tagsWithId.map((tag) => tag.id);

    // filter tags that don't have id
    const tagsWithoutId = this.state.tags.filter((tag) => !tag.id);

    // create tags that don't have id
    if (tagsWithoutId.length) {
      const tags = await addUserApprovedCodeTags(tagsWithoutId).call();

      // loop through the tags and add the id to the tagIds array
      forOwn(tags, (tag) => {
        tagIds.push(
          tag.id
        );
      });
    }

    await updateSaveCode(get(this.state, "saveCodeId"), {
      fileName: this.state.saveCode.fileName,
      description: this.state.saveCode.description || '',
      hasRequestedByMentee: true,
    }, tagIds).call();

    getToasterBasedOnType({
      type: "success",
      message: "Your request has been sent to the community",
    });

    this.setState({
      isPublishing: false,
    });


    this.fetchCodeByIdAndSaveInState()
    this.closePublishDialog();
  };

  clearInterpretor = () => {
    this.outputRef.current.clear()
  }

  cancelSaveCode = (e) => {
    e.stopPropagation();
    const showCode = get(this.props, "location.state.showCode");
    if (showCode) {
      this.setState({
        showSaveModal: false,
        saveCode: {
          fileName: get(showCode, "fileName"),
          description: get(showCode, "description") || "",
          hasRequestedByMentee: get(showCode, "hasRequestedByMentee", false),
          id: get(showCode, "id"),
        },
      });
    } else {
      this.setState({
        showSaveModal: false,
        saveCode: {
          fileName: "main",
          description: "",
          hasRequestedByMentee: get(this.state, "saveCode.hasRequestedByMentee", false),
        },
      });
    }
  };


  runCode = (codeString) => {
    this.setState({ outputCodeString: codeString })
    // updateConsole(codeString,this.state.uniqueId)
  }

  runCodeDebounced = debounce(this.runCode, 500)

  arrow = () => {
    const arrowStyle = this.props.arrowStyle ? this.props.arrowStyle : {};
    return (
      <div
        style={{
          minWidth: 10,
          maxWidth: 10,
          minHeight: 17.2,
          maxHeight: 17.2,
          position: "relative",
          top: 10,
          transform: "rotate(180deg)",
          ...arrowStyle,
        }}
      >
        <ArrowIcon
          style={{
            position: "relative",
            top: -10,
          }}
        />
      </div>
    );
  };

  isCustomHeaderVisible = () => {
    const { loggedInUserId, match } = this.props
    if ((!loggedInUserId || isMobile()) && match.path.split('/').includes('code-playground')) {
      return true
    }
    return false
  }

  onCodeStringChange = (codeString, event) => {
    this.setState(
      { codeString },
      () => {
        this.props.onChange &&
          this.props.onChange(
            this.state.codeString,
            this.props.editorKey
          )
      }
    )
    if (this.state.liveCodeToggle) {
      this.runCodeDebounced(codeString)
    }

    if (get(this.props.match, "params.id") || this.props.updatedSaveCode) {
      // check if initial code is same as current code
      if (this.state.initialCodeString !== codeString) {
        this.updateSavedCodeDebounced();
      }
    }
  }

  // get content and props for locked alert
  getLockedAlertContent = () => {
    const content = {};
    if (this.getSavedCodeStatus() === SAVED_CODE_STATUS.IN_REVIEW) {
      content.text = "File is locked while it is in the review stage. Editing will be allowed after teacher has given comments.";
    }

    if (this.getSavedCodeStatus() === SAVED_CODE_STATUS.PUBLISHED) {
      content.text = "File is locked. To edit this file duplicate it and make changes.";
      content.buttonText = "Duplicate";
      content.buttonIcon = <CopyIcon />;
      content.onClick = this.duplicateCode;
    }

    return content;
  };

  // close code garage button tooltip
  closeCodeGarageButtonTooltip = () => {
    this.setState({
      isCodeGarageButtonTooltipOpen: false,
    });
  };

  // get editor header title
  getEditorHeaderTitle = () => {
    if (get(this.props, 'codeFileName', false)) {
      return get(this.props, 'codeFileName').slice(0, 10)
    }

    // append .py extension if not present
    if (!get(this.state, 'saveCode.fileName', '').includes('.html')) {
      return `${this.state.saveCode.fileName}.html`
    }

    return this.state.saveCode.fileName
  };

  onCopyCodeButtonClick = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(this.state.codeString);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = this.state.codeString;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    this.setState({ copyClicked: true })
    let timer = setInterval(() => {
      this.setState({ copyClicked: false })
    }, 2000);
    return () => clearTimeout(timer)
  }

  onPasteButtonCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      this.setState({ codeString: text })
    } catch (error) {
      console.log('Error reading clipboard data:', error);
    }
    this.setState({ pasteClicked: true })
    let timer = setInterval(() => {
      this.setState({ pasteClicked: false })
    }, 2000);
    return () => clearTimeout(timer)
  }
  currentLanguage = () => {
    const language = get(this.props, 'editorMode') || "markup";
    return language;
  }
  renderEditor = () => {
    const isCodePublished = get(this.props, "location.state.isCodePublished", this.state.isCodePublished);
    const isReviewRequested = get(this.props, "location.state.showCode.hasRequestedByMentee", this.state.isReviewRequested);
    const language = this.currentLanguage();
    return (
      <>
        <div className={styles.editorContainer}>
          <CodeEditor
            readOnly={Boolean(this.getSavedCodeStatus()) || (get(this.props, "readOnly"))}
            language={language}
            value={this.state.codeString}
            onChange={(codeString) => {
              this.onCodeStringChange(codeString)
            }}
          >

          </CodeEditor>
          {!this.state.loading ? <span className="code-playgroud-page-mixpanel-identifier" /> : null}
          {this.state.loading ? (
            <SimpleButtonLoader
              showLoader
              customClassName={this.props.customLoadingIcon || styles.LoadingIcon}
            />
          ) : (
            <>
              <MobileOnly>

                <PlayButton style={{ zIndex: 99 }} runCode={() => this.runCode(this.state.codeString)} runButton={this.props.runButton} playButton={styles.playButton} setWebState={this.state} />
              </MobileOnly>
              <DesktopOnly>
                {(language !== "java" && !this.state.liveCodeToggle) ? (
                  <PlayButton runCode={() => this.runCode(this.state.codeString)} runButton={this.props.runButton} playButton={styles.playButton} />
                ) : null}
                {this.props.editorMode === 'java' && !get(this.props, 'fromReportPage') &&
                  <div className={styles.copyReplaceButtonContainer}>
                    {!this.state.copyClicked && <button className={styles.copyButton} onClick={this.onCopyCodeButtonClick}>
                      <CopyOutlineIcon height="21" width="21" fill={'white'} />
                      <p>Copy  Code</p>
                    </button>}
                    {this.state.copyClicked && <button className={styles.copyButton} >
                      <CheckmarkCircle height="21" width="21" color="#01AA93" />
                      <p>Copied</p>
                    </button>
                    }
                    {!this.state.pasteClicked && <button className={styles.copyButton} onClick={this.onPasteButtonCode}>
                      <ClipBoardIcon height="21" width="21" />
                      <p>Paste & Replace Code</p>
                    </button>}
                    {this.state.pasteClicked && <button className={styles.copyButton} >
                      <CheckmarkCircle height="21" width="21" color="#01AA93" />
                      <p>Code Replaced</p>
                    </button>
                    }
                  </div>
                }
              </DesktopOnly>
            </>
          )}
          {/* {(get(this.props, "match.path").includes("/code-playground") && !checkIfEmbedEnabled()) && (
              <button
                className={styles.saveButton}
                disabled={!this.state.codeString || this.state.savingCode}
                onClick={this.openSaveModal}
              >
                <div
                  className={cx(
                    styles.saveModal,
                    this.state.showSaveModal
                      ? styles.showSaveModal
                      : styles.hideSaveModal
                  )}
                >
                  <p>
                    Give your playground a friendly name so you can easily
                    find it later.
                  </p>
                  <input
                    type="text"
                    name="fileName"
                    placeholder="Name"
                    onChange={this.handleSaveCode}
                    value={this.state.saveCode.fileName}
                  />
                  <textarea
                    type="text"
                    name="description"
                    placeholder="Description"
                    onChange={this.handleSaveCode}
                    value={this.state.saveCode.description}
                  />
                  {isReviewRequested || isCodePublished ? (
                    null
                  ) : (
                    <div className={styles.postOnCommunityBtn}>
                      <div className={styles.checkBoxContainer}>
                        <CheckBox
                            onChange={(e) => {
                                const { saveCode } = this.state;
                                this.setState({
                                  saveCode: {
                                    ...saveCode,
                                    hasRequestedByMentee: e.target.checked,
                                  },
                                });
                              }}
                            value={this.state.saveCode.hasRequestedByMentee}
                        />
                      </div>
                      <span
                        onClick={() => {
                          const { saveCode } = this.state;
                          this.setState({
                            saveCode: {
                              ...saveCode,
                              hasRequestedByMentee: !get(saveCode, 'hasRequestedByMentee', false)
                            }
                          })
                        }}
                      >
                        Post On Community
                      </span>
                    </div>
                  )}
                  <div className={styles.actionContainer}>
                    <button
                      className={styles.roundedButtons}
                      onClick={this.saveCode}
                      disabled={
                        !this.state.codeString ||
                        !this.state.saveCode.fileName
                      }
                      style={{
                        border: "none",
                      }}
                    >
                      Save
                    </button>
                    <div
                      className={cx(
                        styles.roundedButtons,
                        styles.cancelButton
                      )}
                      onClick={this.cancelSaveCode}
                    >
                      Cancel
                    </div>
                  </div>
                </div>
              </button>
            )} */}
        </div>
      </>



    )
  }

  // locked alert handlers
  openLockedAlert = () => {
    this.setState({
      showLockedAlert: true,
    });
  };

  closeLockedAlert = () => {
    this.setState({
      showLockedAlert: false,
    });
  };

  renderToggle = () => {
    return (
      <div className={cx(styles.toggleContainer, this.props.refOutputActive && styles.active)} onClick={this.props.onOutputClick}>
        <div className={cx(styles.toggleSwitch, this.props.refOutputActive && styles.active)}>
        </div>
      </div>
    )
  }

  renderOutput = (title, codeString) => {
    const userCode = codeString ? codeString : (this.state.outputCodeString || this.props.initialCodeString)
    let htmlCode = `<div id="user-code-output">${userCode || ""}</div> `
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(htmlCode, "text/html");
    // const styleForCode = htmlDoc.querySelectorAll("style")
    // styleForCode.forEach(style => {
    //   style.innerHTML = appendClassToCSSElmInCssCode(style.innerHTML)
    // })
    htmlCode = htmlDoc.documentElement.outerHTML
    const modifiedCode = !title ? addErudaToHead(htmlCode) : htmlCode
    // there can be multiple output panes on the same page so we need to make sure that the iframe has a unique id.
    const id = `previewOutput-${this.state.uniqueId}`

    return (
      <>
        <div className={styles.outputPane}>
          <div style={{ height: "100%" }}>
            {title ? null : <OutputHeader togglePreview={() => this.onPreviewClick()} toggleState={this.state.isPreview} openPublishDialog={this.openPublishDialog} savedCodeStatus={this.getSavedCodeStatus()} savedCodeId={get(this.state, "saveCodeId")} openEditSavedCodeDialog={this.openSaveModal} fromReportPage={get(this.props, 'fromReportPage')} userCode={userCode} fromCodeShowCasePage={get(this.props, 'fromCodeShowCasePage', false)} />}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1
              }}
            >
              <iframe
                srcDoc={modifiedCode}
                className={styles.previewIframe}
                title="Preview Editor"
                id={!title ? id : ''}
                onLoad={() => {
                  if (title) return;
                  const iframe = document.getElementById(id);
                  onLoadErudaConsole(iframe);

                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '0px',
                  pointerEvents: this.state.isSplitting ? 'none' : 'auto',
                  background: "transparent",
                  width: '100%',
                  height: '100%',

                }}
                className="overlay"></div>
            </div>


          </div>
        </div>

      </>
    );
  }
  render() {
    const { source } = this.props
    const lockedAlertContent = this.getLockedAlertContent();
    console.log('render', this.props)
    return (
      <>
        <Helmet>
          <link rel="canonical" href="https://www.tekie.in" />
          <title>Tekie - Free online code playground for students.</title>
          <meta name="description" content="Welcome to Tekie Playground! Practice coding assignments after every live session on your own terms, at your own pace."></meta>
          <meta name="keywords" content="tekie,tekie coding,tekie in,tekie app,tekie coding classes,tekie review,tekie classes,tekie india,tekie online coding,tekie online class,tekie online demo,python for kids,coding for kids,best python course for kids,python coding for kids, online coding platform for python, python online course for kids,best coding classes for kids,live online coding classes for kids, best coding classes for kids, best programming courses for kids,online coding programs for kids,programming classes for kids" />
        </Helmet>
        {source !== 'ind-code-showcase' ? (
          <Link to="/my-code">

          </Link>
        ) : null}
        {this.isCustomHeaderVisible() && (
          <Header
            logoClickable
            positionFixed={false}
            openEnrollmentForm={() => {
              this.setState({
                isSignUpModalVisible: true
              })
            }}
            openLogin={() => {
              this.props.history.push('/login')
            }}
          />
        )}

        <Output clearInterpreter={this.clearInterpretor} style={{ display: 'none' }} ref={this.outputRef} isWASMSupported={isWASMSupported()} id={this.getEditorId()} loading={this.state.loading} />
        {/* TEMP */}
        <div className={styles.container} id="editor-page-container" style={{
          height: `${this.isCustomHeaderVisible() ? 'calc(100vh - 65px)' : (get(this.props, "match.path").includes("/code-playground") && checkIfEmbedEnabled()) ? '100vh' : '100%'}`
        }}>
          <DesktopOnly>
            <div className={styles.webEditorContainer}>
              <SplitPane
                split="vertical"
                showResizer={this.currentLanguage() !== 'java'}
                sizes={this.state.sizes}
                onChange={(newSize) => {
                  this.setState({ isSplitting: false })
                  this.setState({ sizes: newSize })
                }}
                onMouseLeave={() => {
                  this.setState({ isSplitting: true })
                }}
              >
                <div style={{
                  display: "flex", width: '100%',
                  flexDirection: 'column', height: '100%'
                }}>
                  <EditorHeader
                    mode={this.currentLanguage()}
                    type={this.props.type}
                    fileName={this.fileNameClass}
                    showSave={this.props.showSave}
                    isSave={this.props.isSave}
                    openEditSavedCodeDialog={this.openSaveModal}
                    isSaveButtonDisabled={!get(this.state, "codeString") || !get(this.state, "codeString").trim() || this.state.savingCode}
                    showSaveButton={!get(this.props, "match.params.id")}
                    lastSavedAt={this.state.saveCode.updatedAt}
                    showSaveModal={this.openSaveModal}
                    toggleOutput={() => this.props.onOutputClick()}
                    toggleState={this.props.refOutputActive}
                    title={this.getEditorHeaderTitle()}
                    savedCodeStatus={(this.getSavedCodeStatus())}
                    hideEditorHeaderActions={this.props.hideEditorHeaderActions}
                    isCodeGarageButtonTooltipOpen={this.state.isCodeGarageButtonTooltipOpen}
                    closeCodeGarageButtonTooltip={this.closeCodeGarageButtonTooltip}
                    fromReportPage={get(this.props, 'fromReportPage')}
                    codeEditorCode={this.state.codeString}
                    courseId={get(this.props, 'match.params.courseId')}
                    fromCodeShowCasePage={get(this.props, 'fromCodeShowCasePage', false)}
                    managementApp={this.props.managementApp}
                  />
                  {this.props.refOutputActive ? this.renderOutput('Refrence Output', this.props.answerCodeSnippet) : this.renderEditor()}

                </div>
                {this.props.editorMode !== 'java' && <div style={{
                  display: "flex", width: '100%',
                  flexDirection: 'column', height: '100%'
                }}>
                  {this.props.editorMode === 'java' ? '' : this.renderOutput()}
                </div>}

              </SplitPane>


            </div>
          </DesktopOnly>
          {/* <MobileOnly style={{ width: '100%' }}>
            <div className={styles.mobileBodyContainer}>
              <div style={{ minWidth: '100vw', }}>
                {this.renderEditor()}
              </div>
              <div style={{ minWidth: '100vw', position: 'relative', zIndex: 99, transition: '0.2s all cubic-bezier(.23,.44,.27,.89)' }} className={this.state.mobileOutputShow ? styles.mobileOutputShow : styles.mobileOutputHidden}>
                {this.renderOutput()}
              </div>
            </div>
          </MobileOnly> */}
        </div>
        {this.props.answerCodeSnippet && this.props.isMentor && (
          <div className={styles.bottomToolbar}>
            <ActionButton
              title="Show Answer"
              hideIconContainer
              onClick={() => {
                this.setState(
                  { codeString: this.props.answerCodeSnippet },
                  () =>
                    this.props.onChange &&
                    this.props.onChange(
                      this.state.codeString,
                      this.props.editorKey
                    )
                );
              }}
              buttonContainer={styles.buttonContainer}
              buttonText={styles.buttonText}
            />
          </div>
        )}
        {(this.props.isSubmittedForReview && this.props.newFlow) && (
          <div className={styles.bottomToolbar}>
            <div className={styles.slideText}>{this.state.rightAnswerActive ? 'Right' : 'Your'} Answer</div>
            <label class={styles.switch}>
              <input type="checkbox"
                value={!this.state.rightAnswerActive}
                onClick={() => {
                  this.setState(
                    {
                      codeString: this.state.rightAnswerActive ? this.props.initialCodeString : this.props.answerCodeSnippet,
                      rightAnswerActive: !this.state.rightAnswerActive
                    },
                    () =>
                      this.props.onChange &&
                      this.props.onChange(
                        this.state.codeString,
                        this.props.editorKey
                      )
                  );
                }}
              />
              <span class={cx(styles.slider, styles.round)}></span>
            </label>
          </div>
        )}
        {source !== 'ind-code-showcase' ? (
          <AuthModalContainer
            source='editorComponent'
            isSignInModalVisible={this.state.isSignInModalVisible}
            isSignUpModalVisible={this.state.isSignUpModalVisible}
            openEnrollmentForm={() => {
              this.setState({
                isSignUpModalVisible: true
              })
            }}
            closeLoginModal={() => {
              this.setState({
                isSignInModalVisible: false
              })
            }}
            closeSignupModal={() => {
              this.setState({
                isSignUpModalVisible: false
              })
            }}
          />
        ) : null}

        <Dialog open={this.state.showSaveModal} onClose={this.closeSaveModal}>
          <SaveCodeDialog
            title={get(this.state, "saveCodeId") && "Edit details"}
            values={
              {
                fileName: this.state.saveCode.fileName,
                description: this.state.saveCode.description,
              }
            }
            isSaving={this.state.savingCode}
            handleChange={this.handleSaveCodeChange}
            handleSubmit={this.saveCode}
            managementApp={this.props.managementApp}
          />
        </Dialog>
        {
          !this.props.type && (
            <>
              <PublishDialog
                savedCode={{
                  fileName: this.state.saveCode.fileName,
                  description: this.state.saveCode.description,
                  code: this.state.codeString,
                  tags: this.state.tags,
                }}
                handleSavedCodeChange={this.handleSaveCodeChange}
                tags={this.state.tags}
                tagsChangeHandler={this.tagsChangeHandler}
                handleSubmit={this.requestForPostingInCommunity}
                onClose={this.closePublishDialog}
                open={this.state.isPublishDialogOpen}
                isLoading={this.state.isPublishing}
              />

            </>
          )
        }

        <Alert
          persisting
          open={this.state.showLockedAlert}
          onClose={this.closeLockedAlert}
          buttonText={lockedAlertContent.buttonText}
          buttonIcon={lockedAlertContent.buttonIcon}
          onClick={lockedAlertContent.onClick}
        >
          {lockedAlertContent.text}
        </Alert>
      </>
    );
  }
}

export default withRouter(Editor); 