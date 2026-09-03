// Renders HTML through Nutrient DWS and stores the resulting PDF in Xano.
// NUTRIENT_API_KEY must be configured in Xano Keys & Variables.
function "pdf/generate_from_html" {
  input {
    text html filters=trim|min:20
    text filename? filters=trim
  }
  stack {
    var $pdf_filename {
      value = "leadagent-report.pdf"
    }
    conditional {
      if ($input.filename != null && $input.filename != "") {
        var.update $pdf_filename {
          value = $input.filename
        }
      }
    }
    var $boundary {
      value = "----LeadAgentNutrientBoundary7MA4YWxkTrZu0gW"
    }
    var $multipart_body {
      // Constructing the small HTML multipart payload directly keeps this
      // integration compatible with Xano plans without file-resource support.
      value = "--" ~ $boundary ~ "\r\n" ~ "Content-Disposition: form-data; name=\"html\"; filename=\"index.html\"\r\n" ~ "Content-Type: text/html; charset=utf-8\r\n\r\n" ~ $input.html ~ "\r\n--" ~ $boundary ~ "--\r\n"
    }
    api.request {
      url = "https://api.nutrient.io/processor/generate_pdf"
      method = "POST"
      params = $multipart_body
      headers = []
        |array_push:("Authorization: Bearer " ~ $env.NUTRIENT_API_KEY)
        |array_push:("Content-Type: multipart/form-data; boundary=" ~ $boundary)
      timeout = 60
    } as $nutrient
  }
  response = {
    filename      : $pdf_filename,
    mime          : "application/pdf",
    content_base64: $nutrient.response.result|base64_encode
  }
  guid = "qZ7rP2nV8kLm4sTx1cWd9aFj3Y"
}
