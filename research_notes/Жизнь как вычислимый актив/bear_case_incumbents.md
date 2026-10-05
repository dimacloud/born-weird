# Bear case: "life experience as a computable asset" products, and incumbent absorption

Research date: 2026-10-05. About 22 searches/fetches. Source quality varies: TechCrunch, a16z, Simon Willison, Bloomberg and Zenity are primary or near-primary. Several 2026 items come from secondary aggregators (igeeksblog, roborhythms, usewire, voxbooster) and are marked as such.

## 1. Postmortems: why personal-AI, lifelogging and memory products failed or pivoted

### Takeaway
None of these products died because the AI was too weak. They died from three things: no daily habit (people tried it once and left), hardware and privacy friction, and acquisition by a platform that wanted the team and the IP rather than the product. The best-funded "AI that knows you" startups (Inflection Pi, Rewind/Limitless, Humane, Dot) all ended as acquihires, asset sales or shutdowns between 2024 and 2025.

### Cited Findings
- **Dot (New Computer)**: an AI "friend and companion" that grew more personalized over time. It launched in 2024 and announced its shutdown in September 2025, with service ending October 5. The stated reason was that the founders' visions diverged after "a year exploring how we could expand from personal intelligence to social intelligence." The shutdown came amid wider scrutiny of companion-chatbot safety. — [TechCrunch](https://techcrunch.com/2025/09/05/personalized-ai-companion-app-dot-is-shutting-down)
- **Rewind → Limitless → Meta (Dec 2025)**: Meta acquired Limitless, maker of a $99 pendant that recorded, transcribed and summarized conversations, and folded it into Reality Labs under the "personal superintelligence" banner. Limitless stopped selling the pendant to new customers and supports existing users for at least a year, on a free "Unlimited" plan. The original Rewind desktop-recording features are being wound down. — [TechCrunch](https://www.techcrunch.com/2025/12/05/meta-acquires-ai-device-startup-limitless/); [Outlook Business](https://www.outlookbusiness.com/corporate/meta-acquires-ai-wearables-start-up-limitless-as-it-doubles-down-on-personal-superintelligence); [TechInformed](https://techinformed.com/meta-acquires-limitless-pendant-users-moved-to-free-unlimited-plan/)
- **Humane AI Pin**: sold to HP for $116M, covering the Cosmos platform, staff and more than 300 patents and applications. Devices stopped working on Feb 28, 2025, and user data not downloaded was lost. By mid-2024 only about 8,000 units remained with customers, and daily returns outpaced purchases. — [Tom's Guide](https://www.tomsguide.com/ai/the-humane-ai-pin-is-officially-dead-and-hp-is-picking-up-humanes-leftovers); [Benzinga](https://www.benzinga.com/tech/25/02/43803887/humanes-ai-pin-dubbed-as-potential-iphone-killer-dies-this-month-as-company-sells-to-hp-for-116-million-amid)
- **Inflection Pi**: $1.5B raised. In March 2024 its CEO, chief scientist and most staff left for Microsoft, and Inflection pivoted to an enterprise API, effectively abandoning the consumer "personal AI" Pi. — [Forbes AU](https://www.forbes.com.au/news/innovation/ai-unicorn-inflection-abandons-its-chatgpt-challenger-as-ceo-joins-microsoft/); [BNN](https://www.bnn.ca/inflection-ai-plans-pivot-after-most-employees-go-to-microsoft-1.2049041)
- **Friend pendant**: an always-listening AI companion. It spent about $1M on more than 11,000 NYC subway-car ads, which were widely defaced ("AI is not your friend", "surveillance tool"). About 3,000 units sold and 1,000 shipped, roughly $348K revenue at about 400 units a week. It became a symbol of the backlash against AI. — [Fortune](https://www.fortune.com/2025/10/01/who-is-avi-schiffmann-friend-ai-pendant-necklace); [KRDO/CNN](https://krdo.com/news/2025/11/16/how-this-tiny-device-became-a-symbol-for-the-backlash-against-ai/); [ContentGrip](https://www.contentgrip.com/friend-nyc-subway-campaign/)
- **Microsoft Recall** (screen lifelogging): announced May 2024, pulled and reworked as opt-in after heavy criticism. Signal blocked it with a DRM screenshot flag ("Microsoft has simply given us no other option"). Brave and AdGuard block it by default, citing screenshots of private chats and card entry. — [Engadget](https://engadget.com/ai/brave-and-adguard-now-block-microsoft-recall-by-default-152601475.html); [Wikipedia: Windows Recall](https://en.wikipedia.org/wiki/Windows_Recall)
- **Character.AI**: MAU peaked at about 28M in mid-2024 and fell to about 20M by early 2025. Valuation fell from about $2.5B to about $1B. Causes cited: the founders' return to Google in a $2.7B deal, wrongful-death litigation, an under-18 chat ban (announced Oct 29, 2025), ads and model retirements. Secondary source, so treat the numbers as approximate. — [RoboRhythms](https://www.roborhythms.com/what-happened-to-character-ai/)
- **Google Now / Snapshot** (proactive cards): Google retired the Now brand in 2016 and replaced its cards with Feed. The successor, Snapshot (2018), "never took off": a 2020 reader poll found many users did not know it existed. Google later killed it. — [Wikipedia: Google Now](https://en.wikipedia.org/wiki/Google_Now); [Android Police](https://www.androidpolice.com/google-is-killing-snapshot-the-now-replacement-that-never-took-off/)

### Inferences
- The pattern repeats: a startup proves people want an "AI that remembers you." Then a platform (Meta, Microsoft, HP, Google) buys the team or IP, shuts the product down and ships the idea as a feature. Exit by acquihire is plausible; building an independent company is not.
- Always-on capture (Recall, Friend, Limitless) carries a social and privacy cost that hits the people around the user, not only the user. Products built on passive recording face resistance from third parties (Signal, Brave, the NYC public).
- Data loss at shutdown (Humane, Dot, Rewind desktop) teaches users that a startup is an unsafe custodian of their life data. That is a structural trust handicap against Google and Apple.

### Gaps
- Not researched this pass (no fresh sources gathered): Mem.ai struggles (searches returned only Mem0), Personal.ai, HereAfter, MyLifeBits, Evernote, Jawbone, personal-CRM churn, "second brain" fatigue. My recollection: Mem.ai cut staff and repositioned in 2024, and Evernote cut most of its staff after the 2022 Bending Spoons acquisition. Both are unverified here.
- Rabbit R1 usage numbers: not found. Widely reported in 2024 as about 5,000 daily users at one point; not verified here.

## 2. Retention: is self-discovery a "wow once" curiosity rather than a habit?

### Takeaway
The data strongly favors "wow once." Consumer AI is winner-take-most around ChatGPT, novel AI experiences retain poorly, and AI apps churn faster than non-AI apps. Even OpenAI's own new features "have not broken through" on retention.

### Cited Findings
- ChatGPT has 800–900M weekly users. Fewer than 10% of ChatGPT weekly users visited another major model provider, and only 9% of consumers pay for more than one AI subscription. — [a16z State of Consumer AI 2025](https://a16z.com/state-of-consumer-ai-2025-product-hits-misses-and-whats-next/)
- ChatGPT DAU/MAU is 36% versus Gemini's 21%. Month-12 desktop retention is 50% for ChatGPT versus 25% for Gemini; month-12 paid retention is 68% versus 57%. — [a16z](https://a16z.com/state-of-consumer-ai-2025-product-hits-misses-and-whats-next/)
- Sora had more than 12M downloads but under 8% D30 retention, against more than 30% for top consumer apps. On OpenAI's new features, a16z writes that "none of the new experiences have truly broken through in terms of either usage or retention." Google's Portraits, Doppl, Whisk and Gems saw "relatively muted traction," and AI Mode reaches about 2% of weekly Search users. — [a16z](https://a16z.com/state-of-consumer-ai-2025-product-hits-misses-and-whats-next/)
- RevenueCat 2026 benchmarks (115K+ apps): AI apps earn 41% more revenue per customer but churn 30% faster than non-AI apps. — via [LetsDataScience](https://letsdatascience.com/news/consumer-ai-returns-retention-will-decide-winners-36738207) (secondary)
- AI companion engagement is real but concentrated in emotional and companion use: about 705M hours on companion apps versus about 280M on dating apps in Q1 2026, with about $120M in 2025 mobile revenue. — [VoxBooster stats compilation](https://voxbooster.com/blog/ai-companion-apps-statistics-2026) (aggregator, low confidence)

### Inferences
- A "your life as a computable asset" report is structurally a one-time reveal, like a personality test, Spotify Wrapped or a 23andMe result. Retention needs a new input every day, and historical data, by definition, does not change.
- The products that retain (ChatGPT, companions) win on daily utility or emotion, not on insight about yourself. Users stay with the default assistant, so a standalone insight app must justify a second app that 90%+ of users never open.

### Gaps
- No public retention data found for Rosebud, Reflectly, Day One AI or other AI-journaling apps. No Sensor Tower cohort data for reflection apps.
- No hard numbers found on Replika retention.

## 3. Structural headwinds: noise, cold start, connector fragility, OAuth barriers, proactive-notification fatigue

### Takeaway
Distribution and data access favor the incumbents. A third party must pay for and pass Google's restricted-scope audits, faces platform API closures (WhatsApp, January 2026), and must prove that proactive suggestions are not Clippy or Google Now. The history of proactive cards is mostly failure.

### Cited Findings
- Gmail and other restricted Google scopes require a CASA Tier 2 security assessment, renewed annually. The legacy track costs about $15K–$75K and takes weeks to months; newer self-serve labs quote about $540–$1K a year. Developers call it an innovation killer, and middleware (Truto at about $10 per connection, Composio, Nango) exists specifically to get around it. — [Unipile](https://www.unipile.com/integrating-google-oauth-2-0-user-authentication-into-your-app/); [GMass](https://www.gmass.co/blog/google-oauth-verification-security-assessment/); [Truto](https://truto.one/google/); [Composio](https://composio.dev/content/ship-gmail-integration-in-minutes)
- **Platforms closing their pipes**: Meta changed the WhatsApp Business Solution terms (new users from Oct 15, 2025; all from Jan 15, 2026) to bar general-purpose AI assistants. ChatGPT, Copilot, Perplexity, Luzia and Poke had to leave WhatsApp, while Meta AI stays. — [Business Standard](https://www.business-standard.com/technology/tech-news/meta-bans-ai-chatbots-from-whatsapp-business-api-chatgpt-to-shut-down-jan-2026-125102200335_1.html); [respond.io](https://respond.io/blog/whatsapp-chatbot-policy-2026); [APH Networks](https://aphnetworks.com/news/30920-meta-says-no-more-general-purpose-chatbots-whatsapp-except-its-own)
- **ChatGPT Pulse** (Sept 2025): an overnight brief of 5–10 cards drawn from chat history and connected Gmail and Calendar. It is deliberately finite ("stop after a handful of items rather than turn into a feed"), launched for $200 Pro users, with Plus "next" and everyone "eventually." Altman called it his favorite feature. — [Tom's Guide](https://www.tomsguide.com/ai/chatgpt-pulse-is-here-now-ai-starts-the-chat-and-curates-your-feed); [Vaizle](https://insights.vaizle.com/news/openai-launches-chatgpt-pulse-a-once-a-day-brief-inside-chatgpt-that-runs-overnight); [Sentisight](https://www.sentisight.ai/when-will-chatgpt-pulse-be-available-for-plus-and-free-users/)
- Google Now cards, Google's flagship proactive surface, were retired. Its successor Snapshot was buried and unused. — [Android Police](https://www.androidpolice.com/google-is-killing-snapshot-the-now-replacement-that-never-took-off/)

### Inferences
- An "opportunity alerts" feature collides with notification fatigue. OpenAI's own design (capped, once a day, opt-in) shows the incumbent has already learned the Clippy lesson and set the norm for proactive AI.
- Connector fragility is policy risk, not just engineering risk. A single platform's terms change (WhatsApp) or audit regime (Gmail) can remove a third party's data source overnight, while the platform's first-party assistant keeps full access.
- "Historical data is noise": years of email and chat are mostly logistics, newsletters and dead threads. Signal is sparse, and inferences about personality or patterns from it are hard to verify, which invites both Barnum-effect "wow" and later distrust.

### Gaps
- No primary source found on Pulse adoption or reception metrics, or whether it has reached Plus or Free by Oct 2026.
- No study found that quantifies the signal-to-noise ratio of personal email or chat archives, or user trust in AI inferences about the self.

## 4. Autonomous-action risk: prompt injection in email, calendar and memory agents

### Takeaway
Any product that reads your inbox or messages (untrusted input), holds your life data (private data) and can send or act (exfiltration) has all three parts of Willison's "lethal trifecta." It has been exploited repeatedly in Gemini, ChatGPT memory and connectors, and M365 Copilot. No robust fix exists. For a startup, one incident is existential; for an incumbent, it is a patch note.

### Cited Findings
- Willison's "lethal trifecta" is access to private data, plus exposure to untrusted content, plus the ability to communicate externally. Agents with all three can be tricked into leaking data. Documented exploits hit Microsoft 365 Copilot, GitHub MCP, GitLab Duo, ChatGPT, Amazon Q, Slack and others (2023–2025). — [Simon Willison](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)
- **"Invitation Is All You Need"** (Tel Aviv University, Technion and SafeBreach; Black Hat 2025): hidden instructions in a Google Calendar invite made Gemini open smart shutters, turn on a boiler, exfiltrate email and calendar data, track location, open apps and start Zoom calls. Google added detection and user confirmations for high-risk actions in June 2025. — [Tom's Guide](https://www.tomsguide.com/computing/online-security/google-calendar-bug-uses-gemini-to-take-over-smart-home-devices-and-steal-user-data); [Android Authority](https://www.androidauthority.com/gemini-hacked-calendar-invite-smart-homes-3584529)
- **Johann Rehberger, "SpAIware"** (Sept 2024): indirect prompt injection planted false long-term memories in ChatGPT, which then exfiltrated all future chats through image links. Memory turns a one-time injection into a permanent one. — [Dark Reading](https://www.darkreading.com/endpoint-security/chatgpt-memory-feature-prompt-injection)
- **Radware "ZombieAgent"** (Jan 2026): ChatGPT connectors combined with memory made indirect injection from emails and documents persistent across sessions. — [Startup Defense / MITRE ATLAS case](https://www.startupdefense.io/mitre-atlas-case-studies/aml-cs0066-zombieagent-data-exfiltration-attack-on-chatgpt)
- **Zenity Labs "AgentFlayer"**: a 0-click attack on ChatGPT Connectors in which a poisoned shared document triggers data exfiltration. — [Zenity Labs](https://labs.zenity.io/p/agentflayer-chatgpt-connectors-0click-attack-5b41)

### Inferences
- A "digital clone that acts for you" or "agent sending intros" puts the trifecta at maximum exposure. The defensible design is read-mostly with human-confirmed actions, which erodes the "autonomous" value proposition.
- Liability is asymmetric: incumbents absorb incidents, startups do not. Cross-platform aggregation (Gmail + Telegram + LinkedIn in one store) also makes the startup a single high-value breach target.

### Gaps
- No case law or regulatory action found on liability for consumer agent errors. EU AI Act and GDPR obligations for "life profiling" were not researched.

## 5. Incumbent roadmaps: which capabilities become free features within 12–24 months

### Takeaway
Every major platform has publicly committed to "an assistant that knows you": OpenAI's "super assistant," Google's Personal Intelligence, Apple's personal-context Siri, Meta's "personal superintelligence," and Claude and Copilot memory. Personal knowledge search and lightweight life-pattern summaries are already free or bundled. Proactive briefs are shipping. Relationship intelligence and digital clones are next.

### Cited Findings
- **OpenAI**: the "ChatGPT: H1 2025 Strategy" doc, surfaced in DOJ v. Google discovery, aims for a "super-assistant… one that knows you, understands what you care about, and helps with any task," covering calendars, to-dos, emails and gifts across "channels." It names human interaction as a competitor. — [9to5Mac](https://9to5mac.com/2025/06/02/openai-is-coming-for-your-iphone/); [The Decoder](https://the-decoder.com/openai-sees-human-interaction-as-a-competitor-to-chatgpts-super-assistant-ambitions/); [Laptop Mag](https://www.laptopmag.com/ai/open-ai-court-doc-super-assistant)
- **OpenAI hardware**: io acquired for about $6.5B. The device is a screenless, palm-sized "AI companion" made by Foxconn. Per a court filing, it "will not ship to customers before the end of February 2027." — [Channel News](https://www.channelnews.com.au/openai-and-jony-ives-secret-ai-device-hits-technical-delays/); [Complex](https://www.complex.com/life/a/alex-ocho/openai-mystery-device-release-date-jony-ive)
- **OpenAI memory**: reportedly rebuilt its memory architecture in June 2026. Pulse is in production. The free tier now carries ads, which favors deep personalization for ad targeting. — [usewire](https://usewire.io/blog/ai-memory-lock-in-blocks-your-own-product/) (secondary); [itechify](https://itechify.com/2026/08/10/chatgpt-upgrade-2026-free-paid-users/) (secondary)
- **Google**: Gemini "Personal Intelligence" connects Gmail, Photos, Search and YouTube history in one tap, and expanded globally on April 14, 2026. Example: it knows "when your last flight was… what hotel you booked." — [DataCamp](https://www.datacamp.com/blog/gemini-personal-intelligence); [Forklog](https://forklog.com/en/google-empowers-gemini-to-analyse-personal-emails-and-photos/)
- **Apple**: personal-context Siri was delayed from 2025 to 2026. In January 2026 Apple and Google announced a multi-year deal to base Apple's foundation models on Gemini. The features slipped again from iOS 26.4. At WWDC 2026, Apple presented a rebuilt "Siri AI" with personal context across mail, messages, files and photos, on-screen awareness, app actions, cross-device memory over iCloud and a Siri app. — [Financial Express/Reuters](https://thefinancialexpress.com.bd/sci-tech/apple-says-some-ai-improvements-to-siri-delayed-to-2026); [iGeeksBlog](https://www.igeeksblog.com/apple-delays-gemini-powered-siri-features-ios-26-4-ios-27/); [MacRumors WWDC guide](https://macrumors.com/guide/wwdc-2026-what-to-expect); [iGeeksBlog WWDC roundup](https://newsletter.igeeksblog.com/posts/wwdc-2026-roundup-ios-27-siri-ai-apple-intelligence-watchos-27-more)
- **Meta**: Zuckerberg's July 30, 2025 letter says "Personal superintelligence that knows us deeply, understands our goals, and can help us achieve them will be by far the most useful," and that glasses that "see what we see, hear what we hear" will become primary devices. Meta then bought Limitless. — [TechRepublic](https://www.techrepublic.com/article/news-meta-mark-zuckerberg-personal-superintelligence/); [TechRadar](https://techradar.com/ai-platforms-assistants/ai-glasses-will-become-your-primary-computing-devices-according-to-mark-zuckerberg-as-he-ushers-in-the-era-of-personal-superintelligence)
- **Anthropic**: memory expanded to free users and an Import Memory tool for ChatGPT, Gemini and Copilot histories launched in early March 2026 (the import takes about 24h to absorb). Claude chat and Cowork memory were reportedly unified on Aug 25, 2026. — [Bloomberg](https://www.bloomberg.com/news/articles/2026-03-03/anthropic-tries-to-win-users-from-chatgpt-with-memory-feature); [SiliconANGLE](https://siliconangle.com/2026/03/02/anthropic-makes-switching-competitors-easier); [PCWorld](https://pcworld.com/article/3076376/claude-can-now-import-chat-histories-from-chatgpt-and-other-ais.html); [usewire](https://usewire.io/blog/ai-memory-lock-in-blocks-your-own-product/) (Aug 25 date secondary)
- **Microsoft**: Copilot memory reached GA in M365 in 2026, and Grok added persistent memory. — [usewire](https://usewire.io/blog/ai-memory-lock-in-blocks-your-own-product/) (secondary)

### Inferences: commoditization verdict per capability (12–24 months, i.e. Oct 2027–Oct 2028)
| Capability | Verdict | Why |
|---|---|---|
| Personal knowledge search ("find the email where X said Y") | **Free/bundled now** | It is Apple's literal WWDC demo, and Gemini Personal Intelligence and ChatGPT connectors already do it. |
| Life-pattern analysis / "what my history says about me" | **Free within 12 months** | It is a single prompt over memory plus connectors. Pulse and Personal Intelligence already synthesize. Low retention makes it a novelty feature, not a business. |
| Opportunity alerts / proactive briefs | **Bundled, rolling out** | Pulse is live; Google has a decade of proactive-card experience. Incumbents set the cadence norm (finite, daily). |
| Relationship intelligence (who you are drifting from, follow-ups) | **Partly commoditized in 12–24 months** within one ecosystem (Gmail + Calendar + Contacts for Google; Messages + Mail for Apple). Not across ecosystems. | Each incumbent sees only its own graph. |
| Digital clone / acts as you | **Slower.** Incumbents are cautious because of liability and prompt injection, but OpenAI's strategy doc targets "acting on your behalf." | Risk caps everyone; startups bear the risk worse. |
| Two-sided intros / network matching | **Not obviously commoditized** | Needs multi-user consent and network effects, which assistants do not yet do. |

### Gaps
- No primary Apple newsroom source confirming that iOS 27 Siri personal context has actually shipped to users by Oct 2026. The WWDC coverage found is secondary.
- No primary OpenAI source for the June 2026 memory rebuild.

## 6. Where moats remain

### Takeaway
The only credible moats are the things incumbents structurally cannot or will not do: cross-ecosystem neutrality, multi-party network effects, deep vertical workflows, and trust positioning (local-first, user-owned). Even these are under pressure. Platforms close APIs (WhatsApp), memory is becoming portable (Claude import), and accumulated memory is now every incumbent's lock-in strategy, not a startup advantage.

### Cited Findings
- Accumulated memory is "one of the last real switching costs," but memory infrastructure is commoditizing toward bring-your-own-database middleware. — [Activant Capital, "The Memory Moat"](https://www.activantcapital.com/research/the-memory-moat)
- Memory lock-in is "the switching cost every major assistant spent 2026 building." Exports satisfy portability rules but "fail practically because exported data immediately becomes stale." The essay argues for external, user-controlled context containers accessed through standard protocols, which is a possible wedge for a neutral layer. — [usewire](https://usewire.io/blog/ai-memory-lock-in-blocks-your-own-product/)
- Incumbents are attacking each other's memory lock-in: Claude's Import Memory pulls from ChatGPT, Gemini and Copilot. That makes longitudinal state less sticky for everyone, startups included. — [SiliconANGLE](https://siliconangle.com/2026/03/02/anthropic-makes-switching-competitors-easier)
- Neutrality is fragile: Meta removed third-party general-purpose AI from WhatsApp while keeping Meta AI. — [APH Networks](https://aphnetworks.com/news/30920-meta-says-no-more-general-purpose-chatbots-whatsapp-except-its-own)
- Users stick to one assistant (fewer than 10% multi-home), so a neutral layer must ride inside the incumbents (MCP connector, ChatGPT app) rather than compete for a second app slot. — [a16z](https://a16z.com/state-of-consumer-ai-2025-product-hits-misses-and-whats-next/)

### Inferences
- **Cross-platform neutrality is the strongest real gap**: no incumbent sees Gmail + Telegram + WhatsApp + LinkedIn + ChatGPT + Claude history together. But access to each source runs through someone else's terms. The defensible form is local-first or user-held (exports, on-device capture), not cloud OAuth to everything.
- **Longitudinal state is a weak moat**: incumbents accumulate it faster from higher-frequency use, and import tools are eroding it.
- **Two-sided network effects (intros, matching)** are the most defensible, because they need consent from multiple users. That is a social product, not a personal AI, with its own cold-start problem.
- **Vertical niches** (job search, founder fundraising networks, grief/legacy à la HereAfter, therapy-adjacent use) can survive where workflow, compliance or community matter more than raw insight.
- **Trust/privacy positioning** is credible only with architecture behind it (on-device, no cloud copy). Apple is already contesting this ground with Private Cloud Compute.
- **Implication for a "toy" experiment**: build it as a one-time artifact (a shareable reveal, like Wrapped) that rides incumbents' assistants. Do not bet on daily retention or on owning connectors. Treat a successful insight as a feature demo whose likely end state is absorption or acquihire.

### Gaps
- No specific 2025–2026 a16z, Sequoia or NFX essay on personal-AI moats was retrieved; only Activant and smaller blogs. a16z's state-of-consumer data is the only top-tier investor source here.
- No evidence gathered on revenue or retention of any surviving neutral cross-platform personal-AI startup (e.g., Mem0 as infrastructure, Personal.ai) to test the neutrality thesis.
