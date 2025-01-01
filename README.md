# GitHub Portfolio Generator

A dynamic web application that generates professional portfolio websites directly from GitHub profiles. Simply enter any GitHub username to create a beautifully designed portfolio showcasing projects, skills, and contact information.

## 🚀 Features

### ⚡ Instant Portfolio Generation
- One-click portfolio creation from GitHub data
- Clean, modern, and responsive design
- Automatic dark theme optimization

### 👤 Profile Section
- Profile picture and bio integration
- Repository statistics
- Follower count and total stars
- Professional layout with animated transitions

### 💻 Projects Showcase
- Featured repositories display
- Live demo links when available
- Project descriptions and statistics
- Language usage indicators
- "See More Projects" expandable view

### 🛠️ Skills & Technologies
- Automatic skills detection from repositories
- Visual representation of programming languages
- Dynamic skill cards with hover effects

### 🤖 AI-Enhanced Features
- AI-powered bio generation using RapidAPI
- Professional description creation
- One-click bio regeneration

### 🎯 Interactive Elements
- Smooth scrolling navigation
- Responsive contact form
- Social media integration
- Download portfolio as static site

## 📋 Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for GitHub API access
- Node.js (optional, for local server)

## 🔧 Installation & Setup

1. Clone the repository:

## ⚠️ GitHub API Rate Limiting

### Current Implementation
This project uses the public GitHub API without authentication, which means:
- Rate limit: 60 requests per hour per IP address
- No token required
- Suitable for testing and demonstration

### Rate Limit Error
If you see "GitHub API error: 403" or "API rate limit exceeded", you have two options:

1. **Wait for Rate Limit Reset**
   - The rate limit resets every hour
   - Try again after an hour

2. **Add Your Own GitHub Token**
   ```javascript
   // In script.js, update the fetch functions:
   async function fetchUserData(username) {
       try {
           const headers = {
               'Authorization': 'Bearer YOUR_GITHUB_TOKEN',
               'Accept': 'application/vnd.github.v3+json'
           };
           const response = await fetch(`https://api.github.com/users/${username}`, { headers });
           // ... rest of the function
       }
   }
   ```

### Getting a GitHub Token
1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
2. Generate new token (classic)
3. Select scopes: `read:user` and `public_repo`
4. Copy and use your token
5. ⚠️ Keep your token private and never commit it to public repositories