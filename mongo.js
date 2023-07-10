const mongoose = require('mongoose')

if (process.argv.length !== 5 && process.argv.length !== 3) {
    console.log('missing parameters')
    process.exit(1)
}
const password = process.argv[2]
const url =
  `mongodb+srv://admin:${password}@cluster0.sa4fofd.mongodb.net/Phonebook?retryWrites=true&w=majority`
  //mongodb+srv://admin:<password>@cluster0.sa4fofd.mongodb.net/?retryWrites=true&w=majority

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

if (process.argv[3] && process.argv[4]) {
    const name = process.argv[3]
    const number = process.argv[4]
    const person = new Person({
        name: name, 
        number: number,
    })
    person.save().then(result => {
        console.log(`added ${name} number ${number} to the phonebook`)
        mongoose.connection.close()
    })
} else {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(p => {
            console.log(`${p.name} ${p.number}`)
        })
        mongoose.connection.close()
    })
}

