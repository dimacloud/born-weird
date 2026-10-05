# Frontier landscape: Personal AI that ingests years of a person's data (as of 2026-10-05)

Method note: about 25 web searches, no full-page fetches. Many hits were SEO or affiliate review blogs (marked "aggregator"). Treat any number from an aggregator as unverified. Primary or tier-1 sources (OpenAI, TechCrunch, CNBC, Bloomberg, Engadget, MacRumors, BusinessWire, product blogs) are noted where available. "Shipped" means generally available. "Announced" means on a roadmap or in preview.

## 1. Big assistants' personal-context features (ChatGPT, Claude, Gemini, Apple, Meta, Microsoft)

### Takeaway
All six platforms now ship some cross-session memory. The frontier has moved to two things: (a) connecting the assistant to the user's own data stores (Gmail, Calendar, Photos, Drive, search and YouTube history), and (b) proactive output, meaning the assistant pushes something to the user (ChatGPT Pulse; Gemini Personal Intelligence partly does this). None of them yet builds an explicit, user-inspectable "life model" over years of data, or mines the past for opportunities. Memory is still mostly preferences plus retrieval.

### Cited Findings
**OpenAI / ChatGPT**
- Pulse launched in Sept 2025 for Pro users on mobile. Overnight it researches and produces a personalized morning set of cards from chat history, saved memory and, if connected, Gmail and Google Calendar. Memory must be on. — [OpenAI: Introducing ChatGPT Pulse](https://openai.com/index/introducing-chatgpt-pulse/); [TechCrunch 2025-09-25](https://techcrunch.com/2025/09/25/openai-launches-chatgpt-pulse-to-proactively-write-you-morning-briefs/)
- Pulse reportedly rolling out to Plus across 2026 (aggregator, not verified with OpenAI). — [futurefactors.ai](https://futurefactors.ai/chatgpt-pulse-proactive-ai-briefings-guide-2026/)
- 2026 memory upgrade reportedly draws on past chats, saved notes, uploaded files and connected Gmail. A "memory sources" view shows which chats or notes shaped an answer (aggregator; needs primary confirmation). — [digitalstrategyai substack](https://digitalstrategyai.substack.com/p/what-i-learned-after-testing-every)
- Connector content is opt-in and "not used to train models". — [OpenAI Pulse post](https://openai.com/index/introducing-chatgpt-pulse/)
- Fyxer (an exec-assistant startup) is built on OpenAI models. OpenAI published a customer story on it. — [OpenAI: Fyxer](https://openai.com/index/fyxer/)

**Anthropic / Claude**
- Persistent memory reached all users, free included, in March 2026. After each chat it extracts details (role, preferences, formatting) into a running summary. — [MacRumors 2026-03-02](https://www.macrumors.com/2026/03/02/anthropic-memory-import-tool/); [WinBuzzer](https://winbuzzer.com/2026/03/03/anthropic-drops-memory-paywall-free-claude-users-xcxwbn/)
- Memory import tool: a prepared prompt has ChatGPT or another assistant export its memories in a format Claude can ingest. This is an explicit play for portable personal context. — [MacRumors](https://www.macrumors.com/2026/03/02/anthropic-memory-import-tool/)
- Free users also got connectors, file creation and skills. A third-party MCP example is the Fantastical calendar connector (March 2026). — [AlternativeTo news](https://alternativeto.net/software/claude/news)
- Aug 2026: one shared memory across Claude chat and Cowork (the agentic desktop mode). — [TechCrunch 2026-08-25](https://techcrunch.com/2026/08/25/claude-cowork-finally-remembers-what-you-told-the-app-in-chat/); [Engadget](https://www.engadget.com/2243753/claude-memory-now-works-across-both-chats-and-cowork-sessions/); [The New Stack](https://thenewstack.io/claude-memory-chat-cowork/)

**Google / Gemini "Personal Intelligence"**
- Announced and rolling out around Jan 22, 2026 for US AI Pro and Ultra subscribers, on web, Android and iOS, with all Gemini models. With permission it reasons over Gmail, Google Photos, Search history and YouTube activity. It retrieves specific details from emails and photos and combines text, photo and video. Google plans more countries and eventually a free tier. — [GSMArena](https://www.gsmarena.com/google_launches_personal_intelligence_for_gemini-news-71110.php); [Pocket-lint](https://www.pocket-lint.com/google-gemini-personal-intelligence-launch/)
- The same personal context also reached Search AI Mode (Gmail and Photos). — [TechCrunch 2026-01-22](https://techcrunch.com/2026/01/22/googles-ai-mode-can-now-tap-into-your-gmail-and-photos-to-provide-tailored-responses/)
- Later extended to Nano Banana image generation, for example images that "know your life" from Photos. — [The Next Web](https://thenextweb.com/news/google-gives-gemini-image-generation-that-knows-your-lifegoogle-gemini-nano-banana-personal-intelligence-image-generation); [Engadget](https://www.engadget.com/2204410/google-expands-personalized-intelligence-to-gemini-app-image-creation/)
- Privacy: Google says it won't train "directly" on the Gmail inbox or Photos library, but prompts and responses are used. — [Pocket-lint](https://www.pocket-lint.com/google-gemini-personal-intelligence-launch/)
- Press framed it as "personal superintelligence". — [Dealroom news](https://app.dealroom.co/news/feed/google-ships-personal-superintelligence-by-connecting-gemini-ai-across-gmail-photos-and-search-history-1)

**Apple Intelligence (personal context Siri)**
- Demoed at WWDC 2024: Siri tracks emails, messages, files and photos, and fills forms from personal data such as a driver's license photo. Delayed in March 2025 ("take us longer than we thought"). — [CNBC 2025-03-07](https://www.cnbc.com/2025/03/07/apple-delays-siri-ai-improvements-to-2026.html); [MacRumors](https://www.macrumors.com/2025/03/07/apple-intelligence-siri-features-delayed/)
- Target was spring 2026. — [MacRumors 2025-06-12](https://www.macrumors.com/2025/06/12/apple-intelligence-siri-spring-2026/)
- A secondary source says the personalized Siri "only began rolling out in 2026", about 18 months after the demo, and cites reliability as the cause of the delay. — [valueaddvc blog](https://valueaddvc.com/blog/apple-intelligence-2026-what-apples-ai-actually-does-and-what-it-still-cant)

**Meta AI**
- Memory in 1:1 chats on Facebook, Messenger and WhatsApp (initially US and Canada). Meta AI also draws on FB and IG profile data and viewing history for recommendations. — [Maginative](https://www.maginative.com/article/meta-ai-rolls-out-new-memory-and-personalization-features/); [MediaPost](https://www.mediapost.com/publications/article/402902/metas-ai-assistant-makes-recommendations-based-on.html)
- From Dec 16, 2025, Meta uses Meta AI conversations to personalize ads and content across FB, IG and WhatsApp, except in the EU, UK and South Korea. — [Proton blog](https://proton.me/blog/meta-ai-ads)
- Meta acquired Limitless (lifelogging pendant) in Dec 2025 (see section 2).

**Microsoft**
- Copilot (consumer) Fall Release, Oct 2025: memory and personalization that recalls preferences and ongoing tasks, with user review, edit and delete. — [Redmondmag 2025-10-27](https://redmondmag.com/articles/2025/10/27/microsoft-brings-expanded-memo-copilot.aspx)
- Microsoft 365 Copilot memory: the Insider blog describes Copilot Memory. A roadmap item for work-data-based memory personalization targets general availability in **November 2026** (announced, not shipped). — [M365 Insider blog](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/unlock-the-power-of-personalization-copilot-memory-in-microsoft-365/4458242); [Message Center MC1158329](https://mc.merill.net/message/MC1158329); [windowsnews.ai](https://windowsnews.ai/article/microsoft-365-copilot-to-gain-memory-based-personalization-in-november-2026.429482)
- Windows Recall: screenshots every few seconds plus on-device models, searchable. Ships on Copilot+ PCs, and Microsoft promoted it again in Feb 2026. — [Wikipedia: Windows Recall](https://en.wikipedia.org/wiki/Windows_Recall); [Windows Latest 2026-02-20](https://www.windowslatest.com/2026/02/20/microsoft-says-2026-is-the-moment-for-ai-pcs-touts-windows-11-recall-copilot-and-the-highest-standard-of-security/)

### Inferences
- The platforms' data reach maps onto their ecosystems. Google has the deepest native years-of-life data (Gmail, Photos, Search, YouTube). Apple has on-device messages and photos but has shipped slowly. Meta has social-graph data and points it at ads. Microsoft has work data and the screen. OpenAI and Anthropic depend on connectors and MCP, plus memory import to win portability.
- Proactivity (Pulse) is the clearest frontier move. It is still a "daily newspaper", not long-horizon pattern mining or opportunity discovery from the past.
- Memory import between assistants (Claude, March 2026) shows that personal context is now seen as lock-in. A neutral, user-owned layer for that context is a strategic opening.

### Gaps
- No primary OpenAI source was fetched for 2026 memory changes ("memory sources" view), Pulse reaching Plus or web, or ChatGPT Agent and Apps connectors. Confirm on the OpenAI changelog.
- Whether Apple's personal-context Siri actually shipped in iOS 26.x, and in which regions, is unconfirmed (only a secondary blog).
- Gemini Personal Intelligence outside the US and on the free tier: status as of Oct 2026 unknown.
- Claude: no primary Anthropic source fetched. Whether Claude can reference all past chats (search over history) versus only the summary needs a check on anthropic.com/news.

## 2. Lifelogging and wearables (Limitless/Rewind, Bee, Omi, Plaud, Friend, Screenpipe, Recall, Humane/Rabbit)

### Takeaway
2025 was the consolidation year. Big platforms bought the "always-on recorder" category: Amazon bought Bee (July 2025), Meta bought Limitless (Dec 2025, which killed the Rewind Mac app), and HP bought what was left of Humane (Feb 2025). The survivors are open-source or hardware-first players (Omi, Screenpipe, Plaud) plus companion devices (Friend). Capture is solved. Turning years of transcripts into understanding and action is not.

### Cited Findings
- **Limitless (formerly Rewind)**: Meta acquired it, CEO Dan Siroker announced the deal on Dec 5, 2025, terms not disclosed. The team joined Reality Labs wearables, and new Pendant sales stopped. — [CNBC 2025-12-05](https://www.cnbc.com/2025/12/05/meta-limitless-ai-wearable.html); [Engadget](https://www.engadget.com/ai/metas-latest-acquisition-suggests-hardware-plans-beyond-glasses-and-headsets-212930339.html)
- **Rewind Mac app**: rebranded to Limitless in April 2024. On Dec 19, 2025, screen and audio capture in the Rewind app was disabled, and EU and UK users had to export data before deletion. — [EverMind blog (aggregator)](https://evermind.ai/blogs/rewind-alternatives-for-personal-ai-memory)
- **Bee** (wrist and clip conversation recorder): acquired by Amazon in July 2025. — [CNBC](https://www.cnbc.com/2025/12/05/meta-limitless-ai-wearable.html)
- **Omi**: fully open-source hardware, firmware and app stack. Pitches user data ownership and converts talk into tasks. It ranks at the top of 2026 wearable lists, but those are press-release (openPR) placements. — [openPR](https://www.openpr.com/news/4641904/omi-pendant-leads-2026-list-of-ai-wearables-that-turn-talk-into); [vibe.us](https://vibe.us/blog/limitless-pendant-alternatives/)
- **Friend** (Avi Schiffmann): companion-first necklace aimed at emotional check-ins rather than productivity, $129. — [layer3labs review](https://www.layer3labs.io/gear/reviews/friend-ai-necklace)
- **Plaud**: AI voice recorder and notetaker. Its own 2026 blog positions it as the leading note-taking wearable. — [Plaud blog](https://www.plaud.ai/blogs/articles/whats-the-best-wearable-device-for-ai-note-taking-2026)
- **Screenpipe**: open-source 24/7 screen and audio recorder that is AI-searchable and positions itself as "the context layer for AI agents" (MCP server). The GitHub README says YC S26. Funding: $2.8M announced Oct 2025, about $3.4M seed in total. Self-reported traction: $70K+ MRR, 240 DAU, 200K+ installs, 17.5K GitHub stars. It changed its license (moved away from pure open source). — [GitHub](https://github.com/screenpipe/screenpipe); [screenpi.pe/investors](https://screenpi.pe/investors); [Seedtable](https://seedtable.com/companies/screenpipe); [license update](https://screenpipe.com/blog/screenpipe-license-update)
- **Windows Recall**: see section 1. The platform-level version of Rewind.
- **Humane AI Pin**: HP bought the assets for $116M (Cosmos platform, 300+ patents, talent). Devices bricked on Feb 28, 2025. Humane had raised more than $230M, and returns reportedly outpaced sales by mid-2024. — [Tom's Guide](https://www.tomsguide.com/ai/the-humane-ai-pin-is-officially-dead-and-hp-is-picking-up-humanes-leftovers); [Fortune](https://www.fortune.com/2025/02/19/hp-humane-deal-ai-pin-shutting-down)
- **Rabbit r1**: only mentioned in passing as part of the "first wave" of pocket AI hardware. No 2026 status found.

### Inferences
- The lesson from Rewind, Limitless and Humane: when a lifelog lives inside a startup's cloud, users lose years of data on acquisition or shutdown (Rewind export deadline, Humane bricking). Durable local ownership and export is a real need, and Omi and Screenpipe market against exactly this.
- Wearables capture conversations, not life context (email, docs, social, finances). No device player fuses audio with digital archives across years.
- Screenpipe's numbers (240 DAU against 200K installs) suggest a big curiosity-to-retention gap for raw total recall. Search over everything is not a habit-forming product by itself.

### Gaps
- Omi, Plaud and Friend units or revenue in 2026: no reliable numbers found. Plaud's sales claims were not verified in this pass.
- Bee's fate inside Amazon (Alexa+ integration? still sold?) was not confirmed.
- What Meta is doing with Limitless tech (Ray-Ban/Oakley glasses memory?) was not confirmed.
- Rabbit's current status was not checked.

## 3. Personal knowledge, memory and journaling startups (Mem, Personal.ai, Dot, Rosebud, Reflect, Mindsera, Day One, Granola, Supermemory, etc.)

### Takeaway
The "AI second brain" category split. Consumer companions with deep personal memory struggled (Dot shut down in Oct 2025). Work-context capture (Granola, valued at $1.5B) and developer memory infrastructure (Supermemory) won the money. AI journaling is alive but small (Rosebud with a $6M seed; Day One adding chat plus memory). Very few products claim long-horizon pattern detection, and the ones that do (Mindsera, Rosebud) do it only over journal text the user typed in.

### Cited Findings
- **Dot (New Computer)**: AI companion with deep personal memory, founded by Sam Whitmore and Jason Yuan (ex-Apple). Shutdown announced Sept 2025, operated until Oct 5, 2025 with data download. Reason given: the founders' visions "diverged". — [TechCrunch 2025-09-05](https://techcrunch.com/2025/09/05/personalized-ai-companion-app-dot-is-shutting-down/)
- **Mem**: Mem 2.0 released early 2026 (auto-linking notes, Mem Chat, PDF ingestion). Pro is $14.99/mo. Raised more than $28M (a16z, OpenAI Startup Fund). All of this comes from review aggregators. — [builtwithclaude.io review](https://builtwithclaude.io/mem-ai-review-ai-powered-knowledge/); [workgpt](https://workgpt.com/en/app-reviews/mem-ai)
- **Granola** (meeting notes into enterprise context): raised $125M at a $1.5B valuation in March 2026, led by Index, with Kleiner Perkins. Valuation went from $250M to $1.5B in under a year. It is expanding from notetaker to an "enterprise AI app" with context tools. — [TechCrunch 2026-03-25](https://techcrunch.com/2026/03/25/granola-raises-125m-hits-1-5b-valuation-as-it-expands-from-meeting-notetaker-to-enterprise-ai-app/); [Bloomberg](https://www.bloomberg.com/news/articles/2026-03-25/ai-notetaker-granola-hits-1-5-billion-value-in-125-million-funding)
- **Supermemory** (memory API for AI apps; founder Dhravya Shah, founded 2024): about $3M seed, Oct 2025 (Susa, Browder, SF1). — [Tracxn](https://tracxn.com/d/companies/supermemory/__pLAZAfS7jagHq_m-58u50kYrRLK-6lY70wYdV2t6F4Y)
- **Rosebud** (AI journal): $6M seed in 2025. Free plan retired Sept 30, 2026, now $12.99/mo. — [mylifenote blog (competitor, aggregator)](https://blog.mylifenote.ai/the-8-best-ai-journaling-apps-in-2026/)
- **Mindsera**: type, speak or call the journal, with emotion detection and "long-term patterns" (self-published ranking). — [Mindsera articles](https://mindsera.com/articles/the-7-best-ai-journaling-apps-in-2026-tested)
- **Day One** (Automattic): "Daily Chat" added March 2026, with a Memory system that learns people, places and interests from chats, plus AI summaries. — [mylifenote blog](https://blog.mylifenote.ai/the-8-best-ai-journaling-apps-in-2026/)
- **Inflection AI Labs** (July 2026): first experiment "Pi Journeys", helping people navigate life phases. — [Yahoo Finance](https://finance.yahoo.com/technology/ai/articles/inflection-ai-shaping-future-personal-130000573.html)
- **Moonshot** (YC company page): pitches monitoring "conscious and subconscious life", reminding about open loops, and spotting life and emotional trends before the user does. This is one of the few explicit pattern-detection pitches. — [YC AI Assistant directory](https://www.ycombinator.com/companies/industry/ai-assistant)
- **Kin**: markets itself as a privacy-first, local-data Dot replacement. — [mykin.ai](https://mykin.ai/resources/dot-by-new-computer-alternative)

### Inferences
- Money follows work context (meetings and docs into a team knowledge layer). Consumer "know my whole life" products have weak monetization, as Rosebud killing its free tier and Dot shutting down suggest.
- Journaling apps do the inference and pattern layer, but only over self-reported text. Lifeloggers have the raw data but not the inference. Nobody shown here joins the two over years of real archives.

### Gaps
- Personal.ai, Reflect, Heyday, Recall (the app), Tana, Saner, Fabric, Sana, Read.ai and Hey: not researched in this pass because of the tool budget. Status unknown.
- Mem's actual traction and funding beyond aggregator claims were not verified.

## 4. Relationship and network intelligence (Clay/Mesh, Dex, Folk, Happenstance, Boardy, Series)

### Takeaway
Personal CRMs that self-update from email, calendar and LinkedIn are mature, mid-sized products (Mesh, formerly Clay, is now owned by Automattic; Dex). The frontier move is AI agents that act on the network. Boardy (a voice AI superconnector) has real scale: 166K people spoken with and 114K intros made.

### Cited Findings
- **Clay → Mesh (me.sh)**: acquired by Automattic in June 2025 and rebranded to Mesh, same team. It auto-builds profiles of the people in a user's network from email, calendar, address book, LinkedIn and social accounts. — [trywend blog](https://www.trywend.io/blog/what-happened-to-clay-crm); [Dex: Mesh review (competitor)](https://getdex.com/blog/mesh-review/)
- **Dex**: pulls contacts and history from email, calendar, LinkedIn, WhatsApp, iMessage, FB, IG and phone. Offers reminders and timelines. $20 to $34/mo. — [getdex.com](https://getdex.com/); [Dex blog list of 60+ personal CRMs](https://getdex.com/blog/personal-crm-list/)
- **Boardy**: voice AI that calls people, learns their needs and brokers double-opt-in intros. $3M pre-seed (Oct 2024) plus an $8M seed led by Creandum (Jan 2025), reportedly pitched by the AI itself. By mid-2026: 166K people spoken with, 114K intros, 17-hour median time to intro. Boardy Ventures fund aimed for $10M, and LP demand reportedly exceeded $200M (single aggregator source). — [Altis VC research](https://www.altis.vc/research/companies/boardy); [Creandum](https://creandum.com/stories/backing-boardy-ai/); [Upstarts Media critique](https://www.upstartsmedia.com/p/would-you-trust-ai-to-help-raise)

### Inferences
- Relationship intelligence is the most concrete form of "opportunity discovery from your past": dormant ties, who-knows-whom. Boardy, though, works over its own network graph, not over the user's years of history.

### Gaps
- Folk, Happenstance (network search over Gmail and LinkedIn), Series and similar: not covered in this pass.

## 5. AI clones, digital twins and digital legacy (Delphi, Personal.ai, Sensay, HereAfter, StoryFile, Eternos)

### Takeaway
Delphi is the leading "Digital Mind" platform for experts and creators. It ingests a person's public corpus (books, podcasts, YouTube) rather than private life data. The legacy players were not checked in this pass.

### Cited Findings
- **Delphi**: users connect books, articles, podcasts, YouTube, courses and docs. It builds a cited conversational clone with a cloned voice that supports 40+ languages. The founder was inspired by turning his grandfather's memoir into an interactive tool. — [Fast Company](https://www.fastcompany.com/91356476/delphi-ai-digital-mind); [AssemblyAI case study](https://www.assemblyai.com/customers/delphi-customer-story); [Forbes 2025-03](https://www.forbes.com/sites/jonathanreichental/2025/03/10/inside-the-artificial-intelligence-that-can-clone-your-mind/)

### Inferences
- Clones are built for broadcasting a person (monetizing expertise), not for the person's own benefit. Digital legacy and digital twins for one's own decisions remain thin.

### Gaps
- HereAfter AI, StoryFile, Eternos, Sensay and Personal.ai: current status was not found. Search results contained nothing on them. Delphi's 2026 funding and traction were not verified.

## 6. AI executive assistants that act (Lindy, Fyxer, Superhuman, Shortwave, Poke, Howie, Martin, Alfred)

### Takeaway
This is the commercially hottest segment. Fyxer reached about $35M ARR in roughly a year, and Poke was acquired by Cognition in a low nine-figure deal in July 2026. Lindy relaunched as a personal executive assistant. These products act autonomously on email and calendar but have only shallow, recent-context memory. None of them uses years of history as a strategic asset.

### Cited Findings
- **Poke (The Interaction Company of California)**: a texting agent over iMessage, SMS and Telegram. It connects email, calendar and files to draft replies, handle invoices, reschedule and book travel, and it can start conversations itself. Funding: $15M seed (General Catalyst, Sept 2025), then $10M at a $300M valuation (Spark, Jan 2026). More than 100M messages in three months. **Acquired by Cognition (Devin), announced July 23, 2026, in a low nine-figure deal.** Poke keeps running. — [TechCrunch 2026-04-08](https://techcrunch.com/2026/04/08/poke-makes-ai-agents-as-easy-as-sending-a-text/); [Crypto Briefing](https://cryptobriefing.com/cognition-acquires-poke-ai-assistant/); [runtimewire](https://runtimewire.com/article/cognition-acquires-poke-interaction-consumer-ai-agents); [Dealroom](https://app.dealroom.co/companies/poke_)
- **Fyxer** (UK, Hollingsworth brothers): AI EA for inbox and meetings. ARR grew from $1M to about $32 to 35M in 2025. Targets $100 to 150M for 2026. 90-day retention above 90%. $30M Series B. — [OpenAI customer story](https://openai.com/index/fyxer/); [GrowthBook](https://www.growthbook.io/blog/how-a-team-of-4-used-a-b-testing-to-help-fyxer-grow-from-1m-to-35m-arr-in-1-year); [LionHerald](https://lionherald.com/uk-ai-startup-fyxer-ai-secures-30-million-series-b-as-it-eyes-50-million-arr-by-year%E2%80%90end/)
- **Lindy** (Flo Crivello, about $50M raised): Feb 2026 relaunch as a personal AI EA. It triages Gmail and Outlook on its own, drafts in the user's voice, schedules, preps for calls, records meetings and sends a daily brief. It also has a phone agent (Gaia) and computer use. — [dupple review (aggregator)](https://dupple.com/reviews/lindy)
- **Superhuman**: Grammarly announced the acquisition June 30, 2025, and closed it in July 2025. On Oct 29, 2025 the parent company was renamed "Superhuman". — [BusinessWire](https://www.businesswire.com/news/home/20250630889937/en/Grammarly-to-Acquire-Superhuman-to-Accelerate-Its-AI-Productivity-Platform); [Superhuman blog](https://blog.superhuman.com/superhuman-is-being-acquired-by-grammarly/)
- **Shortwave**: AI Gmail client (ex-Google Inbox team). Tasklet agent layer launched Jan 2026 for multi-step email automation. Runs on the Claude Sonnet and Opus 4.6 family (aggregator). — [aitoolscoop](https://aitoolscoop.com/tool/shortwave/); [cmdk.email](https://cmdk.email/post/shortwave-review/)

### Inferences
- The products that act (Poke, Fyxer, Lindy) win on low-friction channels such as iMessage and the inbox, and on immediate time saved. Their memory is narrow and recent. Cognition buying Poke for its interaction design suggests the "personality plus proactive texting" layer is valued separately from data depth.

### Gaps
- Howie, Martin, Alfred: not researched.

## 7. Products that explicitly do "opportunity discovery from your past" or "pattern detection across years of your data"

### Takeaway
No reliable source found a shipped product whose main job is mining years of a person's multi-source archives (email, docs, chats, social, voice) for patterns and opportunities. The nearest examples are pieces: Pulse (proactive, recent), journaling apps (patterns in self-written text), Moonshot (pitch only), Boardy (opportunities over its own network), and Gemini Personal Intelligence (retrieval across years of Gmail and Photos, reactive).

### Cited Findings
- Moonshot (YC) pitches spotting life and emotional trends and open loops. — [YC directory](https://www.ycombinator.com/companies/industry/ai-assistant)
- Mindsera and Rosebud claim "long-term patterns" over journal entries. — [Mindsera](https://mindsera.com/articles/the-7-best-ai-journaling-apps-in-2026-tested)
- A blog frames memory and sense-making as a "quieter category" with strong retention (aggregator, no data). — [businessideasdb](https://businessideasdb.com/blog/ai-business-ideas-2026)

### Inferences
- The gap is real but has warning signs. Incumbents already hold the data and memory (Google, Meta, OpenAI, Anthropic). Startups holding lifelogs get acquired or shut down. Raw recall does not retain users (Screenpipe's DAU-to-install ratio). A winning wedge probably needs a one-off, high-value output (for example, "here is what your last 10 years say about you and three untapped opportunities") that runs over exports or connectors the user already owns, with no new hardware and no permanent hosting of their life data.

### Gaps
- Russia and CIS: not researched in this pass (for example Yandex Alice memory and personalization, Sber GigaChat memory, Russian AI journaling or diary apps). Treat as an open gap.
- No HN or Product Hunt sweep was done for 2026 indie "analyze your life archive" tools (Google Takeout or ChatGPT-export analyzers).
