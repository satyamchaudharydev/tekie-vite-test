function generateDummy(
  type,
  mainTitle,
  title,
  videoTitle,
  videoTime,
  quantity
) {
  const data = []
  for (let i = 1; i <= quantity; i++) {
    const mainTitle1 = `${mainTitle}-${i}`
    const body = []
    for (let j = 0; j < 5; j++) {
      const obj = {}
      obj.id = `${type}-${title || videoTitle}-${i}-${j}`
      if (title) {
        obj.title = `${title}-${j}`
      }
      if (videoTitle) {
        obj.videoTitle = `${videoTitle}-${j}`
      }
      if (videoTime) {
        obj.videoTime = '2m'
      }
      body.push(obj)
    }
    const obj = { mainTitle: mainTitle1, body }
    data.push(obj)
  }
  return data
}

export const QUIZZES = generateDummy(
  'QUIZZES',
  'Chapter',
  'topic',
  null,
  null,
  3
)

export const PRACTICE_QUESTIONS = generateDummy(
  'PRACTICE_QUESTIONS',
  'Chapter',
  'topic',
  null,
  null,
  3
)

export const CHATS = generateDummy(
  'CHATS',
  'Topic',
  'Learning Objective',
  null,
  null,
  3
)

export const LEARNING_VIDEOS = generateDummy(
  'LEARNING_VIDEOS',
  'Chapter',
  'Topic',
  'Video-Title',
  '2m',
  3
)
export const OVERVIEW_VIDEOS = generateDummy(
  'LEARNING_VIDEOS',
  'Chapter',
  'Topic',
  'Video-Title',
  '2m',
  3
)

export const STORY_BITS = generateDummy(
  'LEARNING_VIDEOS',
  'Chapter',
  null,
  'Video-Title',
  '2m',
  3
)
