import React, { Component } from "react";
import { debounce, forOwn } from "lodash";
import cx from "classnames";
import { isString, get, filter } from "lodash";
import { hs, hvs } from "../../utils/size";
import is32BitArch from '../../utils/is32BitArch'
import requestToGraphql from "../../utils/requestToGraphql";
import SplitPane from "react-split-pane";
import { Link, withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import qs from 'query-string'
import insertCss from "./insertStyle";
import styles from "./styles.module.scss";
import webStyles from "./webEditorStyle.module.scss";
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
import "./editor.scss";
import "./resizer.css";
import Output from './Output'
import isMobile from "../../utils/isMobile";
import PyodideInterpreter from "./PyodideInterpreter";
import { checkIfEmbedEnabled } from "../../utils/teacherApp/checkForEmbed";
import EditorHeader from "./components/EditorHeader";
import PlayButton from "./components/PlayButton";
import OutputHeader from "./components/OutputHeader";
import { getCodePlayground } from "../../utils/getCourseId";
import Dialog from "../../library/Dialog";
import SaveCodeDialog from "./components/SaveCodeDialog";
import { CODE_PLAYGROUND, TEACHER_CODE_PLAYGROUND } from '../../constants/routes/routesPaths';
import PublishDialog from "./components/PublishDialog/PublishDialog";
import addUserApprovedCodeTags from "../../queries/approvedCodes/addUserApprovedCodeTags";
import { APPROVED_FOR_DISPLAY, SAVED_CODE_STATUS } from "../../constants/savedCode/savedCodeStatus";
import Alert from "../../library/Alert/Alert";
import { ReactComponent as CopyIcon } from '../../assets/icons/copy.svg'
import CodeEditor from "./components/CodeEditor/CodeEditor";
import getMe from "../../utils/getMe";
import { limitLoopIterations } from "./utils/limitLoopIterations";

window.languagePluginUrl = "https://dsd4auyo4ifts.cloudfront.net/pyodideBundle/";

let isElectron = typeof window !== 'undefined'
  ? get(window, 'native.isElectron', false)
  : window.native;

const isWASMSupported = (isMobile = false) => {
  if (is32BitArch()) return false
  try {
    if (isElectron) return false
    if (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    ) {
      if ((typeof SharedArrayBuffer === 'undefined') && !isMobile) return false
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

const replaceSpecialQuotes = (codeString) => {
  return codeString ? (codeString.replace(/“|”/g, '"') || '') : ''
}

class Editor extends Component {
  state = {
    codeString: "",
    output: [],
    size: [0, 0],
    interpretorCodeString: "",
    interpretor: [],
    interpretorHistory: [],
    currentInterpretorHistory: [],
    currentLineTextInHistory: "",
    loading: !isElectron,
    initializingEditor: true,
    showSaveModal: false,
    isPublishDialogOpen: false,
    isPublishing: false,
    mobileOutputShow: false,
    saveCode: {
      fileName: "untitled",
      description: "",
      updatedAt: null,
      hasRequestedByMentee: false,
      isApprovedForDisplay: false,
    },
    tags: [],
    savingCode: false,
    isSignInModalVisible: false,
    isSignUpModalVisible: false,
    rightAnswerActive: false,
    showLockedAlert: false,
    isCodeGarageButtonTooltipOpen: false,
  };

  runCodeRef = React.createRef()

  interpretorCanMultiline = false;

  currentHistoryIndex = 0;
  currentRuns = 1;

  outputRef = React.createRef()

  currentPromptResolve = () => { }

  outputId = this.props.index
    ? "__editor__outputContainer__" + this.props.index
    : "__editor__outputContainer";
  interpretorId = this.props.index
    ? "__interpretor__" + this.props.index
    : "__interpretor__";

  getEditorId = () => (this.props.editorKey ? this.props.editorKey : "editor");


  async fetchCodeByIdAndSaveInState() {
    const { fromCodeShowCasePage = false } = this.props;
    if (fromCodeShowCasePage || !get(this.props, "match.params.id")) return true;
    const { userSavedCode } = await fetchSavedCodeSingle(get(this.props, "match.params.id")).call();
    if (userSavedCode) {
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

    if (!isMobile() || !is32BitArch() || !isElectron) {
      if (isWASMSupported()) {
        // this.initInterpreter();
      }
    } else {
      if (!isWASMSupported(true)) {
        this.setState({ loading: false }, () => {
          setTimeout(() => {
            if (this.outputRef && this.outputRef.current) {
              this.outputRef.current.write('\r\n')
              this.outputRef.current.write("🧗   Support for your browser coming soon!\r\n")
              this.outputRef.current.write('\r\n')
              this.outputRef.current.write("🛠️   Please use latest desktop version of Chrome for now.")
            }
          }, 0)
        })
      }
    }
    if (get(this.props, "location.state.showCode")) {
      const showCode = get(this.props, "location.state.showCode");
      this.setState({
        initialCodeString: replaceSpecialQuotes(get(showCode, "code")),
        codeString: replaceSpecialQuotes(get(showCode, "code")),
        saveCode: {
          fileName: get(showCode, "fileName"),
          description: get(showCode, "description") || "",
          hasRequestedByMentee: get(showCode, 'hasRequestedByMentee', false),
        },
        saveCodeId: get(showCode, "id"),
      });
    } else if (get(this.props, "match.params.id")) {
      await this.fetchCodeByIdAndSaveInState();
    } else if (chatCode) {
      this.fetchCodeFromChat(chatCode)
    } else if (slideId) {
      this.fetchCodeFromSlide(slideId)
    }

    if (this.props.codeString) {
      this.setState({ codeString: replaceSpecialQuotes(this.props.codeString) });
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
      });
    }
  }

  async fetchCodeFromChat(id) {
    this.setState({ loading: true })
    const res = await requestToGraphql(`{
      message(id: "${id}") {
        terminalInput
      }
    }`)
    this.setState({ loading: false })
    const code = get(res, 'data.message.terminalInput')
    this.setState({
      codeString: replaceSpecialQuotes(code),
      // outputCodeString: code,
    }, () => {
      // if (isWASMSupported()) {
      this.runCode()
      // }
    })
  }

  async fetchCodeFromSlide(id) {
    this.setState({ loading: true })
    const res = await requestToGraphql(`{
      learningSlideContent(id:"${id}"){
        id
        codeInput
      }
    }`)
    this.setState({ loading: false })
    const code = get(res, 'data.learningSlideContent.codeInput', '') || ''
    this.setState({
      codeString: replaceSpecialQuotes(code),
      // outputCodeString: code,
    }, () => {
      // if (isWASMSupported()) {
      this.runCode()
      // }
    })
  }



  writeOutput = (text, isError) => {
    if (isError) {
      // replace temp file name with local file name
      let errorText = text.replace(/(?<=File ").*(?=")/, "./" + this.state.saveCode.fileName + ".py")
      // adjust line number ignoring patch up internal code
      errorText = errorText.replace(/line \d+/, (match) => {
        const tokens = match.split(" ")
        if (Number(tokens[1])) {
          tokens[1] = Number(tokens[1]) - 16
        }
        return tokens.join(" ")
      })

      if (errorText.indexOf('\n') === -1) {
        this.outputRef.current.write(`\x1b[38;5;203m${text}\x1b[0m`)
      } else {
        errorText.split('\n').forEach((outputText, i) => {
          this.outputRef.current.write(`\x1b[38;5;203m${outputText}\x1b[0m`)
          if (i !== text.split('\n').length - 1) {
            this.outputRef.current.write(`\r\n`)
          }
        })
      }
      return;
    }

    if (text.indexOf('\n') === -1) {
      this.outputRef.current.write(text)
    } else {
      text.split('\n').forEach((outputText, i) => {
        this.outputRef.current.write(outputText)
        if (i !== text.split('\n').length - 1) {
          this.outputRef.current.write('\r\n')
        }
      })
    }
  }
  initEditor = () => {
    if (isElectron) {
      window.native.onOutput((event, data) => {
        this.writeOutput(data.text, data.type === 'error')
      })
      window.native.shouldPrompt(() => {
        this.outputRef.current.prompt((res) => {
          window.native.prompt(res)
        })
      })
    }

    if (
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.codeString
    ) {
      this.setState(
        { codeString: replaceSpecialQuotes(this.props.location.state.codeString) },
        () => {
          this.runCode();
        }
      );
    }
    if (this.props.codeString !== undefined) {
      this.setState({
        codeString: replaceSpecialQuotes(this.props.codeString),
      });
    } else if (this.props.initialCodeString) {
      this.setState({
        codeString: replaceSpecialQuotes(this.props.initialCodeString),
      });
    }

    const splitPane = document.querySelector('[data-type="SplitPane"]')
    if (splitPane) {
      const splitPaneChildren = document.querySelector('[data-type="SplitPane"]')
        .children;
      if (splitPaneChildren && splitPaneChildren.length) {
        splitPaneChildren[0].setAttribute("id", "firstPane");
        splitPaneChildren[2].setAttribute("id", "secondPane");
        splitPaneChildren[0].style.minWidth = `${window.innerWidth * 0.3}px`;
        splitPaneChildren[2].style.minWidth = `${window.innerWidth * 0.1}px`;
      }
      this.newOutput = [];
    }
  };

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      const userId = getMe().id
      if (!get(this.state, "saveCodeId") && this.props.match.path === CODE_PLAYGROUND && userId && window) {
        localStorage.setItem("codeString", this.state.codeString);
      }
    }
    if (window.native) {
      window.native.offOutput();
      window.native.offShouldPrompt();
    }

  }

  manipulateResize = () => {
    const resizer = document.querySelector('div[data-type="Resizer"]');
    const title = document.querySelector("#__editor_title");
    resizer.style.position = "relative";

    const arrowLeft = document.createElement("div");
    arrowLeft.style.backgroundImage = `url("${require("./arrow.svg")}")`;
    arrowLeft.style.backgroundSize = "contain";
    arrowLeft.style.backgroundRepeat = "no-repeat";
    arrowLeft.style.width = hvs(17 * 0.9);
    arrowLeft.style.height = hvs(26 * 0.9);
    arrowLeft.style.position = "absolute";

    arrowLeft.style.top = `calc(50%)`;
    arrowLeft.style.left = hvs(-18);
  }


  componentDidUpdate(prevProps, prevState) {
    const { shouldUpdate } = this.props;
    // if isSave and showSave props changed, then update the props respecively


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
          codeString: replaceSpecialQuotes(get(showCode, "0.code")),
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
        codeString: replaceSpecialQuotes(this.props.initialCodeString),
      });
    }

    if (this.state.size !== prevState.size) {
      window.dispatchEvent(new Event("resize"));
    }

    if (this.props.codeString !== undefined) {
      if (prevProps.codeString !== this.props.codeString) {
        this.setState({
          codeString: replaceSpecialQuotes(this.props.codeString),
        });
      }
    }

    if (this.props.isSeeAnswers !== prevProps.isSeeAnswers) {
      if (this.props.isSeeAnswers) {
        this.setState(
          {
            codeString: this.props.answerCodeSnippet,
            initialCodeString: this.props.answerCodeSnippet,

          },
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

  handleSaveCodeChange = (e) => {
    const { saveCode } = this.state;
    this.setState({
      saveCode: {
        ...saveCode,
        [e.target.name]: e.target.value,
      },
    });
  };

  tagsChangeHandler = (tags) => {
    this.setState({
      tags: tags || [],
    });
  };

  openSaveModal = (e) => {
    this.setState({
      showSaveModal: true,
    });
  };

  closeSaveModal = (e) => {
    this.setState({
      showSaveModal: false,
    });
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

  // get the saved code status
  // if in review or published
  getSavedCodeStatus = () => {
    const { hasRequestedByMentee, isApprovedForDisplay } = this.state.saveCode;
    if (hasRequestedByMentee && isApprovedForDisplay === APPROVED_FOR_DISPLAY.PENDING) {
      return SAVED_CODE_STATUS.IN_REVIEW;
    }

    if (hasRequestedByMentee && isApprovedForDisplay === APPROVED_FOR_DISPLAY.ACCEPTED) {
      return SAVED_CODE_STATUS.PUBLISHED;
    }
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

  checkIfUserLoggedIn = (redirectToLogin = true) => {
    const { loggedInUserId } = this.props
    if (!loggedInUserId) {
      this.checkIfMulitpleChildrenExists()
      // this.setState({
      //   isSignInModalVisible: true
      // })
      if (redirectToLogin) {
        this.props.history.push('/login')
      }
      return false
    }
    return true
  }

  updateSavedCode = async () => {
    this.setState({
      savingCode: true,
    });

    // remove .py extension from file name using regex
    const fileName = this.state.saveCode.fileName.replace(/.py/g, "");
    const updateCode = await updateSaveCode(get(this.state, "saveCodeId"), {
      code: this.state.codeString,
      fileName: fileName,
      description: this.state.saveCode.description || '',
    }).call();
    this.setState({
      savingCode: false,
      updatedAt: get(updateCode, 'updatedAt', '')
    });
    // this.fetchCodeByIdAndSaveInState()
  };

  updateSavedCodefn = this.props.updatedSaveCode || this.updateSavedCode;
  updateSavedCodeDebounced = debounce(this.updateSavedCodefn, 3000);
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

    this.fetchCodeByIdAndSaveInState();
    this.closePublishDialog();
  };


  saveCode = async (e) => {
    e.preventDefault();
    const isLoggedIn = this.checkIfUserLoggedIn()
    if (isLoggedIn) {
      if (this.state.savingCode) return;
      this.setState({
        savingCode: true,
      });
      const userId = get(this.props, 'loggedInUserId');
      if (get(this.state, "saveCodeId")) {
        this.updateSavedCode();
      } else {
        // remove .py extension from file name using regex
        const fileName = this.state.saveCode.fileName.replace(/.py/g, "");
        const data = await addSaveCode(userId, {
          code: this.state.codeString,
          languageType: "python",
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

  openPrompt = () => {
    this.outputRef.current.prompt((res) => {
      this.currentPromptResolve(res)
    })
  }

  setPromptResolve = (resolve) => {
    this.currentPromptResolve = resolve
  }

  runCode = async (code) => {
    // window.native.runCode(isString(code) ? code : this.state.codeString);
    this.setState({ mobileOutputShow: true })
    let codeString = isString(code) ? code : this.state.codeString;
    if (isElectron) {
      window.native.runCode(codeString);
      return;
    }
    if (isMobile() || is32BitArch() || !isWASMSupported()) {
      this.setState({
        pythonCode: codeString,
      }, () => {
        this.runCodeRef.current.runCodeOnPlay()
      });
      return;
    }
    if (this.state.loading && !isWASMSupported()) return
    if (this.interpreter) {
      this.interpreter.runCode(
        codeString,
        () => {
          this.outputRef.current.blur()
        })
    }
  };

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

  // duplicate code handler
  duplicateCode = async () => {
    this.setState({
      savingCode: true,
    })

    const userId = get(this.props, 'loggedInUserId');
    const data = await addSaveCode(userId, {
      code: this.state.codeString,
      languageType: "python",
      fileName: `${this.state.saveCode.fileName} (Copy)`,
      description: this.state.saveCode.description,
    }).call();

    this.setState({
      saveCodeId: get(data, "addUserSavedCode.id"),
    });
    const urlString = this.props.managementApp ? `${TEACHER_CODE_PLAYGROUND}/${get(data, "addUserSavedCode.id")}?language=${get(data, "addUserSavedCode.languageType")}` : `${CODE_PLAYGROUND}/${get(data, "addUserSavedCode.id")}?language=${get(data, "addUserSavedCode.languageType")}`
    this.props.history.replace(`${CODE_PLAYGROUND}/${get(data, "addUserSavedCode.id")}?language=${get(data, "addUserSavedCode.languageType")}`)

    getToasterBasedOnType({
      type: "success",
      autoClose: 10000,
      message: `Code duplicated successfully.`,
    });

    this.setState({
      showLockedAlert: false,
      savingCode: false,
    });
  };

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
      content.buttonLoading = this.state.savingCode;
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
    if (!get(this.state, 'saveCode.fileName', '').includes('.py')) {
      return `${this.state.saveCode.fileName}.py`
    }

    return this.state.saveCode.fileName
  };

  renderEditor = () => {
    const isCodePublished = get(this.props, "location.state.isCodePublished", this.state.isCodePublished);
    return (
      <div className={styles.pane}>
        <div
          style={{ height: "100%", width: "100%" }}
          id="__editor__full__screen"
        >
          <EditorHeader
            type={this.props.type}
            mode="python"
            fileNameClass={this.props.fileNameClass}
            showSave={this.props.showSave}
            showSaveModal={this.openSaveModal}
            showSaveButton={!get(this.props, "match.params.id")}
            lastSavedAt={this.state.saveCode.updatedAt}
            isSaveButtonDisabled={!get(this.state, "codeString") || !get(this.state, "codeString").trim() || this.state.savingCode}
            isSave={this.props.isSave}
            openEditSavedCodeDialog={this.openSaveModal}
            title={this.getEditorHeaderTitle()}
            savedCodeStatus={(this.getSavedCodeStatus())}
            hideEditorHeaderActions={this.props.hideEditorHeaderActions}
            isCodeGarageButtonTooltipOpen={this.state.isCodeGarageButtonTooltipOpen}
            closeCodeGarageButtonTooltip={this.closeCodeGarageButtonTooltip}
            fromReportPage={get(this.props, 'fromReportPage', false)}
            fromCodeShowCasePage={get(this.props, 'fromCodeShowCasePage', false)}
            managementApp={this.props.managementApp}
          />

          <div className={styles.editorContainer}>
            <CodeEditor
              readOnly={Boolean(this.getSavedCodeStatus()) || (get(this.props, "readOnly"))}
              language="python"
              value={this.state.initialCodeString}
              onChange={(codeString) => this.onCodeStringChange(codeString)}
            >

            </CodeEditor>
            {this.state.loading ? (
              <SimpleButtonLoader
                showLoader
                customClassName={this.props.customLoadingIcon || styles.LoadingIcon}
              />
            ) : (
              <PlayButton runButton={this.props.runButton} playButton={styles.playButton} runCode={this.runCode} />
            )}
            {!this.state.loading ? <span className="code-playgroud-page-mixpanel-identifier" /> : null}
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
        </div>
      </div>
    )
  }

  renderOutput = () => {
    return (
      <div className={styles.pane}>
        {this.props.type === "assignment" && (
          <MobileOnly style={{}}>
            <div
              style={{
                zIndex: 99
              }}
              className={cx(styles.playButton, styles.editButton)}
              onClick={() => {
                this.setState({ mobileOutputShow: false });
              }}
            />
          </MobileOnly>
        )}
        <div style={{ height: "100%" }}>
          <OutputHeader
            openPublishDialog={this.openPublishDialog}
            savedCodeStatus={this.getSavedCodeStatus()}
            savedCodeId={get(this.state, "saveCodeId")}
            mode="python"
            openEditSavedCodeDialog={this.openSaveModal}
            clearInterpretor={this.clearInterpretor}
            fromReportPage={get(this.props, "fromReportPage", false)}
          />
          {/* <div
            className={
              this.props.titleClass && this.props.outputTitleBg
                ? cx(this.props.titleClass, this.props.outputTitleBg)
                : cx(styles.title, styles.skyBlue)
            }
            style={{
              position: "relative",
            }}
            id='__editor___output'
          >
            Output
            {/* <div className={styles.toolbar}>
              <div
                className={
                  this.props.type === "assignment"
                    ? styles.clearButton
                    : styles.clearButtonEditor
                }
                onClick={() => {
                  this.clearInterpretor();
                }}
              >
                <Clear />
              </div> */}
          {/* <MobileOnly style={{}}>
                <div
                  className={styles.backButton}
                  style={{
                    display: `${(this.props.type === "assignment") ? 'none' : 'flex'}`
                  }}
                  onClick={() => {
                    this.setState({ mobileOutputShow: false });
                  }}
                >
                  <ArrowIcon />
                </div>
              </MobileOnly>
            </div>
          </div>  */}
          {(isMobile() || is32BitArch() || !isWASMSupported()) && !isElectron && (
            <PyodideInterpreter
              key={this.getEditorId()}
              id={this.getEditorId()}
              clearInterpretor={this.clearInterpretor}
              pythonCode={this.state.pythonCode || ""}
              outputRef={this.outputRef.current}
              clearLoading={() => {
                this.setState({
                  loading: false
                });
              }}
              ref={this.runCodeRef}
            />
          )}
          <Output
            ref={this.outputRef}
            clearInterpreter={this.clearInterpretor}
            isWASMSupported={isMobile() || isWASMSupported()}
            id={this.getEditorId()}
            loading={this.state.loading}
          />
        </div>
      </div>
    );
  }

  render() {
    const { source } = this.props
    const lockedAlertContent = this.getLockedAlertContent();
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
        <div className={styles.container} id="editor-page-container" style={{ height: this.checkIfUserLoggedIn(false) && `${this.isCustomHeaderVisible() ? 'calc(100vh - 65px)' : (get(this.props, "match.path").includes("/code-playground") && checkIfEmbedEnabled()) ? '100vh' : '100%'}` }}>
          <DesktopOnly>
            <SplitPane
              size={this.state.size}
              onChange={(size) => {
                this.setState({ size });
                insertCss(`
                  #firstPane {
                    flex: ${size[0]} 1 0% !important;
                  }
                  #secondPane {
                    flex: ${size[1]} 1 0% !important;
                  }
                `);
              }}
              split="vertical"
              paneStyle={{ height: "100%" }}
              className={styles.splitPane}
            >
              {this.renderEditor()}
              {this.renderOutput()}
            </SplitPane>
          </DesktopOnly>
          <MobileOnly style={{ width: '100%' }}>
            <div className={styles.mobileBodyContainer}>
              <div style={{ minWidth: '100vw', }}>
                {this.renderEditor()}
              </div>
              <div style={{ minWidth: '100vw', position: 'relative', zIndex: 99, transition: '0.2s all cubic-bezier(.23,.44,.27,.89)' }} className={this.state.mobileOutputShow ? styles.mobileOutputShow : styles.mobileOutputHidden}>
                {this.renderOutput()}
              </div>
            </div>
          </MobileOnly>
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
            <ActionButton
              title={`Show ${this.state.rightAnswerActive ? 'Your' : 'Right'} Answer`}
              hideIconContainer
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
              buttonContainer={styles.buttonContainer}
              buttonText={styles.buttonText}
            />
          </div>
        )}
        {this.props.answerCodeSnippet && this.props.isMentor && (
          <div className={styles.bottomToolbar}>
            <div className={webStyles.slideText}>{this.state.rightAnswerActive ? 'Right' : 'Your'} Answer</div>
            <label class={webStyles.switch}>
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
              <span class={cx(webStyles.slider, webStyles.round)}></span>
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
            managementApp={this.props.managementApp}
            handleChange={this.handleSaveCodeChange}
            handleSubmit={this.saveCode}
            isSaving={this.state.savingCode}
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
          buttonLoading={lockedAlertContent.buttonLoading}
          onClick={lockedAlertContent.onClick}
        >
          {lockedAlertContent.text}
        </Alert>
      </>
    );
  }
}

export default withRouter(Editor);