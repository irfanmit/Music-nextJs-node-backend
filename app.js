const express = require('express');

const { graphqlHTTP } = require('express-graphql');
const fs = require('fs');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const bodyParser = require('body-parser');
const { default: mongoose } = require('mongoose');





const app = express();

const isAuth = require('./middleware/isAuth')
//////////////////////////////////////////
// const file = require('init.txt');
// const musicDirectory = 'D:/music';
// const Song = require('./models/song');
// const songs = fs.readdirSync(musicDirectory)
// // console.log(songs)
// songs.forEach(async (song) => {
//   // Skip directories
//   if (!fs.existsSync('databaseInitialized.txt')) {
//     const file = fs.readFileSync(`${musicDirectory}/${song}`);

//     // Analyze the tempo using music-tempo package
//     // const tempo = await musicTempo.getTempo(file);
    
//     // Create a new song document
//     const songData = new Song({
//       title: song,
//       artist: 'The Artist',
//       album: 'The Album',
//       genre: 'The Genre',
//       tempo: 1,
//       filePath: `${musicDirectory}/${song}`,
//     });

//     // Save the song data to MongoDB
//     try {
//       await songData.save();
//       // console.log(`Saved ${song} to MongoDB`);
//     } catch (error) {
//       console.error(`Error saving ${song} to MongoDB:`, error);
//     }
//   }
// }); // <-- Add this closing parenthesis for the forEach loop

// if (!fs.existsSync('databaseInitialized.txt')) {
//   fs.writeFileSync('databaseInitialized.txt', 'Initialized');
// } else {
//   // console.log('Database has already been initialized.');
// }


////////////////////////////
app.use(isAuth);
// console.log('hello')
app.use(bodyParser.json());

// GET endpoint for "Hello, World!"
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// const path = require('./static/music/dune.mp3')


app.use('/music', express.static('music'));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, authorization');
  if(req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  customFormatErrorFn(err){
    if(!err.originalError)
    return err;
    const data = err.originalError.data;
    const message = err.message || 'An errror occured';
    const code = err.originalError.code || 500;
    return {message : message, statusCode: code, data: data};
  }
}));

mongoose.connect('mongodb+srv://faisalirfan:AirpBqL5mMAal7ON@cluster0.j111j4d.mongodb.net/user').then(result => {
  app.listen(8080, () => {
    console.log('Server is running on port 8080.');
  });
}).catch(error => {
  console.error('Error connecting to MongoDB:', error.message);
});

