// Generates a send-ready first-touch message from qualified lead evidence.
query "outreach/generate" verb=POST {
  api_group = "LeadAgent"
  input {
    text company filters=trim|min:1
    // Only a short, non-personal service profile is accepted here. The raw CV
    // remains in research context and must never reach the outreach writer.
    text offer filters=trim|min:10|max:500
    text signal filters=trim|min:1
    json evidence?
    text contact? filters=trim
    text role? filters=trim
    enum channel { values = ["Email", "LinkedIn", "Cold call notes"] }
    int variation?=0
  }
  stack {
    ai.agent.run "Outreach Message Agent" {
      args = {
        company  : $input.company
        offer    : $input.offer
        signal   : $input.signal
        evidence : $input.evidence
        contact  : $input.contact
        role     : $input.role
        channel  : $input.channel
        variation: $input.variation
      }
      allow_tool_execution = false
    } as $draft
  }
  response = $draft
  guid = "rT5nC8xQ1uL4dS7gJ2kP9vA6eZ0"
}
