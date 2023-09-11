import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'

const fetchCourseDetails = (courseId, force = false) => {
    return duck.createQuery({
      query: gql`
        query {
          course(id: "${courseId}"){
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
            topics(filter:{
                status: published
            }, orderBy:order_ASC){
              id
              title
              description
              videoTitle
              order
              
            chapter {
                id
                title
                order
            }
              topicComponentRule {
                componentName
                order
                childComponentName
                learningObjectiveComponentsRule{
                    componentName
                    order
                }
                learningObjective{
                    id
                    title
                    order
                    messagesMeta{
                        count
                    }
                    questionBankMeta(filter:{and:[{assessmentType:practiceQuestion}{status:published}]}){
                        count
                    }
                    comicStripsMeta(filter:{status:published}){
                        count
                    }
                    learningSlidesMeta {
                        count
                    }
                    practiceQuestionLearningSlidesMeta: learningSlidesMeta(filter:{type:practiceQuestion}){
                        count
                    }
                }
                blockBasedProject{
                    id
                    order
                    title
                    isHomework
                }
                video{
                    id
                }
            }
            }
        }
      }
      `,
      variables: {
        CDNCaching: true,
      },
      type: 'course/fetch',
      key: `course/${courseId}`,
      force
    })
}
// Learning SLideMEta coiunt
export default fetchCourseDetails
