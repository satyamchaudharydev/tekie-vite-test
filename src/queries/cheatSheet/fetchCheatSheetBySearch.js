import gql from 'graphql-tag'
import duck from '../../duck'
import { get } from 'lodash'

const fetchCheatSheetsBySearch = (search) => duck.query ({
    query : gql`
        {
        getCheatSheet(input: { searchText: "${search}" }) {
            cheatSheetConcepts {
            isSelected
            isBookmarked
            userCheatSheetId
            cheatsheet {
                id
                title
                description
                topic {
                id
                title
                }
            }
            }
        }
    }
    `,
    type: 'cheatSheetsBySearch/fetch',
    key: 'cheatSheetsBySearch',
    changeExtractedData: (extractedData, originalData) => {
      const data = []
      if (originalData && get(originalData, 'getCheatSheet.cheatSheetConcepts', []).length > 0 && get(extractedData, 'topic', []).length > 0) {
        get(extractedData, 'topic', []).forEach((topic) => {
          const topicsWithConcept = { id: topic.id, title: topic.title }
          topicsWithConcept.concept = get(originalData, 'getCheatSheet.cheatSheetConcepts', []).filter(({ cheatsheet }) => get(cheatsheet, 'topic.id') === topic.id)
          data.push(topicsWithConcept)
        })
      }
      return { cheatSheetsBySearch: data }
    }
})


export default fetchCheatSheetsBySearch
