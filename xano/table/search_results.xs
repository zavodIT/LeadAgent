// Auditable snapshot of each live SerpApi result used during qualification.
table search_results {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int research_run_id { table = "research_runs" }
    text engine filters=trim
    text query filters=trim
    int position?
    text title?
    text link? filters=trim
    text source_name?
    timestamp published_at?
    json raw?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "research_run_id", op: "asc"}]}
    {type: "btree|unique", field: [{name: "research_run_id", op: "asc"}, {name: "link", op: "asc"}]}
  ]
  guid = "L3ar7tiPs3Nn1pC0bLjON0qbCSY"
}
