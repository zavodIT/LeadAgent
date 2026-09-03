// One user-requested market research execution.
table research_runs {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    timestamp completed_at?
    text offer filters=trim
    text industry filters=trim
    text location? filters=trim
    json stages?
    json requested_signals?
    text query? filters=trim
    enum status? {
      values = ["processing", "completed", "failed"]
    }
    text error?
    int result_count?=0
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree", field: [{name: "status", op: "asc"}]}
  ]
  guid = "pDqbEyyaMGPQzNn7B4Q4RPuGjp0"
}
