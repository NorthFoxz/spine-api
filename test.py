from spineapi import Connection

import math
def x_squared(x):
  return math.pow(x, 2)

def string_reverse(str):
  return str[::-1]

spine_server = Connection(
  project_path="hello_project",
  project_name="A test project",
  description="An inference API for my ML model",
  author="northfoxz", # Optional
  link="https://github.com/northfoxz", # Optional
  base_url="http://localhost:3000",
  passcode="3b5222f9-46db-4546-87a8-0c7fe084985d"
)
spine_server.register_function(
  pathname='x_squared',
  function=x_squared,
)
spine_server.register_function(
  pathname='string_reverse',
  requiresAuth=True,
  authToken='asdfqwer',
  function=string_reverse,
)
spine_server.run()