// google sign in webClientId
export const googleWebClientId = '948144838611-najsguugb41q0ugs18tt9joous9kbqdg.apps.googleusercontent.com'
// App working mode

export const countriesMap = {
  'ae': 'uae',
  'in': 'india',
  'sg': 'singapore',
  'af': 'afghanistan',
  'au': 'australia',
  'us': 'usa',
  'ru': 'russia',
  'gb': 'uk',
  'om': 'oman',
  'qa': 'qatar',
  'kw': 'kuwait',
  'eg': 'egypt',
  'ca': 'canada',
  'jm': 'jamaica',
  'bd': 'bangladesh',
}

export const countriesAllowed = Object.keys(countriesMap)

export const cache = true
export const keysToCache = [
  'user',
  'currentTopicComponent',
  'totalTopics',
  'totalChapters',
  'chapter',
  'currentCourse',
  'currentTopicComponentDetail',
  'homepage',
  'userQuizReport',
  'menteeCourseSyllabus',
  'learningObjective',
  'studentProfile',
  'userFirstAndLatestQuizReport',
  'mentorMenteeSession',
  'unlockBadge',
  'message',
  'userChildren',
  'userParent',
  'batchSession',
  'topic',
  'course',
  'courses',
  'userCourse',
  'coursePackages',
  'ebookCourse',
]

export const referralCredits = [{
  registrationVerified: 100,
  trialTaken: 100,
  coursePurchased: 800,
}, {
  registrationVerified: 100,
  trialTaken: 100,
  coursePurchased: 2300,
}];

export const MINIMUM_BANK_LIMIT = 2500
export const GIFT_VOUCHER_AMOUNT = 2500
export const MAXIMUM_EARNED_CREDIT_LIMIT = 25000

export const courseName = 'Intro to Coding ( with mentor )'
export const product1 = 'Live 1:1 Classes'
export const product2 = 'Live 1:2 Classes'
export const product3 = 'Live 1:3 Classes'
export const product4 = 'Live 1:4 Classes'
export const product5 = 'Live 1:5 Classes'
export const product6 = 'Live 1:6 Classes'
export const product7 = 'Live 1:7 Classes'
export const product8 = 'Live 1:8 Classes'
export const product9 = 'Live 1:9 Classes'
export const product10 = 'Live 1:10 Classes'
export const product11 = 'Live 1:11 Classes'
export const product12 = 'Live 1:12 Classes'
export const product30 = 'Live 1:30 Classes'
export const schoolDiscountCoupons = {
  'Primrose Schools': 'primrose',
  'G M Vidyanikethan Public School': 'gmvps',
  'KRM Public School': 'krmps',
  'DPS PATHANKOT': 'dpsptk',
  'CRB MEMORIAL SR SECONDARY SCHOOL': 'crbss',
  'Rohilas International School': 'rohilasis',
  'Mar Thoma Public School': 'mtps',
  'Delhi World Public School': 'dwps',
  'Summer Field School': 'sfs',
  'Airforce BalBharti School': 'abbs',
  'Mahavir Senior Model School': 'msms',
  'St Joseph Academy': 'sja',
  'Paras World School': 'pws',
  'Trivandrum International School': 'tis',
  'Global International School': 'gis',
  'Jaya Jaya Sankara International School': 'jjsis',
  'Jayawant Public School': 'jps',
  'Himalaya International School': 'his',
  'NC Jindal Public School': 'njps',
  'Little Star School': 'lss',
  'HH International School': 'hhis',
  'Bhagavathi English Medium': 'bem',
  'Poornachandra School': 'poorna',
  'Gujarath English Medium School': 'gems'
}
export const productTypes = ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToFour', 'oneToFive', 'oneToSix', 'oneToSeven', 'oneToEight', 'oneToNine', 'oneToTen', 'oneToEleven', 'oneToTwelve', 'oneToThirty']
export const products = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 2457,
    "totalCharge": 30303,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 1725,
    "totalCharge": 21275,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 1313,
    "totalCharge": 16187,
    "label": "Live 1:3 Classes"
  },
];
const GMSV_SCHOOL_PRODUCTS = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 12600,
    "totalCharge": 20160,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 10130,
    "totalCharge": 12870,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 7510,
    "totalCharge": 9990,
    "label": "Live 1:3 Classes"
  },
  {
    "price": 12000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToFour",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcntc500000vx95mhi6zdv",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:4 Classes",
    "discountPrice": 3200,
    "totalCharge": 8800,
    "label": "Live 1:4 Classes"
  },
  {
    "price": 10000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToFive",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcoain00010vx98k1sb8ec",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:5 Classes",
    "discountPrice": 2800,
    "totalCharge": 7200,
    "label": "Live 1:5 Classes"
  },
  {
    "price": 8500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToSix",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcomkg00020vx9chi23l3f",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:6 Classes",
    "discountPrice": 2300,
    "totalCharge": 6200,
    "label": "Live 1:6 Classes"
  },
  {
    "price": 7800,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToSeven",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcowa900030vx99fa5cy99",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:7 Classes",
    "discountPrice": 2100,
    "totalCharge": 5700,
    "label": "Live 1:7 Classes"
  },
  {
    "price": 7200,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToEight",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcp8ga00040vx9fihi9wqk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:8 Classes",
    "discountPrice": 2000,
    "totalCharge": 5200,
    "label": "Live 1:8 Classes"
  },
  {
    "price": 6800,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToNine",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcphfj00050vx98nrmc10q",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:9 Classes",
    "discountPrice": 1800,
    "totalCharge": 5000,
    "label": "Live 1:9 Classes"
  },
  {
    "price": 6300,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTen",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcpqhr00060vx93p1y3q11",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:10 Classes",
    "discountPrice": 1700,
    "totalCharge": 4600,
    "label": "Live 1:10 Classes"
  },
  {
    "price": 6000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToEleven",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcq11z00070vx9ecl921ck",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:11 Classes",
    "discountPrice": 1700,
    "totalCharge": 4300,
    "label": "Live 1:11 Classes"
  },
  {
    "price": 5500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwelve",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcqcw500080vx9copnbplk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:12 Classes",
    "discountPrice": 1500,
    "totalCharge": 4000,
    "label": "Live 1:12 Classes"
  },
];
const PRIMORSE_SCHOOL_PRODUCTS = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 6552,
    "totalCharge": 26208,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 4600,
    "totalCharge": 18400,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 3500,
    "totalCharge": 14000,
    "label": "Live 1:3 Classes"
  },
  {
    "price": 8500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToSix",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcomkg00020vx9chi23l3f",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:6 Classes",
    "discountPrice": 500,
    "totalCharge": 8000,
    "label": "Live 1:6 Classes"
  },
  {
    "price": 7200,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToEight",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcp8ga00040vx9fihi9wqk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:8 Classes",
    "discountPrice": 1200,
    "totalCharge": 6000,
    "label": "Live 1:8 Classes"
  },
  {
    "price": 5500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwelve",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcqcw500080vx9copnbplk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:12 Classes",
    "discountPrice": 1100,
    "totalCharge": 4400,
    "label": "Live 1:12 Classes"
  },
];
const KRM_SCHOOL_PRODUCTS = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 6552,
    "totalCharge": 26208,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 4600,
    "totalCharge": 18400,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 3500,
    "totalCharge": 14000,
    "label": "Live 1:3 Classes"
  },
  {
    "price": 12000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToFour",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcntc500000vx95mhi6zdv",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:4 Classes",
    "discountPrice": 1200,
    "totalCharge": 10800,
    "label": "Live 1:4 Classes"
  },
  {
    "price": 10000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToFive",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcoain00010vx98k1sb8ec",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:5 Classes",
    "discountPrice": 800,
    "totalCharge": 9200,
    "label": "Live 1:5 Classes"
  },
  {
    "price": 8500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToSix",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcomkg00020vx9chi23l3f",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:6 Classes",
    "discountPrice": 500,
    "totalCharge": 8000,
    "label": "Live 1:6 Classes"
  },
  {
    "price": 7800,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToSeven",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcowa900030vx99fa5cy99",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:7 Classes",
    "discountPrice": 1000,
    "totalCharge": 6800,
    "label": "Live 1:7 Classes"
  },
  {
    "price": 7200,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToEight",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcp8ga00040vx9fihi9wqk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:8 Classes",
    "discountPrice": 1200,
    "totalCharge": 6000,
    "label": "Live 1:8 Classes"
  },
];
const CRB_SCHOOL_PRODUCTS = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 6552,
    "totalCharge": 26208,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 4600,
    "totalCharge": 18400,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 3500,
    "totalCharge": 14000,
    "label": "Live 1:3 Classes"
  },
  {
    "price": 12000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToFour",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcntc500000vx95mhi6zdv",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:4 Classes",
    "discountPrice": 1200,
    "totalCharge": 10800,
    "label": "Live 1:4 Classes"
  },
  {
    "price": 10000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToFive",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcoain00010vx98k1sb8ec",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:5 Classes",
    "discountPrice": 800,
    "totalCharge": 9200,
    "label": "Live 1:5 Classes"
  },
  {
    "price": 8500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToSix",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcomkg00020vx9chi23l3f",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:6 Classes",
    "discountPrice": 500,
    "totalCharge": 8000,
    "label": "Live 1:6 Classes"
  },
  {
    "price": 7800,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToSeven",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcowa900030vx99fa5cy99",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:7 Classes",
    "discountPrice": 1000,
    "totalCharge": 6800,
    "label": "Live 1:7 Classes"
  },
  {
    "price": 7200,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToEight",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcp8ga00040vx9fihi9wqk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:8 Classes",
    "discountPrice": 1200,
    "totalCharge": 6000,
    "label": "Live 1:8 Classes"
  },
  {
    "price": 6800,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToNine",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcphfj00050vx98nrmc10q",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:9 Classes",
    "discountPrice": 1360,
    "totalCharge": 5440,
    "label": "Live 1:9 Classes"
  },
  {
    "price": 6300,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTen",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcpqhr00060vx93p1y3q11",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:10 Classes",
    "discountPrice": 1260,
    "totalCharge": 5040,
    "label": "Live 1:10 Classes"
  },
  {
    "price": 6000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToEleven",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcq11z00070vx9ecl921ck",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:11 Classes",
    "discountPrice": 1200,
    "totalCharge": 4800,
    "label": "Live 1:11 Classes"
  },
  {
    "price": 5500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwelve",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcqcw500080vx9copnbplk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:12 Classes",
    "discountPrice": 1100,
    "totalCharge": 4400,
    "label": "Live 1:12 Classes"
  },
];
const RIS_SCHOOL_PRODUCTS = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 6552,
    "totalCharge": 26208,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 4600,
    "totalCharge": 18400,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 3500,
    "totalCharge": 14000,
    "label": "Live 1:3 Classes"
  },
  {
    "price": 7200,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToEight",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcp8ga00040vx9fihi9wqk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:8 Classes",
    "discountPrice": 1200,
    "totalCharge": 6000,
    "label": "Live 1:8 Classes"
  },
  {
    "price": 5500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwelve",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcqcw500080vx9copnbplk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:12 Classes",
    "discountPrice": 1100,
    "totalCharge": 4400,
    "label": "Live 1:12 Classes"
  },
];

const MPS_SCHOOL_PRODUCTS = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 6552,
    "totalCharge": 26208,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 4600,
    "totalCharge": 18400,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 3500,
    "totalCharge": 14000,
    "label": "Live 1:3 Classes"
  },
  {
    "price": 7200,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToEight",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcp8ga00040vx9fihi9wqk",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:8 Classes",
    "discountPrice": 1200,
    "totalCharge": 6000,
    "label": "Live 1:8 Classes"
  },
];

const PWS_SCHOOL_PRODUCTS = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 6552,
    "totalCharge": 26208,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 4600,
    "totalCharge": 18400,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 3500,
    "totalCharge": 14000,
    "label": "Live 1:3 Classes"
  },
  {
    "price": 12000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToFour",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcntc500000vx95mhi6zdv",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:4 Classes",
    "discountPrice": 1200,
    "totalCharge": 10800,
    "label": "Live 1:4 Classes"
  },
];

const TIS_SCHOOL_PRODUCTS = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 6552,
    "totalCharge": 26208,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 4600,
    "totalCharge": 18400,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 3500,
    "totalCharge": 14000,
    "label": "Live 1:3 Classes"
  },
  {
    "price": 8500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToSix",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckibcomkg00020vx9chi23l3f",
    "createdAt": "2020-12-05T07:02:38.447Z",
    "isSelected": false,
    "productName": "Live 1:6 Classes",
    "discountPrice": 500,
    "totalCharge": 8000,
    "label": "Live 1:6 Classes"
  },
];

const GIS_SCHOOL_PRODUCTS = [
  {
    "price": 32760,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToOne",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckajpz0ex000042752aow3qwn",
    "createdAt": "2020-05-23T14:19:47.016Z",
    "isSelected": true,
    "productName": "Live 1:1 Classes",
    "discountPrice": 6552,
    "totalCharge": 26208,
    "label": "Live 1:1 Classes"
  },
  {
    "price": 23000,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToTwo",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxdpm000ayx75homccoxc",
    "createdAt": "2020-07-27T10:45:09.653Z",
    "isSelected": false,
    "productName": "Live 1:2 Classes",
    "discountPrice": 4600,
    "totalCharge": 18400,
    "label": "Live 1:2 Classes"
  },
  {
    "price": 17500,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThree",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckd4dxwg8000byx757yl0f6fj",
    "createdAt": "2020-07-27T10:45:34.697Z",
    "isSelected": false,
    "productName": "Live 1:3 Classes",
    "discountPrice": 3500,
    "totalCharge": 14000,
    "label": "Live 1:3 Classes"
  },
];

const LSS_SCHOOL_PRODUCTS = [
  {
    "price": 7999,
    "discounts": [
    ],
    "status": "published",
    "title": "Intro to Coding ( with mentor )",
    "type": "oneToThirty",
    "course": {
      "title": "python",
      "status": "published"
    },
    "id": "ckpiqlmaf0002rkui5iav5xnj",
    "createdAt": "2021-06-04T19:45:10.488Z",
    "isSelected": true,
    "productName": "Live 1:30 Classes",
    "discountPrice": 2000,
    "totalCharge": 5999,
    "label": "Live 1:30 Classes"
  },
];

export const schoolProducts = {
  'Primrose Schools': PRIMORSE_SCHOOL_PRODUCTS,
  'G M Vidyanikethan Public School': GMSV_SCHOOL_PRODUCTS,
  'KRM Public School': KRM_SCHOOL_PRODUCTS,
  'DPS PATHANKOT': KRM_SCHOOL_PRODUCTS,
  'CRB MEMORIAL SR SECONDARY SCHOOL': CRB_SCHOOL_PRODUCTS,
  'Rohilas International School': RIS_SCHOOL_PRODUCTS,
  'Mar Thoma Public School': MPS_SCHOOL_PRODUCTS,
  'Delhi World Public School': MPS_SCHOOL_PRODUCTS,
  'Summer Field School': MPS_SCHOOL_PRODUCTS,
  'Airforce BalBharti School': MPS_SCHOOL_PRODUCTS,
  'Mahavir Senior Model School': MPS_SCHOOL_PRODUCTS,
  'St Joseph Academy': MPS_SCHOOL_PRODUCTS,
  'Paras World School': PWS_SCHOOL_PRODUCTS,
  'Trivandrum International School': TIS_SCHOOL_PRODUCTS,
  'Global International School': GIS_SCHOOL_PRODUCTS,
  'Jaya Jaya Sankara International School': MPS_SCHOOL_PRODUCTS,
  'Jayawant Public School': MPS_SCHOOL_PRODUCTS,
  'Himalaya International School': MPS_SCHOOL_PRODUCTS,
  'NC Jindal Public School': MPS_SCHOOL_PRODUCTS,
  'Little Star School': LSS_SCHOOL_PRODUCTS,
  'HH International School': LSS_SCHOOL_PRODUCTS,

  'Bhagavathi English Medium': LSS_SCHOOL_PRODUCTS,
  'Poornachandra School': LSS_SCHOOL_PRODUCTS,
  'Gujarath English Medium School': LSS_SCHOOL_PRODUCTS
}
export const schoolsProductAllowed = {
  'Primrose Schools': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToSix', 'oneToEight', 'oneToTwelve'],
  'KRM Public School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToFour', 'oneToFive', 'oneToSix', 'oneToSeven', 'oneToEight'],
  'DPS PATHANKOT': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToFour', 'oneToFive', 'oneToSix', 'oneToSeven', 'oneToEight'],
  'Rohilas International School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight', 'oneToTwelve'],
  'Mar Thoma Public School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'Delhi World Public School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'Summer Field School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'Airforce BalBharti School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'Mahavir Senior Model School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'St Joseph Academy': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'Paras World School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToFour'],
  'Trivandrum International School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToSix'],
  'Global International School': ['oneToOne', 'oneToTwo', 'oneToThree'],
  'Jaya Jaya Sankara International School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'Jayawant Public School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'Himalaya International School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'NC Jindal Public School': ['oneToOne', 'oneToTwo', 'oneToThree', 'oneToEight'],
  'Little Star School': ['oneToThirty'],
  'HH International School': ['oneToThirty'],
  'Bhagavathi English Medium': ['oneToThirty'],
  'Poornachandra School': ['oneToThirty'],
  'Gujarath English Medium School': ['oneToThirty']
}
export const schoolCoupons = ['school1', 'school2', 'school3']
export const defaultCoupons = { 'newyear40': 40 }
console.log(import.meta.env,"api BAse UEl")
const config = {
  apiBaseURL: 'https://api-staging.tekie.in/graphql/core',
  cdnApiBaseURL: import.meta.env.REACT_APP_API_CDN_BASE_URL,
  fileBaseUrl: import.meta.env.REACT_APP_FILE_BASE_URL, 
  cloudFrontBaseUrl: import.meta.env.REACT_APP_CLOUDFRONT_BASE_URL,
  appToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJbmZvIjp7Im5hbWUiOiJ0ZWtpZVdlYkFwcCIsInR5cGUiOiJzdGF0aWMifSwiaWF0IjoxNTg5NTMwNDU1LCJleHAiOjE5MDUxMDY0NTV9.QIYVrzro9a_j_f64BWHK9liGTyvq78hzCjoHUEnt2kU',
  daysBeforeNextSessionObj: {
    1: [2, 3, 4, 5, 6],
    3: [7, 8], 5: [9, 10]
  },
  daysToBookFrom: 6,
  bookClosingWindow: 21,
  nextDayOpeningIfBookedAfterClosingWindow: 11,
  courseTitle: 'python',
  CONTENT_MANAGER: 'contentManager',
  ADMIN: 'admin',
  SELF_LEARNER: 'selfLearner',
  SCHOOL_STUDENT: 'schoolStudent',
  SCHOOL_ADMIN: 'schoolAdmin',
  SCHOOL_TEACHER: 'schoolTeacher',
  USER_MANAGER: 'userManager',
  TEACHER: 'teacher',
  MENTOR: 'mentor',
  MENTEE: 'mentee',
  PARENT: 'parent',
  SCHOOL_TRAINER: 'schoolTrainer',
  published: 'published',
  unpublished: 'unpublished',
  timeLag: 4,
  usaTimeLag: 24,
  bookingDaysCutOff: 7,
  slotsWindow: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
  timezones: [
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
    { value: 'America/New_York', label: 'America/New_York' },
    { value: 'US/Central', label: 'US/Central' },
    { value: 'US/Eastern', label: 'US/Eastern' },
    { value: 'US/Pacific', label: 'US/Pacific' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata' }
  ],
  subscriptionBaseURL: import.meta.env.REACT_APP_SUBSCRIPTION_API_BASE_URL
}

export const learningObjectiveComponents = {
  message: 'message',
  practiceQuestion: 'practiceQuestion',
  comicStrip: 'comicStrip',
  chatbot: 'chatbot',
  learningSlide: 'learningSlide'
}
export const loComponentNameToRouteAlias = {
  [learningObjectiveComponents['practiceQuestion']]: 'practice-quiz',
  [learningObjectiveComponents['message']]: 'chat',
  [learningObjectiveComponents['comicStrip']]: 'comic-strip',
  [learningObjectiveComponents['chatbot']]: 'chat',
  [learningObjectiveComponents['assignment']]: 'chat',
  [learningObjectiveComponents['learningSlide']]: 'learning-slides'
}

export const featuresByCountries = {
  landingPageIITIIM: {
    in: true,
    us: false,
    default: false
  },
  buyNowButton: {
    in: true,
    us: false,
    default: false
  },
  becomeMentorButton: {
    in: true,
    us: false,
    default: false
  },
  referralFeature: {
    in: false,
    us: false,
    default: false
  },
  demoPack: {
    in: true,
    us: false,
    default: false
  },
  compareCourses: {
    in: true,
    us: true,
    default: true
  },
  usPricing: {
    in: false,
    us: true,
    middleEast: false,
    default: true
  },
  featuredIn: {
    in: true,
    us: false,
    default: false
  },
}

export const PYTHON_COURSE_BACKEND = 'python'
export const PYTHON_COURSE = 'Fake_course_to_not_match_anywhere'


// 🚨🚨🚨 NOTE: DON'T CHANGE DEFAULT COURSE OTHER THAN PYTHON, PLEASE, IT WILL RUIN YOUR SLEEP AND WEEKENDS
// IF THE BELOW CONFIG NEEDS TO BE CHANGED THEN WE ALSO NEED TO CHANGE IN LEADGEN */register* PAGE
const COURSES_CONFIG = {
  staging: [
    {
      grade: [1, 2, 3],
      course: {
        id: 'ckpwgsqpx00010txl9q1s19f2', title: 'Building logic and algorithmic thinking',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }

      },
    },
    {
      grade: [4, 5],
      course: {
        id: 'ckpwvp8gb00000t06f78t6dbz',
        title: 'Intro to Coding concepts with Blockly',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#5BB27E', secondary: '#DCEFE4', backdrop: '#01AA93' }
      },
    },
    {
      grade: [6, 7],
      course: {
        isDefaultCourse: true,
        id: 'cjs8skrd200041huzz78kncz5',
        title: PYTHON_COURSE,
        secondaryCategory: 'PROGRAMME I',
        color: { primary: '#966CAB', secondary: '#E8DFEC', backdrop: '#D34B57' }
      },
    },
    {
      grade: [8, 9, 10, 11, 12],
      course: {
        id: 'ckthf492w00000tw76x5b2wxy',
        title: 'Web Development Specialisation Test-1',
        secondaryCategory: 'PROGRAMME I',
        color: { primary: '#966CAB', secondary: '#E8DFEC', backdrop: '#D34B57' }
      },
    }
  ],
  production: [
    {
      grade: [1, 2],
      course: {
        id: 'cks5y78w0000t0vwcauvc2rtm',
        title: 'Building logics and algorithmic thinking',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
      },
    },
    {
      grade: [3, 4, 5],
      course: {
        id: 'cks94x3jq00fc0w24e92pb9ku',
        title: 'Intro to Coding with Blockly - I',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
      },
    },
    {
      grade: [6, 7, 8, 9, 10, 11, 12],
      course: {
        id: 'cks5r4pzv000r0v29gk231bcy', title: 'Intro to Coding - I',
        secondaryCategory: 'PROGRAMME I',
        color: { primary: '#966CAB', secondary: '#E8DFEC', backdrop: '#D34B57' }
      },
    },
    {
      grade: [],
      course: {
        id: 'cktl3n6h8002x0wtdde4rabca', title: "Web Development Specialisation - Part I",
        secondaryCategory: 'PROGRAMME I',
        color: { primary: '#966CAB', secondary: '#E8DFEC', backdrop: '#D34B57' }
      },
    },
    {
      grade: [1],
      course: {
        id: 'ckqkfreo400200vsb8y461qpb',
        title: 'Building logic and algorithmic thinking - I',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
      },
    },
    {
      grade: [2],
      course: {
        id: 'ckqkft7ju00240vsb7xblaab8',
        title: 'Building logic and algorithmic thinking - II',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
      },
    },
    {
      grade: [3],
      course: {
        id: 'ckqkfuwsr00250vsb91utgurp',
        title: 'Building logic and algorithmic thinking - III',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
      },
    },
    {
      grade: [4, 5],
      course: {
        id: 'ckpzsql0500010vw1fmbr29nq',
        title: 'Intro to Coding concepts with Blockly',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#5BB27E', secondary: '#DCEFE4', backdrop: '#01AA93' }
      },
    },
    {
      grade: [6, 7, 8, 9, 10, 11, 12],
      course: {
        id: 'cks5r4pzv000r0v29gk231bcy', title: PYTHON_COURSE,
        secondaryCategory: 'PROGRAMME I',
        color: { primary: '#966CAB', secondary: '#E8DFEC', backdrop: '#D34B57' }
      },
    },
    {
      grade: [6, 7, 8, 9, 10, 11, 12],
      course: {
        isDefaultCourse: true,
        id: 'cjs8skrd200041huzz78kncz5', title: PYTHON_COURSE,
        secondaryCategory: 'PROGRAMME I',
        color: { primary: '#966CAB', secondary: '#E8DFEC', backdrop: '#D34B57' }
      },
    },
    {
      grade: [],
      course: {
        id: 'ckpzsorgj00000vw19c78dnz7',
        title: 'Building logic and algorithmic thinking',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#5BB27E', secondary: '#DCEFE4', backdrop: '#01AA93' }
      }
    },
    {
      grade: [1],
      course: {
        id: 'ckri98xge00dc0vw473hxcbmf',
        title: 'Building logic and algorithmic thinking - I',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
      },
    },
    {
      grade: [2],
      course: {
        id: 'ckri9fevm00de0vw417p1gf1c',
        title: 'Building logic and algorithmic thinking - II',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
      },
    },
    {
      grade: [3],
      course: {
        id: 'ckri9h46p00dg0vw4dbbncw6k',
        title: 'Building logic and algorithmic thinking - III',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
      },
    },
    {
      grade: [4, 5],
      course: {
        id: 'ckri9kw0b00di0vw40wal0br5',
        title: 'Intro to Coding concepts with Blockly',
        secondaryCategory: 'BLOCK-BASED PROGRAMMING',
        color: { primary: '#5BB27E', secondary: '#DCEFE4', backdrop: '#01AA93' }
      },
    }
  ],
}

export const COURSES = COURSES_CONFIG['staging']
export const IS_SCHOOL_WEBSITE = false
export const FORCE_ACTIVE_SUB_DOMAIN = false

export const CACHE_TTL_ONE_HOUR = 60 * 60 * 1000

export const COURSE_CERTIFICATE_URL = `${import.meta.env.REACT_APP_FILE_BASE_URL}/python/course/courseCompletionCertificate.pdf`
export const NUNITO_REGULAR_FONT_URL = `${import.meta.env.REACT_APP_FILE_BASE_URL}/python/course/Nunito-Regular.ttf`
export const NUNITO_SEMI_BOLD_FONT_URL = `${import.meta.env.REACT_APP_FILE_BASE_URL}/python/course/Nunito-SemiBold.ttf`
export const NUNITO_BOLD_FONT_URL = `${import.meta.env.REACT_APP_FILE_BASE_URL}/python/course/Nunito-Bold.ttf`

export const MOBILE_BREAKPOINT = 900

export const FileBucket = {
  PYTHON: 'python',
  EMAIL: 'email',
  LANDING_PAGE: 'landingPage',
  EDITOR: 'editor',
  WEB_DEVELOPMENT: 'webDevelopment',
  CODE_ORG: 'codeOrg',
  BLOCKLY: 'blockly',
  TEMP: 'temp',
  TOPIC_THUMBNAIL: 'topicThumbnail',
  VIDEO_TO_TRANSCODE: 'videosToTranscode',
}

export const CRT_SCREEN_BREAKPOINT = {
  start: 1201,
  end: MOBILE_BREAKPOINT
}

export const NPS_INTERVAL = 20

export const HOUR_BEFORE_START_SESSION = 1

export const whatsapp_link = "https://bit.ly/tekiewhatsapp"
export const facebook_link = "https://www.facebook.com/groups/460131971641804/?ref=share"

export const WAITINGMODAL_ROUTE = '/?openWaiting=true'

export const PRIMARY_BUTTON_DEFAULT_TEXT = 'Get in Touch'

export const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

export const eventSchoolList = [
  'Seth Anandram Jaipuria School',
  'Freedom International School',
  'Modern Public School',
  'ASN Sr. Sec School',
  'Jaipuria Vidyalaya',
  'St Joseph School',
  'St. Xaviers Mohali',
  'DAV Model School',
  'Gitarattan Jindal School',
  'St. Soldiers School',
  'SJR Kengri Public School',
  'Podar International School',
  'BGS National Public School',
  'Acharya Pathshala',
  'Ganga International school',
  'Guardian School ICSE',
  'St. Mary School',
  'Carmel School',
  'Anand Niketan School',
  'AECS Magnolia Maaruti Public School',
  'MG School of Excellence',
  'Dayananda Sagar International School',
  'National Public School, Rajajinagar',
  'BGS',
  'Venkat International',
  'VET',
  'Radcliff School',
  'East West Academy',
  'National Public School, Kengri',
  'Euro School',
  'Greenwood High',
  'Royale Concorde International School',
  'Kensri',
  'Vishwavidyapeeth',
  'Dafodills English School',
  'Dafodills Foundation for Learning',
  'Deens, Whitefield',
  'Deens, Gunjur',
  'NCFE',
  'St. John\'s',
  'RV Public School',
  'Poornaprajna Education Society ',
  'The Oxford Senior Secondary School',
  'Carmel Teresa',
  'Harsha International Public School',
  'Candour5 Education Academy ',
  'Chinmaya Vidyalaya ',
  'East West Public School',
  'Renuka Education Society',
  'Nimavat International School',
  'US Ostwal High School',
  'Sree Cauvery school',
  'Saandipini Hi Tech',
  'The Montessori School',
  'Air Force Bal Bharti school',
  'Paras World school',
  'Prince Public school',
  'Himalaya International School',
  'Great Mission Public School',
  'Nature International School',
  'Ramjas School',
  'Vrukksha School',
]

export default config
