import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { gql } from 'apollo-boost'
import { useApolloClient } from 'react-apollo-hooks'

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
      genres
    }
  }
`
const FIND_BOOKS_BY_GENRE = gql`
  
  query findBooksByGenre($genre: String){
    allBooks (genre: $genre){
      title
      author{name}
      published
      genres
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
  editAuthor(name: $name, setBornTo: $setBornTo){
    name
    born
    bookCount
    id
  }
}
`

const LOGIN = gql`
mutation login($username: String!, $password: String!) {
  login(username: $username, password: $password)  {
    value
  }
}
`


const App = () => {
  const [page, setPage] = useState('authors')
  const resultAuthors = useQuery(ALL_AUTHORS)
  const resultBooks = useQuery(ALL_BOOKS)
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const booksByGenre = useQuery(FIND_BOOKS_BY_GENRE, { genre: "" })

  const client = useApolloClient()

  useEffect(() => {
    setToken(localStorage.getItem('library-user-token', token))
  }, [])


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

  const login = useMutation(LOGIN)

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  return (
    <div>

      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {!token && <button onClick={() => setPage('login')}>login</button>}
        {token && <button onClick={logout}>logout</button>}
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
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        client={client}
        booksByGenre={booksByGenre}
      />

      <NewBook
        show={page === 'add'}
        addBook={addBook}
        handleError={handleError}
      />

      <LoginForm
        show={page === 'login'}
        login={login}
        setToken={(token) => setToken(token)}
        handleError={handleError}
        setPage={setPage}
      />

    </div>
  )
}

export default App
