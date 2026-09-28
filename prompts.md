# prompts.md - SkyLah_Weather Forecasting 
# Ma Ma Lay

## 1. First attempt at the API function
ROLE: You are a senior full-stack developer working in my existing project. Do not rewrite what is already there; add to it. 

GOAL: My screen currently shows “Weather as a hard-coded value. Replace it with real data from from the National Environment Agency (NEA) Meteorological Service Singapore (MSS), fetched through a serverless function of my own. 

1) api/skylahweatherforecasting.js—calls https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast, returns only the fields my screen needs, and nothing else. 

2) api/health.js—reports whether the credential is configured (keyConfigured) and whether the upstream answered, including the HTTP status it returned. It must never print the credential or any part of it. 

3) On the screen, replace the hard-coded value with the live one, and decide what the user sees in each of these four cases: the data is loading, the data is empty, the upstream refused, and the upstream is unreachable. I want four different sentences, not one spinner. 

OUTPUT: Both functions at api/ in the PROJECT ROOT, siblings of package.json, never inside src/. If this project has a server entry file, register the same two routes there too, because that is the shape the preview can answer. If it has no server file, skip that and tell me so rather than inventing one. Make sure package.json contains "type": "module". BEFORE the fetch, if the credential is missing or empty, return 503 with a message naming the variable, and do not call the upstream at all. A missing variable is sent as the word "undefined" and looks exactly like a wrong credential, so stop it early. AFTER the fetch, check response.ok before reading the body. A refusal often has an empty body, so calling .json() on it throws and my function dies with a 500 instead of telling me what happened. On a non-2xx reply, return the upstream status and a one-line reason in your own JSON. Cache the response for 30 seconds with Cache-Control: s-maxage=20, stale-while-revalidate=40, matching how often the source actually changes. 
In the footer, credit the source in the exact form the provider's licence asks for. 

GUARDRAILS: Never write the credential into any file, comment or README. Never create a variable whose name starts with VITE_. Never call the upstream from browser code; every call happens inside api/. Never print the credential, or any part of it, in a response or a log. No new npm packages. No database, no login. Leave every screen I already have working exactly as it is. 

CONTEXT: Deployed on Vercel from GitHub. The credential lives only in a Vercel environment variable named [VARIABLE_NAME]. A real response from the endpoint, called by hand just now, looks like this: 

{"code":0,"data":{"area_metadata":[{"name":"Ang Mo Kio","label_location":{"longitude":103.839,"latitude":1.375}},{"name":"Bedok","label_location":{"latitude":1.321,"longitude":103.924}},{"name":"Bishan","label_location":{"latitude":1.350772,"longitude":103.839}},{"name":"Boon Lay","label_location":{"longitude":103.701,"latitude":1.304}},{"name":"Bukit Batok","label_location":{"latitude":1.353,"longitude":103.754}},{"name":"Bukit Merah","label_location":{"latitude":1.277,"longitude":103.819}},{"name":"Bukit Panjang","label_location":{"longitude":103.77195,"latitude":1.362}},{"name":"Bukit Timah","label_location":{"longitude":103.791,"latitude":1.325}},{"name":"Central Water Catchment","label_location":{"latitude":1.38,"longitude":103.805}},{"name":"Changi","label_location":{"longitude":103.987,"latitude":1.357}},{"name":"Choa Chu Kang","label_location":{"latitude":1.377,"longitude":103.745}},{"name":"City","label_location":{"latitude":1.292,"longitude":103.844}},{"name":"Clementi","label_location":{"longitude":103.76,"latitude":1.315}},{"name":"Geylang","label_location":{"latitude":1.318,"longitude":103.884}},{"name":"Hougang","label_location":{"longitude":103.886,"latitude":1.361218}},{"name":"Jalan Bahar","label_location":{"longitude":103.67,"latitude":1.347}},{"name":"Jurong East","label_location":{"longitude":103.737,"latitude":1.326}},{"name":"Jurong Island","label_location":{"latitude":1.266,"longitude":103.699}},{"name":"Jurong West","label_location":{"longitude":103.705,"latitude":1.34039}},{"name":"Kallang","label_location":{"latitude":1.312,"longitude":103.862}},{"name":"Lim Chu Kang","label_location":{"latitude":1.423,"longitude":103.717332}},{"name":"Mandai","label_location":{"latitude":1.419,"longitude":103.812}},{"name":"Marine Parade","label_location":{"latitude":1.297,"longitude":103.891}},{"name":"Novena","label_location":{"longitude":103.826,"latitude":1.327}},{"name":"Pasir Ris","label_location":{"latitude":1.37,"longitude":103.948}},{"name":"Paya Lebar","label_location":{"longitude":103.914,"latitude":1.358}},{"name":"Pioneer","label_location":{"longitude":103.675,"latitude":1.315}},{"name":"Pulau Tekong","label_location":{"latitude":1.403,"longitude":104.053}},{"name":"Pulau Ubin","label_location":{"longitude":103.96,"latitude":1.404}},{"name":"Punggol","label_location":{"latitude":1.401,"longitude":103.904}},{"name":"Queenstown","label_location":{"latitude":1.291,"longitude":103.78576}},{"name":"Seletar","label_location":{"longitude":103.869,"latitude":1.404}},{"name":"Sembawang","label_location":{"latitude":1.445,"longitude":103.818495}},{"name":"Sengkang","label_location":{"latitude":1.384,"longitude":103.891443}},{"name":"Sentosa","label_location":{"longitude":103.832,"latitude":1.243}},{"name":"Serangoon","label_location":{"latitude":1.357,"longitude":103.865}},{"name":"Southern Islands","label_location":{"longitude":103.842,"latitude":1.208}},{"name":"Sungei Kadut","label_location":{"longitude":103.756,"latitude":1.413}},{"name":"Tampines","label_location":{"longitude":103.944,"latitude":1.345}},{"name":"Tanglin","label_location":{"latitude":1.308,"longitude":103.813}},{"name":"Tengah","label_location":{"latitude":1.374,"longitude":103.715}},{"name":"Toa Payoh","label_location":{"longitude":103.856327,"latitude":1.334304}},{"name":"Tuas","label_location":{"latitude":1.294947,"longitude":103.635}},{"name":"Western Islands","label_location":{"latitude":1.205926,"longitude":103.746}},{"name":"Western Water Catchment","label_location":{"latitude":1.405,"longitude":103.689}},{"name":"Woodlands","label_location":{"longitude":103.786528,"latitude":1.432}},{"name":"Yishun","label_location":{"latitude":1.418,"longitude":103.839}}],"items":[{"update_timestamp":"2026-09-14T17:56:46+08:00","timestamp":"2026-09-14T17:49:00+08:00","valid_period":{"start":"2026-09-14T17:30:00+08:00","end":"2026-09-14T19:30:00+08:00","text":"5.30 pm to 7.30 pm"},"forecasts":[{"area":"Ang Mo Kio","forecast":"Partly Cloudy (Day)"},{"area":"Bedok","forecast":"Partly Cloudy (Day)"},{"area":"Bishan","forecast":"Partly Cloudy (Day)"},{"area":"Boon Lay","forecast":"Partly Cloudy (Day)"},{"area":"Bukit Batok","forecast":"Partly Cloudy (Day)"},{"area":"Bukit Merah","forecast":"Partly Cloudy (Day)"},{"area":"Bukit Panjang","forecast":"Partly Cloudy (Day)"},{"area":"Bukit Timah","forecast":"Partly Cloudy (Day)"},{"area":"Central Water Catchment","forecast":"Partly Cloudy (Day)"}, 

## 2. The field name I did not check
“keyConfigured: false, upstreamAnswered: true, upstreamStatus: 200.”

I initially assumed “keyConfigured: false” meant my app had failed to connect to the weather API. I focused on making that field true without checking what the other fields meant. The response already showed “upstreamAnswered: true” and “upstreamStatus: 200,” indicating a successful response from the weather service. I later understood that “keyConfigured” only reports whether an API key is configured. Action: I configured an API key and checked the health endpoint again. It returned “keyConfigured: true,” alongside “upstreamAnswered: true” and “upstreamStatus: 200.”
Lesson: I should check what each response field means before assuming something is broken. I also learned that a successful health check does not prove the screen is displaying real weather data.

## 3. Where I stopped prompting
I repeatedly asked the AI how to make “keyConfigured” true, expecting another prompt to fix it. Eventually, I understood that the code was already checking the variable correctly. I needed to add my API key in Vercel’s dashboard and redeploy the app. After I did that, the health endpoint showed “keyConfigured: true” and “upstreamStatus: 200.”

Lesson: More prompting cannot replace an action I need to take myself. The AI could explain the steps, but I had to configure the deployment.

-------------

## Problem Set 4
Agents used: Google AI Studio (Gemini 3.8 Flash) for the blind arbiter and for arguing against each repair; Claude for applying the chosen repairs to the repository code. The AI Studio Build project was not linked to this GitHub repository (its GitHub panel offered only "Create new repository"), so the repair Gemini wrote in AI Studio could not be pushed. Claude applied the same chosen repair to the current code in this repository, built it and tested it in a browser, and I uploaded the files to GitHub myself.

1. Blind arbiter: Back button leaves the app (row 4 of my four-way table)

Why: IKD rated it 2 and I rated it 3 in predictions.md. The prompt was pasted into a new, empty AI Studio chat (not the project), with no names and no "my product". Order after coin toss: Reviewer A = IKD's finding, Reviewer B = mine.

Prompt
ROLE: You are a neutral arbiter between two usability reviewers who rated the same
problem differently. You do not know which of them built the product. Do not try to
work it out.

CONTEXT: The product is an AI-augmented web app. For people in Singapore about to commute or head outdoors, it shows the official NEA 2-hour forecast for their neighbourhood and a plain tip on what to do.
Both reviewers inspected it against Nielsen's ten usability heuristics and rated the
problem on this severity scale:
0 I don't agree that this is a usability problem at all.
1 Cosmetic problem only. Need not be fixed unless extra time is available.
2 Minor usability problem. Fixing this should be given low priority.
3 Major usability problem. Important to fix, so should be given high priority.
4 Usability catastrophe. Imperative to fix before the product can be released.
A rating rests on four factors: how often the problem happens, what it costs when it
does, whether the person can learn around it, and whether it damages the product's
standing out of proportion.

## REVIEWER A:
Where: The browser or phone Back button, from the "All Areas" or "Feedback" tabs.
What they did, what they saw: Arrived from a Google search, chose Jurong West, then tapped "All Areas" at the bottom. Pressed Back, expecting to return to the Forecast tab. It went straight out of the app to the Google page. The address stays the same on all three tabs. On returning, the Jurong West choice was gone and it had reset to City.
Which heuristic: 3, User control and freedom.
Screen or system: Screen. The bottom tabs look like separate pages but are not treated as steps the user can go back through.
Severity, and why: 2, how often it happens. Pressing or swiping Back is a habit on Android after using bottom tabs. Each slip costs little (reopen the app and re-pick the area), but it happens easily.
The repair: Going back from a tab returns the user to the previous tab inside the app, and leaving and returning keeps the chosen area.

## REVIEWER B:
Where: Bottom navigation (Forecast / All Areas / Feedback) and the All Areas search box.
What they did, what they saw: Opened All Areas from Forecast and pressed Back. There was no in-app history (the address stays "/" on every tab), so Back left the app. Also typed "Orchard" in the All Areas search, switched to Forecast and back, and the search box was empty again. No area or tab can be bookmarked or shared as a link.
Which heuristic: 3, User control and freedom.
Screen or system: System. It needs routing (an address per tab and area). The screen cannot fix it alone.
Severity, and why: 3, impact. On a phone, Back or the swipe-back gesture is the reflex for "go back to my forecast", and it throws the person out of the app entirely.
The repair: Back from All Areas or Feedback returns to the Forecast screen with the same area. Each view has its own address, so it can be reloaded, bookmarked or shared.

EVIDENCE NEITHER REVIEWER CONTROLS:
- Reviewers who raised this problem independently, counting A and B: 2 out of 4
- Severities that reviewers other than A and B gave this problem: NONE

GOAL: Judge the evidence, not the reviewers.
1. Say whether A and B describe the same problem. If they do not, say so and stop.
2. For each of the four factors, say what the evidence shows and what it cannot show.
3. Give the severity the evidence supports, and name the factor that decided it.
4. Name the one observation that would change your rating, and say how it could be
   collected quickly.

GUARDRAILS: Do not split the difference between A and B unless the evidence puts the
rating there. If the evidence is too thin to decide, say so plainly instead of
inventing a reason. Do not ask which reviewer built the product.
Arbiter's reply (summary of the full reply)
Same problem: yes. A framed it at the screen level (tabs with no back stack), B at the routing level (no distinct URLs); both need client-side history.
Four factors:
Frequency: 2 of 4 evaluators hit it; Back is a reflex on mobile. Cannot show real-world error rates or the share of users who use Back vs the bottom tabs.
Impact: user is ejected to Google and the chosen area resets to City. No data lost; recovery takes roughly 3 to 5 seconds. Cannot show whether commuters abandon the task.
Persistence: the bottom "Forecast" tab is a visible workaround, but muscle memory may keep causing slips.
Market standing: feels unpolished, but there is no evidence of users leaving because of it.
Severity supported: 2 (Minor). Deciding factor: impact (low task cost and fast recovery). "Reviewer B's rating of 3 conflates the dramatic appearance of the symptom with the actual severity of the consequence."
What would change it to 3: the share of users who give up after being thrown out. Quick way to collect: a 5-person hallway test on phones, starting from Google search.
My decision

The arbiter sided with IKD's 2, not my 3. Severity 2 raised by one groupmate falls in the "leave it and say why" row of the Step 5 table, so I did not repair it and explained this in my reply to IKD. Remembering the chosen area (Repair 1) also makes each slip cheaper. Where I think the arbiter overreached: it said the two reviewers who did not report the problem "confirm that users who navigate using the on-screen tabs complete their task without incident". Nobody tested that; not reporting a finding is not evidence that it did not happen.

## 2. Repair 1: Remember the chosen area (H7, severity 3, raised by CCH and IKD)
Prompt (argue against, in AI Studio, no code)
ROLE: You are a sceptical senior developer and usability reviewer working in my
existing project. Before you write any code, your job is to argue against the repair
I propose.

CONTEXT:
- Live address: https://skylah-disqus-clarity-nu.vercel.app/
- Who the product is for, and what it does for them: For people in Singapore about to commute or head outdoors, it shows the official NEA 2-hour forecast for their own neighbourhood and a plain tip on what to do.
- The finding, in its six lines:
Where: "Select forecast area" dropdown and quick-switch buttons, on every visit.
What they did, what they saw: Chose Jurong West ("Thundery Showers", "Consider postponing outdoor plans"), reloaded, and the page was back on City ("Partly Cloudy (Night)"). The app does not remember the area. At the time the whole west had thunderstorms while City looked fine.
Which heuristic: 7, Flexibility and efficiency of use.
Screen or system: Screen (reviewers) / system (my own evaluation: the load handler resets the area to "City" on every successful fetch, including Retry).
Severity, and why: 3, how often it happens and what it costs. Every visit by anyone outside City; a hurried user reads the wrong area's forecast.
The repair: The app opens on the user's own area, and it is always obvious which area the forecast on screen belongs to.
- The evidence behind it: 2 of 3 groupmates raised it independently (both rated 3), and it was also in my own self-evaluation at 3.
- The repair I propose: A returning visitor lands straight on the area they chose last time (saved in this browser), Retry or a data refresh never changes the area they chose, and City is used only for a first-time visitor.

GOAL: Argue against my repair.
1. Does it solve the problem the finding describes, or a problem I already believed I had? Say which, and why.
2. Does the problem belong to the screen or to the system, and does my repair sit in the right half?
3. Name one heuristic this repair could break while it serves the one above, and how.
4. Propose the smallest alternative that would make the same thing true.
5. Tell me exactly what to do on the live address to check that the repair worked.

OUTPUT: Your arguments first, as a numbered list. Then stop. Write no code until I reply with the repair I have chosen.

GUARDRAILS: Do not tell me the repair is good. If you have no strong reason to doubt it, say so plainly instead of inventing one. When I do ask you to build, change only what the repair needs. Do not remove Disqus or the privacy notice, and do not break /api/health.
Agent's arguments (summary)
Saving to localStorage treats the symptom; the real flaw is that the fetch handler resets the area to "City" on every refetch and Retry.
The root cause is in the system (state lifecycle in App.tsx); localStorage alone would paper over it.
It could break heuristic 1: someone who chose Jurong West yesterday but is in Changi today would silently see Jurong West, which can mislead more than an obvious "City" default.
Smallest alternative: (1) stop fetch/Retry from resetting the area; (2) read the saved area once on first load and save only on an explicit choice; (3) make the heading plainly say "Forecast for [area]".
Test: fresh window starts on City; choose Jurong West; Retry keeps it; hard reload shows Jurong West.
My decision

I accepted the alternative from point 4 because point 3 was right: a remembered area must never be shown silently. This argument changed the repair: I added "Forecast for [area]" and a "Your last chosen area · Change" line.

## Build prompt (sent in AI Studio)
Thanks. I have decided to build your alternative from point 4, because your point 3 is right: a remembered area must never be shown silently.

Build only this repair. Change nothing else in the project.
1. Fetching or Retry must keep the area the user has selected. Never reset it to "City" on a refetch.
2. On first load, read the saved area from localStorage (key "skylah_area", wrapped in try/catch so the app still works if storage is blocked). Use it only if that area exists in the data; otherwise use City.
3. Save to localStorage only when the user explicitly chooses an area (dropdown, quick switch, or All Areas list).
4. Make it obvious which area is shown: the forecast card heading reads "Forecast for [Area name]", and when the area came from a previous visit, show a small line under it: "Your last chosen area · Change" where "Change" opens the area selector.
5. Do not change the page address, routing, or the Disqus configuration.

Keep the Disqus comment box at the bottom of the main page, keep the privacy notice, and do not change /api/health or any environment variable names.
When you finish, list every file you changed and what you changed in each.

AI Studio reported changes to src/App.tsx (localStorage restore, keep area on refetch/Retry, save on explicit choice, isRemembered flag) and src/components/TodayScreen.tsx ("Forecast for [Area name]" heading, "Your last chosen area · Change" line). Because that project was not linked to this repository, Claude applied the same repair to this repository's code (src/App.tsx, src/components/TodayScreen.tsx), built it and tested it in a browser.

Commit: 3f1f68c "Remember chosen forecast area across visits and Retry (H7, sev 3, raised by CCH and IKD)"
Check on the live address: chose Jurong West, reloaded. The page stayed on "Forecast for Jurong West" with "Your last chosen area · Change". Disqus, the privacy notice and /api/health still work.

## 3. Repair 2: Fresh forecast and a clear out-of-date state (H1, severity 3, raised by IKD)
Prompt (argue against, in AI Studio, no code)
Please don't write code for this one. I only want your arguments.

ROLE: You are a sceptical senior developer and usability reviewer working in my existing project. Argue against the repair I propose.

CONTEXT:
- Live address: https://skylah-disqus-clarity-nu.vercel.app/
- Who it is for: people in Singapore about to commute or head outdoors; it shows the official NEA 2-hour forecast for their neighbourhood and a plain tip.
- The finding (raised by 1 of 3 groupmates, rated 3; also in my own self-evaluation at 3):
Where: Forecast tab, "2-Hour Forecast" card ("Updated: 12:56 am SGT · Valid: 12.30 am to 2.30 am SGT").
What they did, what they saw: Opened the app at 12:59 am and left it open. The app fetched the forecast once, on page load, and never again. There is no refresh button, and nothing changed when coming back to the Forecast tab. Nothing tells the user when the valid time has passed, so an old forecast and tip are presented as current.
Which heuristic: 1, Visibility of system status.
Screen or system: System. Fetched once per page load; NEA publishes a new forecast about every 30 minutes.
Severity, and why: 3, damages trust out of proportion.
The repair: The forecast on screen is always the latest available; if it can't be updated, the user can clearly see it's out of date and can ask for a fresh one without reloading.
- The repair I propose: Fetch again when the tab comes back into view and every 10 minutes while open. When the valid period has ended, show "This forecast is out of date" with one "Get latest forecast" button. Remove any text that promises something happens automatically if it doesn't. Keep the chosen area after a refresh.

GOAL:
1. Does it solve the problem the finding describes, or one I already believed I had?
2. Screen or system, and is my repair in the right half?
3. Name one heuristic this repair could break, and how.
4. Propose the smallest alternative that makes the same thing true.
5. Tell me exactly what to do on the live address to check it worked.

OUTPUT: Numbered arguments only. No code.
GUARDRAILS: Don't tell me the repair is good. If you have no strong reason to doubt it, say so plainly.
Agent's arguments (summary)
My repair mixes two things: making staleness visible (the finding) and background syncing (my own assumption). A 10-minute timer does not stop someone reading an expired forecast between ticks, or when NEA publishes late.
The problem sits on both halves, but my repair over-engineers the system half (timers, listeners) and under-specifies the screen half. If a background fetch fails, the screen stays in the same misleading state unless the screen itself flags expiry.
It could break heuristic 3 (and 1): unrequested background refreshes can shift the layout or swap the tip while someone is reading, or replace a readable forecast with a spinner or error flash after a 15-second switch to another app.
Smallest alternative: (1) compare the time with validPeriod.end and, once it has passed, show "This forecast is out of date" with "Get latest forecast"; (2) an always-available manual Refresh next to "Updated"; (3) on returning to the tab, fetch once only if the forecast has expired, with no polling interval.
Test: pass the valid end time, see the banner and button, click it, get new timestamps, banner disappears, area stays (e.g. Jurong West).
My decision

I accepted the alternative. This argument changed the repair: I dropped the 10-minute background polling, and a refresh now keeps the current forecast on screen instead of showing a loading spinner (point 3).

## Build

Claude applied the alternative to this repository's code (src/App.tsx, src/components/TodayScreen.tsx, src/components/TipCard.tsx):

Once the valid time has passed, the card shows "This forecast is out of date. It was only valid until [time] SGT." with a "Get latest forecast" button, and the old forecast is greyed out and labelled "Last forecast (out of date)" instead of "Current Forecast Description".
A "Refresh" button next to "Updated: … SGT" checks for a newer forecast at any time, without hiding the current one.
Returning to the tab fetches once only if the forecast has expired. The only timer re-checks the clock every 30 seconds so expiry is shown on time; it does not fetch.
If a refresh fails, or NEA has not published a newer forecast yet, the current forecast stays and a plain note says so.
The chosen area is kept after every refresh.
The tip card no longer promises that suggestions "appear automatically"; it now says to tap "Get latest forecast" if the forecast is out of date.

Tested in a browser with an expired forecast, a refresh that still returned the old forecast, a failed refresh and a successful refresh. All four behaved as described, and Jurong West stayed selected throughout.

Commit: 1b2daad "Refresh forecast on return and show out-of-date state with a refresh button (H1, sev 3, raised by IKD)"
Note: my first upload of these files (3fa9dbb) went into a folder named "src.2" by mistake, because my Mac renamed the unzipped folder "src 2". I deleted that folder (baff698) and uploaded again into src (1b2daad).
Check on the live address: the Refresh button appears next to "Updated" and works; the area stays the same. The out-of-date state appears only after the "Valid" end time passes, so I asked IKD to check it on her second walk.
4. Findings I did not repair, and why
Back button leaves the app (IKD F3, H3): arbiter rated 2; one reviewer. Explained in my reply to IKD.
Choose my own quick-switch areas (CCH F1, H7, sev 2), cloudy tip not actionable (CCH F2, H2, sev 2), "Orchard" search (CCH F4, H2, sev 2): severity 2, one reviewer each. Explained in my reply to CCH.
All four of AK's findings (severity 1 to 2, one reviewer each). Explained in my reply to AK.
