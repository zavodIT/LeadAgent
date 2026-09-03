// Qualified companies ranked by service fit and current buying intent.
table leads {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int research_run_id? { table = "research_runs" }
    text company filters=trim
    text website?
    text industry?
    text location?
    int fit_score?=0
    int urgency_score?=0
    int overall_score?=0
    enum confidence? { values = ["low", "medium", "high"] }
    text why_now?
    text service_match?
    text outreach?
    enum status? {
      values = ["found", "qualified", "to_contact", "contacted", "replied", "archived"]
    }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "research_run_id", op: "asc"}]}
    {type: "btree", field: [{name: "overall_score", op: "desc"}]}
    {type: "btree", field: [{name: "status", op: "asc"}]}
  ]
  guid = "wDvOYKCmG4vQ3w31GU3EHGET98M"
}
