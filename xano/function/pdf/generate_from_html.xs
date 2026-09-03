// Renders HTML through Nutrient DWS and stores the resulting PDF privately.
// NUTRIENT_API_KEY must be configured in Xano Keys & Variables.
function "pdf/generate_from_html" {
  input {
    text html filters=trim|min:20
    text filename? filters=trim
  }
  stack {
    var $pdf_filename {
      value = $input.filename|default:"leadagent-report.pdf"
    }
    storage.create_file_resource {
      filename = "index.html"
      filedata = $input.html
    } as $html_file
    api.request {
      url = "https://api.nutrient.io/processor/generate_pdf"
      method = "POST"
      params = {}
        |set:"html":$html_file
      headers = []
        |array_push:("Authorization: Bearer " ~ $env.NUTRIENT_API_KEY)
      timeout = 60
    } as $nutrient
    storage.create_attachment {
      access = "private"
      value = $nutrient.response.result
      filename = $pdf_filename
    } as $pdf
    storage.sign_private_url {
      pathname = $pdf.path
      ttl = 900
    } as $download_url
  }
  response = {
    file        : $pdf,
    download_url: $download_url,
    expires_in  : 900
  }
  guid = "qZ7rP2nV8kLm4sTx1cWd9aFj3Y"
}
