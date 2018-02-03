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
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ingredient'
            }
        ],
        required: [true, 'Ingredients are required']
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

userSchema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('password')) {
        return next();
    }

    if (user.isAdmin()) {
        user.role = 'BOSS';
    }

    bcrypt.genSalt(SALT_WORK_FACTOR)
        .then(salt => {
            bcrypt.hash(user.password, salt)
                .then(hash => {
                    user.password = hash;
                    next();
                })
        })
        .catch(error => next(error));
});


const Receipt = mongoose.model('Receipt', userSchema);
module.exports = Receipt;