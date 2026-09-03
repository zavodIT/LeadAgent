// Extracts a concise, non-personal seller profile from an uploaded CV.
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
              professional_profile: {
                type: "string"
                maxLength: 1000
                description: "Write a concise B2B seller profile in no more than 120 words. Include only services the person can credibly offer, core professional capabilities, relevant technologies, industries, and seniority. Synthesize the information instead of copying the CV. Exclude the person's name, postal address, location, phone number, email, URLs, websites, social handles, employer names, client names, education, certificates, exact dates, age, and all other personally identifiable or contact information. Do not include headings, labels, raw CV text, or contact details. Return only the profile suitable for matching the seller to potential business buyers."
              }
            }
            required: ["professional_profile"]
          }
        }|json_encode)
      headers = []
        |array_push:("Authorization: Bearer " ~ $env.NUTRIENT_EXTRACT_API_KEY)
      timeout = 60
    } as $extraction
  }
  // Keep the public endpoint response small and compatible with the frontend:
  // { professional_profile: "..." } rather than the extraction service envelope.
  response = $extraction.response.result.output.data
  guid = "qPpOwrEYMS7iBsKQ4YzI-1Aconw"
}
