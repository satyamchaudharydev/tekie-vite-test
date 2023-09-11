const getIframeUrl = ({ isRevisit, isLoComponent = false, componentName, courseId, topicId, componentId }) => {

        const revisitString = ['true', 'True', true].includes(isRevisit) ? '/revisit' : '';
        
        if (isLoComponent) {
            return `/teacher${revisitString}/sessions/${componentName}/${courseId}/${topicId}/${componentId}`
        }
        switch (componentName) {
            case 'video': {
                return `/teacher${revisitString}/sessions/video/${courseId}/${topicId}/${componentId}`
            }
            case 'blockBasedPractice': {
                return `/teacher${revisitString}/sessions/practice/${courseId}/${topicId}/${componentId}`
            }
            case 'blockBasedProject': {
                return `/teacher${revisitString}/sessions/project/${courseId}/${topicId}/${componentId}`
            }
            case 'assignment': {
                return `/teacher${revisitString}/sessions/coding/${courseId}/${topicId}`
            }
            case 'homework': {
                return `/teacher/sessions/homework-review/${courseId}/${topicId}`
            }
            case 'homeworkPractice': {
                return `/teacher/homework/${courseId}/${topicId}/${componentId}/practice`
            }
            case 'homeworkAssignment': {
                return `/teacher/homework/${courseId}/${topicId}/codingAssignment`
            }
            case 'quiz': {
                return `/teacher/homework/${courseId}/${topicId}/quiz`
            }
            default: {
                return '/teacher/sessions'
            }
        }
}
    
export default getIframeUrl