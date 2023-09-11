import { get } from "lodash";
import duck from "../../../duck";
import header from "../../../utils/header";

const fetchBatchDetails = async (batchId, user) => {
  const divId = get(user, 'divid');
  const academicYearId = get(user, 'academicyear.id')
  const key = 'batchCoursePackageDetail'
  const headers = header(user)
  return duck.query({
		query: `https://api-stage.uolo.co/core/tekie/get-batch-course-mappings?divId=${divId}&academicYearId=${academicYearId}&groupId=${batchId}`,
		options: {
			tokenType: "appTokenOnly",
			rest: true,
			method: "get",
			headers,
			apiType: key,
		},
		changeExtractedData: (extractedData, originalData) => {
      if (originalData && originalData.batchCoursePackageDetail) {
        const batchCoursePackageDetail = get(extractedData, 'batchCoursePackageDetail')
        console.log('batchCoursePackageDetail ', batchCoursePackageDetail)
        const courseTopicMappings = get(batchCoursePackageDetail, 'courseTopicMappings')
        originalData.batchCoursePackageDetail.coursePackage = get(courseTopicMappings, 'coursePackage')
        originalData.batchCoursePackageDetail.coursePackageTopicRule = get(courseTopicMappings, 'coursePackageTopicRule')
        delete originalData.batchCoursePackageDetail.courseTopicMappings
        const data = originalData.batchCoursePackageDetail
        originalData.batchCoursePackageDetail = [data]
        return originalData
      }
		},
		type: `${key}/fetch`,
		key: `${key}/${batchId}`,
	});
};

export default fetchBatchDetails;