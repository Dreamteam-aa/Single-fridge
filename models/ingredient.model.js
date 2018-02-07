const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ingredient name is required'],
        unique: [true, 'Ingredient already exists']
    },
    description: {
        type: String
    }
});

const Ingredient = mongoose.model('Ingredient', userSchema);
module.exports = Ingredient;

