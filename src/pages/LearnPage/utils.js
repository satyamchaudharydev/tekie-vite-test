import { get } from "lodash"

export const videoFiltersOptions = {
    'all': {
        label: 'All Videos',
        value: 'all'
    },
   'bookmarked': {
        label: 'Bookmarked',
        value: 'bookmarked'
    }
}

export const getVideoIds = (allSessions) => {
    if(allSessions.length === 0) return []
    const allVideoIds = allSessions.map(session => session.videoIds)
    return allVideoIds.flat()
}   

export const getTopicsByChapter = (allSessions,videos,userVideos) => {
    const topicByChapter = {}
    allSessions.forEach(session => {
        const chapterId = session.chapterId
        const chapterTitle = session.chapterTitle
        const videoIds = get(session,'videoIds', [])
        if(videoIds.length > 0) {
            const videosInSession = videoIds.map(videoId => {
                const video = videos.find(video => video.id === videoId)
                return video
            })
            // find video in userVideos and add isBookmarked
            videosInSession.forEach(video => {
                if(!video) return
                const userVideo = userVideos.find(userVideo => userVideo.video.id === video.id)
                if(userVideo) {
                    video.isBookmarked = get(userVideo,'isBookmarked', false)
                    video.userVideoId = get(userVideo,'id', null)
                }
                else{
                    video.isBookmarked = false
                    video.userVideoId = ""

                }
            })
            session.videos = videosInSession

        }
        const key = `${chapterId}-${chapterTitle}`
        if(!topicByChapter[key]) {
            topicByChapter[key] = []
        }
        topicByChapter[key].push(session)
    })
    return topicByChapter
}
export const getFilterTopics = (menteeCourseSyllabus,courses) => {
    if(menteeCourseSyllabus.length === 0) return []
    const bookSession = menteeCourseSyllabus[0].bookedSession
    const completedSession = menteeCourseSyllabus[0].completedSession
    const upComingSession =   menteeCourseSyllabus[0].upComingSession
    let allSessions = [...bookSession, ...completedSession, ...upComingSession]
    // return allSessions
    // filter by theory and check if videoIds is empty
    allSessions = allSessions.filter((session) => 
    session.classType === 'theory' && get(session,'videoIds', []).length  > 0
)
    allSessions = allSessions.filter((session) => 
        {
            const videoIds = get(session,'videoIds', [])
            const course = courses.find(course => course.id === session.course.id)
            const courseCategory = get(course,'category', '')
            if((courseCategory === 'tools' || courseCategory === 'theory') && videoIds.length > 0) return true
            return false
        }
    )
    return allSessions
}
export const getVideosFromChapterVideos = (chapterVideos) => {
    const videos = []
    for (const key in chapterVideos){
        const chapterArray = chapterVideos[key]
        chapterArray.forEach(chapter => {
            if(chapter.videos) {
                videos.push(...chapter.videos)
            }
        })
    }
    return videos

}