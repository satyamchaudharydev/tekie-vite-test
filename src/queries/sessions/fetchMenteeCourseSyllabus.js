import { get } from "lodash";
import duck from "../../duck"
import getCourseId from "../../utils/getCourseId";

const fetchMenteeCourseSyllabus = () => {
    const url = "/sessions/menteeCourseSyllabus/64784e3277b03202a71ad601"
    const response = duck.query({
			query: url,

			type: "menteeCourseSyllabus/fetch",
			key: "menteeCourseSyllabus",
			
			options: {
				rest: true,
				method: "get",
				headers: {},
				data: {},
				apiType: "menteeCourseSyllabus",
			},
			changeExtractedData: (extractedData, originalData) => {
				const courseId = getCourseId()

				if (extractedData.menteeCourseSyllabus) {
					extractedData.menteeCourseSyllabus.courseId = courseId
				  }
				  extractedData.coursePackages = extractedData.coursePackages.map(coursePackage => {
					const coursesWithData = get(extractedData, 'courses', [])
					return {
					  ...coursePackage,
					  courses: get(coursePackage, 'courses', []).map(course => {
						const thisCourseWithData = coursesWithData.find(c => c.id === course.id)
						return thisCourseWithData
					  })
					}
				  })
				  extractedData.course = extractedData.courses
          console.log({extractedData})
				  return extractedData;
			}
		});
    return response
} 
export default fetchMenteeCourseSyllabus    