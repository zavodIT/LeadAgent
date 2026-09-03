// Creates a research run and returns fresh Google News evidence from SerpApi.
query "research" verb=POST {
  api_group = "LeadAgent"
  input {
    text offer filters=trim|min:10
    text offer_query? filters=trim
    text industry filters=trim
    text location? filters=trim
    json stages?
    json signals?
  }
  stack {
    var $offer_filter {
      // The frontend removes generic words such as "agency" and "team", leaving
      // the capabilities a buyer would mention (for example "Python OR backend").
      value = $input.offer_query
    }
    var $search_query {
      // Target-market prose stays out of the query because it is often too broad.
      // Offer capabilities, however, must constrain the evidence we retrieve.
      value = $input.industry ~ " (startup OR company) (" ~ $offer_filter ~ ") (funding OR raises OR raised OR hiring OR launches OR expansion) when:90d"
    }
    db.add research_runs {
      data = {
        created_at       : "now"
        offer            : $input.offer
        industry         : $input.industry
        location         : $input.location
        stages           : $input.stages
        requested_signals: $input.signals
        query            : $search_query
        status           : "processing"
        result_count     : 0
      }
    } as $run
    api.request {
      url = "https://serpapi.com/search.json"
      method = "GET"
      params = {}
        |set:"engine":"google_news"
        |set:"q":$search_query
        |set:"hl":"en"
        |set:"api_key":$env.SERPAPI_API_KEY
      headers = []
      timeout = 30
    } as $serp
    var $news {
      // SerpApi may omit news_results for a valid zero-match response.
      value = $serp.response.result|get:"news_results":[]
    }
    var $qualification_evidence {
      // Keep qualification fast and predictable. The full SerpApi response is
      // still saved below for audit/history, but the model only needs the most
      // recent 20 compact evidence records.
      value = []
    }
    foreach ($news|slice:0:20) {
      each as $item {
        array.push $qualification_evidence {
          value = {
            title        : $item.title
            source_name  : $item.source.name
            source_url   : $item.link
            published_at : $item.iso_date
          }
        }
      }
    }
    foreach ($news) {
      each as $item {
        db.add search_results {
          data = {
            created_at     : "now"
            research_run_id: $run.id
            engine         : "google_news"
            query          : $search_query
            position       : $item.position
            title          : $item.title
            link           : $item.link
            source_name    : $item.source.name
            published_at   : $item.iso_date
            raw            : $item
          }
        } as $saved_result
      }
    }
    ai.agent.run "Lead Qualification Agent" {
      args = {
        offer   : $input.offer
        industry: $input.industry
        location: $input.location
        stages  : $input.stages
        signals : $input.signals
        evidence: $qualification_evidence
      }
      // Qualification is deliberately read-only; raw evidence remains auditable.
      allow_tool_execution = false
    } as $qualification
    db.edit research_runs {
      field_name = "id"
      field_value = $run.id
      data = {
        status      : "completed"
        completed_at: "now"
        result_count: $news|count
      }
    } as $completed_run
  }
  response = {run: $completed_run, results: $news, qualification: $qualification}
  guid = "9z28ubZBxgAbF9Z7MeYQg0wF9Tw"
}
