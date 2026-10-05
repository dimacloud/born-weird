# Personal data landscape, privacy architectures, generational data density (as of 2026-10-05)

Notation: [V] = verified via search/fetch in this session (2026-10-05). [K] = from model knowledge of official docs, URL given but NOT re-fetched this session; the report writer should treat [K] items as lower confidence. Dates in brackets are when the fact applied.

## Q1. Data access per source: how a builder actually gets 10–30 years of a person's data into an AI

### Takeaway
In 2026 there are three ways in: (1) user-run exports (Takeout, DYI, Telegram JSON, LinkedIn, ChatGPT/Claude exports). These are free, complete and legal everywhere, but slow, manual and not refreshed. (2) Live OAuth APIs. Gmail/Drive restricted scopes need a Google CASA audit, roughly $500–$6k a year for Tier 2 (some vendors quote far more), renewed every year. (3) The new layer: MCP connectors run by the AI hosts themselves (Claude/ChatGPT Gmail connectors, Google's official Gmail MCP server). Here the host carries the verification burden. For a small builder, the cheapest high-coverage route is "user uploads an export archive, processed locally" plus host MCP connectors for live data.

### Cited Findings
**Google**
- Apps reading Gmail/Drive through restricted scopes must pass a CASA security audit by a Google-approved lab and revalidate every year — [DeepStrike](https://deepstrike.io/blog/google-casa-security-assessment-2025) [V]
- Cost estimates conflict. DeepStrike quotes $15k–$75k for Tier 2 ([DeepStrike](https://deepstrike.io/blog/google-casa-security-assessment-2025)). An integrator's 2026 lab rates are $1.5k–$6k a year for Tier 2 and $8k–$25k+ for Tier 3 ([truto.one](https://truto.one/google/)). MailMate, an indie Mac mail client, reported passing Tier 2 in April 2025; on that list, discounted partner pricing of $540–$1,800 was cited, vs $1,800–$6,300 undiscounted ([MailMate list, Apr 2025](https://lists.freron.com/mailmate/2025-April/018278.html)) [V]. Inference: the lower range applies to small apps through preferred labs, and the higher figures probably include remediation and consultancy.
- Google Data Portability API (EU DMA, launched March 2024): users can authorise third parties to receive Google data directly, for up to 180 days per authorisation, free. Scopes are per-product (e.g., Search history, Alerts), and some are classified "Sensitive" — [Google DPAPI scopes](https://developers.google.com/data-portability/user-guide/scopes); [EU DMA developer portal](https://digital-markets-act.ec.europa.eu/developer-portal/end-user-data-portability_de) [V]. The UK CMA has also issued a "Data portability conduct requirement v2" for Google — [UK gov PDF](https://assets.publishing.service.gov.uk/media/6979ce981c24881f40a4d6dd/_Data_portability_conduct_requirement_v2.pdf) [V, title only]
- Maps Timeline moved to on-device storage. The final cloud deadline was 9 June 2025 (some users got an earlier date, e.g., 6 April 2025), and cloud data not migrated was deleted. Takeout could export the JSON before that date — [TechRadar](https://www.techradar.com/phones/youve-got-more-time-the-great-google-maps-timeline-switch-gets-a-new-deadline-date); [Gizchina, Mar 2025](https://www.gizchina.com/2025/03/09/google-maps-timeline-data-is-disappearing-whats-going-on/) [V]. Implication: since mid-2025, Google location history is no longer in Takeout from the cloud. It has to come from the phone's own Timeline export.
- Google ships an official Gmail MCP server (Workspace MCP). It can search threads, read threads, create drafts and list labels, but does not send — [Google Developers](https://developers.google.com/workspace/gmail/api/guides/configure-mcp-server); [Drag blog 2026](https://www.dragapp.com/blog/gmail-mcp/) [V via search snippet]
- Takeout gives Gmail as .mbox, Photos as originals plus JSON sidecars, and Drive as files — [Google Takeout help](https://support.google.com/accounts/answer/3024190) [K]

**MCP as a new access layer**
- The official MCP registry grew from about 9,650 servers (May 2026) to 30,375 unique servers (10 Sept 2026) — [dev.to "MCP registry by the numbers"](https://dev.to/amareswer/the-mcp-registry-by-the-numbers-38nc); [aiskill.market](https://aiskill.market/blog/9652-servers-inside-the-mcp-registry) [V via snippet; secondary sources]
- Claude's built-in Gmail connector (paid plans) can search and read. Since August 2026 it can also send, reply and forward, with every outgoing message shown for approval — [Drag blog](https://www.dragapp.com/blog/gmail-mcp/) [V via snippet; secondary]

**Messaging**
- WhatsApp "Export chat" works one chat at a time and caps at the most recent 40,000 messages without media, or 10,000 with media. There is no date range, so older history beyond the cap cannot be exported this way — [dev.to WhatsApp export guide 2026](https://dev.to/chattopdf/whatsapp-chat-export-complete-guide-iphone-android-zip-pdf-2026-10lo); [Tenorshare](https://www.tenorshare.com/whatsapp-tips/whatsapp-export-more-than-40000-messages.html) [V]
- Telegram Desktop exports per chat or for the whole account as "Machine-readable JSON" or HTML. The output is a result.json plus folders, with message fields such as id, date, date_unixtime, from, from_id, text and text_entities. The lightweight "Telegram for macOS" app lacks export — [Telegram import/export schema](https://core.telegram.org/import-export); [LangChain TelegramChatLoader](https://python.langchain.com/docs/integrations/chat_loaders/telegram) [V]. LangChain already has a loader for it.
- iMessage history lives in a local SQLite db on the Mac (~/Library/Messages/chat.db). Reading it needs Full Disk Access, and there is no official export [K — no source fetched]
- Apple Health: the Health app offers "Export All Health Data", which produces a zip with export.xml — [Apple support](https://support.apple.com/guide/iphone/share-your-health-data-iph5ede58c3d/ios) [K]. Apple Data & Privacy portal: [privacy.apple.com](https://privacy.apple.com) [K]

**Social/professional**
- LinkedIn export: Connections.csv (name, email when available, company, position, connected date), Messages, Profile.csv, Jobs.csv, Invitations.csv, endorsements, search history and ad-interest data. Format is mostly CSV with some JSON/HTML. The full archive arrives within about 24 hours — [takeoutday.org guide](https://takeoutday.org/guides/how-to-export-linkedin-data); [La Growth Machine](https://lagrowthmachine.com/export-linkedin-contacts/) [V]
- Meta "Download Your Information" (FB/IG) in JSON/HTML; X archive (tweets.js etc.); ChatGPT export (conversations.json + chat.html via email link); Claude export (Settings → Privacy → Export data, JSON via email); Spotify extended streaming history (up to ~30 days to deliver); Amazon "Request your data" — [K, URLs not fetched: https://www.facebook.com/help/212802592074644, https://help.x.com/en/managing-your-account/how-to-download-your-x-archive, https://help.openai.com/en/articles/7260999, https://support.anthropic.com, https://www.spotify.com/account/privacy/]
- Claude memory supports import/export with other chatbots (copy-paste, marked experimental) — [fast.io Claude memory guide](https://fast.io/resources/claude-memory-guide/); [Yahoo Tech](https://tech.yahoo.com/ai/claude/articles/anthropic-brings-claudes-memory-feature-170000472.html) [V]

**Russia**
- From 1 July 2025, the amended Art. 18(5) of 152-FZ (via 23-FZ, published 28 Feb 2025) bans recording, systematising, storing, updating and retrieving Russian citizens' personal data in databases outside Russia, except in specified cases. This hits foreign cloud services, Google Forms/Analytics and similar tools — [Konsu Group](https://konsugroup.com/en/news/new-requirements-personal-data-protection-russia-2025-07/); [B1](https://b1.ru/en/insights/law-messenger/localization-of-personal-data-of-russian-citizens-6-march-2025/) [V]
- Fines for localisation breaches: up to RUB 6M for a first violation and RUB 18M for a repeat. Tougher fines under 420-FZ have applied since 30 May 2025 — [Konsu Group](https://konsugroup.com/en/news/new-requirements-personal-data-protection-russia-2025-07/) [V]

### Inferences
- Difficulty ranking for a builder, easiest first: Telegram JSON, then ChatGPT/Claude exports, LinkedIn CSV, Google Takeout mbox/Photos, Meta DYI, WhatsApp (capped per chat), iMessage (local db, Mac only), and finally live Gmail API (CASA audit plus yearly renewal).
- Live, continuously refreshed access to Gmail is cheapest through host connectors (Claude/ChatGPT/Google MCP), because the host has already done the verification. A builder who builds on top of the host avoids CASA.
- A product serving Russian users that stores their personal data on foreign servers is legally exposed after July 2025. Local-first processing, where data stays on the user's device and no operator database exists, is the cleanest answer.

### Gaps
- Exact current CASA Tier 2 prices from Google's own pages were not fetched, and sources conflict by an order of magnitude.
- Microsoft Graph (Mail.Read) verification requirements, Yandex/VK export, open banking specifics (PSD2/PSD3, US 1033 rule status), browser history and Notion/Slack exports were not researched this session.
- The Meta DMA portability API status was not verified.

## Q2. Typical volumes: how much data does a 40-year-old professional have?

### Takeaway
Hard per-age statistics are scarce. Most available numbers are averages across all users from vendors or surveys, so a 40-year-old's footprint has to be estimated from daily email volume and photo counts.

### Cited Findings
- The average person receives about 100–121 emails a day (including spam) — [EmailToolTester/aggregator snippets](https://www.emailtooltester.com/en/?p=38026) [V, aggregator]. An older figure is about 83 emails a day, roughly 30,000 a year, for a professional — [Law Dept Mgmt blog](https://lawdepartmentmanagementblog.com/an-average-of-83-e-mails-per-person-each-day-30000-per-year) [V, old]
- Smartphone camera rolls average roughly 2,000–2,800 photos per user, though estimates vary widely (the US figure is 646 in an older Avast study) — [Photutorial](https://photutorial.com/photos-statistics); [Security Boulevard/Avast 2019](https://securityboulevard.com/2019/10/which-countries-store-the-most-photos-avast) [V, low-quality aggregators]
- More than 2 trillion photos are expected to be taken globally in 2025 — [PetaPixel, Jun 2025](https://petapixel.com/2025/06/18/the-number-of-photos-taken-in-2025-is-expected-to-exceed-two-trillion) [V]

### Inferences
- Back-of-envelope only: 20 years of Gmail at about 30k emails a year would be about 600k emails received, mostly noise. A realistic "meaningful" set of personal and threaded email is perhaps tens of thousands. Add tens of thousands of photos in cloud libraries, plus messenger histories. This is an estimate, not a sourced figure.

### Gaps
- I found no reliable published statistics on digital footprint size by age cohort (emails, photos or messages per 40-year-old). This should be flagged as an open gap. The best proxy would be the founder's own Takeout counts.

## Q3. Generational: digital history depth, AI adoption, fluency and trust

### Takeaway
Younger adults use AI chatbots more often and more confidently. Millennials and 30–49 year olds lead daily use, and people 65+ lag sharply in both use and confidence. Older cohorts have deeper digital histories, often decades of email, but lower fluency. There is no direct evidence that older users get more value from personal context; that remains a hypothesis.

### Cited Findings
- Pew (5,119 US adults, 17–23 Feb 2026) on whether people use AI chatbots, ever and daily: 18–29: 66% / 31%; 30–49: 61% / 34%; 50–64: 42% / 19%; 65+: 23% / 7% — [Pew, 17 Jun 2026](https://www.pewresearch.org/internet/2026/06/17/how-opinions-and-use-of-ai-differ-by-age/) [V]
- Same survey, share "extremely/very confident" using chatbots: 31% / 23% / 12% / 6%. Adults 65+ were the most unsure about AI's impact (21% unsure about the societal impact, 29% about the personal impact) — [Pew 2026](https://www.pewresearch.org/internet/2026/06/17/how-opinions-and-use-of-ai-differ-by-age/) [V]. Negative views of AI's personal impact are highest among 18–29 (37%) vs 28% among 65+ — same source.
- Pew 2025: 34% of US adults have ever used ChatGPT, including 58% of under-30s, 41% of 30–49, 25% of 50–64 and 10% of 65+ — [Pew, Jun 2025](https://www.pewresearch.org/short-reads/2025/06/25/34-of-us-adults-have-used-chatgpt-about-double-the-share-in-2023/) [V]
- Menlo Ventures 2025: Millennials (29–44) are the most prolific daily users, not Gen Z. 61% of US adults used AI in the past 6 months, and nearly 1 in 5 use it daily — [Menlo 2025 State of Consumer AI](https://www.menlovc.com/perspective/2025-the-state-of-consumer-ai/) [V, snippet]. The 2026 report (PDF, Sept 2026) exists but was too large to fetch: [Menlo 2026 PDF](https://menlovc.com/wp-content/uploads/2026/09/menlo_ventures_consumer_ai_report-2026.pdf)
- OpenAI/NBER "How People Use ChatGPT" (Sept 2025): 46% of messages come from users aged 18–25. Non-work messages grew from 53% to over 70% between June 2024 and June 2025. The share of work-related messages is lowest for 18–25 (22.5%) and for 66+ (16.1%) — [MediaNama](https://www.medianama.com/2025/09/223-over-70-chatgpt-interactions-non-work-guidance-openai/); [Yahoo Tech](https://tech.yahoo.com/ai/articles/3-things-learned-openais-report-170514988.html) [V, secondary]
- Reuters Institute Generative AI and News Report 2025 (6 countries: AR, DK, FR, JP, UK, US): weekly use of generative AI rose from 18% to 34%, and ChatGPT had 22% weekly use. Younger users were more engaged and optimistic — [SSRC MediaWell summary](https://mediawell.ssrc.org/news-items/generative-ai-and-news-report-2025-how-people-think-about-ais-role-in-journalism-and-society/) [V, secondary]

### Inferences
- The "personal life archive" target (people with 15–30 years of email and photos) skews to Millennials and Gen X (roughly 30–60). That is also where daily AI use peaks (30–49: 34% daily). The 50–64 group has the deepest archives but half the daily use and much lower confidence, so onboarding has to be very guided.
- Gen Z has the highest AI use but shallower email archives and more history in ephemeral or closed platforms (TikTok, Instagram, Snap). Their "life data" is messenger-heavy rather than email-heavy.

### Gaps
- Anthropic Economic Index age breakdowns were not found (the index reports tasks and occupations, not user age, as far as I know [K]).
- I found no study directly showing that older users get more value from personal context. It is untested.
- Menlo 2026 age-level numbers were not extracted (the PDF was too large).

## Q4. Privacy architectures and incidents

### Takeaway
The industry has converged on three patterns: on-device models, attested confidential-cloud inference (Apple PCC, Google Private AI Compute since Nov 2025, Anthropic research on TEEs, reported OpenAI moves in 2026), and user-visible memory controls (view, edit, delete, incognito, import/export). The incidents of 2024–2025 show the failure modes: always-on capture (Recall), acquisition risk (Limitless sold to Meta), accidental publication (ChatGPT shared chats indexed by Google), and legal retention (the NYT v. OpenAI preservation order).

### Cited Findings
**Confidential/attested cloud**
- Google Private AI Compute (announced 14 Nov 2025) runs on TPUs inside "Titanium Intelligence Enclaves", with remote attestation and encryption. Google says the data is "not accessible to anyone else, not even Google". It first powers Pixel 10 Magic Cue — [Datamation](https://www.datamation.com/artificial-intelligence/google-private-ai-compute/); [BGR](https://www.bgr.com/2024375/google-launches-private-ai-compute-similar-to-apple/) [V]
- Anthropic, "Confidential Inference via Trusted Virtual Machines" (18 Jun 2025, with Pattern Labs): data stays encrypted except when processed inside verifiable TEEs. Anthropic calls it early-stage research, not a product — [Anthropic](https://www.anthropic.com/research/confidential-inference-trusted-vms); [paper PDF](https://assets.anthropic.com/m/c52125297b85a42/original/Confidential_Inference_Paper.pdf) [V]
- NVIDIA confidential computing is to help expand Apple's Private Cloud Compute — [NVIDIA blog](https://blogs.nvidia.com/?p=94324) [V, title only; date not confirmed]
- OpenAI: secondary sources report that OpenAI described a TEE-based "private AI cloud" and client-side encryption on its roadmap, plus an August 2026 confidential-compute framework for enterprise inference — [Perfect Forward Substack](https://perfectforward.substack.com/p/private-ai-clouds); [techbytes](https://techbytes.app/posts/deep-dive-openai-confidential-compute-zero-retention-pipeline/) [V, secondary/unconfirmed. No primary OpenAI page found, so treat as unverified]
- Apple Private Cloud Compute (June 2024) uses stateless processing on Apple-silicon servers, publishes images for researcher verification, and has a bug bounty — [Apple Security blog](https://security.apple.com/blog/private-cloud-compute/) [K]

**Memory controls**
- Claude memory reached Team/Enterprise in Sept 2025, Pro/Max in Oct 2025, and all plans by early 2026. It offers project-scoped memory, view/edit/delete, and incognito chats that are not saved, do not feed memory and are not used for training — [fast.io guide](https://fast.io/resources/claude-memory-guide/); [Computerworld](https://www.computerworld.com/article/4056366/anthropic-adds-memory-to-claude-for-team-and-enterprise-plan-users.html) [V, partly secondary]
- ChatGPT memory has two parts, "saved memories" and "reference chat history", plus Temporary Chat — [OpenAI help](https://help.openai.com/en/articles/8590148-memory-faq) [K]

**Incidents**
- NYT v. OpenAI: a 13 May 2025 order required OpenAI to preserve all ChatGPT output logs, including deleted chats, across Free, Plus, Pro and Team. The obligation ended on 26 Sept 2025 (order of 9 Oct 2025, Judge Ona Wang). Logs already preserved stay available to plaintiffs, and EEA/Swiss/UK users were exempt. A later order required disclosure of about 20M chat logs (Nov 2025) — [Engadget](https://engadget.com/ai/openai-no-longer-has-to-preserve-all-of-its-chatgpt-data-with-some-exceptions-192422093.html); [OpenAI response](https://openai.com/index/response-to-nyt-data-demands/); [terms.law, Nov 2025](https://terms.law/2025/11/12/openai-v-new-york-times-stopped-being-just-a-copyright-case-the-moment-the-court-turned-to-your-chatgpt-logs/) [V]
- ChatGPT shared chats indexed by Google (late July 2025, for users who ticked "discoverable"). OpenAI removed the feature on 31 Jul 2025, calling it a "short-lived experiment", and worked to de-index the links. An unverified estimate puts the number of indexed chats at up to 70k — [Malwarebytes, Aug 2025](https://malwarebytes.com/blog/news/2025/08/openai-kills-short-lived-experiment-where-chatgpt-chats-could-be-found-on-google); [Fortune](https://www.fortune.com/2025/08/05/openai-google-search-chat-history) [V]
- Microsoft Recall was relaunched in April 2025 as opt-in, with an encrypted database and content filters. Signal blocked it with a DRM screen-capture flag because Microsoft offered no developer opt-out API — [TechRepublic](https://www.techrepublic.com/article/news-signal-blocks-windows-recall-privacy/) [V]
- Meta acquired Limitless (the AI pendant that records conversations) in Dec 2025. Users lost HIPAA protections, had to accept new terms, and were cut off in the EU, UK, Brazil, China, Israel, South Korea and Turkey. Sales of the $99 device stopped, and support continues for at least a year — [SF Standard, 14 Dec 2025](https://sfstandard.com/2025/12/14/big-tech-scooping-ai-wearable-startups-customers-spooked/); [techinformed](https://techinformed.com/meta-acquires-limitless-pendant-users-moved-to-free-unlimited-plan/) [V]

**Personal data stores**
- Solid/Inrupt, Hub of All Things and digi.me were not researched this session [gap].

### Inferences
- For a "life as an asset" product, the trust story has to answer all four failure modes explicitly. (a) Nothing is captured by default (anti-Recall). (b) Data is portable and deletable if the company is sold (anti-Limitless). (c) Nothing is published or shareable by accident (anti-shared-chats). (d) The operator holds no logs that can be subpoenaed (anti-NYT order). Local-first storage plus on-device or attested inference addresses (d) best, since an operator cannot be compelled to hand over data it never holds.
- Big-platform TEE offerings (Apple, Google) currently power only their own features. A small builder realistically has local models (Ollama/llama.cpp) or zero-retention API agreements, not its own attested enclave.

### Gaps
- Solid/Inrupt, HAT and digi.me status in 2025–26, Azure/NVIDIA H100 confidential-inference availability for third parties, and a primary OpenAI source on confidential compute were all not covered.

## Q5. Consumer attitudes: willingness to give AI access to personal data

### Takeaway
A meaningful minority already grants deep access. Among US AI-agent users in July 2026, 36% had given an agent their email, 31% messaging apps and 20% financial accounts. Worry nonetheless remains near-universal. Trust and accuracy now rank above ease of use when people choose an AI product.

### Cited Findings
- Menlo Ventures / Morning Consult (5,067 US adults, July 2026), permissions granted by agent users: email 36%, web browser 33%, messaging apps 31%, cloud storage 29%, calendar 27%, health apps 23%, financial accounts 20% — [DigitalApplied summary of Menlo 2026](https://www.digitalapplied.com/blog/ai-agent-access-permissions-consumer-survey-statistics-2026) [V, secondary summary of Menlo report published 16 Sept 2026]
- Same survey, top factors when choosing AI products: accuracy 45%, trustworthiness 40%, security/privacy 36%, ease of use 32% ("trust now outranks ease of use"). Users rate an account's sensitivity by its contents, not by what it can unlock — same source [V]
- SurveyMonkey Q4 2025: 38% of Americans say an AI assistant storing or sharing personal data without consent would lose their trust fastest — [SurveyMonkey](https://www.surveymonkey.com/curiosity/surveymonkey-research-ai-sentiment-study-q4-2025/) [V, snippet]
- StartMail survey: 95% of Americans are concerned about AI's impact on privacy, and over 40% are very or extremely concerned about AI scanning personal email — [StartMail](https://startmail.com/email-privacy-survey) [V, snippet; vendor survey, date unclear]

### Inferences
- What lowers resistance, by inference: visible accuracy (being shown what the AI found, with sources), granular per-source permissions, and the absence of unconsented storage or sharing. Content-sensitivity framing suggests messaging and health data will meet more resistance than email-as-utility.

### Gaps
- No age-segmented data on willingness to grant access was found. Russian-audience attitudes (e.g., VTsIOM/FOM on AI and personal data) were not researched.
