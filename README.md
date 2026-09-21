⚡ Codeforces Progress Tracker

«A privacy-first browser extension that helps competitive programmers track, understand, and improve their Codeforces problem-solving journey.»

Chrome • Brave • Manifest V3 • Vanilla JavaScript

---

🎯 Why?

When practicing Codeforces, it's easy to lose track of:

- How many problems you've actually attempted
- How much time you spend on problems
- Which topics you struggle with
- How often you get Wrong Answer / TLE / Runtime Error
- Whether you're actually improving over time

Codeforces Progress Tracker is built to turn that practice history into useful insights.

---

✨ Features

- 📊 Track Codeforces problem-solving progress
- ⏱️ Track time spent on problem pages
- 📝 Track problem visits and attempts
- 🎯 Track verdicts and submission history
- 🏷️ Analyze problems by topic
- 📈 View solving statistics
- 🔥 Track practice streaks
- 🧠 Identify frequently failed topics
- 📝 Add personal notes and failure reasons
- 💾 Store data locally
- 🌙 Clean dark-mode-friendly interface
- 🔒 Privacy-first — no account or backend required

«Features are only listed here once they are actually implemented and tested.»

---

🛠️ Tech Stack

- JavaScript
- HTML
- CSS
- Chrome Extension APIs
- Chrome Storage API
- Manifest V3

No React.
No TypeScript.
No backend.
No database.
No external server.

---

📂 Project Structure

codeforces-progress-tracker/
│
├── src/
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   │
│   ├── content/
│   │   └── content.js
│   │
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   ├── dashboard.css
│   │   └── dashboard.js
│   │
│   └── utils/
│       ├── storage.js
│       ├── codeforces.js
│       └── helpers.js
│
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── manifest.json
└── README.md

---

🚀 Installation

Chrome / Brave

1. Clone or download this repository.
2. Open:

chrome://extensions/

For Brave:

brave://extensions/

3. Enable Developer mode.
4. Click Load unpacked.
5. Select the project folder containing "manifest.json".
6. Open Codeforces and start solving.

---

📊 Dashboard

The dashboard is designed to provide a clear overview of your practice:

Problems Solved
Problems Attempted
Total Time
Current Streak
Acceptance Rate

Along with:

- Rating distribution
- Topic statistics
- Verdict breakdown
- Failure patterns
- Recent activity

---

🧠 Problem Data

A tracked problem may contain information such as:

Problem ID
Contest ID
Problem Index
Problem Name
Rating
Tags
Visit Count
Time Spent
Submission Count
Verdict
Status
Notes
Failure Reason
Sessions

---

🔐 Privacy

This project is designed with a local-first approach.

Your practice data is stored locally using browser storage.

There is:

- ❌ No account system
- ❌ No personal-data collection
- ❌ No external database
- ❌ No tracking server
- ❌ No analytics service

---

🗺️ Roadmap

- [x] Extension foundation
- [x] Codeforces page detection
- [ ] Problem tracking
- [ ] Automatic submission tracking
- [ ] Time tracking
- [ ] Local data storage
- [ ] Dashboard
- [ ] Topic analytics
- [ ] Failure analytics
- [ ] Streak tracking
- [ ] Export / backup data
- [ ] UI improvements
- [ ] Chrome Web Store release

---

🧪 Development

This project is currently being developed and tested using:

- Google Chrome
- Brave Browser

The project is actively evolving, so some features may change as development continues.

---

🤝 Contributing

Suggestions, bug reports, and improvements are welcome.

If you find a problem or have an idea for a useful feature, feel free to open an Issue or submit a Pull Request.

---

📜 License

License information will be added when the project reaches a stable release.

---

👨‍💻 Author

Nafiul

Built as a personal project to better understand Competitive Programming, JavaScript, Browser Extensions, and Software Development.

---

«Solve. Track. Understand. Improve. ⚡»
