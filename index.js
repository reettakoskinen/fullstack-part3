const express = require('express');
const morgan = require('morgan');
const app = express()

app.use(express.json())
app.use(express.static('dist')) 

morgan.token('req-body', (req) => {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

const cors = require('cors')

app.use(cors())

let people = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  },
  { 
    "id": 5,
    "name": "testi", 
    "number": "39-23-642365"
  }
]

let count = people.length

app.get('/info', (request, response) => {
    const currentDate = new Date();
    response.send(`<p>Phonebook has info for ${count} people</p> <p>${currentDate}</p>`)
  })

app.get('/api/persons', (request, response) => {
response.json(people)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = people.find(person => person.id === id)
    
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    people = people.filter(person => person.id !== id)
  
    response.status(204).end()
  })

const getRandomInt = () => {
return Math.floor(Math.random() * 500)
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    
    if (!body.name || !body.number) {
        return response.status(400).json({ 
          error: 'name or number missing' 
        })
    }

    const sameName = people.find(person => person.name === body.name)
    if (sameName) {
        return response.status(400).json({ 
          error: 'name must be unique' 
        })
    }
    
    const person = {
    id: getRandomInt(),
    name: body.name,
    number: body.number
    }
    
    people = people.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
