import React, {useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {ArrowLeft, ArrowRight, Bold, CalendarDays, Check, Copy, Download, ExternalLink, Globe, History, Italic, Link, List, LoaderCircle, RefreshCw} from 'lucide-react'
import './styles.css'

type Screen='form'|'loading'|'results'|'detail'|'history'
type CompanyLink={type:string;title:string;url:string}
type Lead={id:string;name:string;location:string;size:string;website:string;logoUrl?:string;description?:string;socials?:CompanyLink[];companyLinks?:CompanyLink[];type:'funded'|'hiring'|'trending';score:number;signal:string;bullets:string[];whyNow:string[];news:{title:string;source:string;date:string;url?:string}[];roles:{title:string;meta:string}[];trendDelta:string;trendLabel:string;spark:number[];outreach:string;url?:string}
type Result={title:string;link:string;date?:string;iso_date?:string;source?:{name?:string}}
type QualificationEvidence={title?:string;source_name?:string;source_url?:string;published_at?:string}
type QualifiedLead={company?:string;website?:string;industry?:string;location?:string;signal_type?:string;fit_score?:number;urgency_score?:number;overall_score?:number;confidence?:string;headline?:string;why_now?:string[];service_match?:string;outreach?:string;evidence?:QualificationEvidence[]}
type ResearchRun={id:number;created_at:string;completed_at?:string;offer:string;industry:string;location?:string;query?:string;status:string;result_count?:number;stages?:unknown;requested_signals?:unknown;error?:string}
type SavedResult={id:number;position?:number;title?:string;link?:string;source_name?:string;published_at?:string|number;raw?:unknown}
const API=(import.meta.env.VITE_XANO_API_BASE||'').replace(/\/$/,'')
const badges={funded:['Just Funded','#dcfce7','#15803d'],hiring:['Hiring Surge','#ffedd5','#c2410c'],trending:['Trending','#dbeafe','#1d4ed8']} as const
const demo:Lead[]=[
 {id:'techcorp',name:'TechCorp',location:'San Francisco, CA',size:'42 employees',website:'techcorp.io',type:'funded',score:94,signal:'Raised $4M Series A - 3 weeks ago',bullets:['Hiring 3 backend engineers with Python/FastAPI in the job description','CTO said the round funds a rebuild of the payments core','No in-house payments experience listed on the team page'],whyNow:['$4M Series A closed in August with engineering named as the priority.','Three Python backend roles opened within 9 days of the round.','Job posts name FastAPI, Postgres and Stripe Connect.','Only 4 backend engineers against a Q4 migration deadline.'],news:[{title:'TechCorp raises $4M Series A to rebuild its payments core',source:'TechCrunch',date:'12 Aug 2026'},{title:'TechCorp names former Brex engineer as VP Engineering',source:'Business Insider',date:'26 Aug 2026'}],roles:[{title:'Senior Backend Engineer (Python)',meta:'posted 9 days ago'},{title:'Backend Engineer, Payments',meta:'posted 6 days ago'},{title:'Platform Engineer (FastAPI)',meta:'posted 2 days ago'}],trendDelta:'+118%',trendLabel:'"techcorp payments" search interest, 90 days',spark:[22,26,24,31,29,38,44,41,55,62,78,96],outreach:'Hi Maria,\n\nCongrats on the $4M Series A. I saw the note about rebuilding the payments core before Q4.\n\nWe are a 5-person Python agency focused on FastAPI, Postgres and Stripe Connect. We can start quickly and hand the system over as your team grows.\n\nWorth 20 minutes this week to compare notes?\n\n- Alex'},
 {id:'finstack',name:'FinStack',location:'New York, NY',size:'88 employees',website:'finstack.com',type:'hiring',score:89,signal:'7 open backend roles posted this week',bullets:['Backend headcount plan jumped from 2 to 7 roles in 6 days','All postings require Python and event-driven architecture','The same roles have been reposted twice since June'],whyNow:['Seven backend roles appeared in one week.','Four roles have been reposted since June.','Every posting lists Kafka and Python.','The new CTO committed to a January ledger rewrite.'],news:[{title:'FinStack hires Datadog veteran as CTO',source:'Fintech Futures',date:'14 Jul 2026'},{title:'FinStack opens second engineering hub',source:'Reuters',date:'21 Aug 2026'}],roles:[{title:'Staff Backend Engineer (Python)',meta:'posted 8 days ago'},{title:'Backend Engineer, Ledger',meta:'reposted 3rd time'}],trendDelta:'+64%',trendLabel:'FinStack careers traffic, 60 days',spark:[30,28,33,35,40,38,47,52,58,66,71,84],outreach:'Hi Daniel,\n\nSeven backend roles in one week caught my eye, especially the ledger role reposted since June.\n\nWe are a 5-person Python team specialising in Kafka, Python and Postgres. We plug in as a pod while your recruiters keep working the funnel.\n\nFree for a call Thursday?\n\n- Alex'},
 {id:'payflow',name:'PayFlow',location:'Austin, TX',size:'130 employees',website:'payflow.co',type:'funded',score:86,signal:'Raised $12M Series B - 5 weeks ago',bullets:['Plans to double engineering in 2 quarters','Migrating from Rails to Python services','Two backend leads left last quarter'],whyNow:['The Series B names platform re-architecture as a use of funds.','A Rails-to-Python plan was published without an owner.','The team has an institutional knowledge gap.'],news:[{title:'PayFlow lands $12M Series B',source:'Axios Pro Rata',date:'29 Jul 2026'}],roles:[{title:'Backend Engineer, Payouts',meta:'posted 11 days ago'},{title:'Python Services Engineer',meta:'posted 4 days ago'}],trendDelta:'+41%',trendLabel:'"payflow api" search volume, 90 days',spark:[40,38,42,45,44,49,53,51,60,64,69,76],outreach:'Hi Priya,\n\nCongrats on the $12M. I read the Rails-to-Python migration post too.\n\nWe have completed this kind of migration twice without putting the revenue path at risk. Happy to share the checklist we use.\n\n- Alex'},
 {id:'databridge',name:'DataBridge',location:'Remote (EU)',size:'24 employees',website:'databridge.dev',type:'trending',score:81,signal:'+340% search interest - new product launch',bullets:['Public API launched on 20 Aug','Python SDK is still marked coming soon','Integration questions are growing'],whyNow:['Search interest is up 340% since launch.','Python is the most requested SDK.','There is no developer-experience owner.'],news:[{title:'DataBridge opens its unified data API',source:'The New Stack',date:'20 Aug 2026'}],roles:[{title:'Developer Experience Engineer',meta:'posted 3 days ago'}],trendDelta:'+340%',trendLabel:'"databridge api" search interest, 30 days',spark:[12,14,13,18,22,30,45,58,70,82,91,100],outreach:'Hi Tomas,\n\nThe API launch looks strong, and users are already asking for the Python SDK.\n\nWe build typed Python SDKs and reference integrations for API-first companies in 3 to 4 weeks. Want me to send a proposed client interface?\n\n- Alex'}
]
const messages=['Scanning Google News for funding announcements...','Checking hiring signals on Google Jobs...','Analyzing market trends...','Qualifying leads with AI...']
const signalActions='raises|raised|secures|secured|lands|landed|closes|closed|appoints|appointed|hires|hired|launches|launched|expands|expanded|acquires|acquired|unveils|unveiled|announces|announced'
function companyFrom(title:string):string|null{
 const escapedAction=`(?:${signalActions})`
 const prefixed=new RegExp(`^(?:Travel fintech|Fintech startup|Payments? startup|Banking startup|Insurtech startup|Healthtech startup|SaaS startup|AI startup)\\s+([A-Z][\\w&.'-]*(?:\\s+[A-Z][\\w&.'-]*){0,2})\\s+${escapedAction}\\b`)
 const direct=new RegExp(`^([A-Z][\\w&.'-]*(?:\\s+[A-Z][\\w&.'-]*){0,2})\\s+${escapedAction}\\b`)
 const built=title.match(/\b(?:Built|Building)\s+(?:Fintech\s+|Startup\s+)?([A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*)?)\s+(?:Into|To|As)\b/)
 const embedded=title.match(new RegExp(`\\b(?:Fintech|Payments?|Banking|Insurtech|Healthtech|SaaS|AI)\\s+Startup\\s+([A-Z][\\w&.'-]*(?:\\s+[A-Z][\\w&.'-]*){0,2})\\s+${escapedAction}\\b`))
 return title.match(prefixed)?.[1]||title.match(direct)?.[1]||built?.[1]||embedded?.[1]||null
}
function dateTimestamp(value?:string){
 if(!value)return 0
 const us=value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(\d{1,2}):(\d{2})\s*(AM|PM))?/i)
 if(us){
  let hour=Number(us[4]||0)
  if(us[6]?.toUpperCase()==='PM'&&hour<12)hour+=12
  if(us[6]?.toUpperCase()==='AM'&&hour===12)hour=0
  return Date.UTC(Number(us[3]),Number(us[1])-1,Number(us[2]),hour,Number(us[5]||0))
 }
 const parsed=Date.parse(value.replace(/,\s*([+-]\d{4})\s*UTC$/,' $1'))
 return Number.isFinite(parsed)?parsed:0
}
function displayDate(value?:string){
 const timestamp=dateTimestamp(value)
 return timestamp?new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(timestamp):'Date unavailable'
}
function websiteUrl(value?:string){
 if(!value||/not verified/i.test(value))return ''
 try{return new URL(/^https?:\/\//i.test(value)?value:`https://${value}`).href}catch{return ''}
}
function websiteHost(value?:string){
 const url=websiteUrl(value)
 if(!url)return ''
 try{return new URL(url).hostname.replace(/^www\./,'')}catch{return ''}
}
function normalizeOutreach(value:string){
 const text=value.trim().replace(/\r\n/g,'\n')
 if(!text||text.includes('\n\n'))return text
 // AI responses sometimes arrive as one JSON string/paragraph. Restore the
 // email structure without changing the wording supplied by the model.
 return text
  .replace(/^(Hi|Hello|Hey)([^.!?\n]{0,80}[,:])\s+/i,'$1$2\n\n')
  .replace(/\s+(?=(?:Would|Could|Can|Are you|Open to|Worth|Should)\b[^?]{0,180}\?)/i,'\n\n')
  .replace(/\s+(-\s*[A-Z][\w .'-]{1,40})$/,'\n\n$1')
}
function CompanyLogo({lead,size='normal'}:{lead:Lead;size?:'normal'|'large'}){
 const host=websiteHost(lead.website)
 const [failed,setFailed]=useState(false)
 const logo=lead.logoUrl||(host?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`:'')
 const initials=lead.name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()
 return <div className={`companyLogo ${size}`}>{logo&&!failed?<img src={logo} alt={`${lead.name} logo`} onError={()=>setFailed(true)}/>:<span>{initials||'?'}</span>}</div>
}
function LinkFavicon({item}:{item:CompanyLink}){
 const [failed,setFailed]=useState(false)
 let host=''
 try{host=new URL(item.url).hostname}catch{/* Invalid links keep the text fallback. */}
 const favicon=host?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`:''
 return <span className="linkFavicon" aria-hidden="true">{favicon&&!failed?<img src={favicon} alt="" onError={()=>setFailed(true)}/>:item.type.slice(0,1).toUpperCase()}</span>
}
function leadDate(lead:Lead){return lead.news[0]?.date||'Date unavailable'}
function htmlEscape(value:unknown){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!))}
function reportHtml(leads:Lead[],offer:string,title='LeadAgent Intelligence Report'){
 const cards=leads.map(lead=>`<section><header><div><h2>${htmlEscape(lead.name)}</h2><p>${htmlEscape([lead.location,lead.size].filter(Boolean).join(' · '))}</p></div><strong>${lead.score}/100</strong></header><h3>${htmlEscape(lead.signal)}</h3><h4>Why now</h4><ul>${lead.whyNow.map(item=>`<li>${htmlEscape(item)}</li>`).join('')}</ul><h4>Evidence</h4>${lead.news.map(item=>`<p class="source"><b>${htmlEscape(item.title)}</b><br>${htmlEscape(item.source)} · ${htmlEscape(item.date)}${item.url?`<br><a href="${htmlEscape(item.url)}">${htmlEscape(item.url)}</a>`:''}</p>`).join('')}<h4>Suggested outreach</h4><div class="outreach-copy">${htmlEscape(lead.outreach).replace(/\n/g,'<br>')}</div></section>`).join('')
 return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:18mm}*{box-sizing:border-box}body{font:13px/1.55 Arial,sans-serif;color:#172033;margin:0}main>header{margin-bottom:24px;border-bottom:3px solid #4f46e5;padding-bottom:16px}h1{font-size:28px;margin:0 0 5px;color:#312e81}h2{font-size:21px;margin:0}h3{font-size:14px;color:#4338ca;background:#eef2ff;padding:10px 12px;border-radius:7px}h4{font-size:12px;text-transform:uppercase;letter-spacing:.7px;margin:18px 0 7px;color:#64748b}p{margin:3px 0;color:#64748b}section{page-break-inside:avoid;border-bottom:1px solid #dbe1ea;padding:0 0 24px;margin:0 0 25px}section header{display:flex;justify-content:space-between;gap:20px}section header strong{font-size:17px;color:#4f46e5}li{margin:4px 0}.source,.outreach-copy{border-left:3px solid #c7d2fe;padding:8px 11px;margin:8px 0;background:#f8fafc;overflow-wrap:anywhere}.outreach-copy{color:#334155}a{color:#4338ca}</style></head><body><main><header><h1>${htmlEscape(title)}</h1><p>${htmlEscape(offer)}</p><p>${leads.length===1?'1 qualified opportunity':`${leads.length} qualified opportunities`} · ${htmlEscape(new Date().toLocaleDateString())}</p></header>${cards}</main></body></html>`
}
const offerStopWords=new Set(['agency','company','companies','consulting','consultant','consultants','development','developer','developers','dev','team','teams','people','person','specialist','specialists','service','services','studio','business','focused','focus','expert','experts','expertise','help','helps','helping','build','building','provide','provides','provider','providers','solutions','solution','with','and','the','for','from','that','this','our','your'])
function offerTerms(value:string,industry:string){
 const industryWords=new Set(industry.toLowerCase().match(/[a-z0-9+#.-]+/g)||[])
 return (value.match(/[a-zA-Z][a-zA-Z0-9+#.-]{1,}/g)||[]).filter((term,index,all)=>{
  const normalized=term.toLowerCase()
  return !offerStopWords.has(normalized)&&!industryWords.has(normalized)&&all.findIndex(x=>x.toLowerCase()===normalized)===index
 }).slice(0,4)
}
function offerSearchTerms(value:string,industry:string){return offerTerms(value,industry).join(' OR ')||industry}
function signalType(title:string):Lead['type']{
 if(/hir(?:e|es|ed|ing)|appoint|workforce|jobs?|headcount|cto|engineer/i.test(title))return 'hiring'
 if(/rais|fund|series|seed|valuation|investment|secures|lands|closes/i.test(title))return 'funded'
 return 'trending'
}
function fromResults(results:Result[],offer:string,industry:string):Lead[]{
 const terms=offerTerms(offer,industry).map(x=>x.toLowerCase())
 const companies=new Map<string,Lead>()
 for(const [index,r] of [...results].sort((a,b)=>dateTimestamp(b.iso_date||b.date)-dateTimestamp(a.iso_date||a.date)).entries()){
  const name=companyFrom(r.title)
  if(!name)continue
  const key=name.toLowerCase()
  const source=r.source?.name||'Google News'
  const news={title:r.title,source,date:displayDate(r.iso_date||r.date),url:r.link}
  const existing=companies.get(key)
  if(existing){existing.news.push(news);existing.bullets.push(`Additional signal: ${r.title}`);continue}
  const matches=terms.filter(term=>r.title.toLowerCase().includes(term)).length
  const type=signalType(r.title)
  companies.set(key,{id:`live-${index}`,name,location:'Company details not verified',size:'',website:'Not verified',type,score:Math.min(96,72+matches*6+(type==='funded'?6:3)),signal:r.title,bullets:[`Evidence: ${r.title}`,`Source: ${source}`,matches?`Matches your offer on ${matches} capability${matches===1?'':'ies'}`:'Matches the offer-filtered search'],whyNow:[r.title,`Published by ${source}.`,'Company identity and contact details still need verification before outreach.'],news:[news],roles:[],trendDelta:'—',trendLabel:'No verified trend data',spark:[],outreach:`Hi ${name} team,\n\nI saw the recent news: ${r.title}\n\n${offer}. If this is relevant to your current priorities, would a short conversation be useful?\n\n- Alex`,url:r.link})
 }
 return [...companies.values()].sort((a,b)=>dateTimestamp(leadDate(b))-dateTimestamp(leadDate(a))||b.score-a.score)
}
function qualificationPayload(value:unknown):{leads?:QualifiedLead[]}|null{
 if(typeof value==='string'){
  const clean=value.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')
  try{return qualificationPayload(JSON.parse(clean))}catch{return null}
 }
 if(Array.isArray(value)){
  for(const item of value){const nested=qualificationPayload(item);if(nested)return nested}
  return null
 }
 if(!value||typeof value!=='object')return null
 const record=value as Record<string,unknown>
 if(Array.isArray(record.leads))return record as {leads:QualifiedLead[]}
 for(const key of ['output','response','message','content','result','text','data']){
  const nested=qualificationPayload(record[key])
  if(nested)return nested
 }
 return null
}
function fromQualification(value:unknown):Lead[]{
 const qualified=qualificationPayload(value)?.leads
 if(!qualified)return []
 return qualified.filter(item=>item&&typeof item.company==='string'&&item.company.trim()&&Array.isArray(item.evidence)&&item.evidence.length>0).map((item,index)=>{
  const evidence=item.evidence!.filter(e=>e?.title&&e?.source_url)
  const type:Lead['type']=item.signal_type==='funding'?'funded':item.signal_type==='hiring'?'hiring':'trending'
  const fit=Number(item.fit_score)||0,urgency=Number(item.urgency_score)||0
  const fallbackScore=Math.round((fit+urgency)/2)
  const rawScore=Number(item.overall_score??fallbackScore)
  // Some models occasionally interpret an unlabeled score as 0-10. Normalize it.
  const score=Math.max(0,Math.min(100,rawScore>0&&rawScore<=10?rawScore*10:rawScore))
  const whyNow=Array.isArray(item.why_now)?item.why_now.filter(Boolean):[]
  return {id:`ai-${index}-${item.company!.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,name:item.company!.trim(),location:item.location?.trim()||'Location not verified',size:'',website:item.website?.trim()||'Not verified',type,score,signal:item.headline?.trim()||whyNow[0]||'Relevant recent market signal',bullets:[...whyNow.slice(0,2),item.service_match?.trim()].filter((x):x is string=>Boolean(x)),whyNow,news:evidence.map(e=>({title:e.title!,source:e.source_name||'Google News',date:displayDate(e.published_at),url:e.source_url})),roles:[],trendDelta:'—',trendLabel:'No verified trend data',spark:[],outreach:item.outreach?.trim()||'',url:evidence[0]?.source_url}
 }).filter(lead=>lead.news.length>0).sort((a,b)=>b.score-a.score)
}
type SearchProfile={name?:string;link?:string}
type OrganicResult={title?:string;link?:string;snippet?:string}
type EnrichmentResponse={knowledge_graph?:Record<string,unknown>;organic_results?:OrganicResult[]}
function linkType(title:string,url:string){
 const value=`${title} ${url}`.toLowerCase()
 if(value.includes('linkedin.com'))return 'linkedin'
 if(value.includes('twitter.com')||value.includes('x.com'))return 'twitter'
 if(value.includes('facebook.com'))return 'facebook'
 if(value.includes('instagram.com'))return 'instagram'
 if(value.includes('youtube.com'))return 'youtube'
 if(value.includes('crunchbase.com'))return 'crunchbase'
 if(/career|jobs/.test(value))return 'careers'
 if(/contact/.test(value))return 'contact'
 return 'resource'
}
function uniqueLinks(items:CompanyLink[]){
 const seen=new Set<string>()
 return items.filter(item=>{if(!item.url||seen.has(item.url))return false;seen.add(item.url);return true})
}
function mergeEnrichment(lead:Lead,data:EnrichmentResponse):Lead{
 const kg=data.knowledge_graph||{}
 const profiles=Array.isArray(kg.profiles)?kg.profiles as SearchProfile[]:[]
 const organic=Array.isArray(data.organic_results)?data.organic_results:[]
 const excludedHosts=/linkedin\.com|twitter\.com|x\.com|facebook\.com|instagram\.com|youtube\.com|crunchbase\.com/i
 const companyKey=lead.name.toLowerCase().replace(/[^a-z0-9]/g,'')
 const relevant=organic.filter(x=>`${x.title||''} ${x.link||''}`.toLowerCase().replace(/[^a-z0-9]/g,'').includes(companyKey))
 const officialResult=relevant.find(x=>{try{
  if(!x.link||excludedHosts.test(new URL(x.link).hostname))return false
  const hostKey=new URL(x.link).hostname.replace(/^www\./,'').split('.')[0].replace(/[^a-z0-9]/g,'')
  return hostKey===companyKey||hostKey.includes(companyKey)||companyKey.includes(hostKey)
 }catch{return false}})||relevant.find(x=>{try{return Boolean(x.link)&&!excludedHosts.test(new URL(x.link!).hostname)}catch{return false}})
 let inferredWebsite=''
 try{if(officialResult?.link)inferredWebsite=new URL(officialResult.link).origin}catch{/* Ignore malformed search URLs. */}
 const website=typeof kg.website==='string'?kg.website:websiteUrl(lead.website)||inferredWebsite||lead.website
 const image=typeof kg.image==='string'?kg.image:typeof kg.logo==='string'?kg.logo:undefined
 const headerImages=Array.isArray(kg.header_images)?kg.header_images as Array<{source?:string;image?:string}>:[]
 const description=typeof kg.description==='string'?kg.description:typeof kg.snippet==='string'?kg.snippet:officialResult?.snippet
 const profileLinks=profiles.filter(x=>x.link).map(x=>({type:linkType(x.name||'',x.link!),title:x.name||'Social profile',url:x.link!}))
 const useful=relevant.filter(x=>x.link&&(x===officialResult||/linkedin|crunchbase|career|jobs|contact|about|twitter|facebook|instagram|youtube/i.test(`${x.title} ${x.link}`))).slice(0,8).map(x=>({type:x===officialResult?'website':linkType(x.title||'',x.link!),title:x===officialResult?'Official website':x.title||'Company resource',url:x===officialResult?inferredWebsite||x.link!:x.link!}))
 const links=uniqueLinks([...profileLinks,...useful])
 return {...lead,website:website||lead.website,logoUrl:image||headerImages[0]?.source||headerImages[0]?.image,description:description||lead.description,socials:links.filter(x=>['linkedin','twitter','facebook','instagram','youtube'].includes(x.type)),companyLinks:links.filter(x=>!['linkedin','twitter','facebook','instagram','youtube'].includes(x.type))}
}
async function enrichLead(lead:Lead):Promise<Lead>{
 if(!API)return lead
 try{
  const response=await fetch(`${API}/companies/enrich`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({company:lead.name,location:lead.location,website:lead.website})})
  if(!response.ok)return lead
  return mergeEnrichment(lead,await response.json())
 }catch{return lead}
}
function App(){
 const [screen,setScreen]=useState<Screen>(location.hash==='#history'?'history':'form'),[offer,setOffer]=useState('Python dev agency, 5 people, fintech backend specialists'),[market,setMarket]=useState('B2B SaaS startups, Series A-B, USA'),[industry,setIndustry]=useState('Fintech'),[size,setSize]=useState('11-50'),[leads,setLeads]=useState(demo),[selected,setSelected]=useState(0),[msg,setMsg]=useState(0),[outreach,setOutreach]=useState(''),[contact,setContact]=useState(''),[role,setRole]=useState(''),[channel,setChannel]=useState('Email'),[subject,setSubject]=useState(''),[copied,setCopied]=useState(false),[error,setError]=useState(''),[enriching,setEnriching]=useState(false),[regenerating,setRegenerating]=useState(false),[regeneration,setRegeneration]=useState(0),[pdfLoading,setPdfLoading]=useState(false),[pdfError,setPdfError]=useState('')
 const lead=leads[selected]||demo[0],badge=badges[lead.type]
 useEffect(()=>{if(screen!=='loading')return;const timer=setInterval(()=>setMsg(v=>Math.min(3,v+1)),900);return()=>clearInterval(timer)},[screen])
 async function search(){setError('');setMsg(0);setScreen('loading');try{let next=demo;if(API){const res=await fetch(`${API}/research`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offer,offer_query:offerSearchTerms(offer,industry),industry,location:market,stages:[size],signals:['funding','hiring','launch']})});if(!res.ok)throw new Error(`Research failed (${res.status})`);const data=await res.json();next=fromQualification(data.qualification);if(!next.length)next=fromResults(data.results||[],offer,industry)}setLeads(next);setScreen('results')}catch(e){setError(e instanceof Error?e.message:'Research failed');setScreen('form')}}
 async function open(i:number){const initial=leads[i];setSelected(i);prepareOutreach(initial);setScreen('detail');if(websiteUrl(initial.website)&&initial.description)return;setEnriching(true);const enriched=await enrichLead(initial);setLeads(current=>current.map((item,index)=>index===i?enriched:item));setEnriching(false)}
 function prepareOutreach(next:Lead){
  // Qualification returns only ranking/evidence. Draft the initial message on
  // demand when the card is opened instead of spending model time on every lead.
  const evidence=next.whyNow[0]||next.signal
  const draft=next.outreach||`Hi ${next.name} team,\n\nI noticed ${evidence.charAt(0).toLowerCase()+evidence.slice(1)}\n\n${offer}. We may be able to help with the next milestone without slowing down your team.\n\nWould a 15-minute conversation be useful?\n\n- Alex`
  setOutreach(normalizeOutreach(draft));setContact('');setRole('');setChannel('Email');setSubject(`${next.name} — ${next.type==='funded'?'congrats on the recent round':'a quick idea'}`);setRegeneration(0);setRegenerating(false)
 }
 async function openHistoryResult(next:Lead){setLeads([next]);setSelected(0);prepareOutreach(next);location.hash='';setScreen('detail');const enriched=await enrichLead(next);setLeads([enriched]);prepareOutreach(enriched)}
 async function copy(){const prefix=channel==='Email'&&subject?`Subject: ${subject}\n\n`:'';await navigator.clipboard?.writeText(prefix+outreach);setCopied(true);setTimeout(()=>setCopied(false),1600)}
 async function downloadPdf(scope:Lead[]=leads,filename='leadagent-report.pdf',title='LeadAgent Intelligence Report'){
  if(pdfLoading)return
  setPdfLoading(true);setPdfError('')
  try{
   if(!API)throw new Error('VITE_XANO_API_BASE is not configured')
   const response=await fetch(`${API}/pdf/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({html:reportHtml(scope,offer,title),filename})})
   const data=await response.json().catch(()=>null) as {filename?:string;mime?:string;content_base64?:string;message?:string}|null
   if(!response.ok||!data?.content_base64)throw new Error(data?.message||`PDF generation failed (${response.status})`)
   const binary=atob(data.content_base64),bytes=new Uint8Array(binary.length)
   for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index)
   const url=URL.createObjectURL(new Blob([bytes],{type:data.mime||'application/pdf'})),anchor=document.createElement('a')
   anchor.href=url;anchor.download=data.filename||filename;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
  }catch(e){setPdfError(e instanceof Error?e.message:'PDF generation failed')}
  finally{setPdfLoading(false)}
 }
 async function regenerate(){
  if(regenerating)return
  setRegenerating(true)
  await new Promise(resolve=>setTimeout(resolve,350))
  const next=regeneration+1
  const greeting=contact.trim()?contact.trim().split(/\s+/)[0]:`${lead.name} team`
  const audience=role.trim()?` for a ${role.trim()}`:''
  const evidence=lead.whyNow[next%Math.max(lead.whyNow.length,1)]||lead.signal
  const intros=[
   `I noticed ${lead.signal.charAt(0).toLowerCase()+lead.signal.slice(1)}.`,
   `${evidence} That looks like a timely priority${audience}.`,
   `The recent update from ${lead.name} caught my attention: ${lead.signal}.`
  ]
  const value=[
   `${offer}. We could take on a tightly scoped first milestone without slowing down your team.`,
   `Our focus is ${offer.toLowerCase()}. There may be a practical way to reduce delivery risk while the work is moving quickly.`,
   `We help teams with ${offer.toLowerCase()}. I can share a short, concrete plan based on this signal.`
  ]
  const ctas=['Would a 15-minute conversation be useful?','Open to comparing notes next week?','Should I send over a one-page approach?']
  const intro=intros[next%intros.length],pitch=value[(next+1)%value.length],cta=ctas[(next+2)%ctas.length]
  const draft=channel==='Cold call notes'
   ?`Call notes — ${lead.name}\n\n- Signal: ${lead.signal}\n- Context: ${evidence}\n- Relevance: ${pitch}\n- Ask: ${cta}`
   :channel==='LinkedIn'
    ?`Hi ${greeting} — ${intro} ${pitch} ${cta}\n\nAlex`
    :`Hi ${greeting},\n\n${intro}\n\n${pitch}\n\n${cta}\n\n- Alex`
  setOutreach(draft)
  if(channel==='Email')setSubject(`${lead.name} — ${['a quick idea','support for the next milestone','re: recent momentum'][next%3]}`)
  setRegeneration(next)
  setRegenerating(false)
 }
 function navigate(next:Screen){location.hash=next==='history'?'history':'';setScreen(next)}
 return <div className="app"><Header onHome={()=>navigate('form')} onHistory={()=>navigate('history')}/>{screen==='form'&&<main className="formPage"><div className="glow"/><section className="hero"><span className="engine"><i/> Real-time signal engine</span><h1>Find companies that need you<br/>before your competitors do</h1><p>LeadAgent reads funding rounds, job posts and search demand as they happen, then ranks the accounts most likely to buy this month.</p></section><section className="searchCard"><h2>Describe your search</h2><div className="fields"><Field label="Who are you?"><textarea rows={3} value={offer} onChange={e=>setOffer(e.target.value)} /></Field><Field label="Target market"><input value={market} onChange={e=>setMarket(e.target.value)}/></Field><div className="two"><Field label="Industry focus"><select value={industry} onChange={e=>setIndustry(e.target.value)}><option>Fintech</option><option>Healthcare</option><option>E-commerce</option><option>SaaS</option><option>Any</option></select></Field><Field label="Company size"><select value={size} onChange={e=>setSize(e.target.value)}><option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option><option>Any</option></select></Field></div>{error&&<p className="error">{error}</p>}<button className="primary" onClick={search}>Find Leads <ArrowRight/></button><small>Searches Google News, Jobs and Trends in real-time via SerpApi</small></div></section></main>}
 {screen==='history'&&<HistoryPage onOpenResult={openHistoryResult}/>}
 {screen==='loading'&&<main className="loading"><LoaderCircle/><div><p>{messages[msg]}</p><small>Querying live sources - this usually takes under a minute</small></div><span><i style={{width:`${(msg+1)*25}%`}}/></span></main>}
 {screen==='results'&&<main className="resultsPage"><div className="resultsHead"><div><h1>Found {leads.length} leads</h1><p>Ranked by AI fit and buying urgency</p>{pdfError&&<span className="pdfError" role="alert">{pdfError}</span>}</div><button className="secondary" onClick={()=>downloadPdf()} disabled={pdfLoading}>{pdfLoading?<LoaderCircle className="spin"/>:<Download/>} {pdfLoading?'Generating PDF…':'Download Report PDF'}</button></div>{!leads.length?<div className="empty">No source-backed opportunities matched this search.</div>:<div className="leadGrid">{leads.map((l,i)=>{const b=badges[l.type],site=websiteUrl(l.website);return <article className="leadCard" key={l.id}><header><div className="companySummary"><CompanyLogo lead={l}/><div><h2>{l.name}</h2><p>{l.location}{l.size&&` - ${l.size}`}</p>{site&&<a className="companyWebsite" href={site} target="_blank" rel="noreferrer"><Globe/> {websiteHost(l.website)} <ExternalLink/></a>}</div></div><span style={{background:b[1],color:b[2]}}>{b[0]}</span></header><strong className="signal">{l.signal}</strong><p className="signalDate"><CalendarDays/> {leadDate(l)}</p><ul>{l.bullets.map(x=><li key={x}>{x}</li>)}</ul><div className="sourceLinks">{l.news.slice(0,3).map((n,j)=><a key={`${n.title}-${j}`} href={n.url||l.url} target="_blank" rel="noreferrer"><span>{n.source}</span>{n.title}<ExternalLink/></a>)}</div><div className="score"><p><span>Match score</span><b>{l.score}</b></p><i><em style={{width:`${l.score}%`}}/></i></div><button className="secondary" onClick={()=>open(i)}>Open company card <ArrowRight/></button></article>})}</div>}</main>}
 {screen==='detail'&&<main className="detailPage"><button className="back" onClick={()=>setScreen('results')}><ArrowLeft/> All leads</button><div className="detailGrid"><section className="intel"><small className="kicker">Company Intelligence</small>{enriching&&<span className="enriching"><LoaderCircle className="spin"/> Enriching company profile…</span>}<div className="company"><CompanyLogo lead={lead} size="large"/><div><div className="companyTitle"><h1>{lead.name}</h1><span style={{background:badge[1],color:badge[2]}}>{badge[0]}</span></div><p className="muted">{[lead.location,lead.size].filter(Boolean).join(' - ')}</p>{websiteUrl(lead.website)?<a className="companyWebsite detailWebsite" href={websiteUrl(lead.website)} target="_blank" rel="noreferrer"><Globe/> {websiteHost(lead.website)} <ExternalLink/></a>:<p className="unverified">Company website not verified</p>}</div></div>{lead.description&&<p className="companyDescription">{lead.description}</p>}{((lead.socials?.length||0)+(lead.companyLinks?.length||0)>0)&&<Block title="Company links"><div className="companyLinks">{[...(lead.socials||[]),...(lead.companyLinks||[])].map(item=><a key={item.url} href={item.url} target="_blank" rel="noreferrer"><LinkFavicon item={item}/><span className="linkType">{item.type}</span><b>{item.title}</b><ExternalLink/></a>)}</div></Block>}<Block title="Why now"><ul>{lead.whyNow.map(x=><li key={x}>{x}</li>)}</ul></Block><Block title="Recent news & sources"><div className="news">{lead.news.map((n,i)=><article key={`${n.title}-${i}`}>{n.url||lead.url?<a href={n.url||lead.url} target="_blank" rel="noreferrer"><b>{n.title}</b><ExternalLink/></a>:<b>{n.title}</b>}<span>{n.source} - {n.date}</span></article>)}</div></Block><Block title="Hiring signals">{lead.roles.length?<div className="roles">{lead.roles.map(r=><p key={r.title}><b>{r.title}</b><span>{r.meta}</span></p>)}</div>:<p className="unverified">No verified hiring data for this company.</p>}</Block><Block title="Market trend">{lead.spark.length?<div className="trend"><div><b>{lead.trendDelta}</b><span>{lead.trendLabel}</span></div><div className="spark">{lead.spark.map((x,i)=><i key={i} style={{height:`${x}%`}}/>)}</div></div>:<p className="unverified">No verified market-trend data for this company.</p>}</Block></section><section className="outreach"><small className="kicker">Your Outreach</small><div className="outreachLabel"><b>AI-drafted first message</b><span>{badge[0]}</span></div><div className="composerFields"><Field label="Contact name"><input placeholder="e.g. Maria Chen" value={contact} onChange={e=>setContact(e.target.value)}/></Field><Field label="Role"><input placeholder="e.g. CTO" value={role} onChange={e=>setRole(e.target.value)}/></Field><Field label="Channel"><select value={channel} onChange={e=>setChannel(e.target.value)}><option>Email</option><option>LinkedIn</option><option>Cold call notes</option></select></Field><Field label="Subject"><input disabled={channel!=='Email'} value={subject} onChange={e=>setSubject(e.target.value)}/></Field></div><label className="messageField">Message<div className="formatBar" aria-label="Formatting toolbar"><button title="Bold" onClick={()=>wrapSelection('**')}><Bold/></button><button title="Italic" onClick={()=>wrapSelection('_')}><Italic/></button><button title="Bulleted list" onClick={()=>prefixLines('- ')}><List/></button><button title="Link" onClick={()=>wrapSelection('[','](https://)')}><Link/></button><span>Markdown supported</span></div><textarea id="outreach-message" rows={12} value={outreach} onChange={e=>setOutreach(e.target.value)}/></label><div className="composerActions"><button type="button" className="link" onClick={regenerate} disabled={regenerating} aria-busy={regenerating}>{regenerating?<><LoaderCircle className="spin"/> Regenerating…</>:<><RefreshCw/> Regenerate</>}</button><span aria-live="polite">{outreach.length} characters</span></div><button className="primary" onClick={copy}>{copied?<><Check/> Copied to clipboard</>:<><Copy/> Copy {channel==='Email'?'email':'message'}</>}</button><hr/><button className="secondary" onClick={()=>downloadPdf([{...lead,outreach}],`leadagent-${lead.id}.pdf`,'Company Intelligence Brief')} disabled={pdfLoading}>{pdfLoading?<LoaderCircle className="spin"/>:<Download/>} {pdfLoading?'Generating PDF…':'Download Company Brief'}</button>{pdfError&&<p className="pdfError" role="alert">{pdfError}</p>}<p className="fine">PDF includes this company’s intelligence, evidence and outreach draft</p></section></div></main>}</div>

 function wrapSelection(before:string,after=before){const el=document.getElementById('outreach-message') as HTMLTextAreaElement|null;if(!el)return;const start=el.selectionStart,end=el.selectionEnd;setOutreach(outreach.slice(0,start)+before+outreach.slice(start,end)+after+outreach.slice(end));requestAnimationFrame(()=>{el.focus();el.setSelectionRange(start+before.length,end+before.length)})}
 function prefixLines(prefix:string){const el=document.getElementById('outreach-message') as HTMLTextAreaElement|null;if(!el)return;const start=outreach.lastIndexOf('\n',el.selectionStart-1)+1,endIndex=outreach.indexOf('\n',el.selectionEnd),end=endIndex<0?outreach.length:endIndex;const changed=outreach.slice(start,end).split('\n').map(line=>prefix+line).join('\n');setOutreach(outreach.slice(0,start)+changed+outreach.slice(end))}
}
function Header({onHome,onHistory}:{onHome:()=>void;onHistory:()=>void}){return <header className="top"><button className="brand brandButton" onClick={onHome}><span>L</span>LeadAgent</button><nav><button onClick={onHistory}><History/> Request history</button></nav></header>}
function HistoryPage({onOpenResult}:{onOpenResult:(lead:Lead)=>void}){
 const [runs,setRuns]=useState<ResearchRun[]>([]),[active,setActive]=useState<ResearchRun|null>(null),[answers,setAnswers]=useState<SavedResult[]>([]),[loading,setLoading]=useState(true),[detailLoading,setDetailLoading]=useState(false),[error,setError]=useState('')
 useEffect(()=>{(async()=>{try{if(!API)throw new Error('VITE_XANO_API_BASE is not configured');const res=await fetch(`${API}/research`);if(!res.ok)throw new Error(`History failed (${res.status})`);const data=await res.json();setRuns(data.items||data||[])}catch(e){setError(e instanceof Error?e.message:'Could not load history')}finally{setLoading(false)}})()},[])
 const timestamp=(value?:string|number)=>{if(value===undefined)return 0;const parsed=typeof value==='number'?value:Date.parse(value);return Number.isFinite(parsed)?parsed:0}
 async function openRun(run:ResearchRun){setActive(run);setAnswers([]);setDetailLoading(true);setError('');try{const res=await fetch(`${API}/research/${run.id}/results`);if(!res.ok)throw new Error(`Answers failed (${res.status})`);const data=await res.json();const items:SavedResult[]=data.items||data||[];setAnswers([...items].sort((a,b)=>timestamp(b.published_at)-timestamp(a.published_at)))}catch(e){setError(e instanceof Error?e.message:'Could not load answers')}finally{setDetailLoading(false)}}
 const date=(value?:string)=>value?new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—'
 const publishedDate=(value?:string|number)=>value?new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(value)):'Date unavailable'
 function compose(item:SavedResult){const title=item.title||'Recent company signal',name=companyFrom(title)||item.source_name||'Prospect';onOpenResult({id:`history-${item.id}`,name,location:active?.location||'Location not verified',size:'',website:'Not verified',type:signalType(title),score:75,signal:title,bullets:[`Evidence: ${title}`,`Source: ${item.source_name||'Google News'}`],whyNow:[title,'This signal was saved in your request history.'],news:[{title,source:item.source_name||'Google News',date:publishedDate(item.published_at),url:item.link}],roles:[],trendDelta:'—',trendLabel:'No verified trend data',spark:[],url:item.link,outreach:`Hi ${name} team,\n\nI came across the recent news: ${title}\n\n${active?.offer||'We may be able to help with your current priorities'}. Would a short conversation be useful?\n\n- Alex`})}
 return <main className="historyPage"><div className="historyHead"><div><small className="kicker">Xano request log</small><h1>Request history</h1><p>Inputs sent from the frontend and the saved SerpApi response for every run.</p></div><button className="secondary" onClick={()=>location.reload()}><RefreshCw/> Refresh</button></div>{error&&<p className="error historyError">{error}</p>}{loading?<div className="empty"><LoaderCircle className="spin"/> Loading requests…</div>:!runs.length?<div className="empty">No requests yet.</div>:<div className="historyGrid"><section className="runList">{runs.map(run=><button key={run.id} className={active?.id===run.id?'run active':'run'} onClick={()=>openRun(run)}><span><b>#{run.id} · {run.industry}</b><em className={`status ${run.status}`}>{run.status}</em></span><small>{date(run.created_at)}</small><p>{run.offer}</p><footer>{run.result_count||0} answers <ArrowRight/></footer></button>)}</section><section className="responsePanel">{!active?<div className="empty">Select a request to see its input and response.</div>:<><div className="responseTitle"><div><small className="kicker">Request #{active.id}</small><h2>{active.industry} · {active.location||'Any location'}</h2></div><span className={`status ${active.status}`}>{active.status}</span></div><dl className="requestMeta"><div><dt>Offer</dt><dd>{active.offer}</dd></div><div><dt>Search query</dt><dd><code>{active.query||'—'}</code></dd></div><div><dt>Started</dt><dd>{date(active.created_at)}</dd></div><div><dt>Completed</dt><dd>{date(active.completed_at)}</dd></div></dl><h3>Response · {answers.length} items</h3>{detailLoading?<div className="empty"><LoaderCircle className="spin"/> Loading response…</div>:<div className="answerList">{answers.map(item=><article key={item.id}><span>{item.position||'—'}</span><div><a href={item.link} target="_blank" rel="noreferrer">{item.title||'Untitled result'}</a><p>{item.source_name||'Unknown source'} · {publishedDate(item.published_at)}</p></div><button className="composeButton" onClick={()=>compose(item)}>Create outreach <ArrowRight/></button></article>)}</div>}<details><summary>Raw saved response</summary><pre>{JSON.stringify(answers.map(x=>x.raw||x),null,2)}</pre></details></>}</section></div>}</main>
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label>{label}{children}</label>}
function Block({title,children}:{title:string;children:React.ReactNode}){return <div className="block"><h3>{title}</h3>{children}</div>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
