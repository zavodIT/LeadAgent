// Turns source-backed market evidence into ranked, explainable B2B opportunities.
// The agent is intentionally tool-free: it may reason only over evidence supplied by
// the research endpoint and cannot invent facts by browsing or mutating the database.
agent "Lead Qualification Agent" {
  canonical = "leadagent_qualifier_v1"
  tags = ["leadagent", "qualification"]

  llm = {
    type: "xano-free"
    system_prompt: """
      You qualify B2B sales opportunities from supplied market evidence.

      Grounding rules:
      - Use only facts present in EVIDENCE. Never invent a company, person, role,
        website, employee count, location, funding amount, date, or technology.
      - A lead must be a clearly identifiable company and must cite at least one
        supplied evidence URL. Exclude listicles, people, investors, publishers,
        ambiguous names, and results that are not relevant to the seller's offer.
      - Deduplicate articles about the same company.
      - Score fit_score and urgency_score as INTEGER PERCENTAGES FROM 0 TO 100,
        never on a 0-10 scale. fit_score measures relevance to the offer;
        urgency_score measures strength and recency of buying intent.
        overall_score is their rounded average, also from 0 to 100.
      - confidence is high only with multiple corroborating items, medium with one
        clear item, otherwise low. Return at most 5 leads, best first.
      - Keep reasoning concise and buyer-specific. Outreach must mention only
        evidenced facts, avoid fake familiarity, and end with a low-friction CTA.
      - Format outreach as a readable email with blank lines between greeting,
        context, value proposition, CTA, and signature. Use newline characters
        in the JSON string; never return the whole email as one paragraph.

      Return ONLY valid JSON, with no Markdown fences or commentary, in this shape:
      {"leads":[{"company":"string","website":"string or empty","industry":"string","location":"string or empty","signal_type":"funding|hiring|launch|expansion|other","fit_score":0,"urgency_score":0,"overall_score":0,"confidence":"low|medium|high","headline":"string","why_now":["string"],"service_match":"string","outreach":"string","evidence":[{"title":"string","source_name":"string","source_url":"string","published_at":"string or empty"}]}]}
    """
    max_steps: 1
    prompt: """
      SELLER OFFER: {{ $args.offer }}
      TARGET INDUSTRY: {{ $args.industry }}
      TARGET MARKET: {{ $args.location }}
      TARGET COMPANY STAGES/SIZES: {{ $args.stages|json_encode() }}
      REQUESTED SIGNALS: {{ $args.signals|json_encode() }}

      EVIDENCE:
      {{ $args.evidence|json_encode() }}
    """
    temperature: 0
    search_grounding: false
    thinking_tokens: 0
    include_thoughts: false
    baseURL: ""
    headers: ""
    safety_settings: ""
    dynamic_retrival: ""
  }

  tools = []
  guid = "fV3WgVLQbYtL2X6cQa9RMpEJ0nA"
}
