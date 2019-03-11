import React, { useState } from 'react'

const Books = (props) => {


  if (!props.show) {
    return null
  }
  const { data, error, loading } = props.result;
  if (loading) {
    return <div>loading....</div>
  }
  if (error) {
    return <div>error</div>
  }

  const [books, setBooks] = useState(data.allBooks)
  const genres = [...new Set(data.allBooks.reduce((result, b) => result = [...result, ...b.genres], []))]


  const handleGenreChange = async (g) => {
    console.log('click genre: ', g)
    if (g === '') {
      setBooks(data.allBooks)
    } else {
      const newBooks = await props.booksByGenre.refetch({ genre: g })
      setBooks(newBooks.data.allBooks)
    }
    props.setSelectedGenre(g)
  }

  return (
    <div>
      <h2>books</h2>
      {(props.resultMe.data.me.favoriteGenre === props.selectedGenre)
        ? <h3>showing books of your favorite genre: {props.selectedGenre}</h3>
        : <h3>showing books of the genre: {props.selectedGenre ? props.selectedGenre : 'any genre'}</h3>}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>

              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h4>filter by genre, recommendations </h4>
      <div>
        {genres.map(g => <button key={g + '_button'} onClick={() => handleGenreChange(g)}>{g}</button>)}
      </div>
      <br />
      <div>
        <button key='any_genres_button' onClick={() => handleGenreChange('')}>any genre</button>

      </div>


    </div>
  )
}

export default Books