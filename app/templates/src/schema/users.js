import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID
} from 'graphql';
import { GraphQLError } from 'graphql/error';
import { GraphQLEmail } from 'graphql-custom-types';
import Users from '../lib/users';

const users = new Users();

const userType = new GraphQLObjectType({
  name: 'User',
  description: 'Representation of public user data.',
  fields: () => ({
    _id: {
      description: 'Unique user id.',
      type: GraphQLID
    },
    username: {
      description: 'Unique username.',
      type: GraphQLString
    },
    mail: {
      description: 'Optional E-Mail address.',
      type: GraphQLEmail
    }
  })
});

const _self = {
  description: 'Information about the currently logged in user.',
  type: userType,
  resolve(parentValue, _, { rootValue: { session } }) {
    if(session.passport) {
      return session.passport.user;
    }
    throw new GraphQLError('Query error: Not logged in');
  }
};

const _list = {
  description: 'Information about all users.',
  type: new GraphQLList(userType),
  resolve(parentValue, _, { rootValue: { session } }) {
    return users.getList();
  }
};

const _updateMail = {
  description: 'Update mail address of the currently logged in user.',
  type: userType,
  args: {
    mail: {
      description: 'Non empty, valid E-Mail address.',
      type: GraphQLEmail
    }
  },
  resolve(parentValue, _, { rootValue: { session } }) {
    if(session.passport) {
      return users.updateMail(session.passport.user._id, _.mail);
    }
    throw new GraphQLError('Query error: Not logged in');
  }
}

const _signup = {
  description: 'Register a new user account. Returns newly created user or null if username is taken.',
  type: userType,
  args: {
    username: {
      description: 'Non empty username for new account.',
      type: GraphQLString
    },
    password: {
      description: 'Non empty password for new account.',
      type: GraphQLString
    }
  },
  resolve(parentValue, _, { rootValue: { data } }) {
    return users.signup(_.username, _.password);
  }
}

export const selfField = _self;
export const userListField = _list;
export const userUpdateMailField = _updateMail;
export const userSignupField = _signup;
