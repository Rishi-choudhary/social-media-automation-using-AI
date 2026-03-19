# ONE SOCIAL — Social Media Automation Using AI

> Generate platform-tailored captions, hashtags, and visuals for Instagram, Facebook, Twitter, and LinkedIn in seconds — powered by Google Gemini and Stability AI.

---

## 🚀 Overview

**ONE SOCIAL** is an AI-powered social media content platform that eliminates the time and effort of crafting posts manually. Users describe their content theme and desired tone, and the app produces polished captions, relevant hashtags, and matching AI-generated imagery — ready to publish across multiple platforms simultaneously.

Whether you're a solo creator, a small business, or a marketing team, ONE SOCIAL turns a single idea into fully formatted, platform-specific content in a single click.

---

## ✨ Features

- **AI Caption Generation** — Produces platform-optimized captions using Google Gemini 2.5 Flash
- **AI Image Generation** — Creates matching visuals via Stability AI's Stable Diffusion Ultra
- **Multi-Platform Support** — Instagram, Facebook, Twitter/X, and LinkedIn from one interface
- **Tone Control** — Choose from Professional, Casual, Inspiring, Humorous, or Educational styles
- **Length Options** — Short, Medium, or Long content to suit each platform's best practices
- **Hashtag Automation** — Relevant hashtags auto-generated with every post
- **Post History** — All generated posts stored and browsable with status tracking
- **Analytics Dashboard** — Track total posts, published count, engagement metrics, and reach
- **Live Preview** — See platform-specific previews before publishing
- **Persistent Workspace** — Form state auto-saved to localStorage for uninterrupted workflows
- **Simulated Publishing** — Mark posts as published and track status (direct platform API publishing is a planned future feature)

---

## 🏗️ Architecture

ONE SOCIAL is a classic **Flask MVC monolith** with a clean separation between server-side logic, database models, and a dynamic single-page workspace powered by vanilla JavaScript.

```
Browser (HTML/CSS/JS)
        │
        ▼
Flask Application (app.py)
  ├── Jinja2 Templates (landing page + workspace)
  ├── RESTful JSON API (/api/*)
  │       ├── POST /api/generate-post    → Gemini + Stability AI → DB
  │       ├── GET  /api/user-posts       → Retrieve post history
  │       ├── GET  /api/analytics        → Dashboard metrics
  │       └── POST /api/upload-post/<id> → Publish to platforms
  └── SQLAlchemy ORM
          └── SQLite (dev) / PostgreSQL (prod)
```

**Key patterns:**
- **ProxyFix middleware** for correct header forwarding behind reverse proxies
- **SQLAlchemy ORM** for database-agnostic model definitions
- **Client-side SPA pattern** — workspace interactions handled entirely via AJAX without page reloads
- **Observer pattern** — Intersection Observer drives scroll-based animations on the landing page

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.7+, Flask 3.1.1, Werkzeug 3.1.3 |
| **Database** | SQLite (dev) · PostgreSQL (prod) via SQLAlchemy 2.0 + Flask-SQLAlchemy 3.1.1 |
| **AI — Text** | Google Gemini 2.5 Flash (`google-generativeai 0.8.5`) |
| **AI — Images** | Stability AI v2beta — Stable Image Ultra |
| **Frontend** | Vanilla JavaScript (ES6+), Bootstrap 5.3, Font Awesome 6.4, Google Fonts |
| **Validation** | Pydantic 2.11.7 |
| **Image Processing** | Pillow 11.2.1 |
| **Deployment** | Gunicorn (WSGI), ProxyFix, Render / Railway / Heroku |

---

## 📦 Project Structure

```
social-media-automation-using-AI/
├── app.py                   # Flask application — routes, models, AI logic
├── main.py                  # Minimal entry point (calls app.py)
├── requirements.txt         # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css        # Full custom stylesheet (1,282 lines)
│   ├── js/
│   │   ├── main.js          # Landing page animations & interactions
│   │   └── workspace.js     # Content generation workspace logic
│   ├── images/
│   │   └── ai-bg.svg        # Hero background graphic
│   └── generated_images/    # Runtime directory for AI-generated images
└── templates/
    ├── index.html           # Landing page
    └── workspace.html       # Content generation UI
```

---

## ⚙️ Installation

### Prerequisites

- Python 3.7+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A [Stability AI API key](https://platform.stability.ai/account/keys)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Rishi-choudhary/social-media-automation-using-AI.git
cd social-media-automation-using-AI

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables (see section below)
cp .env.example .env            # then edit .env with your keys

# 5. Run the development server
python app.py
```

Visit **http://localhost:5000** in your browser.

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Flask
SESSION_SECRET=your-strong-secret-key-here

# Database (defaults to SQLite if not set)
DATABASE_URL=sqlite:///ai_auto_publisher.db

# AI Services
GEMINI_API_KEY=AIzaSy...          # Google Gemini — text generation
STABILITY_API_KEY=sk-...          # Stability AI — image generation
```

| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET` | ✅ | Flask session encryption key |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for caption generation |
| `STABILITY_API_KEY` | ✅ | Stability AI key for image generation |
| `DATABASE_URL` | ➖ | PostgreSQL URL for production; defaults to SQLite |

> ⚠️ **Never commit your `.env` file or paste real API keys in source code.**

---

## ▶️ Usage

1. **Open the workspace** at `http://localhost:5000/workspace`
2. **Enter a content theme** (e.g., *"summer product launch for a skincare brand"*)
3. **Select platforms** — Instagram, Facebook, Twitter, LinkedIn (multi-select)
4. **Choose a tone** — Professional, Casual, Inspiring, Humorous, or Educational
5. **Pick content length** — Short, Medium, or Long
6. Click **Generate Content** — captions, hashtags, and an AI image are created instantly
7. **Preview** the post in a platform-specific card layout
8. Click **Upload Post** to mark the post as published in the local database (direct publishing to live social media platforms requires configuring the respective platform APIs — see [Future Improvements](#-future-improvements))

Post history and analytics are accessible from the sidebar navigation.

---

## 🧪 Testing

There is currently no automated test suite in this repository. Contributions adding `pytest`-based tests are welcome — see [Contributing](#-contributing) below.

---

## 🚀 Deployment

### Gunicorn (recommended for production)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Heroku

Create a `Procfile`:

```
web: gunicorn app:app
```

Then deploy:

```bash
heroku create
heroku config:set SESSION_SECRET=... GEMINI_API_KEY=... STABILITY_API_KEY=...
git push heroku main
```

### Render / Railway

Both platforms auto-detect Flask. Set the three required environment variables in the platform dashboard and point the start command to `gunicorn app:app`.

### Production checklist

- [ ] Set `SESSION_SECRET` to a long random string
- [ ] Set `DATABASE_URL` to a PostgreSQL connection string
- [ ] Move all API keys to environment variables (not source code)
- [ ] Disable Flask debug mode (`FLASK_ENV=production`)
- [ ] Serve behind HTTPS with a reverse proxy (nginx, Caddy, or platform-managed TLS)

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear, focused commits
4. Open a pull request describing what you changed and why

Please keep PRs focused — one feature or fix per PR. If you're adding a significant feature, open an issue first to discuss the approach.

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

## 💡 Future Improvements

- **OAuth social login** — User authentication is scaffolded (Flask-Login, Flask-Dance, PyJWT are already in dependencies) but not yet wired to login routes
- **Real platform publishing** — Connect Instagram, Facebook, Twitter (Tweepy is already a dependency), and LinkedIn APIs for direct post publishing
- **Scheduling** — Queue posts for optimal publish times with a background task worker (Celery + Redis)
- **Brand voice profiles** — Save custom tone/style settings per brand or client
- **A/B variants** — Generate multiple caption options and pick the best one
- **Cloud image storage** — Replace local `generated_images/` with S3 or Cloudinary for scalability
- **Rate limiting** — Protect API endpoints from abuse
- **Test suite** — Pytest coverage for routes, models, and AI service wrappers

