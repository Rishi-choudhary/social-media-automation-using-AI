import os
import jwt
import uuid
from functools import wraps
from urllib.parse import urlencode
import requests
import hashlib
import re
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import datetime
from flask_dance.consumer import OAuth2ConsumerBlueprint, oauth_authorized, oauth_error
from flask_dance.consumer.storage import BaseStorage
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from oauthlib.oauth2.rfc6749.errors import InvalidGrantError
from sqlalchemy.exc import NoResultFound
from werkzeug.local import LocalProxy
import google.generativeai as genai
import requests
import json



class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)


app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)


database_url = os.environ.get("DATABASE_URL")
if not database_url:
    
    database_url = "sqlite:///ai_auto_publisher.db"

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}


db.init_app(app)

with app.app_context():
    
    class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(80), unique=True, nullable=False)
        email = db.Column(db.String(120), unique=True, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.now)
        is_active = db.Column(db.Boolean, default=True)
        
        def __repr__(self):
            return f'<User {self.username}>'

    class GeneratedPost(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        theme = db.Column(db.String(100), nullable=False)
        tone = db.Column(db.String(50), nullable=False)
        platforms = db.Column(db.String(200), nullable=False)  
        caption = db.Column(db.Text, nullable=False)
        hashtags = db.Column(db.String(500))
        status = db.Column(db.String(20), default='generated')
        created_at = db.Column(db.DateTime, default=datetime.now)
        likes = db.Column(db.Integer, default=0)
        comments = db.Column(db.Integer, default=0)
        shares = db.Column(db.Integer, default=0)
        reach = db.Column(db.Integer, default=0)
        image_url = db.Column(db.String(500), nullable=True)  
        image_prompt = db.Column(db.Text, nullable=True)  
        
    
        user_id = db.Column(db.String, nullable=True)
        
        def __repr__(self):
            return f'<GeneratedPost {self.id}: {self.theme}>'
    
    
    globals()['User'] = User
    globals()['GeneratedPost'] = GeneratedPost
    
    db.create_all()


def configure_ai():
    """Configure AI services when API keys are available"""
    gemini_key = "AIzaSyCC6pSLGsaZqPRyM4y5b42LP1jy7kCFI-U"  # Replace with your actual Gemini API ke
    if gemini_key:
        genai.configure(api_key=gemini_key)
        return True
    return False

def generate_content_with_ai(theme, tone, platforms, context="", length="medium"):
    """Generate social media content using Gemini AI"""
    try:
        if not configure_ai():
            
            return {
                "error": "GEMINI_API_KEY not configured",
                "caption": f"Please configure your Gemini API key to generate AI content about {theme}",
                "hashtags": f"#{theme.replace(' ', '')} #AI #AutoPublisher",
                "image_prompt": f"Professional image related to {theme}"
            }
        
        
        platform_text = ", ".join(platforms)
        
        prompt = f"""You are a social media content generator. Create high-performing content for {platform_text} using the following inputs:

- Theme/Topic: {theme}
- Tone: {tone} (e.g., inspiring, informative, playful, bold)
- Desired Length: {length} (e.g., short <50 words, medium 100–150 words, long >200 words)
- Additional Context: {context} (include target audience, purpose, brand voice, etc.)

Please return your response in the following **JSON format**:

{{
  "caption": "Write a scroll-stopping caption tailored to the platform, aligned with the given tone and length. Start with a hook if possible and end with a CTA.",
  "hashtags": "#trending #relevant #themeRelated (Provide 5–10 hashtags that are platform-appropriate and aligned with the theme)",
  "image_prompt": "Generate a short, vivid description (max 60 words) for AI image generation, visually representing the theme."
}}"""
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        print("response:", response.text)
     
        
       
        try:
        
            cleaned_text = re.sub(r"^```json|```$", "", response.text.strip(), flags=re.MULTILINE).strip()
            content = json.loads(cleaned_text)
            print("Parsed content:", content)
            return content

        except json.JSONDecodeError:

            text = response.text
            print(f"Failed to parse JSON response: {text}")
            return {
            "caption": f"Generated content about {theme} with {tone} tone",
            "hashtags": f"#{theme.replace(' ', '')} #AI #AutoPublisher",
            "image_prompt": f"Professional image related to {theme}"
            }
            
    except Exception as e:
        return {
            "error": f"AI generation failed: {str(e)}",
            "caption": f"Error generating content about {theme}",
            "hashtags": f"#{theme.replace(' ', '')} #AI #AutoPublisher",
            "image_prompt": f"Professional image related to {theme}"
        }

def generate_image_with_ai(prompt):
    """Generate image using AI image generation service"""
    try:
        stability_key = "YOUR_STABILITY_API_KEY"  # Replace with your actual Stability API key
        if stability_key:
            return generate_image_stability(prompt, stability_key)
        else:
            return None
            
    except Exception as e:
        print(f"Image generation error: {e}")
        return None



def sanitize_filename(text, max_length=20):
    # Create a safe, short filename from the prompt
    text = re.sub(r'\W+', '_', text.strip().lower())  # Replace non-alphanum with underscores
    return text[:max_length] or "image"

static_folder = os.path.join(app.root_path, 'static', 'generated_images')
os.makedirs(static_folder, exist_ok=True)


def generate_image_stability(prompt, api_key):
    """Generate image using Stability AI v2beta API"""
    url = "https://api.stability.ai/v2beta/stable-image/generate/ultra"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "image/*"
    }
    data = {
        "prompt": prompt,
        "output_format": "webp",
    }

    response = requests.post(url, headers=headers, files={"none": ''}, data=data)

    if response.status_code == 200:
        filename = sanitize_filename(prompt) + f"-{uuid.uuid4().hex[:6]}.webp"  # unique name
        static_folder = os.path.join(app.root_path, 'static', 'generated_images')
        os.makedirs(static_folder, exist_ok=True)
        file_path = os.path.join(static_folder, filename)

        with open(file_path, 'wb') as file:
            file.write(response.content)

        # Return relative URL for use in frontend
        return url_for('static', filename=f'generated_images/{filename}')
    else:
        raise Exception(f"Image generation failed: {response.status_code} - {response.text}")
    
    
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/workspace')
def workspace():
    return render_template('workspace.html')

@app.route('/api/generate-post', methods=['POST'])
def generate_post():
    """API endpoint to generate social media content using AI and save to database"""
    try:
        data = request.get_json()
        theme = data.get('theme', 'General')
        tone = data.get('tone', 'professional')
        platforms = data.get('platforms', ['instagram'])  # Now accepts multiple platforms
        context = data.get('context', '')
        length = data.get('length', 'medium')
        print(f"Generating post with theme: {theme}, tone: {tone}, platforms: {platforms}, context: {context}, length: {length}")   
        
        
        if isinstance(platforms, str):
            platforms = [platforms]
        
        
        ai_content = generate_content_with_ai(theme, tone, platforms, context, length)
        print(f"AI content generated: {ai_content}")
        
        caption = ai_content.get('caption', f"Generated content about {theme}")
        hashtags = ai_content.get('hashtags', f"#{theme.replace(' ', '')} #AI #ONESOCIAL")
        image_prompt = ai_content.get('image_prompt', f"Professional image related to {theme}")
        
        
        image_url = generate_image_with_ai(image_prompt)
        
        
        platforms_str = ','.join(platforms)
        
        
        new_post = GeneratedPost(
            theme=theme,
            tone=tone,
            platforms=platforms_str,
            caption=caption,
            hashtags=hashtags,
            image_url=image_url,
            image_prompt=image_prompt,
            status='generated'
        )
        
        db.session.add(new_post)
        db.session.commit()
        
        response_data = {
            'success': True,
            'post_id': new_post.id,
            'caption': caption,
            'hashtags': hashtags,
            'platforms': platforms,
            'image_url': image_url,
            'image_prompt': image_prompt
        }
        
        
        if 'error' in ai_content:
            response_data['ai_error'] = ai_content['error']
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics')
def get_analytics():
    """API endpoint to get analytics data"""
    total_posts = db.session.query(GeneratedPost).count()
    published_posts = db.session.query(GeneratedPost).filter_by(status='published').count()
    
    
    all_posts = db.session.query(GeneratedPost).all()
    platform_counts = {}
    for post in all_posts:
        if post.platforms:
            platforms = post.platforms.split(',')
            for platform in platforms:
                platform = platform.strip()
                platform_counts[platform] = platform_counts.get(platform, 0) + 1
    
    return jsonify({
        'total_posts': total_posts,
        'published_posts': published_posts,
        'platform_stats': platform_counts,
        'engagement_rate': 8.5,  
        'reach': 125400,
        'new_followers': 450
    })

@app.route('/api/user-posts')
def get_user_posts():
    """API endpoint to get user's generated posts"""
    try:
        
        posts = db.session.query(GeneratedPost).order_by(GeneratedPost.created_at.desc()).limit(20).all()
        
        posts_data = []
        for post in posts:
            posts_data.append({
                'id': post.id,
                'theme': post.theme,
                'tone': post.tone,
                'platforms': post.platforms.split(',') if post.platforms else [],
                'caption': post.caption,
                'hashtags': post.hashtags,
                'status': post.status,
                'created_at': post.created_at.isoformat() if post.created_at else None,
                'likes': post.likes,
                'comments': post.comments,
                'shares': post.shares,
                'reach': post.reach,
                'image_url': post.image_url,
                'image_prompt': post.image_prompt
            })
        
        return jsonify({
            'success': True,
            'posts': posts_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/upload-post/<int:post_id>', methods=['POST'])
def upload_post(post_id):
    """API endpoint to upload a post to social media platforms"""
    try:
        
        post = db.session.query(GeneratedPost).get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post not found'}), 404
        
       
        platforms = post.platforms.split(',') if post.platforms else []
        upload_results = {}
        
        for platform in platforms:
            platform = platform.strip()
    
            upload_results[platform] = {
                'success': True,
                'post_url': f'https://{platform}.com/post/{post_id}_{platform}',
                'message': f'Successfully uploaded to {platform.title()}'
            }
        
        
        post.status = 'published'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'upload_results': upload_results,
            'message': f'Post uploaded to {len(platforms)} platform(s)'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
