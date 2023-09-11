import React from 'react'
import {
    View,
    Text,
    ScrollView,
    Animated,
    Platform,
    TextInput,
    TouchableWithoutFeedback
} from 'react-native'

import SyntaxHighlighter, { Prism as SyntaxHighlighterPrism } from 'react-syntax-highlighter'
// import SyntaxHighlighterPrism from 'react-syntax-highlighter/prism'
import { createStyleObject } from 'react-syntax-highlighter/dist/cjs/create-element'
import { defaultStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { prism as prismDefaultStyle } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ScaleSheet, { horizontalScale, verticalScale } from './RN-size-matters'

const styleCache = new Map()
const UNDERSCORE_PATTERN = '___'
const topLevelPropertiesToRemove = [
    'color',
    'textShadow',
    'textAlign',
    'whiteSpace',
    'wordSpacing',
    'wordBreak',
    'wordWrap',
    'lineHeight',
    'MozTabSize',
    'OTabSize',
    'tabSize',
    'WebkitHyphens',
    'MozHyphens',
    'msHyphens',
    'hyphens',
    'fontFamily'
]

const TextInputComponent = ({
    generatedKey,
    underlineColorAndroid,
    id,
    style,
    autoCorrect,
    value,
    onTextInputChange
}) => {
    return (
        <TextInput
            key={generatedKey}
            autoCapitalize='none'
            autoCorrect={autoCorrect}
            value={value}
            underlineColorAndroid={underlineColorAndroid}
            style={style}
            onChangeText={text => onTextInputChange(id - 1, text)}
        />
    )
}

function generateNewStylesheet({ stylesheet, highlighter }) {
    if (styleCache.has(stylesheet)) {
        return styleCache.get(stylesheet)
    }
    const transformedStyle = Object.entries(stylesheet).reduce(
        (newStylesheet, [className, style]) => {
            newStylesheet[className] = Object.entries(style).reduce(
                (newStyle, [key, value]) => {
                    if (key === 'overflowX' || key === 'overflow') {
                        newStyle.overflow = value === 'auto' ? 'scroll' : value
                    } else if (value.includes('em')) {
                        const [num] = value.split('em')
                        newStyle[key] = Number(num) * 16
                    } else if (key === 'background') {
                        newStyle.backgroundColor = value
                    } else if (key === 'display') {
                        return newStyle
                    } else {
                        newStyle[key] = value
                    }
                    return newStyle
                },
                {}
            )
            return newStylesheet
        },
        {}
    )
    const topLevel =
        highlighter === 'prism'
            ? transformedStyle['pre[class*="language-"]']
            : transformedStyle.hljs
    const defaultColor = (topLevel && topLevel.color) || '#000'
    topLevelPropertiesToRemove.forEach(property => {
        if (topLevel[property]) {
            delete topLevel[property]
        }
    })
    if (topLevel.backgroundColor === 'none') {
        delete topLevel.backgroundColor
    }
    const codeLevel = transformedStyle['code[class*="language-"]']
    if (highlighter === 'prism' && !!codeLevel) {
        topLevelPropertiesToRemove.forEach(property => {
            if (codeLevel[property]) {
                delete codeLevel[property]
            }
        })
        if (codeLevel.backgroundColor === 'none') {
            delete codeLevel.backgroundColor
        }
    }
    styleCache.set(stylesheet, { transformedStyle, defaultColor })
    return { transformedStyle, defaultColor }
}

function createChildren({
    stylesheet,
    fontSize,
    fontFamily,
    section,
    setDropZoneValues,
    refsArr,
    fibInputTextValues,
    blockTexts,
    fibAndEmptyBlockMap,
    onTextInputChange,
    displayFibBlock,
    incrementalId,
    textInputId,
    animatedSize,
    expandViewIndex
}) {
    let childrenCount = 0
    return (children, defaultColor) => {
        childrenCount += 1
        return children.map((child, i) => {
            if (child.type === 'text' && child.value.includes('___')) {
                const splitarr = child.value.split('___')
                var count = (child.value.match(/___/g) || []).length
                const childrenArr = []
                for (let i = 0; i < splitarr.length - 1; i = i + 1) {
                    const newTextChild = { ...child }
                    newTextChild.value = splitarr[i]
                    childrenArr.push(newTextChild)
                    const newChild = { ...child }
                    newChild.value = '___'
                    childrenArr.push(newChild)
                }
                const newTextChild = { ...child }
                newTextChild.value = splitarr[splitarr.length - 1]
                childrenArr.push(newTextChild)
                if (count === splitarr.length) {
                    const newChild = { ...child }
                    newChild.value = '___'
                    childrenArr.push(newChild)
                }
                return childrenArr.map((child, index) => {
                    return createNativeElement({
                        node: child,
                        incrementalId,
                        textInputId,
                        stylesheet,
                        key: `code-segment-${childrenCount}-${i}-${index}`,
                        defaultColor,
                        fontSize,
                        fontFamily,
                        section,
                        refsArr,
                        fibInputTextValues,
                        setDropZoneValues,
                        blockTexts,
                        fibAndEmptyBlockMap,
                        onTextInputChange,
                        displayFibBlock,
                        animatedSize,
                        expandViewIndex
                    })
                })
            } else {
                return createNativeElement({
                    node: child,
                    incrementalId,
                    textInputId,
                    stylesheet,
                    key: `code-segment-${childrenCount}-${i}`,
                    defaultColor,
                    fontSize,
                    fontFamily,
                    section,
                    setDropZoneValues,
                    refsArr,
                    fibInputTextValues,
                    blockTexts,
                    fibAndEmptyBlockMap,
                    onTextInputChange,
                    displayFibBlock,
                    animatedSize,
                    expandViewIndex
                })
            }
        })
    }
}

function setRef(refsArr, ref, key) {
    if (ref) {
        refsArr[key] = React.createRef()
        refsArr[key] = ref
    }
}

function createNativeElement({
    node,
    stylesheet,
    key: generatedKey,
    defaultColor,
    fontFamily,
    fontSize = 12,
    section,
    setDropZoneValues,
    fibInputTextValues,
    refsArr,
    blockTexts,
    fibAndEmptyBlockMap,
    onTextInputChange,
    displayFibBlock,
    animatedSize,
    textInputId,
    incrementalId,
    expandViewIndex
}) {
    const { properties, type, tagName: TagName, value } = node
    const startingStyle = { fontFamily, fontSize, height: fontSize + 10 }
    if (type === 'text') {
        if (value.trim() !== UNDERSCORE_PATTERN) {
            return (
                <Text
                    key={generatedKey}
                    style={Object.assign({ color: defaultColor }, startingStyle)}
                >
                    {value}
                </Text>
            )
        } else {
            if (section === 'fibInput') {
                textInputId.id = textInputId.id + 1
                return (
                    <TextInputComponent
                        key={generatedKey}
                        value={
                            fibInputTextValues && fibInputTextValues[textInputId.id - 1]
                                ? fibInputTextValues[textInputId.id - 1]
                                : ''
                        }
                        generatedKey={generatedKey}
                        id={textInputId.id}
                        autoCorrect={false}
                        underlineColorAndroid='transparent'
                        style={styles.textInput}
                        onTextInputChange={onTextInputChange}
                    />
                )
            } else {
                incrementalId.id = incrementalId.id + 1
                const id = incrementalId.id
                const style = {
                    height: verticalScale(22),
                    minWidth: horizontalScale(28)
                }
                if (id === expandViewIndex + 1) {
                    style.height = animatedSize.height
                    style.width = animatedSize.width
                }
                return (
                    <TouchableWithoutFeedback
                        key={generatedKey}
                        onPress={() => displayFibBlock(fibAndEmptyBlockMap[id - 1], id - 1)}
                    >
                        <Animated.View style={[styles.emptyBlock, style]}>
                            <View
                                key={generatedKey}
                                ref={generatedRef => setRef(refsArr, generatedRef, id - 1)}
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    justifyContent: 'center'
                                }}
                                onLayout={e => setDropZoneValues(e, id - 1, refsArr)}
                            >
                                {blockTexts && blockTexts[incrementalId.id - 1] ? (
                                    <Text id={incrementalId.id} style={styles.blockTextStyle}>
                                        {blockTexts[incrementalId.id - 1]}
                                    </Text>
                                ) : (
                                        <Text id={incrementalId.id} style={styles.blockTextStyle} />
                                    )}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                )
            }
        }
    } else if (TagName) {
        const childrenCreator = createChildren({
            stylesheet,
            fontSize,
            fontFamily,
            section,
            setDropZoneValues,
            refsArr,
            blockTexts,
            fibAndEmptyBlockMap,
            onTextInputChange,
            displayFibBlock,
            textInputId,
            fibInputTextValues,
            incrementalId,
            animatedSize,
            expandViewIndex
        })
        const style = createStyleObject(
            properties.className,
            Object.assign({ color: defaultColor }, properties.style, startingStyle),
            stylesheet
        )
        const children = childrenCreator(node.children, style.color || defaultColor)
        let scrollerStyles = {}
        if (generatedKey === 'code-segment-0') {
            scrollerStyles = {
                width: 'auto',
                marginTop: 16
            }
        }
        return (
            <View
                key={generatedKey}
                style={[
                    style,
                    {
                        flexDirection: 'row',
                        height: verticalScale(26),
                        alignItems: 'center'
                    },
                    scrollerStyles
                ]}
            >
                {children}
            </View>
        )
    }
}

function nativeRenderer({
    defaultColor,
    fontFamily,
    fontSize,
    section,
    refsArr,
    setDropZoneValues,
    blockTexts,
    fibAndEmptyBlockMap,
    fibInputTextValues,
    onTextInputChange,
    displayFibBlock,
    animatedSize,
    expandViewIndex
}) {
    const incrementalId = { id: 0 }
    const textInputId = { id: 0 }
    return ({ rows, stylesheet }) => {
        return rows.map((node, i) =>
            createNativeElement({
                node,
                incrementalId,
                textInputId,
                stylesheet,
                key: `code-segment-${i}`,
                defaultColor,
                fontFamily,
                fontSize,
                section,
                setDropZoneValues,
                refsArr,
                blockTexts,
                fibAndEmptyBlockMap,
                fibInputTextValues,
                onTextInputChange,
                displayFibBlock,
                animatedSize,
                expandViewIndex
            })
        )
    }
}

function NativeSyntaxHighlighter({
    fontFamily,
    fontSize,
    children,
    section,
    setDropZoneValues,
    blockTexts,
    refsArr,
    fibAndEmptyBlockMap,
    displayFibBlock,
    onTextInputChange,
    animatedSize,
    fibInputTextValues,
    expandViewIndex,
    highlighter = 'highlightjs',
    style = highlighter === 'prism' ? prismDefaultStyle : defaultStyle,
    ...rest
}) {
    const { transformedStyle, defaultColor } = generateNewStylesheet({
        stylesheet: style,
        highlighter
    })
    const Highlighter =
        highlighter === 'prism' ? SyntaxHighlighterPrism : SyntaxHighlighter
    return (
        <Highlighter
            {...rest}
            style={transformedStyle}
            horizontal
            renderer={nativeRenderer({
                defaultColor,
                fontFamily,
                fontSize,
                section,
                refsArr,
                setDropZoneValues,
                blockTexts,
                fibInputTextValues,
                fibAndEmptyBlockMap,
                displayFibBlock,
                onTextInputChange,
                animatedSize,
                expandViewIndex
            })}
        >
            {children}
        </Highlighter>
    )
}

NativeSyntaxHighlighter.defaultProps = {
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    fontSize: 12,
    PreTag: ScrollView,
    CodeTag: ScrollView
}

const styles = ScaleSheet.create({
    emptyBlock: {
        minWidth: '28@ms',
        width: 'auto',
        height: '22@vs',
        alignSelf: 'center',
        borderRadius: '10@ms',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#1ac9e8',
        marginHorizontal: 10,
        ...Platform.select({
            android: {
                marginBottom: '6@vs'
            },
            ios: {
                marginBottom: '8@vs'
            }
        })
    },
    textInput: {
        paddingVertical: 0,
        marginHorizontal: 10,
        textAlign: 'center',
        height: '18@ms',
        fontSize: '14@ms',
        alignSelf: 'flex-start',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        color: '#1ac9e8',
        minWidth: '28@hs',
        borderColor: '#1ac9e8',
        fontFamily: 'Monaco'
    },
    blockTextStyle: {
        color: 'white',
        marginHorizontal: 10,
        textAlign: 'center',
        fontSize: '14@ms',
        fontFamily: 'Monaco'
    }
})

export default NativeSyntaxHighlighter