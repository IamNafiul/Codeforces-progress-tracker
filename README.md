<div align="center">⚡ CODEFORCES PROGRESS TRACKER

🧠 Turn Your Practice Into Progress

A privacy-first browser extension built to help competitive programmers track, understand, and improve their Codeforces journey.

<br><img src="https://img.shields.io/badge/Manifest_V3-7C3AED?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111827" alt="JavaScript"/>
<img src="https://img.shields.io/badge/Chrome-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome"/>
<img src="https://img.shields.io/badge/Brave-FB542B?style=for-the-badge&logo=brave&logoColor=white" alt="Brave"/><br><br>

🟣 PRACTICE → 🔵 TRACK → 🟠 ANALYZE → 🟢 IMPROVE

</div>---

🌈 What Is This?

Codeforces Progress Tracker is a browser extension designed for competitive programmers who want to understand their practice instead of simply counting solved problems.

It transforms your Codeforces activity into useful personal insights.

<div align="center">🧩 Solve

Practice problems and build your skills.

⬇️

📊 Track

Automatically record useful practice data.

⬇️

🧠 Analyze

Discover your strengths, weaknesses, and patterns.

⬇️

🚀 Improve

Use your own data to practice more intentionally.

</div>---

✨ Features

📚 Problem Tracking

Keep a history of the problems you interact with.

Tracks things such as

🆔 Problem information
⭐ Problem rating
🏷️ Problem tags
👀 Visits
⏱️ Time spent
🔄 Practice sessions

---

🎯 Submission Tracking

Understand what happens when you submit a solution.

Possible verdicts include

🟢 Accepted

🔴 Wrong Answer

🟡 Time Limit Exceeded

🟠 Runtime Error

⚪ Other verdicts

«The extension should only report submission information when it can detect it reliably.»

---

🧠 Failure Analysis

Wrong answers are not just failures.

They are data.

You can record:

💭 Why you struggled

📝 What you misunderstood

🔴 Why your solution failed

💡 What you learned

🎯 What you would do differently

Over time, these notes can reveal patterns in your problem-solving.

---

📈 Progress Analytics

Turn your practice history into meaningful statistics.

You can analyze things like

🟢 Problems solved

🔵 Problems attempted

🟣 Acceptance rate

🟠 Rating distribution

🔴 Verdict distribution

🏷️ Topic statistics

🔥 Practice streak

⏱️ Time spent

---

🎨 Dashboard

<div align="center">📊 Track What Matters

🟩 Problems
Solved · Attempted · Rating

🟦 Submissions
Accepted · Wrong Answer · TLE · Runtime Error

🟪 Topics
Tags · Frequency · Weak Areas

🟨 Practice
Time Spent · Sessions · Streak

<br>«Practice → Track → Analyze → Improve»

</div>
---

🧩 How It Works

<div align="center">🌐 CODEFORCES

⬇️

👀 PAGE DETECTION

⬇️

🧠 DATA PROCESSING

⬇️

💾 LOCAL STORAGE

⬇️

📊 DASHBOARD

</div>The extension observes relevant Codeforces pages, processes useful information, stores it locally, and presents it through a dedicated dashboard.

---

🛠️ Built With

<div align="center"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111827"/>
<img src="https://img.shields.io/badge/Chrome_API-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white"/></div>🧱 Architecture

Manifest V3

Modern browser extension architecture.

Vanilla JavaScript

No unnecessary framework overhead.

Chrome Extension APIs

Browser integration and extension functionality.

Chrome Storage API

Local persistence for practice data.

---

🚫 Intentionally No

<div align="center">❌ React

❌ TypeScript

❌ Backend

❌ Database

❌ Authentication

❌ Unnecessary External Services

</div>The goal is to keep the project lightweight, understandable, and focused on the fundamentals.

---

🏗️ Architecture

                    ┌──────────────────┐
                    │   CODEFORCES     │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   CONTENT SCRIPT    │
                  │  Detect & Observe   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    DATA LAYER       │
                  │ Parse & Normalize   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   LOCAL STORAGE     │
                  │   Chrome Storage    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │     DASHBOARD       │
                  │ Analyze & Visualize │
                  └─────────────────────┘

---

📂 Project Structure

⚡ codeforces-progress-tracker
│
├── 📁 src
│   │
│   ├── 📁 popup
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   │
│   ├── 📁 content
│   │   └── content.js
│   │
│   ├── 📁 dashboard
│   │   ├── dashboard.html
│   │   ├── dashboard.css
│   │   └── dashboard.js
│   │
│   └── 📁 utils
│       ├── storage.js
│       ├── codeforces.js
│       └── helpers.js
│
├── 📁 assets
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── 📄 manifest.json
└── 📄 README.md

---

🔐 Privacy First

<div align="center">🔒 YOUR PRACTICE DATA BELONGS TO YOU

</div>🚫 No Account

You don't need to create an account.

🚫 No Backend

Your data does not need to be sent to a server.

🚫 No External Database

Practice data is stored locally.

🚫 No Advertising

The extension is not built around advertisements.

✅ Local First

Your practice history stays in your browser by default.

---

🚀 Installation

🟦 Chrome

01
Clone or download this repository.

02
Open:

"chrome://extensions/"

03
Enable Developer Mode.

04
Click Load unpacked.

05
Select the project folder containing "manifest.json".

06
Open Codeforces.

07
Start solving. 🚀

---

🟧 Brave

01
Open:

"brave://extensions/"

02
Enable Developer Mode.

03
Click Load unpacked.

04
Select the project folder containing "manifest.json".

05
Open Codeforces.

06
Start solving. 🚀

---

🗺️ Roadmap

🟢 Foundation

- [x] Manifest V3
- [x] Extension structure
- [x] Codeforces page detection
- [x] Development environment

---

🔵 Tracking

- [ ] Problem detection
- [ ] Problem metadata
- [ ] Visit tracking
- [ ] Session tracking
- [ ] Time tracking
- [ ] Submission detection
- [ ] Verdict tracking
- [ ] Local persistence

---

🟣 Analytics

- [ ] Statistics dashboard
- [ ] Rating distribution
- [ ] Topic analytics
- [ ] Verdict analysis
- [ ] Failure analysis
- [ ] Practice streak
- [ ] Progress trends

---

🟠 Future

- [ ] Data export
- [ ] Backup and restore
- [ ] Advanced visualizations
- [ ] Performance improvements
- [ ] Chrome Web Store release

---

🧠 Design Philosophy

<div align="center">🎯 ACCURACY

Never fabricate data just to make a feature look impressive.

🧩 SIMPLICITY

Use simple technology and understand every layer.

🔒 PRIVACY

Your competitive programming history should remain yours.

📈 USEFULNESS

Every feature should provide meaningful insight.

</div>---

💡 Why I Built This

Competitive programming isn't just about collecting Accepted verdicts.

It's about understanding:

🧠 How you think

❌ Why you fail

⏱️ Where your time goes

🏷️ Which topics challenge you

📈 Whether your practice is actually improving you

This project makes those patterns visible.

It is also a practical way to learn:

JavaScript
     ↓
Browser Extensions
     ↓
Browser APIs
     ↓
Local Storage
     ↓
Data Modeling
     ↓
Analytics
     ↓
UI / UX
     ↓
Git & GitHub

---

🤝 Contributing

Have an idea?

Found a bug?

Want to improve something?

You're welcome to contribute.

🐛 Bug Reports

Include:

- What happened
- What you expected
- Steps to reproduce
- Browser and version

💡 Feature Ideas

Explain:

- The problem
- Your proposed solution
- Why it would be useful

🔧 Pull Requests

Fork
  ↓
Build
  ↓
Test
  ↓
Pull Request

---

📜 License

License information will be added before the first stable release.

---

<div align="center">⚡ Solve. Track. Analyze. Improve.

Built with ❤️, curiosity, and countless Codeforces problems.

<br>⭐ Star the repository if you find the project interesting.

</div>
