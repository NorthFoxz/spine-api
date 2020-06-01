from transformers import T5Tokenizer, T5ForConditionalGeneration
from spineapi import Connection
tokenizer = T5Tokenizer.from_pretrained('t5-small')
model = T5ForConditionalGeneration.from_pretrained('t5-small')

spine_connection = Connection(
  project_path="hello_project",
  project_name="My first project",
  description="Arithmetic operations",
  base_url="http://localhost:3000",
  passcode="3b5222f9-46db-4546-87a8-0c7fe084985d",
)

def summarize(input):
  text = "summarize: " + input
  input_ids = tokenizer.encode(text, return_tensors="pt")  # Batch size 1
  outputs = model.generate(input_ids)
  output = "".join(tokenizer.convert_ids_to_tokens(outputs.tolist()[0])).replace("▁", " ")
  return output

spine_connection.register_function(
  pathname='summarize',
  function=summarize,
  # ============ Optional ==================
  # Set True if you want to protect this API
  requiresAuth=False,
  authToken="xxx",
  # ========================================
)

spine_connection.run()