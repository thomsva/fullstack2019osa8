import React from 'react'

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

  const books = data.allBooks

  return (
    <div>
      <h2>books</h2>

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
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Books