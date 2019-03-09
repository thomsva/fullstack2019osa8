require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const uuid = require('uuid/v1')

mongoose.set('useFindAndModify', false)

const MONGODB_URI = process.env.MONGODB_URI

console.log('commecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }  
  type Book{
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allAuthors: [Author!]!
    allBooks: [Book!]!
  }
  type Mutation {
  addBook(
    title: String!
    author: String!
    published: Int!
    genres: [String]!
  ):Book
  editAuthor(name: String!, setBornTo: Int!): Author
}
`


const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: () => Author.find({}),
    allBooks: async () => {
      const result = await Book.find({}).populate('author')
      console.log('result', result)
      return result
    }
  },

  Mutation: {
    addBook: async (root, args) => {
      console.log('add book', args)
      const authorName = args.author
      var author = await Author.findOne({ name: authorName })
      if (!author) {
        //author has to be created
        console.log('author has to be created')
        author = new Author({ name: authorName })
        await author.save()
      }
      console.log('author', author)
      const book = new Book({ title: args.title, author: author, published: args.published, genres: args.genres })
      console.log('new book', book)
      await book.save()
      console.log('book saved')
      return book
    },
    editAuthor: (root, args) => {
      if (!Author.find({ name: args.name })) {
        //author not found
        return null
      }

      const author = Author.find({ name: args.name })
      author.born = args.setBornTo
      return author.save()
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})


server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})