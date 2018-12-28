const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const debug = require('debug');

const log = debug('fcc:user:model');

// TODO wire up api error with winston
// const APIError = require('../helpers/APIError');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  githubId: {
    type: String
  },
  avatar: {
    type: String
  },
  githubProfile: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
UserSchema.method({});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * find or create a user
   * @param {Object} githubUser - Selected properties returned from GitHub
   * @param {Function} cb - the callback function
   * @returns {Promise<User, APIError>}
   */
  findOrCreate(githubUser, cb) {
    log('findOrCrerate ', githubUser);
    const { githubId } = githubUser;
    this.findOne({ githubId })
      .exec()
      .then((user) => {
        if (user) {
          log('existing user');
          log(user);
          // this user already exists, return it
          return cb(null, user);
        }
        // no user found for this githubId, create one
        return this.create(githubUser).then((newUser) => {
          if (newUser) {
            log('new user');
            log(newUser);
            // user created, return it
            return cb(null, newUser);
          }
          log('@'.repeat(10));
          log('no user found or created');
          log('@'.repeat(10));
          // no user created, throw it
          const err = new Error('unable to create user')//new APIError('Unable to create a user', httpStatus.INTERNAL_SERVER_ERROR);
          return cb(err, null);
        });
      })
      .catch(err => cb(err, null));
  },

  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @param {Function} cb - The callback function
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new Error('no such user')//new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
