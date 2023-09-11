import React from 'react'
import { get } from 'lodash'
import { hs } from './size'
import getPath from './getPath'
import parser from './text-parser'
import codeTagParser from './codeTagParser'

const styles = {
  block: {
    fontWeight: '700',
    backgroundColor: 'rgba(26, 201, 232, 0.16)',
    display: 'inline-block'
  },
  inlineBlock: {
    display: 'inline-block'
  },
  bullet: {
    margin: '4px 0px',
    padding: '0px 14px'
  }
}
const parseMetaTags = props => {
  if (!props.statement) {
    return ''
  }
  if (!props.statement.includes('</') && props.codeTagParser) {
    return codeTagParser(props.statement)
  }
  const { emojis } = props
  // eslint-disable-next-line
  const regex = new RegExp('\n', 'gi')
  let statement = props.statement.replace(regex, '<br></br>')
  if (props && props.removeCodeTag && statement) {
    statement = statement.replaceAll('<code>', '')
    statement = statement.replaceAll('</code>', '')
  }
  const isEmoji = emojiCode => emojis && emojis.find(emoji => emoji.code === emojiCode)
  const textStyles = styles.inlineBlock
  const bulletStyles = styles.bullet
  const brStyle = { display: 'block' }
  const triggers = ['<', ':']
  const tags = {
    bold: {
      startTag: '<bold>',
      endTag: '</bold>',
      render: value => ((value && value.split
        ? (
          value.split(' ').map((text, i) =>
            value.split(' ').length - 1 === i
              ? (
                <div
                  key={i}
                  style={{
                    ...textStyles,
                    fontWeight: 700
                  }}
                  from-bold="true"
                >{text}
                </div>
              ) : (
                <div
                  key={i}
                  style={{
                    ...textStyles,
                    fontWeight: 700
                  }}
                >{text}&nbsp;
                </div>
              )
          )
        ) : (
          <div
            style={{
              ...textStyles,
              fontWeight: 700
            }}
          >{value}
          </div>
        )
      ))
    },
    bullet: {
      startTag: '<bullet>',
      endTag: '</bullet>',
      render: value => ((value && value.split
        ? (
          <ul style={{
            ...bulletStyles
          }}>
            <li>
              {value}
            </li>
          </ul>
        ) : (
          <div
            style={{
              ...textStyles,
            }}
          >{value}
          </div>
        )
      ))
    },
    a: {
      startTag: (string, i) => {
        const splittedString = string.slice(i, string.length).split(' ').filter(s => s)
        if (splittedString[0] === '<a' && splittedString[1].split('=')[0] === 'href') {
          const link = splittedString[1].split('="')[1].split('">')[0]
          const skipLength = string.slice(i, string.length).indexOf('">') + 1
          return {
            tag: 'a',
            i: 1,
            link: link,
            skipLength
          }
        }
        return false
      },
      endTag: '</a>',
      render: (value, { link }) => {
        return (
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
          >
            <div
              style={{
                ...textStyles,
                color: '#0077cc',
                textDecoration: 'underline',
                fontFamily: 700
              }}
            >{value}
            </div>
          </a>
        )
      }
    },
    emoji: {
      startTag: '::',
      endTag: '::',
      disableNesting: true,
      render: value => {
        const emoji = isEmoji(`::${value}::`)
        if (emoji) {
          return (
            <img
              style={{
                width: hs(30),
                height: hs(30),
                position: 'relative',
                top: hs(5)
              }}
              src={getPath(get(emoji, 'image.uri'))}
              alt={'emoji'}
            />
          )
        }
      }
    },
    normal: {
      render: value => (value && value.split
        ? (
          value.split(' ').map((text, i) =>
            value.split(' ').length - 1 === i
              ? (
                <div style={textStyles} key={i}>{text}</div>
              ) : (
                <div style={textStyles} key={i}>{text}&nbsp;</div>
              )
          )
        ) : (
          value
            ? <div style={textStyles}>{value}</div>
            : <></>
        )
      )
    },
    block: {
      startTag: '<block>',
      endTag: '</block>',
      render: value => ((value && value.split
              ? (
                  value.split(' ').map((text, i) =>
                      value.split(' ').length - 1 === i
                          ? (
                              <div
                                  key={i}
                                  style={styles.block}
                              >{text}
                              </div>
                          ) : (
                              <div
                                  key={i}
                                  style={styles.block}
                              >{text}&nbsp;
                              </div>
                          )
                  )
              ) : (
                  <div style={styles.block}>{value}</div>
              )
        ))
    },
    break: {
      startTag: '<br>',
      endTag: '</br>',
      render: value => ((value && value.split
        ? (
          value.split(' ').map((texts, i) =>
            value.split(' ').length - 1 === i
              ? (
                <span
                  key={i}
                  style={brStyle}
                >{texts}
                </span>
              ) : (
                <span
                  key={i}
                  style={brStyle}
                >{texts}&nbsp;
                </span>
              )
          )
        ) : (
          <span style={brStyle}>{value}</span>
        )
      ))
    }
  }
  return parser(tags, triggers)(statement)
}

export default parseMetaTags
