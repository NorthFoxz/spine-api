# Spine API
Access your python functions through HTTP requests.

It is simple, clean, and easy to use. It works with jupyter notebooks too.

## 1. Setup your api server

**Prerequisites**
1. Make sure your server is accessible through port 3000
2. Have Node.js installed on your server

**Installation**
```bash
$ git clone https://github.com/spineapi/spine-api
$ cd spine-api/server
$ npm install
```

**Run server**
```bash
$ node server.js
```
Now you can access your server through http://YOUR_SERVER_IP:3000. Copy the passcode.

### Installation
```bash
$ pip instal spineapi
```

## Connect your python script to the server
**1. Import the library**
```Python
from spineapi import Connection
```

**2. Define your function**
```Python
def hello_function (input):
  # ...
  # do something
  # ...
  return output
```

**3. Specify ```name``` and ```description``` to initialize your project**
```Python
spine_connection = Connection(
  project_path="hello_project",
  project_name="My first project",
  description="Arithmetic operations",
  base_url="http://localhost:3000",
  passcode="xxxx-xxxx-xxxx-xxxxx",
  author="", # Optional
  link="" # Optional
)
```

**4. Register your function(s)**
```Python
spine_connection.register_function(
  pathname='hello_function',
  function=hello_function,
  # ============ Optional ==================
  # Set True if you want to protect this API
  requiresAuth=False,
  authToken="xxx",
  # ========================================
)
```
The function will be accessible through ```/api/hello_project/hello_function```

**5. Run**
```
spine_connection.run()
```
That's it! You can now communicate with your ML model through HTTP post requests.

**6. Send requests**

**Note** You have to first run ```JSON.stringify(input)``` for the request data.
```javascript
const data = {
  input: JSON.stringify(YOUR_INPUT)
  // ============ Optional ==================
  // Required if the API is protected
  authToken: "xxx",
  // ========================================
}
```

Post request body to the endpoint.
```javascript
const url = 'http://localhost:3000/api/hello_project/hello_function';

fetch(
  url,
  {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({ 'Content-Type': 'application/json' })
  }
)
.then(res => res.json())
.catch(error => console.error('Error:', error))
.then(response => console.log('Success:', response));
```

# License
[MIT](https://github.com/northfoxz/spine-api/blob/master/LICENSE)