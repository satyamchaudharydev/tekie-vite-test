import gql from "graphql-tag";
import { List } from "immutable";
import { get } from "lodash";
import duck from "../../duck";
import { filterKey } from "../../utils/data-utils";
import { checkForSchoolTeacher, checkForSchoolTeacherInRawData } from "../../utils/teacherApp/checkForSchoolTeacher";

const fetchMentorChild = async () => {
    // let user = filterKey(window && window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List([])
    // user = user.toJS()[0]
    // let mentorChildId = get(user, 'mentorProfile.studentProfile.id')
    // if (checkForSchoolTeacher(user)) {
    //   if (checkForSchoolTeacherInRawData(user)) {
    //     mentorChildId = get(user, 'rawData.mentorProfile.studentProfile.id')
    //   }
    // }
  // return duck.query({
  //   query: gql`
  //   {
  //       mentorChild: studentProfile(id: "${mentorChildId}") {
  //           id
  //           mentor {
  //             id
  //             teacherManualTooltipCount
  //             sessionTabTooltipCount
  //             theoryClassroomTooltipCount
  //           }
  //           studentUser: user{
  //             id
  //           }
  //           batch {
  //           id
  //           type
  //           classroomTitle
  //           documentType
  //           viewContentBasedOnCurrentComponent
  //           coursePackage {
  //               id
  //               title
  //           }
  //           }
  //           batches {
  //           id
  //           type
  //           documentType
  //           classroomTitle
  //           viewContentBasedOnCurrentComponent
  //           coursePackage {
  //               id
  //               title
  //           }
  //           }
  //       }
  //   }
  //   `,
  //   type: "mentorChild/fetch",
  //   key: "mentorChild",
  //   changeExtractedData: async (extracted, original) => {
  //     extracted.batches = []
  //     extracted.coursePackages = []
  //     const batches = []
  //     if (get(original, 'mentorChild.batch.id')) batches.push(get(original, 'mentorChild.batch'))
  //     if (get(original, 'mentorChild.batches', [])) {
  //       get(original, 'mentorChild.batches', []).forEach((batch) => {
  //         const isAlreadyAdded = batches.find(batchData => get(batchData, 'id') === get(batch, 'id'))
  //         if (!isAlreadyAdded) {
  //           batches.push(batch)
  //         }
  //       })
  //     }
  //     extracted.mentorChild = {
  //       ...get(original, 'mentorChild'),
  //       batches
  //     }
  //     return { ...extracted }
  //   }
  // });
};
export default fetchMentorChild;