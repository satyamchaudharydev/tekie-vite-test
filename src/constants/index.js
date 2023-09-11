const STUDENT_APP_PREFIX = 'student';
const TEACHER_APP_PREFIX = 'teacher';
const HOSTNAME = 'tekie.in';
const LOCALHOST = 'localhost';

const subDomainMapping = {
    teacherApp: {
        prod: [TEACHER_APP_PREFIX, 'teacher-prod'],
        preProd: [`${TEACHER_APP_PREFIX}-preprod`],
        staging: [`${TEACHER_APP_PREFIX}-staging`, `${TEACHER_APP_PREFIX}-staging-test`],
        dev: [`${TEACHER_APP_PREFIX}-dev`],
    },
    studentApp: {
        prod: [STUDENT_APP_PREFIX, 'student-prod'],
        preProd: [`${STUDENT_APP_PREFIX}-preprod`],
        staging: [`${STUDENT_APP_PREFIX}-staging`, `${STUDENT_APP_PREFIX}-staging-test`],
        dev: [`${STUDENT_APP_PREFIX}-dev`],
    },
}

const environments = {
    dev: 'dev',
    staging: 'staging',
    preProd: 'preprod',
    production: 'production'
}

const teacherAppSubDomains = Object.values(subDomainMapping.teacherApp).flat();

const studentAppSubDomains = Object.values(subDomainMapping.studentApp).flat();

const appSubdomains = Object.keys(subDomainMapping).map(platform => Object.values(subDomainMapping[platform]).flat()).flat();

// Please note adding any new subdomain here will make it a root domain and also need to be added in server react-renderer.js file
const rootDomains = [
    'dev',
    'www',
    'school',
    'staging',
    'staging-test',
    'preprod',
    'prod',
    'localhost',
    'tekie-web-dev',
    'tekie-web-staging',
    'tekie-web-pre-prod',
    'web-staging-8db1f1b3f3b32bfd',
];

const routeType = { PUBLIC: 'PUBLIC', PRIVATE: 'PRIVATE' }

export {
  STUDENT_APP_PREFIX,
  TEACHER_APP_PREFIX,
  HOSTNAME,
  LOCALHOST,
  subDomainMapping,
  teacherAppSubDomains,
  studentAppSubDomains,
  appSubdomains,
  rootDomains,
  environments,
  routeType,
};
