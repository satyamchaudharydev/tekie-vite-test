import gql from 'graphql-tag'
import get from 'lodash/get';
import duck from '../../duck/duckIfCacheExists'

const fetchCoursePackageDetails = (coursePackageId, force = false) => {
    return duck.createQuery({
      query: gql`
        query {
          coursePackages(filter:{id: "${coursePackageId}"}){
            title
            thumbnail{
              uri
            }
            courses {
              id
              category
              codingLanguages{
                value
              }
              defaultLoComponentRule{
                componentName
                order
              }
              topicsData: topics(filter:{status:published}) {
                id
                classType
              }
              thumbnailSmall{
                uri
              }
              description
              title
              courseDisplayName
              courseComponentRule {
                componentName
                order
              }
            }
            packageTopics: topics {
                order
                topic {
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
      }
      `,
      variables: {
        CDNCaching: true,
      },
      type: "coursePackages/fetch",
      key: `coursePackages/${coursePackageId}`,
      force,
      changeExtractedData: (extractedData, originalData) => {
        //   setting the empty data in redux
          extractedData.chapter = []
          extractedData.learningObjective = []
          extractedData.coursePackages = get(originalData, 'coursePackages', [])
          const topics = []
          extractedData.coursePackages.forEach(coursePackage => {
            const packageCourses = get(coursePackage, 'courses', [])
            get(coursePackage, 'packageTopics', []).forEach(topic =>{
              const findCourse = packageCourses.find(course => get(course, 'topicsData', []).map(topic => get(topic, 'id')).includes(get(topic, 'topic.id')))
              if (findCourse) {
                //   finding the associated topic and assigning a course to it
                topic.topic.courseData = findCourse
                topics.push(topic.topic)
              }
            })
          })
        extractedData.topic = topics
      return {
        ...extractedData
      }
      },
      expiresIn: (100 * 1000)
    });
}
// Learning SLideMEta coiunt
export default fetchCoursePackageDetails
