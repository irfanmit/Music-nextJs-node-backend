const bcrypt = require('bcryptjs');
const User = require('../models/user');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Song = require('../models/song')
// const nodemailer = require('nodemailer')

const musicPathArray = require('../musicPath/path')

let lastFoundIndex = -1; 

module.exports = {

//////////////////////// PREV MUSIC - PLAYER ////////////////////////

prevMusicPlayer: async function ({ currentType }, req) {
  try {
    console.log('Previous Music Player');

    const formattedCurrentType = currentType;

    let foundIndex;
    let musicPlayer;

    // Calculate the previous index considering the circular array
    const startIndex = (lastFoundIndex - 1 + musicPathArray.length) % musicPathArray.length;

    for (let i = startIndex; i >= 0; i--) {
      if (musicPathArray[i].type === formattedCurrentType) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === undefined) {
      // Logic when the specified type is not found
      throw new Error('Specified type not found.');
    } else {
      musicPlayer = musicPathArray[foundIndex];
      lastFoundIndex = foundIndex; // Update lastFoundIndex
    }

    console.log('Returning previous data');
    return {
      filePath: musicPlayer.path,
      type: musicPlayer.type,
      artist : musicPlayer.artist,
      title : musicPlayer.title
    };
  } catch (err) {
    console.log('Returning ERROR data');
    console.log(err);
    throw err;
  }
},


//////////////////////// N E X T -- M U S I C - P L A Y E R /////////////////
nextMusicPlayer: async function ({ currentType }, req) {
  try {
    console.log("CURRENT TYPE === "+currentType)

    let foundIndex;
    let musicPlayer;
    const startIndex = (lastFoundIndex + 1) % musicPathArray.length;

    // console.log("musicPathArray at index 0 " + musicPathArray[0].type)

    for (let i = startIndex; i < musicPathArray.length; i++) {
      if (musicPathArray[i].type === currentType) {
        foundIndex = i;
        musicPlayer = musicPathArray[i];
        console.log("MUSIC PLAYER VALUE IN NEXT = " + musicPlayer)
        break;
      }
    }
    
    if (foundIndex === -1) {
      // Logic when the specified type is not found
    } else {
      //  musicPlayer = musicPathArray[foundIndex];
       
      lastFoundIndex = foundIndex; // Update lastFoundIndex
    }
    

    // Update the lastFoundIndex with the new foundIndex
    // lastFoundIndex = (startIndex + foundIndex) % musicPathArray.length;
    
    console.log('returning next data ')
    return {
      filePath: musicPlayer.path,
      type: musicPlayer.type,
      artist : musicPlayer.artist,
      title : musicPlayer.title
    };
  } catch (err) {
    console.log('returning next ERROR data ')
    console.log(err)
    throw err;
  }
},

/////////////////////// M U S I C - P L A Y E R ////////////////////
musicPlayer: async function ({currentType, songTitle}, req) {
  try {
    console.log(' MUSIC PLAYER ')
    const formattedSongTitle = songTitle.replace(/\s+/g, '').toLowerCase();
    const musicPlayer = musicPathArray.find(song =>
      song.title.replace(/\s+/g, '').toLowerCase() === formattedSongTitle
    );

    if (!musicPlayer) {
      const error = new Error('Our server does not contain your requested song..we are sorry plz maf krdo');
      error.code = 424;
      throw error;
    }

    const similarSongsPaths = musicPathArray
    .filter((song) => song.type === currentType)
    .map((song) => song.path)
    .slice(0, 5); // Limit the array to 5 items

// console.log(similarSongsPaths)
    return {
      filePath: musicPlayer.path,
      type: musicPlayer.type,
      artist: musicPlayer.artist,
      title: musicPlayer.title,
      similarSongs: similarSongsPaths,
    };
  } catch (err) {
    console.log('ERRRORR musicPLyaer')
    console.log(err)
    throw err;
  }
},


// ///////////////////////// AUTHENTICATION /////////////////////

    authentication: async function (_, req) {
      try {
        // req.isAuth=true;
        // console.log(req.isAuth)
        if(!req.isAuth) {
          const error = new Error('Not authenticated');
          error.code = 420;
          throw error;
        }
      } catch (err) {
        // Handle any potential errors here
        throw err;
      }
    },

  

  /////////////USER-CREATION/////////////
  createUser: async function ({ userInput }, req) {
    try {
      const errors = [];

      if (!validator.isEmail(userInput.email)) {
        errors.push({ message: 'E-Mail is invalid.' });
      }

      if (
        validator.isEmpty(userInput.password) ||
        !validator.isLength(userInput.password, { min: 5 })
      ) {
        errors.push({ message: 'Password too short!' });
      }

      if (errors.length > 0) {
        const error = new Error('Invalid input.');
        error.data = errors;
        error.code = 422;
        throw error;
      }

      const existingUser = await User.findOne({ email: userInput.email });
      if (existingUser) {
        const error = new Error('User exists already!');
        throw error;
      }

      const hashedPw = await bcrypt.hash(userInput.password, 12);
      const user = new User({
        email: userInput.email,
        name: userInput.name,
        password: hashedPw,
      });

      const createdUser = await user.save();
      return {
        ...createdUser._doc,
        _id: createdUser._id.toString(),
      };
    } catch (err) {
      // Handle any potential errors here
      throw err;
    }
  },

  ///////////////////////LOGIN/////////////////////////
  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('Email not found');
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('wrong password');
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      'somesupersecretsecret',
      { expiresIn: '1h' }
    );

    return { token: token, userId: user._id.toString() };
  },
};
