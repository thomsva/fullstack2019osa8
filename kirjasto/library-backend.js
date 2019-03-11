require('dotenv').config()
const jwt = require('jsonwebtoken')
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const uuid = require('uuid/v1')


const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

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
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
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
    allBooks(author: String, genre: String): [Book!]!
    me: User
  }
  type Mutation {
  addBook(
    title: String!
    author: String!
    published: Int!
    genres: [String]!
  ):Book
  editAuthor(name: String!, setBornTo: Int!): Author
  createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ):Token
}
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: () => Author.find({}),
    allBooks: async (root, args) => {
      const allBooks = await Book.find({}).populate('author')
      return (
        (args.author === undefined)
          ? (args.genre === undefined)
            ? allBooks
            : allBooks.filter(b => b.genres.includes(args.genre))
          : (args.genre === undefined)
            ? allBooks.filter(b => b.author.name === args.author)
            : allBooks.filter(b => (b.author.name === args.author
              && b.genres.includes(args.genre)))
      )
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: (root) => Book.find({ author: root }).countDocuments()
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      console.log('add book', args)
      const authorName = args.author
      var author = await Author.findOne({ name: authorName })
      if (!author) {
        //author has to be created
        console.log('author has to be created')
        author = new Author({ name: authorName })
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      console.log('author', author)
      const book = new Book({ title: args.title, author: author, published: args.published, genres: args.genres })
      console.log('new book', book)
      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      console.log('book saved')
      return book
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        //author not found
        return null
      }
      console.log('author', author)

      try {
        author.born = args.setBornTo
        await author.save()
      } catch (error) {
        console.log(error.message)
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      console.log('author saved')
      return author
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secred') {
        throw new UserInputError("wrong credentials")
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    console.log('auth', auth)
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})


server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})