# Ma Ma Lay

# Q.1 Where did the agent make you faster, and by how much?

The agent made me faster when I asked, “Fix the existing SkyLah API integration without rebuilding the app.” It completed the changes in minutes. As a non-programmer, I estimate that understanding and attempting those changes myself would have taken several hours, and I might still have needed help.
This was more than writing something I could have written slowly. Connecting the screen to a serverless function and handling API responses were tasks I could not confidently complete independently. The agent helped me make progress while keeping the existing app.

# Q.2 Where did it cost you time, and whose fault was that?

I lost the most time repeatedly asking how to make “keyConfigured” true, even though “upstreamStatus: 200” already showed a successful connection. My instruction was unfinished: I asked to change a status without understanding whether my goal was to configure a key or display real weather. The agent explained the difference correctly, but its repeated setup instructions also prolonged my focus on the key. I should have asked, “Is the connection working, and why is real weather not showing?” My lesson is to define the actual problem before requesting a fix.

# Q.3 Did it ever hand you something that looked right and was not? 

Yes. The agent helped build a convincing weather screen showing 28°C, a 75% chance of rain, and an umbrella recommendation. Although labelled as demo data, the precise numbers made the app look more capable than it was. When connecting the two-hour forecast API, I learned that it supplied forecast descriptions, not those temperature readings, rain percentages, or 12-hour predictions. Connecting one API would not make every feature real. My lesson was to check each displayed claim against the actual response and keep unsupported values clearly labelled or remove them.

# Q.4 What did you have to know in order to supervise it? 

I needed to know what the two-hour forecast API actually provided. It returned weather descriptions, so it could not support the screen’s 28°C temperature, 75% rain probability, or 12-hour predictions. That helped me distinguish real API data from convincing demo values. To catch less obvious mistakes, I would also need to check that the forecast matched the selected area and was still within its validity period. My responsibility was to verify the source, location, and time behind each claim—not simply accept a screen because it looked realistic.

# Q.5 Which decisions did you keep, and should you have kept more or fewer?

I chose to build a Singapore weather app and brought the assignment’s data.gov.sg API to the agent for integration. Later, I chose to add friendly suggestions based on real forecasts and changed the audience options to “Just me,” “For my child,” and “For my beloved ones.” Other decisions came from the agent. It proposed the loading, empty, refused, and unreachable messages, the cache duration, and how to label unsupported demo data. I accepted those instructions without fully evaluating every choice.

I should have kept more control over what the screen claimed and how clearly it distinguished real forecasts from suggestions and fictional values. The cache duration was also a decision the agent settled before I understood its effect on freshness. However, I could have delegated implementation details more readily instead of repeatedly focusing on making “keyConfigured” true. My role should be to decide what users can trust, while letting the agent implement and test those decisions.

# Q.6 Now scale it up: what does this mean for a team of thirty?

For a team of thirty, I would require a shared record of important decisions, identifying what the agent proposed, who approved it, and how it was checked. I would put a review before changes are merged, with a joint review of the working product midweek so there is time to fix problems before release. Agents could implement code, but a named person would approve data sources, user-facing claims, and how outdated or unavailable data is presented. Reviewers would compare the actual changes with the decision record to catch choices the agent made without approval. My SkyLah experience showed that a successful API response does not prove the screen is displaying trustworthy information. I would therefore require checks of displayed values, source timestamps, and failure messages. I cannot claim these checks are absent in my organisation without investigating, but I would make their ownership and evidence explicit.

