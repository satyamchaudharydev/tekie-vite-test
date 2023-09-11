import React from 'react'
import { useParams } from 'react-router'

import BookEmbed from './component/BookEmbed'
import { get } from 'lodash'
function Book({eBookCourse}) {
  const { bookId } = useParams()
  const currentBook = eBookCourse.length > 0 && eBookCourse.find(item => get(item,'ebook.id') === bookId)
  const bookUrl = get(currentBook,'ebook.resourceURL','')

  return (
    <div className="book-container" style={{width: '100%',height: '100%',overflow: 'hidden'}}>
      <BookEmbed
        bookUrl={bookUrl}
      />

    </div>
  )
}

export default Book