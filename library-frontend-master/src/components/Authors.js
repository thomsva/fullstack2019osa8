import React, { useState } from 'react'
import Select from 'react-select'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const [selectedOption, setSelectedOption] = useState('')

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

  const authors = data.allAuthors
  const options = authors.map(a => ({ value: a.name, label: a.name }))

  const handleChange = (target) => {
    setName(target.value)
    setSelectedOption(target)
    console.log('option selected:', target.value)
  }

  const submit = async (e) => {
    e.preventDefault()
    console.log('update born year...', e)
    try {
      await props.editAuthor({ variables: { name, setBornTo: parseInt(born) } })
    } catch (e) {
      console.log(e)
      props.handleError(e.graphQLErrors[0].message)
    }

    setName('')
    setBorn('')
    setSelectedOption('')

  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <div>
        <form onSubmit={submit}>
          <div>
            name
            <Select
              value={selectedOption}
              onChange={handleChange}
              options={options}
            />
          </div>

          <div>
            born
          <input
              type='number'
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type='submit'>update author</button>
        </form>
      </div>

    </div>
  )
}

export default Authors