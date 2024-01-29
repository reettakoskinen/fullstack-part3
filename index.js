require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

// Middleware
app.use(express.json())
app.use(express.static('dist')) 
app.use(cors())

// Morgan middleware for logging info about requests
morgan.token('req-body', (req) => {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

// Error handler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 
  next(error)
}
// this has to be the last loaded middleware.
app.use(errorHandler)

// Get info about phonebook
app.get('/info', async (request, response) => {
  const count = await Person.countDocuments({})
  const currentDate = new Date();
  response.send(`<p>Phonebook has info for ${count} people</p> <p>${currentDate}</p>`)
})

// get all people
app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

// Get a single person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// Delete a person
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

// Add a new person
app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error));
});

// Update a number
app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})