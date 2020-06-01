import socketio, re
sio = socketio.Client()
class Connection():
  def __init__(
    self,
    project_path="",
    project_name="",
    description="",
    author="",
    link="",
    base_url="",
    passcode=""
  ):
    
    # Default behavior
    self.fnDict = {}
    self.socket = sio
    self.project_path = project_path
    self.project_name = project_name
    self.description = description
    self.author = author
    self.link = link

    if not re.match(r"^[0-9A-Za-z_]+$", project_path):
      raise ValueError("Project path can only contains alphanumeric characters and underscore")
    elif project_name == "":
      raise ValueError("Please specify your project name")
      pass
    elif base_url == "" and passcode == "":
      raise ValueError("Please enter your passcode")
    elif base_url == "":
      raise ValueError("Please enter your server url")
    elif passcode == "":
      # Self hosting, but you have to pass in the authcode of your server.
      raise ValueError("Please enter your passcode.")
    else:
      # Self hosting
      self.base_url = base_url
      self.passcode = passcode
  
  def register_function(self, pathname="", requiresAuth=False, authToken="", function=lambda *args: None):
    self.fnDict[pathname] = {
      'requiresAuth': requiresAuth,
      'authToken': authToken,
      'function': function,
    }
    pass
  
  def run(self):
    try:
      self.socket.connect(self.base_url + "?passcode=" + self.passcode)
      # Default behavior
      @sio.event
      def connect():
        print("I'm connected")
        self.socket.emit("update_project_info", {
          "project_path": self.project_path,
          "project_name": self.project_name,
          "description": self.description,
          "author": self.author,
          "link": self.link,
        })
        for pathname in self.fnDict:
          self.socket.emit("register_path", {
            'pathname': pathname,
            'requiresAuth': self.fnDict[pathname]['requiresAuth'],
            'authToken': self.fnDict[pathname]['authToken'],
          })

      @sio.event
      def connect_error():
        print("The connection failed!")

      @sio.event
      def disconnect():
        print("I'm disconnected!")

      # Main behavior
      @sio.event
      def register_path(data):
        if data["result"] == "success":
          @sio.on(data["pathname"])
          def on_message(message):
            output = self.fnDict[data["pathname"]]["function"](message["input"])
            self.socket.emit(message["requestUUID"], output)
        else:
          print(data["errorMessage"])
    except Exception as e:
      print(e)