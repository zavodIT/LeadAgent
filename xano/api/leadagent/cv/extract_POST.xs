// Extracts a concise, search-ready professional profile from an uploaded CV.
query "cv/extract" verb=POST {
  api_group = "LeadAgent"
  input {
    file file
  }
  stack {
    api.request {
      url = "https://api.nutrient.io/build"
      method = "POST"
      params = {}
        |set:"document":$input.file
        |set:"instructions":({
          parts: [{file: "document"}]
          output: {
            type: "json-content"
            plainText: true
            structuredText: false
          }
        }|json_encode)
      headers = []
        |array_push:("Authorization: Bearer " ~ $env.NUTRIENT_EXTRACT_API_KEY)
      timeout = 60
    } as $extraction
  }
  response = $extraction.response.result
  guid = "qPpOwrEYMS7iBsKQ4YzI-1Aconw"
}
