// Extracts a concise, search-ready professional profile from an uploaded CV.
query "cv/extract" verb=POST {
  api_group = "LeadAgent"
  input {
    file file
  }
  stack {
    api.request {
      url = "https://api.nutrient.io/extraction/extract"
      method = "POST"
      params = {}
        |set:"file":$input.file
        |set:"instructions":({
          schema: {
            type: "object"
            properties: {
              resume_text: {
                type: "string"
                description: "Complete readable text of the CV, preserving headings and line breaks."
              }
            }
            required: ["resume_text"]
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
