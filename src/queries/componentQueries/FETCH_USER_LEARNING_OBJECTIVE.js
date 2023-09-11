import { learningObjectiveComponents, PYTHON_COURSE } from "../../config"
import getCourseId, { getCourseName } from "../../utils/getCourseId"

const FETCH_USER_LEARNING_OBJECTIVE = (
  userId,
  learningObjectiveId,
  courseId = null,
  topicId = '',
  componentType = '',
  hasPQ,
  skipAdditionalLOQuery = false,
) => {
  userId = "cl3qvsttk06or1wrz984ugda0"
  if (skipAdditionalLOQuery) return '';
  const isChatPractice = componentType === learningObjectiveComponents.message ||
  componentType === learningObjectiveComponents.practiceQuestion
  const isChatbot = componentType === learningObjectiveComponents.chatbot

  const isLearningSlide = componentType === learningObjectiveComponents.learningSlide

  let additionalFilter = ''
  if (courseId) {
    additionalFilter += `{ course_some: { id: "${courseId}" } }`
  }
  const CHAT_SPECIFIC_QUERY_ROOT = `
    chatStatus
    isChatBookmarked
  `
  const PRACTICE_SPECIFIC_QUERY_ROOT = `
    practiceQuestionStatus
  `

  const COMIC_STRIP_QUERY_ROOT  = `
    isComicStripBookmarked
  `

  const PRACTICE_SPECIFIC_QUERY_CONTENT_FIELDS = `
    id
    order
    questionLayoutType
    blockLayoutType
    statement
    hint
    explanation
    questionType
    difficulty
    assessmentType
    learningSlideData: learningSlides{
      id
    }
    hints {
      hintPretext
      hint
    }
    learningObjective {
      id
      title
      order
    }
    questionCodeSnippet
    answerCodeSnippet
    status
    mcqOptions {
      statement
      isCorrect
      blocksJSON
      initialXML
      questionBankImage {
        image {
          uri
        }
      }
    }
    fibInputOptions {
      correctPosition
      answers
    }
    fibBlocksOptions {
      statement
      displayOrder
      correctPositions
    }
    arrangeOptions {
      statement
      displayOrder
      correctPosition
      correctPositions
    }
    learningObjective {
      id
    }
  `

  const PRACTICE_SPECIFIC_QUERY_CONTENT = `
    questions {
      ${PRACTICE_SPECIFIC_QUERY_CONTENT_FIELDS}
    }
  `
  const PRACTICE_QUESTION_SPECIFIC_QUERY_CONTENT = `question{
    ${PRACTICE_SPECIFIC_QUERY_CONTENT_FIELDS}
  }
  attemptNumber
  status
  totalAttemptCount
  isHintUsed
  isAnswerUsed
  `

  const CHAT_SPECIFIC_QUERY_CONTENT = `
    messages {
      id
      statement
      type
      image {
        id
        uri
      }
      emoji {
        id
        code
        image {
          id
          uri
        }
      }
      sticker {
        id
        code
        image {
          id
          uri
        }
      }
      terminalInput
      terminalOutput
      editorMode
      order
      alignment
      ${(isChatbot && hasPQ) ? PRACTICE_SPECIFIC_QUERY_CONTENT : ''}
    }
  `

  const LEARNING_SLIDE_SPECIFIC_QUERY_ROOT = `
    learningSlideStatus
    learningSlides {
      status
      learningSlide {
        id
        order
        type
        name
        type
        layoutType
        googleSlideLink
        slideContents {
          id
          gridPlacement
          type
          codeInput
          codeOutput
          url
          statement
          codeEditorConfig {
            editorMode
            layout
            executionAccess
          }
          media {
            uri
            id
          }
        }
        ${hasPQ ? `
          practiceQuestions {
            ${PRACTICE_SPECIFIC_QUERY_CONTENT_FIELDS}
          }
        ` : ''}
      }
    }
  `

  const COMIC_STRIPS_QUERY_CONTENT = `
    comicStrips {
      title
      comicImages {
        image {
          name
          uri
        }
        order
      }
    }
  `  

  return `
    userLearningObjectives(
      filter: {
        and: [
          { user_some: { id: "${userId}" } }
          ${
						getCourseName() !== PYTHON_COURSE && !additionalFilter
							? `{course_some:{id: "${getCourseId(topicId)}"}}`
							: ""
					}
          ${topicId ? `{ topic_some: { id: "${topicId}" } }` : ""}
          { learningObjective_some: { id: "${learningObjectiveId}" } }
          ${additionalFilter}
        ]
      }
    ) @duck(
      type: "chatPractice/fetch"
      key: "${learningObjectiveId}"
      ${isLearningSlide ? 'changeExtractedDataKey: "learningSlide"' : ""}
    ) {
      id
      ${isChatPractice || isChatbot ? CHAT_SPECIFIC_QUERY_ROOT : ""}
      ${
				(isChatPractice || isChatbot || isLearningSlide) && hasPQ
					? PRACTICE_SPECIFIC_QUERY_ROOT
					: ""
			}
      ${
				componentType === learningObjectiveComponents.comicStrip
					? COMIC_STRIP_QUERY_ROOT
					: ""
			}
      ${isLearningSlide ? LEARNING_SLIDE_SPECIFIC_QUERY_ROOT : ""}

      learningObjective {
        id
        title
        ${
					componentType === learningObjectiveComponents.comicStrip
						? COMIC_STRIPS_QUERY_CONTENT
						: ""
				}
        ${isChatPractice || isChatbot ? CHAT_SPECIFIC_QUERY_CONTENT : ""}

        ${
					hasPQ && isChatPractice
						? `
          pqStory
          pqStoryImage{
            id
            uri
          }
        `
						: ""
				}
        }
        ${
					(isChatPractice || isLearningSlide) && hasPQ
						? `
          practiceQuestions {
            ${PRACTICE_QUESTION_SPECIFIC_QUERY_CONTENT}
          }`
						: ""
				}

      nextComponent {
        learningObjective {
          id
          title
          description
          thumbnail {
            id
            uri
          }
        }
        topic {
          id
        }
        nextComponentType
        blockBasedProject{
          title
          order
        }
      }
    }`;
}


export default FETCH_USER_LEARNING_OBJECTIVE