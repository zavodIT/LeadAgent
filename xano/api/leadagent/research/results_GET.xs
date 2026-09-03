// Returns the exact SerpApi items persisted for a research run.
query "research/{research_run_id}/results" verb=GET {
  api_group = "LeadAgent"
  input { int research_run_id filters=min:1 }
  stack {
    db.query search_results {
      where = $db.search_results.research_run_id == $input.research_run_id
      sort = {search_results.position: "asc"}
      return = {type: "list", paging: {page: 1, per_page: 100}}
    } as $results
  }
  response = $results
  guid = "gwQkI2fUGF0xRlcoZpzEUdXl1DQ"
}
