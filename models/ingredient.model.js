const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ingredient name is required']
    },
    amout: {
        type: Number,
        required: [true, 'Amount is required']
    },
    unit: {
        type: String,
        required: [true, 'Unit is required']
    }
});

const Ingredient = mongoose.model('Ingredient', userSchema);
module.exports = Ingredient;

