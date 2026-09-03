query "leads" verb=GET {
  api_group = "LeadAgent"
  input { text status? filters=trim }
  stack {
    db.query leads {
      sort = {leads.overall_score: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 100}}
    } as $leads
  }
  response = $leads
  guid = "1owoGq24ZX2xJ9n9J3WuuZjHphk"
}
