# Experience-as-an-Asset / Experience Graph: competitive landscape

Research date: 2026-10-05. Labels: FACT (with URL), INFERENCE, HYPOTHESIS, Unknown.
Method note: about 20 searches and fetches. Many pricing and review numbers come from aggregator or review blogs, not primary pricing pages. Treat them as approximate. Delphi's funding numbers conflict between sources (see Q3).

---

## Q1. AI career / job-search tools: who they are, how they position, pricing, traction, weaknesses

### Takeaway
The career-tool market is crowded and mature, but almost everyone works at the **job-application layer** (resume rewriting, ATS keywords, trackers, interview copilots). Nobody we found treats a person's accumulated experience as an asset to inventory and value, with what-it-is-worth or what-else-could-it-become outputs. The closest are small, new "pivot" tools with weak monetization (Job Pivotry: about 20k users, $247 all-time revenue) and LinkedIn's Premium AI coach, which sits behind a $30/month paywall and points users to LinkedIn Learning and LinkedIn jobs.

### Competitor table

| Name | Positioning | Audience | Pricing | Acquisition | Traction | Strengths | Weaknesses / complaints | Missing for "experience as asset" |
|---|---|---|---|---|---|---|---|---|
| **Teal** | Job-search organizer plus AI resume builder | Active US job seekers | Free tier; Teal+ $9/wk, $29/mo, $79/3mo — FACT [resumegenius summary via search](https://resumegenius.com/reviews/teal-resume-builder-reviews) | SEO, Chrome extension, content | Trustpilot about 4.3 on about 93 reviews (another source says 3.9 on 60) — FACT, conflicting [Trustpilot](https://www.trustpilot.com/review/tealhq.com?page=4) | Tracker and Chrome extension praised; generous free tier | Generic AI bullets, basic templates, weekly price seen as steep — FACT [resumegenius](https://resumegenius.com/reviews/teal-resume-builder-reviews) | No skill inventory beyond keywords, no AI exposure, no non-job outcomes |
| **Careerflow** | All-in-one job search copilot (LinkedIn optimizer, tracker) | Job seekers, students | Free; Pro $12/mo annual or $19/mo; Premium $25/mo annual — FACT (aggregator) [scoutify](https://scoutify.com/blog/careerflow-review) | SEO, LinkedIn content, Chrome extension | Unknown | Has a LinkedIn profile optimizer | Unknown in this pass | Optimizes the profile *for recruiters*, does not mine hidden expertise |
| **Kickresume** | AI resume and cover-letter builder, design templates | Creative and EU job seekers | $24/mo; $18/mo quarterly; $8/mo annual — FACT (aggregator) [getpulsesignal](https://getpulsesignal.com/pricing/kickresume) | SEO, templates | Unknown | Design | Document-only | Document generator only |
| **Rezi** | ATS-optimized AI resume | Job seekers | Free; Pro $29/mo; lifetime $149 — FACT (aggregator) [macmyths](https://macmyths.com/best-ai-resume-builders-in-2026-rezi-teal-kickresume-and-more/) | SEO | Unknown | ATS scoring | Document-only | Same |
| **Jobscan** | Resume vs job-description match rate | Job seekers | Not confirmed in this pass | SEO ("ATS checker") | Unknown | Clear single metric (match %) | Unknown | Matches to one job description, not to opportunities in general |
| **Huntr** | Job tracker plus resume | Job seekers | $40/mo, or $30/mo quarterly — FACT (aggregator) [huntr vs careerflow](https://huntr.co/blog/huntr-vs-careerflow) | SEO, comparison pages | Unknown | Tracker | Price | Same |
| **Simplify** | Autofill applications plus job board | New grads, tech | Free core (Simplify+ paid; price not verified) | Chrome extension, student virality | Unknown | Autofill saves time | Not verified | Same |
| **Final Round AI** | Real-time interview copilot, job in under 30 days | Tech job seekers | Subscription (price not verified) | Social, demo days | $6.9M seed (Uncork); 50k users and $10k MRR in first month — FACT [seedtable](https://seedtable.com/companies/final-round-ai/funding-rounds/seed-2025-01), [techleap](https://finder.techleap.nl/news/feed/final-round-ai-raises-6-88m-seed) | Fast growth through social | Ethics concerns about live interview "cheating" — INFERENCE (not verified in this pass) | Interview stage only |
| **LinkedIn Premium AI** (Job Match, AI job search, AI Career Coach in LinkedIn Learning) | Built-in AI for job fit and career planning | 1B+ LinkedIn members; Premium payers | Premium about $30/mo, 1-month trial — FACT [getcoai](https://getcoai.com/news/linkedins-new-ai-tool-aims-to-match-you-with-the-perfect-job), [socialpilot](https://www.socialpilot.co/blog/new-linkedin-features) | Native distribution | Unknown for these features | Has the data (profile plus jobs plus skills graph) | Paywalled; nudges toward LinkedIn Learning courses and LinkedIn jobs — INFERENCE | No "AI exposure of my skills", no business or consulting outcomes, no portable artifact — INFERENCE |
| **Job Pivotry** | AI career-transition platform: pivot analysis, tailored resume, cover letter | Career changers | Free pivot analysis; paid tiers unclear | Product Hunt / PeerPush, SEO | About 20,000 B2C users; **$247 all-time revenue**, no active MRR (Stripe-verified, TrustMRR, updated 2026-10-05); founded Nov 2025 — FACT [TrustMRR](https://trustmrr.com/startup/job-pivotry) | Closest to "transferable skills" framing | Gets users but almost no willingness to pay | No market or AI-exposure data, no non-job paths |
| **PivotGuru** | Upload resume, get career paths | Career changers | Unknown | Product Hunt self-promo | Unknown (looks tiny) — [Product Hunt](https://www.producthunt.com/p/self-promotion/pivotguru-upload-your-resume-and-discover-new-career-paths) | Simple | Thin | Same |

Not researched in depth (no reliable data found in this pass): Indeed AI features, Yoodli (speech and interview practice, adjacent rather than competing), Careerist, Coached, Placement. "Kadoa" is a web-data extraction company, not a career coach (INFERENCE from name recognition; not verified).

### Cited Findings
- LinkedIn Premium bundles AI job search, Job Match, and an "AI Career Coach" in LinkedIn Learning for skill gaps and paths, at about $30/mo — [getcoai](https://getcoai.com/news/linkedins-new-ai-tool-aims-to-match-you-with-the-perfect-job); [socialpilot](https://www.socialpilot.co/blog/new-linkedin-features)
- Teal complaints include generic AI resume content and expensive weekly pricing — [resumegenius](https://resumegenius.com/reviews/teal-resume-builder-reviews)
- Final Round AI: $6.9M seed; over 50k users and $10k MRR in its first month — [techleap](https://finder.techleap.nl/news/feed/final-round-ai-raises-6-88m-seed)
- Job Pivotry: about 20k users, $247 all-time revenue, no active subscriptions — [TrustMRR](https://trustmrr.com/startup/job-pivotry)

### Inferences
- INFERENCE: The money in consumer career AI follows **acute pain at a deadline** (getting an interview, passing an interview). Final Round grew fast because it sits at the moment of highest anxiety. Exploratory "what am I good at / where could I pivot" tools pull users but not payment (Job Pivotry).
- INFERENCE: Every incumbent outputs a *document for someone else* (resume, cover letter, an answer for the interviewer). None outputs a *model of the person* that the person owns.

### Gaps
- No public traffic numbers (Similarweb) were retrieved for Teal, Careerflow, or Rezi.
- Jobscan, Simplify, and Final Round current prices were not verified from primary pages.
- Reddit-specific complaint threads for Final Round were not found in this pass.

---

## Q2. "Will AI take my job" / AI-exposure tools and enterprise skills graphs (is there a consumer version?)

### Takeaway
Research-grade exposure data is now public and free: Microsoft's 2025 AI applicability score, and the Anthropic Economic Index with a **free Claude connector launched 2026-07-22**. A swarm of micro-tools wraps O*NET plus this research into a 0–100 "risk score". They get almost no traction (1–3 Product Hunt upvotes). Enterprise skills graphs (Eightfold, Lightcast, Gloat, Workday) reach consumers only through employers, public workforce agencies, or colleges, never as a direct product.

### Cited Findings
- Microsoft's "Working with AI" study (mid-2025) mapped 200k Bing Copilot conversations to O*NET tasks to build an "AI applicability score". The most exposed jobs include interpreters, writers, and customer service reps. The authors warn the score is not a displacement prediction — [Tom's Guide](https://www.tomsguide.com/ai/microsoft-reveals-the-40-jobs-ai-is-most-likely-to-replace-and-40-that-are-safe-for-now); [Fortune](https://www.fortune.com/article/what-are-the-jobs-most-exposed-to-ai-microsoft-researchers-list/)
- The Anthropic Economic Index connector is free in claude.ai, works with any model, and takes about a minute to enable. Example query: "What sorts of tasks do teachers use Claude for?" — FACT [Anthropic, 2026-07-22](https://anthropic.com/news/anthropic-economic-index-connector)
- A third-party "AI Economic Pulse" explorer lets you search 800+ O*NET occupations for a personal exposure report — [HF space](https://nicovlr-ai-economic-pulse.hf.space/)
- AI Job Risk Check: free task-by-task 0–100 score with no signup; upsells a report, plan, and coaching; **3 upvotes** on its Product Hunt thread — FACT [Product Hunt](https://www.producthunt.com/p/ai-job-risk-check/ai-job-risk-check)
- Job Security Meter: scores a resume or LinkedIn profile on 5 dimensions; $7.99 for a 6-month "AI-proofing roadmap"; **1 upvote, #119 for the day** — FACT [hunted.space](https://hunted.space/product/job-security-meter)
- Others in the same pattern: AIRRBridge (free score, paid O*NET breakdown), JobMentis (risk report from O*NET plus Anthropic research; also runs a LinkedIn roaster), WeCovr "Will AI take my job" score (an insurance lead-gen calculator) — [hunted.space](https://hunted.space/product/airrbridge); [JobMentis](https://www.jobmentis.com/it/strategy); [WeCovr](https://internationalinsurance.wecovr.com/calculators/will-ai-take-my-job-score)
- Eightfold Workforce Exchange is sold to public career centers as "consumer-grade" self-service for citizens. Lightcast SkillsMatch is distributed through colleges — [Eightfold datasheet](https://eightfold.ai/wp-content/uploads/Eightfold_Workforce_Exchange_datasheet.pdf.pdf); [SJSU](https://careercenter.sjsu.edu/?p=808)

### Inferences
- INFERENCE: "AI exposure score" is commoditized. The data is public, the method (O*NET task mapping) is obvious, and Claude itself now ships the dataset free. A standalone "risk score" has no moat and, judging by the upvotes, little pull.
- INFERENCE: The emotional frame matters. Risk and fear framing ("will AI replace me") produced nothing viral among these launches. The viral formats in Q4 are identity and humor (roast, "describe me").
- HYPOTHESIS: Exposure data works better as an ingredient (one axis of a personal map) than as the product.

### Gaps
- willrobotstakemyjob.com current traffic and status were not retrieved.
- Whether Workday Skills Cloud or Gloat offer anything individual-facing: not found (likely no).

---

## Q3. Expertise-monetization / "AI of yourself" tools

### Takeaway
"Clone your expertise" is a funded category (Delphi, backed by Sequoia, Founders Fund, and Menlo). But it serves people who **already have an audience** (coaches, creators, celebrities) and assumes they already know what their expertise is. Pricing of $79–$299/mo, or $3k–$16k done-for-you, confirms the target is established experts. Nobody serves the earlier step: *discovering* which parts of an ordinary professional's experience are worth productizing.

### Cited Findings
- Delphi pricing: Free (1 Digital Mind); Builder $79/mo; Scaler $299/mo; "Immortal" custom for celebrities — FACT [delphi.ai/pricing](https://www.delphi.ai/pricing)
- Delphi funding: one source says a $16M Series A (June 2025) with Sequoia, Founders Fund, Menlo, Lux, and Abstract. A search summary also claims $58.7M total through a June 2026 Series B. **Conflicting, Series B not confirmed** — [CB Insights](https://www.cbinsights.com/company/delphi-2); [seedtable](https://seedtable.com/companies/delphi)
- Kē, a product powered by Delphi, launched 2026-06-18 at $14.99 (secondhand, citing TechCrunch; not verified at the primary source) — [seedtable changelog](https://seedtable.com/companies/delphi/changelog)
- Coachvox: $99/mo DIY; $3,000 "done with you"; $16,000 "done for you"; coaches can charge their own clients — FACT (review site) [quso.ai](https://quso.ai/blog/coachvox-ai-review-features-pros-cons-alternatives.html)
- Sensay (London, 2023): replicas trained on documents and video; claims 25k+ MAU and 500k daily interactions; offers token ($SNSY) payment discounts — FACT, company-sourced claims [rankmyai](https://www.rankmyai.com/tools/33cea120-584e-4e25-8e7d-d14a1e9b8dc4/sensay); [Cointelegraph](https://cointelegraph.com/magazine/?p=41951)

### Inferences
- INFERENCE: The clone tools sit downstream of the gap. Their onboarding asks you to upload your content. A typical mid-career professional has no content corpus and no audience, only a CV and tacit know-how.
- INFERENCE: Sensay's crypto token layer is a trust and positioning liability for mainstream professionals.
- HYPOTHESIS: An "experience to offer" bridge (from what you know to a sellable consulting, course, or advisory offer) is unserved for non-creators. Course generators (Mini Course Generator, Coursebox) also assume you already picked the topic. (Not researched in depth in this pass; their pricing is unverified.)

### Gaps
- Delphi user and creator counts: not public.
- Mini Course Generator and Coursebox pricing and traction: not retrieved.
- No "turn your experience into a consulting offer" product was found. This may be a real absence or a search miss.

---

## Q4. Viral LinkedIn-analysis toys

### Takeaway
"Roast my LinkedIn" and "ChatGPT, roast/describe me" are proven viral formats, but they are scattered across dozens of free micro-tools and Chrome extensions, mostly as lead magnets for paid products. No public traction numbers were found for any of them. The virality belongs to the *format* (humor plus identity plus a screenshot-able result), not to any company.

### Cited Findings
- The "roast me" trend spread across Instagram and TikTok; celebrities joined (Demi Lovato asked ChatGPT to roast her) — [Tom's Guide](https://tomsguide.com/ai/everyones-asking-chatgpt-to-roast-them-heres-how-to-try-it)
- Tools: ViralBrain "slop roast" (reads your last 40 posts and scores the "slop"), RoastLinkedIn.com, a "LinkedIn Roaster" Chrome extension, JobMentis roaster, and a "Roast my LinkedIn analyzer" on PeerPush — [ViralBrain](https://www.viralbrain.ai/tools/slop-roast); [Chrome Web Store](https://chromewebstore.google.com/detail/bblackbfmcdofnlhnkkdokfhbmehhmnj); [JobMentis](https://www.jobmentis.com/en/roast-my-linkedin); [PeerPush](https://peerpush.com/p/roast-my-linkedin-analyzer)

### Inferences
- INFERENCE: These toys are top-of-funnel for resume and ghostwriting businesses. Their output is a joke you share once, not something you keep.
- HYPOTHESIS: A "flattering roast" (hidden value you didn't know you had, as a shareable card) could borrow the roast's virality while setting up the serious product. This is untested.

### Gaps
- No public usage numbers for Resume Worded's roast, "LinkedIn Wrapped", or "What's my LinkedIn worth". Searches returned no traction data.

---

## Q5. What one good ChatGPT/Claude/Gemini prompt already delivers, and where it falls short

### Takeaway
A free LLM chat with a pasted CV plus a strong prompt already covers about 70–80% of the *analysis* (transferable skills, pivot ideas, consulting angles, rough AI-exposure reasoning). With Claude's free Economic Index connector it can even ground exposure in real usage data. The gaps are not intelligence. They are **structure, persistence, market grounding at the person level, evidence, shareable output, and follow-through**.

### Cited Findings
- Guides already teach people to use ChatGPT or Claude as a "24/7 career coach" to analyze skills and find new roles — [The AI Break](https://theaibreak.substack.com/p/tutorial-how-to-unlock-your-next)
- Nearly half of Gen Z say ChatGPT gives better job advice than their managers. Critics say it tells you what you want to hear — [search summary, multiple sources incl. Coursera](https://www.coursera.org/articles/chatgpt-career-coach)
- AI career advice is criticized as generic, blind to unique circumstances, and prone to making things up and to bias — [NYSSCPA](https://nysscpa.org/news/1047094-career-coach-bots-offer-advantages-and-disadvantages-2024-05-29); [Coursera](https://www.coursera.org/articles/chatgpt-career-coach)
- The Anthropic Economic Index is queryable free inside Claude — [Anthropic](https://anthropic.com/news/anthropic-economic-index-connector)

### Inferences (where chat falls short)
- INFERENCE, input problem: users paste a CV, which is the *sanitized* version of their experience. The hidden expertise lives in projects, side work, documents, and stories that chat does not draw out unless someone interviews you systematically.
- INFERENCE, no structure or artifact: the output is a wall of text. There is no persistent "experience graph" you can return to, edit, compare against a year ago, or hand to someone else.
- INFERENCE, flattery and genericness: LLMs inflate ("you have rare strategic leadership skills"). There is no calibration against real people or real market prices.
- INFERENCE, no market data at person level: chat can cite occupation-level exposure but not demand, rates, or who would buy this specific combination of skills.
- INFERENCE, no follow-through: no accountability loop, no "test this offer with 3 people this week".
- INFERENCE, not shareable: nothing screenshot-able or bragging-rights-worthy, which is exactly why roast toys spread and chats don't.
- HYPOTHESIS: Users value the *ritual and the artifact* more than the analysis. One good prompt gives the analysis; a product would have to give the ritual (guided excavation) and the artifact (a card, map, or score you keep and share).

### Gaps
- No published side-by-side test of "one prompt in ChatGPT" vs a paid tool. A quick in-house test (the same CV through ChatGPT, Claude with the EI connector, Job Pivotry, and Job Security Meter) would be cheap and decisive.

---

## Q6. Is there whitespace? Where exactly?

### Takeaway
Yes, but it is narrow and the monetization evidence is negative. The **analysis** layer is commoditized by free LLMs. The **job-application** layer is saturated. The **clone/monetization** layer serves only established creators. The remaining whitespace is the **excavation-plus-artifact step** for ordinary professionals: pull out tacit expertise beyond the CV, map it against AI exposure and non-job outcomes (consulting, product, teaching), and produce a shareable, persistent object. The evidence says this gets attention but not payment (Job Pivotry: 20k users, $247; risk meters: 1–3 upvotes). A standalone product is justified only as a cheap viral toy or a funnel, not as a subscription business, at least initially.

### Cited Findings
- Exploratory pivot tools attract users and fail to monetize — [TrustMRR Job Pivotry](https://trustmrr.com/startup/job-pivotry)
- Risk-score micro-tools fail to get attention — [Product Hunt](https://www.producthunt.com/p/ai-job-risk-check/ai-job-risk-check); [hunted.space](https://hunted.space/product/job-security-meter)
- Clone platforms price for established experts ($79–$299/mo; $3k–$16k setup) — [Delphi](https://www.delphi.ai/pricing); [quso.ai](https://quso.ai/blog/coachvox-ai-review-features-pros-cons-alternatives.html)
- Roast and describe-me formats go viral without any owning company — [Tom's Guide](https://tomsguide.com/ai/everyones-asking-chatgpt-to-roast-them-heres-how-to-try-it)

### Inferences
- INFERENCE, specific whitespace map:
  1. **Tacit-expertise excavation interview** (not CV parsing). No one found does this for non-creators.
  2. **"Experience → non-job outcomes"**: consulting offer, micro-product, teaching topic. Career tools stop at "jobs", clone tools start at "you already have content".
  3. **Shareable, positive-identity artifact** ("your hidden expertise card"), mixing roast-style virality with real substance. No incumbent owns it.
  4. **Persistent personal experience graph** that you own and update. LinkedIn has the graph but uses it for recruiters and Premium upsell.
- INFERENCE, threats: LinkedIn can ship this natively. ChatGPT memory plus Claude connectors erode the "analysis" value every quarter. Any differentiation must come from format, ritual, distribution, and community, not model quality.
- HYPOTHESIS: For a small team, the right first test is a free toy (about 5 minutes: paste CV or LinkedIn, answer 5 excavation questions, get a shareable "hidden expertise + AI-exposure + 3 unexpected moves" card), measured on share rate, not revenue.

### Gaps
- No willingness-to-pay data for "experience to business idea" outputs specifically.
- RU / CIS market equivalents (hh.ru AI features, local career bots) were not covered in this pass.
