// For testing purposes only
// Mimicing the behavior of a python script
// 1. Define functions
// 2. Establish connection and functions
const { promisify } = require('util');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const passcode = config.passcode;

const handle_x_squared = x => Math.pow(x, 2);

const handle_string_reverse = str => str.split('').reverse().join('');

const fnDict = {
  'handle_x_squared': {
    requiresAuth: false,
    authToken: '',
    fn: handle_x_squared,
  },
  'handle_string_reverse': {
    requiresAuth: true,
    authToken: 'abc123',
    fn: handle_string_reverse,
  }
}

const io = require('socket.io-client');
const socket = io(`http://localhost:3000?passcode=${passcode}`);
const asyncSocketEmit = promisify(socket.emit);

socket.on('connect', () => {
  for (let pathname in fnDict) {
    console.log('pathname: ', pathname)
    socket.emit('register_path', {
      pathname,
      requiresAuth: fnDict[pathname].requiresAuth,
      authToken: fnDict[pathname].authToken,
    });
    socket.on('register_path', response => {
      if (response.result === 'success') {
        socket.on(pathname, ({ requestUUID, input }) => {
          const output = fnDict[pathname].fn(input);
          console.log(`Output: ${output}`);
          socket.emit(requestUUID, output);
        })
      }
    })
    // console.log('Path register response: ', response);
  }
})

