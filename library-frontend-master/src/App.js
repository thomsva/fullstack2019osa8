import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { gql } from 'apollo-boost'

const ALL_AUTHORS = gql`
  {
    allAuthors {
      name
      born
      bookCount
    }
  }
`
const ALL_BOOKS = gql`
  {
    allBooks {
      title
      author{name}
      published
    }
  }
`
const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String]!){
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ){
      title
      published
      genres
    }
  }
`

const EDIT_AUTHOR_BORN = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!){
    editAuthor( name: $name, setBornTo: $setBornTo){
        name
        born
        bookCount
        id
    }
  }
`





const App = () => {
  const [page, setPage] = useState('authors')
  const resultAuthors = useQuery(ALL_AUTHORS)
  const resultBooks = useQuery(ALL_BOOKS)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleError = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 2000)
  }

  const addBook = useMutation(CREATE_BOOK, {
    onError: handleError,
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
  })

  const editAuthor = useMutation(EDIT_AUTHOR_BORN, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }]
  })


  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <div>{errorMessage}</div>

      <Authors
        show={page === 'authors'}
        result={resultAuthors}
        editAuthor={editAuthor}
        handleError={handleError}
      />

      <Books
        show={page === 'books'}
        result={resultBooks}
      />

      <NewBook
        show={page === 'add'}
        addBook={addBook}
        handleError={handleError}
      />

    </div>
  )
}

export default App
