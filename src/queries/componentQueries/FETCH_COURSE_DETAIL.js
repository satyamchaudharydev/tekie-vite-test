const FETCH_COURSE_DETAIL = (courseId) => `
query {
    course(id: "${courseId}")@duck(
  type: "course/fetch"
  key: "course/${courseId}"
) {
    id
    courseComponentRule {
        componentName
        order
    }
    defaultLoComponentRule {
        componentName
        order
    }
    codingLanguages{
        value
    }
    javaEditorUrl
}
}
`

export default FETCH_COURSE_DETAIL;
