--Readme document for WENDY LE, wle7@uci.edu--

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

10/10
- 3/3 Summarizing tweets
- 4/4 Identifying the most popular activities
- 3/3 Adding a text search interface

2. How long, in hours, did it take you to complete this assignment?

It took me 8 hours to complete this assignment.

3. What online resources did you consult when completing this assignment? (list sites like StackOverflow or specific URLs for tutorials; describe queries to Generative AI or use of AI-based code completion)

- Vega-Lite documentation and examples
- MDN Web Docs for String.match, Array methods, and toLocaleDateString
- Math.js documentation for math.format

4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?

None. I worked on this assignment by myself.

5. Is there anything special we need to know in order to run your code?

Run `tsc --p tsconfig.json` first to generate js/tweet.js, then open index.html (or use live-server). No bonus feature implemented.
Notes: tweets are categorized by prefix ("Just completed/posted a..." = completed, "Watch my...Live" = live, personal record/goal = achievement). 
    Written text is whatever follows the first " - " in a completed tweet, excluding the "TomTom MySports Watch" default. 
    Distances in km are converted at 1 mi = 1.609 km. Search matches only the user-written text, case-insensitively.
