import React from 'react'
import parser from '../../utils/text-parser'

const faqs = [
  {
    "id": 82000580378,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:01:21Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "Who should take this course?",
    "updated_at": "2021-06-05T13:01:21Z",
    "description": "<p dir=\"ltr\">Well, anyone over the age of 10 who wants to start learning to program, get a flavor of what programming is all about, or to see if this excites you can start with this course.</p>",
    "description_text": " Well, anyone over the age of 10 who wants to start learning to program, get a flavor of what programming is all about, or to see if this excites you can start with this course. ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580393,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:07:16Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "Why did we choose Python over other language?",
    "updated_at": "2021-06-05T13:07:45Z",
    "description": "<p></p><p dir=\"ltr\">Python is a fairly simple language to read, so you'll be able to understand it and adapt it to any other language like Javascript, C, PHP, Java. Also, it's the most used programming language for Artificial Intelligence and Machine Learning, and a popular interviewing language widely used at Google, Youtube, Facebook, Instagram, Netflix, Uber, Dropbox, and many top tech companies.</p><p><br></p><p><br></p><p><br></p><p><br></p><p></p>",
    "description_text": "  Python is a fairly simple language to read, so you'll be able to understand it and adapt it to any other language like Javascript, C, PHP, Java. Also, it's the most used programming language for Artificial Intelligence and Machine Learning, and a popular interviewing language widely used at Google, Youtube, Facebook, Instagram, Netflix, Uber, Dropbox, and many top tech companies.              ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580408,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:08:51Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "Do I need to be familiar with coding to take this course?",
    "updated_at": "2021-06-05T13:08:51Z",
    "description": "<p dir=\"ltr\">No, you can start without any previous knowledge.</p>",
    "description_text": " No, you can start without any previous knowledge. ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580409,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:10:28Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "What do I need to be able to take this course?",
    "updated_at": "2021-06-05T13:10:28Z",
    "description": "<p></p><p dir=\"ltr\">You will need wifi, a laptop or desktop computer with a webcam, microphone, and google chrome installed.</p><p><br></p><p></p>",
    "description_text": "  You will need wifi, a laptop or desktop computer with a webcam, microphone, and google chrome installed.     ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580424,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:12:32Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "Is this course completely online?",
    "updated_at": "2021-06-05T13:12:32Z",
    "description": "<p dir=\"ltr\">Yes, you can go anywhere in the world(with wifi), and you'll be able to take this course.</p>",
    "description_text": " Yes, you can go anywhere in the world(with wifi), and you'll be able to take this course. ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580427,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:14:57Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "How are the classes designed and scheduled?",
    "updated_at": "2021-06-05T13:15:05Z",
    "description": "<p></p><p dir=\"ltr\">Your classes are designed by highly qualified teachers, keeping in mind that the session is interesting, fun and pushes students just the right amount. Also, our learning model focuses on developing algorithmic thinking, problem-solving skills &amp; creativity.</p><p><br></p><p></p><p></p>",
    "description_text": "  Your classes are designed by highly qualified teachers, keeping in mind that the session is interesting, fun and pushes students just the right amount. Also, our learning model focuses on developing algorithmic thinking, problem-solving skills & creativity.      ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580428,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:18:19Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "Duration of our sessions?",
    "updated_at": "2021-06-05T13:18:19Z",
    "description": "<p></p><p dir=\"ltr\">Each live session is designed to be 50 to 60 mins long with videos, lesson workbooks, practice questions, coding exercises, and discussions with mentors. After the session is complete, students are assigned Do-It-Yourself(DIY) coding activities, which is designed to be 60 mins long.</p><p><br></p><p><br></p><p></p>",
    "description_text": "  Each live session is designed to be 50 to 60 mins long with videos, lesson workbooks, practice questions, coding exercises, and discussions with mentors. After the session is complete, students are assigned Do-It-Yourself(DIY) coding activities, which is designed to be 60 mins long.        ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580429,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:20:51Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "Is this course beginner friendly?",
    "updated_at": "2021-06-05T13:20:51Z",
    "description": "<p></p><p dir=\"ltr\">Don't worry! All our classes are beginner-friendly. We have sessions designed specifically for beginners. Right from your first class, we'll make sure we help you get started and feel totally comfortable.</p><p><br></p><p><br></p><p><br></p><p></p>",
    "description_text": "  Don't worry! All our classes are beginner-friendly. We have sessions designed specifically for beginners. Right from your first class, we'll make sure we help you get started and feel totally comfortable.           ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580444,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:25:25Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "How often should I take these sessions?",
    "updated_at": "2021-06-05T13:25:25Z",
    "description": "<p></p><p dir=\"ltr\">Well, six sessions a month is the magic number. We always recommend getting some comfort, especially if you're just starting. Each session has two portions, a mentor-led 1:1 live class, and an after-class DIY session; combined they are 120 to 150 minutes of learning per week. But you need to do four sessions per month at a minimum to get something out of all that hard work. Once you get comfortable, you can also take more than six classes a month.</p><p><br></p><p><br></p><p></p>",
    "description_text": "  Well, six sessions a month is the magic number. We always recommend getting some comfort, especially if you're just starting. Each session has two portions, a mentor-led 1:1 live class, and an after-class DIY session; combined they are 120 to 150 minutes of learning per week. But you need to do four sessions per month at a minimum to get something out of all that hard work. Once you get comfortable, you can also take more than six classes a month.        ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580445,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:28:47Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "Can I take a free trial session before I decide to buy this course?",
    "updated_at": "2021-06-05T13:28:47Z",
    "description": "<p></p><p dir=\"ltr\">Absolutely! You get one trial session at no cost. To book your free sessions <a href=\"https://www.tekie.in/login\">click here. </a></p><p><br></p><p></p>",
    "description_text": "  Absolutely! You get one trial session at no cost. To book your free sessions click here.      ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580460,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:29:44Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "How to track kids coding progress?",
    "updated_at": "2021-06-05T13:29:44Z",
    "description": "<p></p><p dir=\"ltr\">We have reporting systems for that. Please book a demo session with us.</p><p><br></p><p></p>",
    "description_text": "  We have reporting systems for that. Please book a demo session with us.     ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580461,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:32:05Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "Why do I have to book a class?",
    "updated_at": "2021-06-05T13:32:16Z",
    "description": "<p></p><p dir=\"ltr\">To attend a session, you will first need to book a slot for yourself since we have limited slots for each session. We limit the number of slots per session so that our instructors can give you individual attention and that the effectiveness of your learning isn't compromised.</p><p><br></p><p></p>",
    "description_text": "  To attend a session, you will first need to book a slot for yourself since we have limited slots for each session. We limit the number of slots per session so that our instructors can give you individual attention and that the effectiveness of your learning isn't compromised.     ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580490,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:42:13Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "I have never coded before. From where should I begin?",
    "updated_at": "2021-06-05T13:42:13Z",
    "description": "<p></p><p dir=\"ltr\"><span dir=\"ltr\" style='font-size: 14px; font-family: \"Helvetica Neue\"; color: rgb(67, 67, 67); font-weight: 400;'>If this is your first time coding, we recommend you start with our foundation series. The guided sessions with our highly trained mentors make it a cakewalk so you can easily sit and learn. By the end of this series, you will go deeper into the world of coding. Just follow along and complete a session every week to get the most out of your membership.</span></p><p><br></p><p></p>",
    "description_text": "  If this is your first time coding, we recommend you start with our foundation series. The guided sessions with our highly trained mentors make it a cakewalk so you can easily sit and learn. By the end of this series, you will go deeper into the world of coding. Just follow along and complete a session every week to get the most out of your membership.     ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580505,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:46:17Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "I have programmed at an intermediate level before. Should I take this course?",
    "updated_at": "2021-06-05T13:46:17Z",
    "description": "<p></p><p dir=\"ltr\">You can always choose to skip the foundation series. However, there is a treasure of knowledge around algorithmic thinking that we offer in the foundation series. So, we recommend that you try them out even if you have coded before.</p><p><br></p><p></p>",
    "description_text": "  You can always choose to skip the foundation series. However, there is a treasure of knowledge around algorithmic thinking that we offer in the foundation series. So, we recommend that you try them out even if you have coded before.     ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  },
  {
    "id": 82000580506,
    "type": 1,
    "status": 2,
    "agent_id": 82015645042,
    "created_at": "2021-06-05T13:48:07Z",
    "category_id": 82000307210,
    "folder_id": 82000450310,
    "title": "Can I go back and re-do the sessions that i have already completed?",
    "updated_at": "2021-06-05T13:48:07Z",
    "description": "<p></p><p dir=\"ltr\">Of course! The more, the merrier. Any session that you complete reflects on your learning dashboard. So, if you would like to revisit any session, you can do them directly from there.</p><p><br></p><p></p>",
    "description_text": "  Of course! The more, the merrier. Any session that you complete reflects on your learning dashboard. So, if you would like to revisit any session, you can do them directly from there.     ",
    "seo_data": {
      "meta_title": "",
      "meta_description": ""
    },
    "tags": [
      "website"
    ],
    "attachments": [],
    "cloud_files": [],
    "thumbs_up": 0,
    "thumbs_down": 0,
    "hits": 0,
    "suggested": 0,
    "feedback_count": 0
  }
]

const faqParser = statement => {
  const brStyle = { display: 'block' }
  const triggers = ['<']
  const textStyles = {
    display: 'inline-block'
  }
  if (statement.includes('style')) {
    const pElement = document.createElement('p')
    pElement.innerHTML = statement
    statement = pElement.textContent
  }
  const tags = {
    bold: {
      startTag: '<bold>',
      endTag: '</bold>',
      render: value => ((value && value.split
        ? (
          value.split(' ').map((text, i) =>
            value.split(' ').length - 1 === i
              ? (
                <div
                  key={i}
                  style={{
                    ...textStyles,
                    fontWeight: 700
                  }}
                  from-bold="true"
                >{text}
                </div>
              ) : (
                <div
                  key={i}
                  style={{
                    ...textStyles,
                    fontWeight: 700
                  }}
                >{text}&nbsp;
                </div>
              )
          )
        ) : (
          <div
            style={{
              ...textStyles,
              fontWeight: 700
            }}
          >{value}
          </div>
        )
      ))
    },
    a: {
      startTag: (string, i) => {
        const splittedString = string.slice(i, string.length).split(' ').filter(s => s)
        if (splittedString[0] === '<a' && splittedString[1].split('=')[0] === 'href') {
          const link = splittedString[1].split('="')[1].split('">')[0]
          const skipLength = string.slice(i, string.length).indexOf('">') + 1
          return {
            tag: 'a',
            i: 1,
            link: link,
            skipLength
          }
        }
        return false
      },
      endTag: '</a>',
      render: (value, { link }) => {
        return (
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
          >
            <div
              style={{
                ...textStyles,
                color: 'white',
                textDecoration: 'underline',
                fontFamily: 700
              }}
            >{value}
            </div>
          </a>
        )
      }
    },
    normal: {
      render: value => (value && value.split
        ? (
          value.split(' ').map((text, i) =>
            value.split(' ').length - 1 === i
              ? (
                <div style={textStyles} key={i}>{text}</div>
              ) : (
                <div style={textStyles} key={i}>{text}&nbsp;</div>
              )
          )
        ) : (
          value
            ? <div style={textStyles}>{value}</div>
            : <></>
        )
      )
    },
    p: {
      startTag: '<p>',
      endTag: '</p>',
      render: value => ((value && value.split
        ? (
          value.split(' ').map((texts, i) =>
            value.split(' ').length - 1 === i
              ? (
                <div
                  style={{ wordBreak: 'break-word', ...textStyles }}
                  key={i}
                >{texts}
                </div>
              ) : (
                <div
                  key={i}
                  style={{ wordBreak: 'break-word', ...textStyles  }}
                >{texts}&nbsp;
                </div>
              )
          )
        ) : (
          <div style={{ wordBreak: 'break-all' }}>{value}</div>
        )
      ))
    },
    break: {
      startTag: '<br>',
      endTag: '</br>',
      render: value => ((value && value.split
        ? (
          value.split(' ').map((texts, i) =>
            value.split(' ').length - 1 === i
              ? (
                <span
                  key={i}
                  style={brStyle}
                >{texts}
                </span>
              ) : (
                <span
                  key={i}
                  style={brStyle}
                >{texts}&nbsp;
                </span>
              )
          )
        ) : (
          <span style={brStyle}>{value}</span>
        )
      ))
    }
  }
  return parser(tags, triggers)(statement)
}

export { faqParser }

export default faqs