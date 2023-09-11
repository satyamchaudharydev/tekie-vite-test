import React from 'react'
import WebEditor from './WebEditor'
import Editor from './index'
import BlocklyPlayground from './BlocklyPlayground'
import qs from 'query-string'
import { get } from 'lodash'
import { connect } from 'react-redux'
import { filterKey, } from '../../utils/data-utils'
import { getCodePlayground } from '../../utils/getCourseId'

const mapStateToProps = (state) => ({
    loggedInUserId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
    hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
    savedCode: state.data.getIn([
        'savedCode',
        'data'
    ]),
    savedCodeStatus: state.data.getIn([
        'savedCode',
        'fetchStatus'
    ]),
})

const EditorComponents = {
    python: Editor,
    markup: WebEditor,
    blockly: BlocklyPlayground,
    java: WebEditor,
}

const EditorToRender = ({ ...props }) => {
    const editorMode = props.editorMode
    let language = ''
    const editorModeConst = {markup:'markup',java:'java',javascript:'javascript',python:'python'}
    if(get(qs.parse(window.location.search), 'language')) {
        language = get(qs.parse(window.location.search), 'language'); 
    }
    language = language || editorMode;
    if(language && Object.keys(EditorComponents).includes(language)) {
        const Component = EditorComponents[language]  
        return  <Component {...props} />
    }
    language = getCodePlayground()

    // if(language === 'java')
        // return <JavaEditor {...props} />
    if (language === editorModeConst.markup || language === editorModeConst.javascript || language === editorModeConst.java )
        return <WebEditor {...props} editorMode={editorMode}/>
    else if(language === editorModeConst.python)
        return <Editor {...props} />
    else return <BlocklyPlayground {...props} />
    // return getCodePlayground() === 'python' ? <Editor {...props} /> : <WebEditor {...props} />
}
export default connect(mapStateToProps)(EditorToRender)