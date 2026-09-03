// Source-backed evidence explaining why a company may buy now.
table signals {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int lead_id { table = "leads" }
    enum type { values = ["funding", "hiring", "launch", "expansion", "other"] }
    text title filters=trim
    text summary?
    text source_url filters=trim
    text source_name?
    timestamp published_at?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "lead_id", op: "asc"}]}
    {type: "btree|unique", field: [{name: "lead_id", op: "asc"}, {name: "source_url", op: "asc"}]}
  ]
  guid = "V-8Hv9YCZCrKkJTZ9cWeF2RrK5M"
}
