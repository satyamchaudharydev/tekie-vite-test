/*eslint-disable*/
import React from 'react'
import config from '../../config'
import { Editor } from 'tekie-content-editor'
import './preview.scss'
import { decodeBase64, isBase64 } from '../../utils/base64Utility'
import ContentLoader from 'react-content-loader'
import isMobile from '../../utils/isMobile'
import { truncate } from 'lodash'
import ReactHtmlParser from "react-html-parser";

const TekieContentEditorParser = ({ id, value, legacyParser = null, useNativeHtmlParser = false, init = {}, setInit = () => { }, truncateText = false, ...props }) => {
  const [editorInitialized, setEditorInitialized] = React.useState(false)
  /**
   * This Script injects value `2` into `data-mce-selected` attrib,
   * which helps in enabling youtube embed and native video player in readOnly mode. 
   */
  const injectPlayableVideoAttrib = (editor) => {
    if (editor && editor.getDoc()) {
      Array.from(editor.getDoc().querySelectorAll('.mce-object-iframe')).map((el) => {
        el.addEventListener('click', () => {
          el.setAttribute('data-mce-selected', '2')
        });
      });
      Array.from(editor.getDoc().querySelectorAll('.mce-object-video')).map((el) => {
        el.addEventListener('click', () => {
          el.setAttribute('data-mce-selected', '2')
        });
      });
    }
  }

  if (!value) return ''
  return isBase64(value) ? (
    <>
      {useNativeHtmlParser ? (
        // HTML REACT PARSER
        truncateText ? (
          ReactHtmlParser(truncate(decodeBase64(value), {
            length: (typeof (truncateText) === Number) ? truncateText : 75,
            omission: "...",
            separator: "",
          }))
        ) : (
          ReactHtmlParser(decodeBase64(value))
        )
      ) : (
        <>
          <div
            style={{
              visibility: !editorInitialized ? "visible" : "hidden",
              opacity: !editorInitialized ? 1 : 0,
              transition: "all ease-in-out .3s",
              position: "absolute",
              marginBottom: 10,
            }}
          >
            <ContentLoader
              speed={2}
              width={340}
              height={94}
              viewBox="0 0 340 84"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <rect x="0" y="0" rx="3" ry="3" width="67" height="11" />
              <rect x="76" y="0" rx="3" ry="3" width="140" height="11" />
              <rect x="127" y="48" rx="3" ry="3" width="53" height="11" />
              <rect x="187" y="48" rx="3" ry="3" width="72" height="11" />
              <rect x="18" y="48" rx="3" ry="3" width="100" height="11" />
              <rect x="18" y="23" rx="3" ry="3" width="140" height="11" />
              <rect x="166" y="23" rx="3" ry="3" width="173" height="11" />
            </ContentLoader>
          </div>
          <div
            className="previewComponent"
            style={{
              visibility: editorInitialized ? "visible" : "hidden",
              opacity: editorInitialized ? 1 : 0,
              transition: "all ease-in-out .2s",
              transitionDelay: ".1s",
            }}
          >
            <Editor
              {...props}
              id={id}
              value={decodeBase64(value)}
              env={import.meta.env.REACT_APP_NODE_ENV || "staging"}
              urlPrefix={config.cloudFrontBaseUrl || config.fileBaseUrl}
              disabled
              onInit={() => {
                setEditorInitialized(true)
                setInit(true)
              }}
              onEditorChange={(_, editor) => injectPlayableVideoAttrib(editor)}
              init={{
                readonly: true,
                selector: "textarea#tekie-tms",
                font_formats:
                  "Nunito; Arial=arial,helvetica,sans-serif; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Helvetica=helvetica; arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times",
                plugins: `autolink directionality code image link media template codesample table hr toc advlist lists wordcount imagetools textpattern noneditable quickbars emoticons autoresize`,
                // imagetools_cors_hosts: ['picsum.photos'],
                autoresize_bottom_margin: 0,
                menubar: false,
                toolbar: false,
                statusbar: false,
                image_caption: true,
                fontsize_formats:
                  "8pt 9pt 10pt 11pt 12pt 14pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt",
                content_style: `
                    body { 
                      font-family:Nunito,Arial,sans-serif; 
                      font-size: ${isMobile() ? "12pt" : "13pt"};
                      line-height: ${props.practice ? "160%" : "unset"};
                      color: ${props.practice ? '#504F4F' : "unset"};
                      margin: 0;
                      width: ${props.fitContent ? "fit-content" : "unset"};
                    }
                    p { 
                      margin-block-start: ${isMobile() ? "0px" : ".5em"}; 
                      margin-block-end: ${isMobile() ? "0px" : ".5em"};
                      text-justify: ${isMobile() ? "justify" : ""}
                    }
                    video {
                      cursor: default !important;
                    }
                    
                    .token.operator{
                      background: none !important;
                    }
                  `,
                setup: (editor) => {
                  editor.on("init", () => {
                    injectPlayableVideoAttrib(editor);
                  });
                },
                ...init,
              }}
            />
          </div>
        </>
      )}
    </>
  ) : legacyParser ? (
    legacyParser(value)
  ) : (
    value
  );
}

export default TekieContentEditorParser
