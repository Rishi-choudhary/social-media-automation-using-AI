

# 🖼️ Flask AI Image Generator

This is a simple Flask web application that generates AI images using the [Stability AI API](https://platform.stability.ai). Users can generate up to **5 high-quality images per day** with their free API key.

---

## 🚀 Features

- Generate AI images from text prompts  
- Uses Stability AI's Stable Diffusion model  
- Simple and intuitive Flask-based backend  
- Easy to run locally  

---

## 🛠️ Requirements

To run this app, you need:

- **Python 3.7+** → [Download Python](https://www.python.org/downloads/)  
- `requirements.txt` with all dependencies  
- A **Stability AI API Key**

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

2. Install Dependencies

pip install -r requirements.txt

🧠 requirements.txt lists all packages your app needs. This installs everything.

⸻

🔑 Get Your Stability AI API Key
	1.	Go to https://platform.stability.ai/account/keys
	2.	Sign up / Log in
	3.	Navigate to API Keys
	4.	Copy your key or create a new one

⚠️ Free tier allows 5 image generations per day.

⸻

🧠 Add Your API Key

Open app.py and update:

STABILITY_API_KEY = "your-api-key-here"

Replace with:

STABILITY_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxx"


⸻

🏃 How to Run the Flask App

Option 1: Directly with Python

python app.py

Navigate to http://localhost:5000

⸻

Option 2: Using Flask CLI

export FLASK_APP=app.py   # On Windows: set FLASK_APP=app.py
flask run

Open http://localhost:5000

⸻

Option 3: Virtual Environment (Recommended)

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

✅ Keeps your Python environment clean and isolated.

⸻

🧰 How It Works
	•	User inputs a text prompt
	•	Prompt is sent to Stability AI API
	•	API returns a generated image
	•	Flask serves the image in-browser

⸻

📋 Requirements Summary

Requirement	Purpose
Python 3.7+	Base language
Flask	Web framework
requests	Call external API
dotenv (opt.)	Manage secrets via environment


⸻

✅ Best Practices
	•	Use .env to store your API key securely
	•	Never commit your API key
	•	Add dotenv support with:

pip install python-dotenv

In app.py:

from dotenv import load_dotenv
load_dotenv()
import os
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")


⸻

💡 Pro Tip

You can deploy this app to:
	•	Replit
	•	Render
	•	Railway
	•	Glitch
	•	Heroku

⸻

📬 Contact

Created by Your Name — pull requests welcome!

⸻

📄 License

Licensed under the MIT License.

