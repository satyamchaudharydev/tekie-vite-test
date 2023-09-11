import React, { useRef, useState } from "react";
import cx from 'classnames'
import SyntaxHighlighter from "../../../../../utils/react-syntax-highlighter/dist/esm/prism-light";
import { hs } from "../../../../../utils/size";
import styles from "./CodeView.module.scss";
import { ReactComponent as Python } from "../../../../../assets/Python-logo.svg";
import { ReactComponent as Web } from "../../../../../assets/Web.svg";


function decodeURIComponentSafe(str = '') {
    if (!str) {
        return str;
    }
    if (str.includes('%')) return decodeURIComponent(str.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
    return str
}

function CodeView({
  editorMode,
  layout,
  executionAccess,
  codeInput,
  codeOutput,
  codeId,
  marginBottom,
}) {
  const [resizeFlag, setResizeFlag] = useState(false);
  const [resizedWidth, setResizedWidth] = useState(-1);
  const terminalContainerRef = useRef();
  const terminalStyles = {
    fontFamily: "Monaco",
    fontWeight: "normal",
    fontStretch: "normal",
    fontStyle: "normal",
    letterSpacing: "normal",
    whiteSpace: "pre-wrap",
    padding: hs(24),
    backgroundColor: "transparent",
    color: "white",
    wordBreak: "break-all",
  };
  const customDimensions = {
    height: layout !== "row" ? "50%" : "100%",
  };
  const getWidth = (rightFlag) => {
    if (layout === "row") {
      if (resizedWidth < 0) return "50%";
      return rightFlag ? 100 - resizedWidth + "%" : resizedWidth + "%";
    }
    return "100%";
  };
  const getHeight = (rightFlag) => {
    if (layout === "column") {
      if (resizedWidth < 0) return "50%";
      return !rightFlag ? terminalContainerRef.current.clientHeight - resizedWidth + "px" : resizedWidth + "px";
    }
    return "";
  };
  const editorModeMap = {
    python: "Python",
    markup: "Web",
  };
  const layoutCursorMap = {
    row: "col",
    column: "row",
  };

  const getResizerDimensions = () => ({
    width: layout === "row" ? "" : "100%",
    height: layout === "row" ? "" : hs(16) + "px",
    cursor: `${layoutCursorMap[layout]}-resize`,
    backgroundColor: layout === "row" ? "" : "#184F64",
    bottom:"0%",
    transform: layout === "row" ? "" : "translateY(100%)",
    left:
      layout === "row" ? (resizedWidth < 0 ? "" : resizedWidth + "%") : "0%",
  });

  const startResizing = () => {
    setResizeFlag(true);
  };

  const resizeTerminal = (e) => {
    if (!resizeFlag) return;
    if (layout === "row") {
      if (e.nativeEvent.offsetX < 10) return;
      let resizedWidthVal =
        (e.nativeEvent.offsetX / terminalContainerRef.current.clientWidth) *
        100;
      if (resizedWidthVal < 20 || resizedWidthVal > 80) return;
      setResizedWidth(
        (e.nativeEvent.offsetX / terminalContainerRef.current.clientWidth) * 100
      );
    } else {
      if (e.nativeEvent.offsetY < 10) return;
      let resizedHeightVal = terminalContainerRef.current.clientHeight - e.nativeEvent.offsetY
      if(resizedHeightVal/terminalContainerRef.current.clientHeight * 100 < 20 || resizedHeightVal/terminalContainerRef.current.clientHeight * 100 > 75) return
      setResizedWidth(resizedHeightVal);
    }
  };

  const stopResizing = () => {
    setResizeFlag(false);
  };

  const redirectToPlayground = () => {
    window.open(
      `/code-playground?slide=${codeId}&language=${editorMode}`,
      "_blank"
    );
  };

  const getBtnOffset = () => {
    if (resizedWidth < 0) return "";
    return resizedWidth + "%";
  };
  return (
    <div
      className={`${styles.mainContainer} ${layout === "column" &&
        styles.colMainContainer} ${marginBottom && styles.marginBottom}`}
      id="codeMain"
      onMouseMove={resizeTerminal}
      onMouseUp={stopResizing}
    >
      {layout === "row" && (
        <div
          className={styles.terminalResizer}
          onMouseDown={startResizing}
          style={{
            ...getResizerDimensions(),
          }}
          onMouseUp={stopResizing}
        ></div>
      )}
      {executionAccess && layout === "row" && (
        <div
          className={`${styles.dummyPlayBtn} ${styles.dummyPlayBtn}`}
          style={{ left: getBtnOffset() }}
          onClick={redirectToPlayground}
        ></div>
      )}
      <div
        className={styles.codeViewContainer}
        style={{ flexDirection: layout }}
        id="codeContainer"
        ref={terminalContainerRef}
      >
        <div
          className={styles.codeViewLeftWrapper}
          style={{
            ...customDimensions,
            width: getWidth(),
            height: getHeight(),
          }}
        >
          {executionAccess && layout === "column" && (
            <div
              className={styles.dummyPlayBtnColumn}
              onClick={redirectToPlayground}
            ></div>
          )}
          {layout === "column" && (
            <div
              className={styles.terminalResizer}
              style={{
                ...getResizerDimensions(),
                pointerEvents: resizeFlag ? "none" : "all"
              }}
              onMouseDown={startResizing}
              onMouseUp={stopResizing}
            >
              <div className={styles.resizeDot}></div>
            </div>
          )}
          <div className={styles.terminalHeader}>
            <div className={styles.headerContentWrapper}>
              {editorMode === "python" ? <Python /> : <Web />}
              <h3>{editorModeMap[editorMode]} Editor</h3>
            </div>
          </div>
          <div
            className={cx(styles.codeViewContentWrapper, styles[`codeViewContent-${layout}`])}
            style={{ pointerEvents: resizeFlag ? "none" : "all" }}
          >
            <SyntaxHighlighter
              language={editorMode} // Through props
              customStyle={terminalStyles}
              className={"grid-container-grid2X2-codeSyntax"}
            >
              {decodeURIComponentSafe(codeInput)}
            </SyntaxHighlighter>
          </div>
        </div>
        <div
          className={`${styles.codeViewRightWrapper} ${editorMode === "python" && styles.pythonOutputContainer}`}
          style={{
            ...customDimensions,
            width: getWidth("right"),
            height: getHeight("right"),
          }}
        >
          <div className={styles.terminalHeader}>
            <div className={styles.headerContentWrapper}>
              <h3 className={styles.headerEditorLabel}>Output</h3>
            </div>
          </div>
          <div
            className={cx(styles.codeViewContentWrapper, styles[`codeViewContent-${layout}`])}
            style={{ pointerEvents: resizeFlag ? "none" : "all" }}
          >
            {editorMode === "python" ? <SyntaxHighlighter
              language={"python"} // Through props
              customStyle={{ ...terminalStyles, color: "" }}
              className={"grid-container-grid2X2-codeSyntax"}
            >
              {codeOutput ? decodeURIComponentSafe(codeOutput) : ''}
            </SyntaxHighlighter>  : (
                <iframe
                  srcDoc={codeOutput ? decodeURIComponentSafe(codeOutput) : ''}
                  className={styles.previewIframe}
                  title="Preview Editor"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeView;
