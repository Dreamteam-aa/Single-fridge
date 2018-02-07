const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    ingredients: {
        type: [{
            ingredient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ingredient'
            },
            amount: {
                type: String
               },
            unit: {
                type: String
            }
        }
    ]
        //Cantidad y unidad de medida lo metemos aqui
    },
    imgs: {
        type: [
            {
                type: String
            }
        ]
    },
    rating: {
        type: [
            {
                type: Number
            }
        ]
    },
    author: {
        type: 
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
    },
    url: {
        type: String
    }
}, { timestamps: true });


const Recipe = mongoose.model('Recipe', userSchema);
module.exports = Recipe;