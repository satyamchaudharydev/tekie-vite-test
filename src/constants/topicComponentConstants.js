const TOPIC_COMPONENTS = {
  video: 'video',
  learningObjective: 'learningObjective',
  assignment: 'assignment',
  homeworkAssignment: 'homeworkAssignment',
  quiz: 'quiz',
  blockBasedProject: 'blockBasedProject',
  blockBasedPractice: 'blockBasedPractice',
  homeworkPractice: 'homeworkPractice',
};

const { homeworkAssignment, homeworkPractice, quiz, video, assignment, blockBasedPractice, blockBasedProject } = TOPIC_COMPONENTS;

export const routesToComponentMap = {
  video: video,
  coding: assignment,
  project: blockBasedProject,
  practice: blockBasedPractice
}

const HOMEWORK_COMPONENTS = [homeworkAssignment, homeworkPractice, quiz]
const HOMEWORK_COMPONENTS_CONFIG = {
  homeworkAssignment,
  
  homeworkPractice,
  quiz
}
export {
    TOPIC_COMPONENTS,
    HOMEWORK_COMPONENTS,
    HOMEWORK_COMPONENTS_CONFIG,
}