export const masteryLevels = {
    NONE: {
        key: 'none',
        tagName: 'NOT FAMILIAR',
        tagColor: '#ADADAD',
        preText: 'You\'re',
        postText: 'with this topic',
    },
    FAMILIAR: {
        key: 'familiar',
        tagName: 'FAMILIAR',
        tagColor: '#F7941D',
        preText: 'You\'re',
        postText: 'with this topic',
    },
    MASTER: {
        key: 'master',
        tagName: 'MASTERED',
        tagColor: '#8C61CB',
        preText: 'You\'ve',
        postText: 'this topic',
    },
    PROFICIENT: {
        key: 'proficient',
        tagName: 'PROFICIENT',
        tagColor: '#1AC9E8',
        preText: 'You\'re',
        postText: 'with this topic',
    },
}
const getMasteryLabel = (masteryLevel) => {
    if (masteryLevel && masteryLevels[masteryLevel.toUpperCase()]) {
        return masteryLevels[masteryLevel.toUpperCase()]
    }
    return masteryLevels.NONE
}

export default getMasteryLabel