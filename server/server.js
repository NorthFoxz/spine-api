// Socket server for spine api
// This is designed to be a lightweight library with simple setup
// Features:
// 1. Only supports single data server. (e.g. one colab notebook)
// 2. Supports handling multiple functions at the same time. (with different pathnames)
// 3. Basic authentication. (You'll have to modify passcode everytime you launch)

const fs = require('fs');
const app = require('express')();
const bodyParser = require('body-parser');
app.use(bodyParser.json())
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const uuidv4 = require('uuid/v4');

let socketAvail = false;
let sendData;

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let passcode = config.passcode;
const isValid = pc => {
  if (pc === passcode) return true;
  return false;
}
let projectInfo = {
  project_name: '',
  description: '',
  author: '',
  link: '',
};
let pathdict = {};
/*
pathdict = { 'get_word_embedding': { requiresAuth: true, authToken: 'xxx' } }
*/

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  if (socketAvail) {
    let pathInfo = "";
    for (let pathname in pathdict) {
      pathInfo += `<div><code>POST /api/${projectInfo.project_name}/${pathname}</code></div>`
    }
    res.send(`<div><h1>Spine API</h1><h3>Project Information</h3><hr/><div>Project Name: ${projectInfo.project_name}</div><div>Author: ${projectInfo.author}</div><div>Link: <a href="${projectInfo.link}">${projectInfo.link}</a></div><p>${projectInfo.description}</p><h3>API Endpoints</h3><hr/>${pathInfo}</div>`);
  } else
    res.send(`<div><h1>Spine API</h1><span>Your passcode:<br/> <code>${passcode}</code><br/><span style="color:#5f5f5f;font-size:14px;">(The message will disappear after you have successfully connected)</span></span></div>`)
});

app.post('/api/:project_name/:pathname', async (req, res) => {
  if (!socketAvail) return res.status(400).json({ error: `Data server not ready yet` });
  const project_name = req.params.project_name;
  if (project_name !== projectInfo.project_name)  return res.status(400).json({ error: 'Invalid project name' });
  const pathname = req.params.pathname;
  if (!(pathname in pathdict)) return res.status(400).json({ error: 'Invalid pathname' });
  if (pathdict[pathname].requiresAuth && pathdict[pathname].authToken !== req.body.authToken) return res.status(401).json({ error: 'Not authorized' });
  let input = {}
  try {
    input = JSON.parse(req.body.input);
  } catch {
    return res.status(400).json({ error: 'You have to first stringify your json input. e.g. JSON.stringify(input)'})
  }
  const requestUUID = uuidv4();
  const result = await sendData({ pathname, input }, requestUUID);
  return res.json(result);
})

// middleware
io.use((socket, next) => {
  let pc = socket.handshake.query.passcode;
  if (!isValid(pc)) {
    return next(new Error('authentication error'));
  } else if (socketAvail) {
    return next(new Error('data server has been setup already'));
  }
  return next();
})

io.on('connection', (socket) => {

  console.log('Data server online! :D');
  socketId = socket.id;
  socketAvail = true;
  sendData = async (requestData, requestUUID) => {
    return new Promise((resolve, reject) => {
      /*
      Data server will receive
      1. requestUUID(string): has to send back
      2. input(json): as data
      and it has to send back the computational result as param output in JSON
      */
      console.log('Sending ', requestUUID, requestData)
      socket.emit(requestData.pathname, {
        requestUUID,
        input: requestData.input,
      });
    
      socket.on(requestUUID, output => {
        console.log("getting result: ", output);
        resolve(output);
      });
    });
  };

  socket.on('update_project_info', projectInfo_ => {
    projectInfo = projectInfo_;
  })

  socket.on('register_path', registration => {
    // Check if path exists
    if (!(registration.pathname in pathdict)) {
      // Register the path
      pathdict[registration.pathname] = {
        requiresAuth: registration.requiresAuth || false,
        authToken: registration.authToken || '',
      }
      socket.emit('register_path', { result: 'success', message: `Successfully registered function for ${registration.pathname}.`, pathname: registration.pathname });
    } else {
      socket.emit('register_path', { result: 'error', errorMessage: 'path exists' });
    }
  })

  socket.on('disconnect', () => {
    socketAvail = false;
    pathdict = {};
    sendData = () => {};
    console.log('Data server disconnected :(');
  });
});

server.listen(port, function(){
  console.log('server up and running at %s port', port);
});