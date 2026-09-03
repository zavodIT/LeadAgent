// Generates a private PDF from complete HTML and returns a 15-minute URL.
// The Nutrient credential never leaves Xano.
query "pdf/generate" verb=POST {
  api_group = "LeadAgent"
  input {
    text html filters=trim|min:20
    text filename? filters=trim
  }
  stack {
    function.run "pdf/generate_from_html" {
      input = {
        html    : $input.html
        filename: $input.filename
      }
    } as $generated
  }
  response = $generated
  guid = "mN5bC8xL2vQ7sR4tK9wH1jDp6A"
}
