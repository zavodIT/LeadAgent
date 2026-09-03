query "leads/{lead_id}" verb=PATCH {
  api_group = "LeadAgent"
  input {
    int lead_id filters=min:1
    enum status { values = ["found", "qualified", "to_contact", "contacted", "replied", "archived"] }
  }
  stack {
    db.edit leads {
      field_name = "id"
      field_value = $input.lead_id
      data = {}|set:"status":$input.status
    } as $lead
    precondition ($lead != null) {
      error_type = "notfound"
      error = "Lead not found"
    }
  }
  response = $lead
}
