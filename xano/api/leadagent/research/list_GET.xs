query "research" verb=GET {
  api_group = "LeadAgent"
  input {}
  stack {
    db.query research_runs {
      sort = {research_runs.created_at: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 25}}
    } as $runs
  }
  response = $runs
  guid = "lzyQhqFmPmEo3AjitC0U97aTpok"
}
