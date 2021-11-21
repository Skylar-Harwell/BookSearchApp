const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userInfo = await User.findOne({ _id: context.user._id }).select('password');
            return userData;
            }
            throw new AuthenticationError('Unable to Log In');
        },
    },
    Mutation: {
        addUser: async (parent, args) => {
           const user = await User.Create(args);
           const token = signToken(user); 

           return {token, user};
        },

        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if (!user) {
                throw new AuthenticationError('Incorrect Username or Password');
            }
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Username or Password');
            }
            const token = signToken(user);
            return {token, user};
        },

        saveBook: async (parent, {bookInfo}, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookInfo } },
                    { new: true }
                );
            return updatedUser;
        }

        throw new AuthenticationError('You need to be logged in to add a book!');
        },

        removeBook: async (parent, {bookId}, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                  );
            return updatedUser;
        }

        throw new AuthenticationError('You need to be logged in to remove a book!')
        },
    },
}

module.exports = resolvers;