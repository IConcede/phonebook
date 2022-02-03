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


app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(result => {
        response.json(result);
    })
    .catch(error => next(error));
});

app.get('/info', (request, response, next) => {
    Person.find({}).then(result => {
        const time = new Date();
        const info = 
            `<div>
                <p>Phonebook has info for ${result.length} people</p>
                <p>${time}</p>
            </div>`;
        response.send(info);
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;

    Person.findById(id).then(result => {
        response.json(result);
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end();
    })
    .catch(error => next(error));
});


app.post('/api/persons', (request, response,next) => {
    const body = request.body;

    if(!body.name || !body.number) {
        let message;

        if(!body.name) {
            message = 'name is missing'
        } else if(!body.number) {
            message = 'number is missing'
        }

        return(response.status(400).json({
            error: message
        }))
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person.save().then(result => {
        response.json(result);
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const person = {
      name: body.name,
      number: body.number,
    };
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        console.log(updatedPerson)
        response.json(updatedPerson)
      })
      .catch(error => {
          console.log(request.body);
          next(error)})
  })

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
  }
  
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message);
  
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error);
  }
  
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});