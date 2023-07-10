require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
const morgan = require('morgan')
const morganLogger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
})

const cors = require('cors')

const app = express()
app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morganLogger)

/*
let persons = [
    {
        id: 1,
        name: "Matti Manninen",
        number: "0412512" 
    },
    {
      id: 2,
      name: "Pera Pesukarhu",
      number: "12345"
    },
    {
      id: 3,
      name: "Kari Kyttä",
      number: "112" 
    },
    {
      id: 4,
      name: "Maestro",
      number: "020202"
    },
    {
      id: 5,
      name: "tt",
      number: "1"
    }
  ]*/

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    return response.json(persons)
  }) 
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const n = persons.length
    const current = new Date()
    response.send(`<p>Phonebook has info for ${n} people<p><p>${current.toDateString()} ${current.toTimeString()}<p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      return response.json(person)
    } else {
      return response.status(404).end()
    }
  }).catch(error => next(error))
  /*
  .catch(error => {
    console.log(error)
    return response.status(400).send({error: 'malformatted id'})
  })*/
  /*
  const id = Number(request.params.id)
  const personObj = persons.find(o => o.id === id)
  if (personObj) {
    response.json(personObj)
  } else {
    response.status(404).end()
  }*/
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id).then(result => {
    return response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  //console.log(body)
  if (!body) {
    return response.status(400).json({error: 'content is missing'})
  }
  if (!body.name) {
    return response.status(400).json({error: 'person is missing a name'})
  }
  if (!body.number) {
    return response.status(400).json({error: 'person is missing a number'})
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(p => {
    response.json(body)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(p => {
      response.json(p)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
