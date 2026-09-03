// Enriches one identified company with public profile data. The SerpApi key
// remains server-side; callers receive only Google's public search response.
query "companies/enrich" verb=POST {
  api_group = "LeadAgent"
  input {
    text company filters=trim|min:2
    text location?
    text website?
  }
  stack {
    var $context {
      // Quoting the company and prioritising its own domain avoids unrelated
      // LinkedIn posts that merely mention the same name.
      value = "\"" ~ $input.company ~ "\" official website company " ~ $input.location
    }
    api.request {
      url = "https://serpapi.com/search.json"
      method = "GET"
      params = {}
        |set:"engine":"google"
        |set:"q":$context
        |set:"hl":"en"
        |set:"num":10
        |set:"api_key":$env.SERPAPI_API_KEY
      headers = []
      timeout = 30
    } as $serp
  }
  response = $serp.response.result
  guid = "rL8fQ4mTp1YwC6nV2kZ9sJ0aBx"
}
