
const express = require('express')

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
app.use(express.json())
app.use(cors())
app.use(morganLogger)
app.use(express.static('build'))

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
  ]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const current = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people<p><p>${current.toDateString()} ${current.toTimeString()}<p>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const personObj = persons.find(o => o.id === id)
  if (personObj) {
    response.json(personObj)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body)

  if (!body) {
    return response.status(400).json({error: 'content is missing'})
  } else {
    
    const others = persons.filter(p => p.name === body.name)
    if (others.length > 0) {
      return response.status(400).json({error: 'name must be unique'})
    }
    if (!body.name) {
      return response.status(400).json({error: 'person is missing a name'})
    }
    if (!body.number) {
      return response.status(400).json({error: 'person is missing a number'})
    }

    body.id = Math.floor(Math.random(10000)*10000)
    persons.push(body)
    return response.json(body)
  }
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
