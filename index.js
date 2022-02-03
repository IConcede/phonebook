require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

app.use(express.json());
app.use(express.static('build'));
app.use(cors());
app.use(morgan('tiny'));

let persons = [
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
    }
]

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result);
    });
});

app.get('/info', (request, response) => {
    Person.find({}).then(result => {
        const time = new Date();
        const info = 
            `<div>
                <p>Phonebook has info for ${result.length} people</p>
                <p>${time}</p>
            </div>`;
        response.send(info);
    })
});

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;

    Person.findById(id).then(result => {
        response.json(result);
    });
});

app.delete('/api/persons/:id', (request, response, next) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    response.status(204).end()

    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end();
    })
    .catch(error => next(error));
});

const generateID = () => {
    return Math.floor(Math.floor(Math.random() * 1000000));
}

app.post('/api/persons', (request, response) => {
    const body = request.body;
    const nameExists = persons.find(person => person.name === body.name);

    if(!body.name || !body.number || nameExists) {
        let message;

        if(!body.name) {
            message = 'name is missing'
        } else if(!body.number) {
            message = 'number is missing'
        } else if(nameExists) {
            message = 'name must be unique'
        }

        return(response.status(400).json({
            error: message
        }))
    }

    const person = new Person({
        id: generateID(),
        name: body.name,
        number: body.number,
    });

    person.save().then(result => {
        response.json(result);
    });
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});