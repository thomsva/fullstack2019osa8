import React, { useState, useEffect } from 'react'

const Recommended = (props) => {

  if (props.booksByGenre.loading) return <div>loading....</div>
  if (!props.show) {
    return null
  }
  if (props.resultMe.loading) {
    return <div>loading....</div>
  }

  const [books, setBooks] = useState([])

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    const newBooks = await (props.booksByGenre.refetch({ genre: props.resultMe.data.me.favoriteGenre }))
    setBooks(newBooks.data.allBooks)
  }

  return (
    <div>
      <h2>book recommendations</h2>

      <h3>showing books of your favorite genre: {props.selectedGenre}</h3>

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
    </div>
  )
}

export default Recommended