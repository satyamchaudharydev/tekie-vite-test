const getPrevTopicId = (topics, currTopicId) => {
    if (topics) {
        let topicId = ''
        topics.forEach((topic, index) => {
            if (!topics[index - 1]) return ''
            if (topic && topic.id === currTopicId) {
                topicId = (topics[index - 1]) && (topics[index - 1]).id
            }
        })
        return topicId
    }

    return ''
}

export {
    getPrevTopicId
}
