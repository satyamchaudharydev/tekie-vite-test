import React, { Component } from "react";
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import Blockly from 'blockly'
import SyntaxHighlighter from 'react-syntax-highlighter'
import 'blockly/python';
import cx from 'classnames'
import { BlocklyWorkspace } from 'tekie-blockly'
import { isBase64, decodeBase64, encodeToBase64 } from '../../utils/base64Utility'
import isMobile from '../../utils/isMobile'
import './BlocklyPlayground.scss'
import PyodideInterpreter from "./PyodideInterpreter";
import Dialog from "../../library/Dialog";
import Alert from "../../library/Alert/Alert";
import updateSaveCode from "../../queries/saveCode/updateSaveCode";
import { getToasterBasedOnType } from "../../components/Toaster";
import { CODE_PLAYGROUND, TEACHER_CODE_PLAYGROUND } from "../../constants/routes/routesPaths";
import addSaveCode from "../../queries/saveCode/addSaveCode";
import addUserApprovedCodeTags from "../../queries/approvedCodes/addUserApprovedCodeTags";
import SaveCodeDialog from "./components/SaveCodeDialog";
import is32BitArch from '../../utils/is32BitArch'
import SplitPane from "react-split-pane";
import Output from './Output'
import PublishDialog from "./components/PublishDialog/PublishDialog";
import Dropdown from "./components/Dropdown";
import { get, debounce, forOwn } from "lodash";
import fetchSavedCodeSingle from "../../queries/saveCode/fetchSavedCodeSingle";
import { ReactComponent as OutputIcon } from '../../assets/editor/output.svg'
import { ReactComponent as BlocklyIcon } from '../../assets/editor/blockly.svg'
import javascriptIcon from './icons/javascriptIcon.jsx'
import pythonIcon from './icons/pythonIcon.jsx'
import AutoSave from "./components/AutoSave";
import Toggle from "./components/Toggle";
import EditorHeader from './components/EditorHeader';
import { APPROVED_FOR_DISPLAY, SAVED_CODE_STATUS } from "../../constants/savedCode/savedCodeStatus";
import { ReactComponent as CopyIcon } from '../../assets/icons/copy.svg'
import { motion } from "framer-motion";

const codes = [
  { value: 'python', label: 'View Python Code', id: 0, selected: true, icon: pythonIcon },
  { value: 'javascript', label: 'View Javascript Code', id: 1, selected: false, icon: javascriptIcon },
]

const isWASMSupported = (isMobile = false) => {
  if (is32BitArch()) return false
  try {
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

class BlocklyPlayground extends Component {
  timer;
  state = {
    pycode: '',
    jscode: '',
    xmlCode: decodeBase64(this.props.initialBlocks),
    decodedCode: '',
    width: this.props.showOutputByDefault ? '70%' : '100%',
    jsactive: false,
    pyactive: true,
    initialCodeString: this.props.codeString || '',
    // initialBlocks : '',
    isBlocky: true,
    selectedValue: '',
    codeList: codes,
    toggle: false,
    savedCodeId: get(this.props, "match.params.id"),
    saveCode: {
      fileName: "untitled",
      description: "",
      updatedAt: null,
      hasRequestedByMentee: false,
      isApprovedForDisplay: false,
    },
    tags: [],
    activeOutput: this.props.showOutputByDefault,
    isSaveDialogOpen: false,
    isPublishDialogOpen: false,
    isSaving: false,
    isPublishing: false,
    isLockedAlertOpen: false,
    isCodeGarageButtonTooltipOpen: false,
  };
  jsCodeVar = ''
  pyCodeVar = ''

  outputRef = React.createRef()
  runCodeRef = React.createRef()

  workspaceConfiguration = {
    readOnly: false,
    grid: {
      spacing: 20,
      length: 3,
      colour: '#ccc',
      snap: false
    },
    move: {
      scrollbars: {
        horizontal: this.props.scrollbarshorizontal || true,
        vertical: this.props.scrollbarsvertical || true
      },
      drag: true,
      wheel: true
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 2,
      minScale: 0.3,
      scaleSpeed: 1.2,
      pinch: true
    },
    trashcan: true,
  }

  async fetchCodeByIdAndSaveInState() {
    if (!this.state.savedCodeId) return;
    const { userSavedCode } = await fetchSavedCodeSingle(this.state.savedCodeId).call();
    if (userSavedCode) {
      this.setState({
        xmlCode: userSavedCode.code || "",
        savedCodeId: userSavedCode.id,
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
    await this.fetchCodeByIdAndSaveInState();
    this.setState({ selectedValue: codes[1].value })
    this.runPythonCode()

    if (!isMobile() || !is32BitArch()) {
      if (isWASMSupported()) {
        this.initInterpreter();
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

    // if the code is published or in review, show the lock icon
    if (Boolean(this.getSavedCodeStatus())) {
      this.openLockedAlert();
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.initialBlocks !== prevProps.initialBlocks) {
      if (isBase64(this.props.initialBlocks)) {
        this.setState({
          xmlCode: decodeBase64(this.props.initialBlocks)
        })
      } else {
        this.setState({
          xmlCode: this.props.initialBlocks
        })
      }
    }
    if (this.state.decodedCode !== prevState.decodedCode) {
      if (this.state.decodedCode) {
        if (this.props.blocklySave) this.props.blocklySave(this.state.decodedCode)
        if (get(this.props.match, "params.id") || this.props.updatedSaveCode) {
          if (this.props.initialCodeString !== this.state.decodedCode) {
            this.updateSavedCodeDebounced();
          }
        }
      }

    }
    if (window["0Blockly"]) {
      window["0Blockly"].svgResize(window["0Blockly"].mainWorkspace);
    }

  }

  // save dialog handlers
  openSaveDialog = () => {
    this.setState({ isSaveDialogOpen: true });
  };

  closeSaveDialog = () => {
    this.setState({ isSaveDialogOpen: false });
  };

  // publish dialog handlers
  openPublishDialog = () => {
    this.setState({ isPublishDialogOpen: true });
  };

  closePublishDialog = () => {
    this.setState({ isPublishDialogOpen: false });
  };

  // locked alert handlers
  openLockedAlert = () => {
    this.setState({ isLockedAlertOpen: true });
  };

  closeLockedAlert = () => {
    this.setState({ isLockedAlertOpen: false });
  };

  getEditorId = () => (this.props.editorKey ? this.props.editorKey : "editor");



  resizerToggle = (pane1, resizer, pane2) => {
    resizer.addEventListener('dblclick', () => {
      if (this.state.pyactive) {
        this.resizerHandler(pane1, pane2)
      }
    })
  }

  resizerHandler = (pane1, pane2) => {
    const style = getComputedStyle(pane2)
    if (style.flex === '1 1 50%') {
      pane1.style.flex = '1 1 0%'
      pane2.style.flex = '1 1 100%'
    } else {
      pane1.style.flex = '1 1 50%'
      pane2.style.flex = '1 1 50%'
    }
  }
  // handle toggle
  handleToggle = () => {

    this.setState({ toggle: !this.state.toggle })
  }
  onSelect = (value, id) => {
    // if item is selected then return
    if (value === 'javascript') {
      this.setState({
        jsactive: true,
        pyactive: false,
      })
    } else {

      this.setState({
        jsactive: false,
        pyactive: true,
      })
    }
    const newList = [...this.state.codeList];
    newList.forEach((item) => item.selected = false);
    newList[id].selected = true;
    this.setState({
      selectedValue: value,
      codeList: newList,
    })
  }

  onSlideBtn = () => {
    this.setState(prevState => ({
      activeOutput: !prevState.activeOutput,
      width: prevState.activeOutput ? '100%' : '70%',
    }))

    Blockly.svgResize(Blockly.mainWorkspace)
    // if (window["0Blockly"]) {
    //     window["0Blockly"].svgResize(window["0Blockly"].mainWorkspace)
    // }
  }

  runPythonCode = () => {
    this.runCodeRef.current && this.runCodeRef.current.runCodeOnPlay()
  }

  onClickPlay = () => {
    this.setState({
      jscode: encodeURIComponent(this.jsCodeVar),
      pycode: encodeURIComponent(this.pyCodeVar)
    })
    if (isMobile() || is32BitArch() || !isWASMSupported()) {
      this.setState({
        pythonCode: this.pyCodeVar,
      }, () => {
        this.runPythonCode()
        if (!this.state.activeOutput)
          this.onSlideBtn()
      });
      return;
    }
    if (this.state.loading && !isWASMSupported()) return

  }
  updateSavedCode = async () => {
    this.setState({
      isSaving: true,
    });

    const updateCode = await updateSaveCode(get(this.state, "savedCodeId"), {
      code: this.state.decodedCode,
      fileName: this.state.saveCode.fileName,
      description: this.state.saveCode.description || '',
    }).call();
    this.setState({
      isSaving: false,
      updatedAt: get(updateCode, 'updatedAt', '')
    });

    // this.fetchCodeByIdAndSaveInState()
  };
  updateSavedCodefn = this.props.updatedSaveCode || this.updateSavedCode;
  updateSavedCodeDebounced = debounce(this.updateSavedCodefn, 3000);
  onChangeSave = (workspace) => {
    const parser = new DOMParser()
    const xmlString = parser.parseFromString(workspace, 'text/xml')
    var xml_text = encodeToBase64(Blockly.Xml.domToText(xmlString))
    if (xml_text !== '<xml xmlns="https://developers.google.com/blockly/xml"></xml>' && xml_text) {
      this.setState({
        // cannot set xmlCode here because that is used as a key 
        // to Blockly Workspace component
        decodedCode: xml_text,
      })
    }


  }


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

  tagsChangeHandler = (tags) => {
    this.setState({
      tags,
    });
  };




  handleSaveOrUpdateCode = async (e) => {
    e.preventDefault();
    if (this.state.isSaving) return;
    this.setState({
      isSaving: true,
    });
    const userId = get(this.props, 'loggedInUserId');
    if (get(this.state, "savedCodeId")) {
      this.updateSavedCode();
    } else {
      const data = await addSaveCode(userId, {
        code: this.state.decodedCode,
        languageType: "blockly",
        fileName: this.state.saveCode.fileName,
        description: this.state.saveCode.description,
      }).call();

      if (!data) {
        getToasterBasedOnType({
          type: "error",
          autoClose: 10000,
          message: "Something went wrong while saving code.",
        });

        this.setState({
          isSaveDialogOpen: false,
          isSaving: false,
        });

        return;
      };

      this.setState({
        savedCodeId: get(data, "addUserSavedCode.id"),
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
      isSaveDialogOpen: false,
      isSaving: false,
    });
  };

  getSavedCodeStatus = () => {
    const { hasRequestedByMentee, isApprovedForDisplay } = this.state.saveCode;
    if (hasRequestedByMentee && isApprovedForDisplay === APPROVED_FOR_DISPLAY.PENDING) {
      return SAVED_CODE_STATUS.IN_REVIEW;
    }

    if (hasRequestedByMentee && isApprovedForDisplay === APPROVED_FOR_DISPLAY.ACCEPTED) {
      return SAVED_CODE_STATUS.PUBLISHED;
    }
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

    await updateSaveCode(get(this.state, "savedCodeId"), {
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

  renderJsOutput = () => {
    // eslint-disable-next-line no-eval
    eval(decodeURIComponent(this.state.jscode))
  }

  renderPythonOutput = () => (
    <>
      {(isMobile() || is32BitArch() || !isWASMSupported()) ? (
        <PyodideInterpreter
          pythonCode={decodeURIComponent(this.state.pycode) || ""}
          outputRef={this.outputRef.current}
          ref={this.runCodeRef}
          isBlocky={this.state.isBlocky}
          id={this.getEditorId()}
          key={this.getEditorId()}
        />
      ) : (
        <Output
          ref={this.outputRef}
          isWASMSupported={isMobile() || isWASMSupported()}
          id={this.getEditorId()}
          loading={this.state.loading}
          fromBlockly={true}
        />
      )}
    </>
  )

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

  // get initial xml for blockly playground
  getInitialXml = () => {
    const answer = get(this.props, "answerCodeSnippet");
    const isSeeAnswers = get(this.props, "isSeeAnswers");

    if (isSeeAnswers && Boolean(answer)) return decodeBase64(answer);

    return this.props.initialBlocks || decodeBase64(this.state.xmlCode);
  };

  // get blockly workspace configuration
  getBlocklyWorkspaceConfiguration = () => {
    if (this.props.blocklyWorkspaceConfiguration) {
      return this.props.blocklyWorkspaceConfiguration;
    }

    if (this.props.readOnly) {
      return {
        toolbox: null,
        readOnly: true,
        zoom: false,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: false
        },
        move: false,
      }
    }

    return this.workspaceConfiguration;
  };

  render() {
    const lockedAlertContent = this.getLockedAlertContent();
    console.log('blockly', this.props)

    const workspaceConfigurationMobile = {
      readOnly: false,
      horizontalLayout: true,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: false
      },
      move: {
        scrollbars: {
          horizontal: this.props.scrollHorizontal || true,
          vertical: this.props.scrollVertical || true
        },
        drag: true,
        wheel: true
      },
      zoom: {
        controls: false,
        wheel: true,
        startScale: 0.9,
        maxScale: 2,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: true
      },
      trashcan: true,
    }

    const customStyles = {
      option: (provided, state) => ({
        ...provided,
        background: state.isSelected ? '#00ADE6' : '#fff',
        "&:hover": {
          background: state.isSelected ? '#00ADE6' : "#e6f9ff"
        }
      }),
      control: (base, state) => ({
        ...base,
        padding: '2px',
        margin: 0,
        color: "#00ADE6",
        outline: 0,
        background: "#e6f9ff",
        border: 0,
        borderRadius: 50,
        borderColor: "#fff",
        paddingLeft: 5,
        fontSize: '15px',
        fontWeight: '600',
      }),
      singleValue: (provided, state) => ({
        ...provided,
        color: "#00ADE6",
      }),
      dropdownIndicator: base => ({
        ...base,
        margin: 0,
        padding: '2px',
        fontSize: '15px',
        fontWeight: '600',
        border: 0,
        color: "#00ADE6",
        "&:hover": {
          color: "#00ADE6"
        }
      }),
      menu: (base) => ({
        ...base,
        borderRadius: 0,
        marginTop: '4px'
      }),
      menuList: (base) => ({
        ...base,
        padding: 0
      }),
      indicatorSeparator: (styles) => ({ display: 'none' })

    }

    return (
      <>
        {(this.props.isMobile && get(this.state, 'xmlCode', '')) ?
          <div style={{ position: 'relative', width: '100%', }}>
            <div>

              <div style={{ width: '100%', height: this.props.height || '500px', 'position': 'relative' }}>
                <BlocklyWorkspace
                  useDefaultToolbox
                  workspaceConfiguration={workspaceConfigurationMobile}
                  onWorkspaceChange={(workspace) => {
                    Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
                    Blockly.Python.INFINITE_LOOP_TRAP = null;
                    this.jsCodeVar = Blockly.JavaScript.workspaceToCode(workspace);
                    this.pyCodeVar = Blockly.Python.workspaceToCode(workspace);
                  }}
                  blocklyKey='0'
                  customTheme={Blockly.Theme.TekiePlayground}
                  onInject={(e) => {
                  }}
                  onXmlChange={(event) => {
                    this.onChangeSave(event);
                  }}

                  // initialXml={this.state.xmlCode || ''}
                  initialXml={this.getInitialXml()}
                  {...(this.props.blocklyWorkspaceProps || {})}
                />
              </div>
              <div className='practice-output-conatiner-mob'>
                <div style={{ display: 'flex' }} onClick={this.onClickPlay}>
                  <button className='blockly-run-button'></button>
                  <h3 style={{ margin: 0, alignSelf: 'center', fontSize: '16.5px', fontWeight: 'bold' }}>Run Editor</h3>
                </div>
              </div>
              <div className="splitPaneContainer">
                <div className='practice-create-container-toolbox' style={{ borderLeft: '1px solid #fff' }}> Output </div>
                <SplitPane
                  split="horizontal"
                  className="splitPane"
                  allowResize={true}
                >
                  <div className="pane1">
                    {this.renderPythonOutput()}
                  </div>
                  {/* <div className='pane2'>
                    <div className='practice-output-tab-code-header practice-create-container-item'>
                       <Dropdown 
                            title={this.state.selectedValue ? `View ${get(this.state.selectedValue,'label', "")} Code` : 'View Code'}
                            list={this.state.codeList}
                            itemIcon={true}
                            onChange={this.onSelect}
                         ></Dropdown>
                      
                    </div>
                    <div className="code-display-blockly">
                      <SyntaxHighlighter
                          language={this.pyactive? 'python' : 'javascript'}
                          style={atomOneDark}
                          customStyle = {{
                              'white-space': 'pre-wrap',
                              'line-height': '1.6',
                              'background-color': '#fff',
                              'margin' : '0px'
                          }}>
                          {decodeURIComponent(this.state.jsactive ? this.state.jscode : this.state.pycode)}
                      </SyntaxHighlighter>
                    </div>
                </div> */}
                </SplitPane>
              </div>
            </div>
          </div>

          :

          <div style={{ position: 'relative', width: '100%' }}>
            <div className="blockly-top-header" style={{ width: '100%', display: 'flex' }}>
              {/* <div className='practice-create-container-workspace practice-create-container-item'>
                  <BlocklyIcon />
                   Blockly Editor
                   <div className="blockly-auto-save-container">
                   <AutoSave 
                   showSave={this.props.showSave}
                   isSave={this.props.isSave}
                   ></AutoSave>
                   </div>
                </div> */}
              <EditorHeader
                mode="blockly"
                type={this.props.type}
                showSave={this.props.showSave}
                isSave={this.props.isSave}
                title={this.state.saveCode.fileName}
                showSaveButton={!this.state.savedCodeId}
                isSaveButtonDisabled={!this.state.decodedCode}
                lastSavedAt={this.state.saveCode.updatedAt}
                showSaveModal={this.openSaveDialog}
                savedCodeId={this.state.savedCodeId}
                savedCodeStatus={this.getSavedCodeStatus()}
                openPublishDialog={this.openPublishDialog}
                openEditSavedCodeDialog={this.openSaveDialog}
                hideEditorHeaderActions={this.props.hideEditorHeaderActions}
                isCodeGarageButtonTooltipOpen={this.state.isCodeGarageButtonTooltipOpen}
                closeCodeGarageButtonTooltip={this.closeCodeGarageButtonTooltip}
                fromCodeShowCasePage={get(this.props, 'fromCodeShowCasePage', false)}
                managementApp={this.props.managementApp}
              />
              {(this.state.activeOutput) && (
                <div className='practice-create-container-output practice-create-container-item'>
                  <OutputIcon />
                  Output
                  <Toggle label="View Code" toggleState={this.state.toggle} handleToggle={this.handleToggle} />
                </div>
              )}
            </div>



            <div className='workspace-output-area code-playgroud-page-mixpanel-identifier'>
              <div className={`${this.props.fullEditor && 'codeplayground-fullHeight'}`} style={{ width: this.state.width, height: this.props.height || '500px', 'position': 'relative' }} >

                <BlocklyWorkspace
                  key={`${this.state.xmlCode}-${this.props.isSeeAnswers}`}
                  useDefaultToolbox
                  workspaceConfiguration={this.getBlocklyWorkspaceConfiguration()}
                  onWorkspaceChange={(workspace) => {
                    Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
                    Blockly.Python.INFINITE_LOOP_TRAP = null;
                    this.jsCodeVar = Blockly.JavaScript.workspaceToCode(workspace);
                    this.pyCodeVar = Blockly.Python.workspaceToCode(workspace);
                  }}

                  blocklyKey='0'
                  customTheme={Blockly.Theme.TekiePlayground}
                  onInject={(e) => {
                  }}
                  onXmlChange={(event) => {
                    this.onChangeSave(event)
                  }}

                  // initialXml={decodeBase64(get(this.props, "answerCodeSnippet")) || decodeBase64(this.state.xmlCode)}
                  initialXml={this.getInitialXml()}
                // {...(this.props.blocklyWorkspaceProps || {})}
                />
                <div className='practice-output-conatiner'>
                  <button
                    className='blockly-run-button'
                    onClick={this.onClickPlay}
                  >
                  </button>
                </div>
                {this.props.showOutputByDefault ? null : <button
                  className={cx('project-slideopen-code-btn', this.state.activeOutput && 'project-slideclose-code-btn')}
                  onClick={this.onSlideBtn}>
                  <svg fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>}
              </div>
              {(this.state.activeOutput) && (
                <div className={`splitPaneContainer blockly-ouputsection ${this.props.fullPage && 'codeplayground-fullHeight'}`} style={{ height: this.props.height || '500px' }}>
                  <SplitPane
                    split="horizontal"
                    className="splitPane"
                    allowResize={true}

                  >
                    <div className="pane1">
                      {this.renderPythonOutput()}
                    </div>
                    {/* <AnimatePresence> */}
                    {this.state.toggle && <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: 100 }}
                      transition={{ duration: 0.2, type: 'ease' }}
                      className="pane2" style={{ background: '#00171F' }}>
                      <div className='practice-output-tab-code-header practice-create-container-output' >
                        <Dropdown
                          title={this.state.selectedValue ? `View ${get(this.state.selectedValue, 'label', "")} Code` : 'View Code'}
                          list={this.state.codeList}
                          itemIcon={true}
                          onChange={this.onSelect}
                        ></Dropdown>
                      </div>

                      <div className="code-display-blockly">
                        <SyntaxHighlighter
                          language={this.pyactive ? 'python' : 'javascript'}
                          style={atomOneDark}
                          customStyle={{
                            'white-space': 'pre-wrap',
                            'line-height': '1.4',
                            'background': 'transparent',
                            'margin': '0px'
                          }}>
                          {decodeURIComponent(this.state.jsactive ? this.state.jscode : this.state.pycode)}
                        </SyntaxHighlighter>
                      </div>
                    </motion.div>
                    }

                  </SplitPane>
                </div>
              )}
            </div>
          </div>
        }

        <Dialog open={this.state.isSaveDialogOpen} onClose={this.closeSaveDialog}>
          <SaveCodeDialog
            title={get(this.state, "savedCodeId") && "Edit details"}
            values={
              {
                fileName: this.state.saveCode.fileName,
                description: this.state.saveCode.description,
              }
            }
            isSaving={this.state.isSaving}
            handleChange={this.handleSaveCodeChange}
            handleSubmit={this.handleSaveOrUpdateCode}
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
                  code: this.state.xmlCode,
                  tags: this.state.tags,
                }}
                handleSavedCodeChange={this.handleSaveCodeChange}
                tags={this.state.tags}
                tagsChangeHandler={this.tagsChangeHandler}
                handleSubmit={this.requestForPostingInCommunity}
                onClose={this.closePublishDialog}
                open={this.state.isPublishDialogOpen}
                isLoading={this.state.isPublishing}
                mode='blockly'
              />

            </>
          )
        }


        <Alert
          persisting
          open={this.state.isLockedAlertOpen}
          onClose={this.closeLockedAlert}
          buttonText={lockedAlertContent.buttonText}
          buttonIcon={lockedAlertContent.buttonIcon}
          onClick={lockedAlertContent.onClick}
        >
          {lockedAlertContent.text}
        </Alert>
      </>
    )
  }

}

export default BlocklyPlayground;