const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String!
    }
    
    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type AuthData {
        token: String!
        userId: String!
        index : Int!
    }

    type MusicPlayer {
        filePath : String!
        type : String!
        artist : String!
        title : String!
        similarSongs: [String]
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        authentication: Int
        emailSend(email: String!): Boolean
        musicPlayer(songTitle: String!, currentType: String! ): MusicPlayer!
        nextMusicPlayer(currentType: String!) : MusicPlayer!
        prevMusicPlayer(currentType: String!) : MusicPlayer!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
