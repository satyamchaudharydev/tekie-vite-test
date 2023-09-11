import { get } from "lodash"

const batchSlots = `
  batch {
    id
    type
    documentType
    classroomTitle
    shouldShowEbook
    viewContentBasedOnCurrentComponent
    coursePackage {
      id
      title
    }
  }
`
export const SIGNUP_RESPONSE_SCHEMA = (otpLogin = false) => `
  id
  name
  token
  role
  secondaryRole
  roles
  createdAt
  source
  username
  country
  timezone
  email
  ${otpLogin ? 'savedPassword' : ''} 
  profilePic {
    uri
  }
  schools {
    id
    name
    city
    country
    coordinatorEmail
    coordinatorRole
    isQuestionPaperGeneratorEnabled
    coordinatorPhone {
      countryCode
      number
    }
    coordinatorName
    logo {
      id
      name
      uri
    }
  isCanvaSsoEnabled
  }
  campaign {
    type
  }
  academicYears {
    id
    startDate
    endDate
  }
  mentorProfile {
    scheduleManagement {
      isDeleteSessions
    }
    teacherOrganisation
    schools {
      id
      name
      code
      isTimeTableEnabled
      isQuestionPaperGeneratorEnabled
      isClassroomEnabled
      isCanvaSsoEnabled
    }
    studentProfile {
      grade
      id
      section
      rollNo
      school{
        id
        name
        isCanvaSsoEnabled
      }
      user {        
        id
        name
        role
        timezone
      }
    }
  }
  studentProfile {
    id
    grade
    section
    rollNo
    school{
      id
      name
      isCanvaSsoEnabled
    }
    profileAvatarCode
    ${batchSlots}
    user {
      id
      name
      timezone
    }
    batch {
      id
      type
      documentType
      coursePackage{
        id
        title
      }
    }
    school {
      id
      whiteLabel
      name
      isTimeTableEnabled
      isQuestionPaperGeneratorEnabled
      logo {
        uri
      }
      isCanvaSsoEnabled
    }
    parents {
      id
      user {
        id
        role
        ${otpLogin ? 'savedPassword' : ''}
        phone {
          number
          countryCode
        }
        source
        country
        email
        campaign {
          id
          type
          title
          school {
            id
            whiteLabel
            name
            logo {
              uri
            }
            isCanvaSsoEnabled
          }
          timeTableRules {
            ${new Array(24).fill('').map((_, i) => `slot${i}`).join('\n')}
            bookingDate
          }
          classes {
            section
            grade
          }
          poster {
            uri
          }
        }
      }
      children {
        id
        grade
        section
        rollNo
        profileAvatarCode
        ${batchSlots}
        user {
          id
          timezone
        }
        batch {
          id
          type
          documentType
          coursePackage{
            id
            title
          }
        }
        school {
          id
          whiteLabel
          name
          isTimeTableEnabled
          isQuestionPaperGeneratorEnabled
          logo {
            uri
          }
          isCanvaSsoEnabled
        }
      }
    }
  }
  parentProfile {
    id
    user {
      email
      campaign {
        id
        type
        title
        school {
          id
          whiteLabel
          name
          logo {
            uri
          }
          isCanvaSsoEnabled
        }
        timeTableRules {
          ${new Array(24).fill('').map((_, i) => `slot${i}`).join('\n')}
          bookingDate
        }
        classes {
          section
          grade
        }
        poster {
          uri
        }
      }
    }
    children {
      id
      grade
      section
      rollNo
      profileAvatarCode
      ${batchSlots}
      user {
        id
        timezone
      }
      batch {
        id
        type
        documentType
        coursePackage{
          id
          title
        }
      }
      school {
        id
        whiteLabel
        name
        isTimeTableEnabled
        isQuestionPaperGeneratorEnabled
        logo {
          uri
        }
        isCanvaSsoEnabled
      }
    } 
  }
  phone {
    countryCode
    number
  }
  children {
    id
    name
    token
    role
  }
  buddyDetails{
    id
    role
    isPrimaryUser
    name
    token
    studentProfile{
      id
      grade
      profileAvatarCode
      section
      rollNo
      school{
        id
        name
        isCanvaSsoEnabled
      }
    }
  }
`

const getUserForState = (data, callbackIfMultipleChildren = () => { }) => {
  if (get(data, 'studentProfile.id')) {
    return {
      user: {
        ...data,
        campaign: get(data, 'campaign.type'),
        email: data.email,
        parent: {
          ...get(data, 'studentProfile.parents[0].user'),
          parentProfile: get(data, 'studentProfile.parents[0]'),
        },
        createdAt: data.createdAt
      },
      studentProfile: get(data, 'studentProfile')
    }
  }
  const { children, ...parent } = data
  let res = {}
  if (children.length > 1) {
    if (callbackIfMultipleChildren) {
      callbackIfMultipleChildren()
    }
    res = {
      userChildren: data.children,
      userParent: data
    }
  }

  return {
    ...res,
    user: {
      ...data.children[children.length - 1],
      campaign: get(data, 'campaign.type'),
      email: data.email,
      parent: parent,
      createdAt: data.createdAt
    },
    studentProfile: get(data, 'parentProfile.children[0]')
  }
}

export const getUserPhoneNumber = (data) => {
  if (get(data, 'studentProfile.id')) {
    return get(data, 'studentProfile.parents[0].number')
  }
  return get(data, 'phone.number')
}

export default getUserForState