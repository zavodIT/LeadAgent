query "leads" verb=POST {
  api_group = "LeadAgent"
  input {
    int research_run_id?
    text company filters=trim
    text website?
    text industry?
    text location?
    int fit_score? filters=min:0|max:100
    int urgency_score? filters=min:0|max:100
    text why_now?
    text service_match?
    text outreach?
  }
  stack {
    var $overall { value = (($input.fit_score + $input.urgency_score) / 2)|to_int }
    db.add leads {
      data = {
        created_at     : "now"
        research_run_id: $input.research_run_id
        company        : $input.company
        website        : $input.website
        industry       : $input.industry
        location       : $input.location
        fit_score      : $input.fit_score
        urgency_score  : $input.urgency_score
        overall_score  : $overall
        confidence     : "medium"
        why_now        : $input.why_now
        service_match  : $input.service_match
        outreach       : $input.outreach
        status         : "qualified"
      }
    } as $lead
  }
  response = $lead
  guid = "xFv8ZmuE02IMEaqjbRi5fLxOJ0o"
}
