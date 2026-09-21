⚡ Codeforces Progress Tracker

<p align="center">🧠 Turn Your Practice Into Progress

A colorful, privacy-first browser extension for tracking and understanding your Codeforces journey.

<br>"Chrome" (https://img.shields.io/badge/Chrome-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
"Brave" (https://img.shields.io/badge/Brave-FB542B?style=for-the-badge&logo=brave&logoColor=white)
"JavaScript" (https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
"Manifest V3" (https://img.shields.io/badge/Manifest-V3-8A2BE2?style=for-the-badge)

</p>---

🌟 What Is This?

Codeforces Progress Tracker is a browser extension built for competitive programmers who want to go beyond simply counting solved problems.

It transforms your Codeforces practice into meaningful insights:

«📝 Practice → 📊 Track → 🧠 Analyze → 🚀 Improve»

Instead of asking:

"Am I actually getting better?"

you can look at your own data and find out.

---

✨ Features

<table>
<tr>
<td width="50%">📚 Problem Tracking

Automatically keep track of the problems you interact with.

- 🆔 Problem information
- ⭐ Rating
- 🏷️ Tags
- 👀 Visits
- ⏱️ Time spent
- 🔄 Practice sessions

</td><td width="50%">🎯 Submission Tracking

Understand your submission history.

- ✅ Accepted
- ❌ Wrong Answer
- ⏱️ Time Limit Exceeded
- 💥 Runtime Error
- ⚠️ Other verdicts

</td>
</tr><tr>
<td>🧠 Failure Analysis

Your mistakes become useful data.

- 🔴 Common failure patterns
- 🏷️ Difficult topics
- 📝 Personal notes
- 💭 Failure reasons
- 📈 Improvement patterns

</td><td>📊 Analytics

Turn your practice history into insights.

- 📈 Rating distribution
- 🏷️ Topic statistics
- 🎯 Acceptance rate
- 🔥 Practice streak
- ⏱️ Time analysis
- 📋 Recent activity

</td>
</tr>
</table>---

🎨 Dashboard

Your practice at a glance.

╭────────────────────────────────────────────────────╮
│                                                    │
│   🟢 SOLVED        🔵 ATTEMPTED       🟣 STREAK    │
│      127              184              14 days     │
│                                                    │
│   🟡 TIME           🔴 ACCEPTANCE     🏷️ TOPICS    │
│   42h 18m              69%              18         │
│                                                    │
╰────────────────────────────────────────────────────╯

The dashboard is designed to answer questions like:

«What am I practicing?»

«Where am I struggling?»

«How much time am I spending?»

«Am I becoming more consistent?»

---

🧩 How It Works

          🌐 CODEFORCES
                │
                ▼
        ┌───────────────┐
        │ 👀 Detection  │
        │ & Tracking    │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │ 🧠 Data Layer │
        │ Parse & Store │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │ 💾 Local      │
        │ Storage       │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │ 📊 Dashboard  │
        │ & Analytics   │
        └───────────────┘

---

🛠️ Tech Stack

<p align="center">"HTML5" (https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
"CSS3" (https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
"JavaScript" (https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
"Chrome API" (https://img.shields.io/badge/Chrome_Extension_API-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)

</p>Architecture

- 🧩 Manifest V3
- ⚡ Vanilla JavaScript
- 🎨 HTML + CSS
- 💾 Chrome Storage API
- 🔒 Local-first architecture

Intentionally No

❌ React
❌ TypeScript
❌ Backend
❌ Database
❌ Authentication
❌ Unnecessary external services

---

📂 Project Structure

⚡ codeforces-progress-tracker
│
├── 📁 src
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

🚀 Installation

🟦 Chrome

1. Download / Clone this repository
2. Open chrome://extensions/
3. Enable Developer Mode
4. Click "Load unpacked"
5. Select the project folder
6. Open Codeforces
7. Start solving 🚀

🟧 Brave

1. Open brave://extensions/
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select the project folder
5. Open Codeforces
6. Start solving 🚀

---

🔐 Privacy

Your data belongs to you.

The extension follows a local-first approach.

🔒| Privacy
🚫| No account required
🚫| No backend server
🚫| No external database
🚫| No advertising
🚫| No unnecessary tracking
✅| Local browser storage
✅| Minimal permissions

Your practice history stays in your browser unless you explicitly export or share it.

---

🗺️ Roadmap

🟢 Foundation

- [x] Manifest V3
- [x] Extension structure
- [x] Codeforces detection
- [x] Development setup

🟡 Tracking

- [ ] Problem detection
- [ ] Problem metadata
- [ ] Visit tracking
- [ ] Session tracking
- [ ] Time tracking
- [ ] Submission detection
- [ ] Verdict tracking
- [ ] Local persistence

🔵 Analytics

- [ ] Statistics dashboard
- [ ] Rating distribution
- [ ] Topic analytics
- [ ] Verdict analysis
- [ ] Failure analysis
- [ ] Practice streak
- [ ] Progress trends

🟣 Future

- [ ] Data export
- [ ] Data backup
- [ ] Import system
- [ ] Advanced visualizations
- [ ] Performance improvements
- [ ] Chrome Web Store release

---

🧠 Design Philosophy

🎯 Accuracy

«Never invent data just to make a feature look impressive.»

🧩 Simplicity

«Use simple technology and understand every layer.»

🔒 Privacy

«Your competitive programming history should remain yours.»

📈 Progress

«Every feature should help you understand your improvement.»

---

💡 Why I Built This

Competitive programming isn't only about collecting Accepted verdicts.

It's about understanding:

🧠 How you think

⏱️ How you spend time

❌ Why you fail

🏷️ Which topics challenge you

📈 How you improve

This project was created to make those patterns visible.

At the same time, it is a practical way to learn:

JavaScript → Browser Extensions → APIs → Storage → Data Modeling → Analytics → UI/UX → Git & GitHub

---

🤝 Contributing

Have an idea?

Found a bug?

Want to improve something?

You're welcome to contribute.

💬 Suggestions

Open an Issue and describe your idea.

🐛 Bugs

Include:

- What happened
- What you expected
- Steps to reproduce
- Browser + version

🔧 Pull Requests

Fork → Build → Test → Submit a PR.

---

📜 License

License information will be added before the first stable release.

---

<p align="center">⚡ Solve. Track. Analyze. Improve.

Built with ❤️, curiosity, and a lot of Codeforces problems.

<br>⭐ If this project becomes useful to you, consider giving it a star.

</p>
