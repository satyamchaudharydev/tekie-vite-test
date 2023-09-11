const checkForTag = (string, i, tags) => {
  for (const [tagIndex, tag] of tags.entries()) {
    if (tag instanceof Function) {
      const externalTagCheck = tag(string, i)
      if (externalTagCheck) return externalTagCheck
    }
    if (string.slice(i, string.length).startsWith(tag)) {
      return {
        tag,
        i: tagIndex
      }
    }
  }
  return false
}

const parser = (tags, triggers) => text => {
  const startTags = Object.values(tags).map(tag => tag.startTag)
  const endTags = Object.values(tags).map(tag => tag.endTag)

  const nodes = []
  const history = {
    0: {
      text: '',
      type: 'normal'
    },
    nodes: []
  }
  let skipTillIndex = -1
  let currentKey = 0
  for (const [i, letter] of [...text].entries()) {
    let shouldAdd = true
    if (!(i <= skipTillIndex)) {
      if (triggers.includes(letter)) {
        const startTag = checkForTag(text, i, startTags)
        const endTag = checkForTag(text, i, endTags)
        const shouldNotBeNestedAndAlreadyIsStartTag =
          startTag.tag === endTag.tag &&
          history[currentKey].type === Object.keys(tags)[startTag.i] &&
          tags[Object.keys(tags)[startTag.i]].disableNesting
        if (startTag && !shouldNotBeNestedAndAlreadyIsStartTag) {
          if (history[currentKey].type !== 'normal') {
            history.nodes = [...history.nodes, tags[history[currentKey].type].render(history[currentKey].text, history[currentKey].tag)]
            history[currentKey].text = ''
            currentKey = currentKey + 1
          } else {
            nodes.push(tags.normal.render(history[currentKey].text))
          }
          history[currentKey] = {
            text: '',
            type: Object.keys(tags)[startTag.i],
            tag: startTag
          }
          shouldAdd = false
          skipTillIndex = startTag.skipLength ? i + startTag.skipLength : i + startTag.tag.length - 1
        } else if (endTag) {
          if (history[currentKey].type !== 'normal') {
            if (currentKey === 0) {
              if (tags[Object.keys(tags)[endTag.i]].disableNesting) {
                nodes.push(tags[history[currentKey].type].render(history[currentKey].text, history[currentKey].tag))
              } else {
                history.nodes = [...history.nodes, tags[history[currentKey].type].render(history[currentKey].text, history[currentKey].tag)]
                nodes.push(tags[history[currentKey].type].render(history.nodes, history[currentKey].tag))
              }
              history[currentKey] = {
                text: '',
                type: 'normal'
              }
              history.nodes = []
            } else {
              if (history[currentKey - 1]) {
                history.nodes =
              [...history.nodes, tags[history[currentKey].type].render(history[currentKey].text, history[currentKey].tag)]
                history[currentKey] = undefined
                currentKey = currentKey - 1
              }
            }
          } else {
            nodes.push(tags.normal.render(history[currentKey].text))
          }
          shouldAdd = false
          skipTillIndex = i + endTag.tag.length - 1
        }
      }
      if (shouldAdd) {
        history[currentKey].text += letter
      }
    }
  }
  nodes.push(tags.normal.render(history[0].text))
  return nodes
}

export default parser
