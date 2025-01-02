const form = document.getElementById('github-form');
const loading = document.getElementById('loading');
const portfolio = document.getElementById('portfolio');
const backButton = document.getElementById('back-button');
const header = document.querySelector('header');
const inputSection = document.querySelector('.input-section');

// Back button functionality
document.getElementById('back-button').addEventListener('click', () => {
    // Show header and input section
    document.querySelector('header').classList.remove('hidden');
    document.querySelector('.input-section').classList.remove('hidden');
    
    // Hide portfolio section
    document.getElementById('portfolio').classList.add('hidden');
    
    // Reset the form
    document.getElementById('github-form').reset();
    
    // Clean up previous data
    cleanupPreviousData();
    
    // Scroll back to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Function to clean up previous data
function cleanupPreviousData() {
    // Reset navigation
    document.getElementById('nav-username').textContent = '';
    
    // Reset profile section
    document.getElementById('avatar').src = '';
    document.getElementById('name').textContent = '';
    
    // Remove bio and info if they exist
    const profileCard = document.querySelector('.profile-card');
    const existingBio = profileCard.querySelector('.profile-bio');
    const existingInfo = profileCard.querySelector('.profile-info');
    if (existingBio) existingBio.remove();
    if (existingInfo) existingInfo.remove();
    
    // Reset stats
    document.getElementById('repos-count').textContent = '0';
    document.getElementById('followers-count').textContent = '0';
    document.getElementById('stars-count').textContent = '0';
    
    // Clear skills
    document.getElementById('languages-chart').innerHTML = '';
    
    // Clear repositories
    document.getElementById('repositories').innerHTML = '';
    
    // Reset social links
    document.getElementById('github-link').href = '#';
    const socialLinks = ['blog-link', 'twitter-link', 'email-link'];
    socialLinks.forEach(link => {
        const element = document.getElementById(link);
        element.classList.add('hidden');
        element.href = '#';
    });
    document.getElementById('email').textContent = '';
    
    // Reset active navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#home') {
            link.classList.add('active');
        }
    });
    
    // Reset about section
    document.getElementById('about-bio').textContent = '';
    document.getElementById('location-info').classList.add('hidden');
    document.getElementById('company-info').classList.add('hidden');
}

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('github-username').value;
    const username = extractUsername(input);
    
    if (!username) {
        alert('Please enter a valid GitHub username or profile URL');
        return;
    }

    try {
        showLoading();
        const [userDataResponse, reposData] = await Promise.all([
            fetchUserData(username),
            fetchRepos(username)
        ]);
        
        userData = userDataResponse; // Store user data globally
        repos = reposData; // Store repos globally
        
        // Update all sections
        updateNavigation(userData);
        updateProfile(userData);
        updateStats(userData, reposData);
        updateAboutSection(userData);
        await updateSkills(username, reposData);
        updateRepositories(reposData);
        initializeReposModal();
        updateContact(userData);

        hideLoading();
        // Hide header and input section, show portfolio
        header.classList.add('hidden');
        inputSection.classList.add('hidden');
        portfolio.classList.remove('hidden');
        
        // Ensure home section is active
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#home') {
                link.classList.add('active');
            }
        });
        
        // Scroll to top
        window.scrollTo(0, 0);
    } catch (error) {
        hideLoading();
        alert(error.message || 'Error fetching GitHub data. Please try again.');
        console.error('Error:', error);
    }
});

function updateNavigation(user) {
    document.getElementById('nav-username').textContent = user.login;
}

function updateProfile(user) {
    document.getElementById('avatar').src = user.avatar_url;
    document.getElementById('name').textContent = user.name || user.login;
}

function updateAboutSection(user) {
    document.getElementById('about-bio').textContent = user.bio || 'No bio available';
    
    // Update location if available
    const locationInfo = document.getElementById('location-info');
    const locationSpan = document.getElementById('location');
    if (user.location) {
        locationSpan.textContent = user.location;
        locationInfo.classList.remove('hidden');
    } else {
        locationInfo.classList.add('hidden');
    }

    // Update company if available
    const companyInfo = document.getElementById('company-info');
    const companySpan = document.getElementById('company');
    if (user.company) {
        companySpan.textContent = user.company;
        companyInfo.classList.remove('hidden');
    } else {
        companyInfo.classList.add('hidden');
    }
}

function updateStats(user, repos) {
    document.getElementById('repos-count').textContent = user.public_repos;
    document.getElementById('followers-count').textContent = user.followers;
    
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    document.getElementById('stars-count').textContent = totalStars;
}

// Add CSS for the new profile elements
const style = document.createElement('style');
style.textContent = `
    .profile-bio {
        color: var(--text-secondary);
        margin: 1rem 0;
        font-size: 1.1rem;
    }
    
    .profile-info {
        margin: 1rem 0;
        color: var(--text-secondary);
        font-family: var(--font-mono);
        font-size: 0.9rem;
    }
    
    .profile-info p {
        margin: 0.5rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style);

async function updateSkills(username, repos) {
    const languages = new Set();

    try {
    await Promise.all(repos.map(async repo => {
        try {
            const response = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`);
                if (!response.ok) {
                    console.warn(`Failed to fetch languages for ${repo.name}`);
                    return;
                }
            const repoLanguages = await response.json();
                Object.keys(repoLanguages).forEach(lang => languages.add(lang));
        } catch (error) {
                console.warn(`Error fetching languages for ${repo.name}:`, error);
        }
    }));

    // Create skills cards
    const skillsContainer = document.getElementById('languages-chart');
    skillsContainer.innerHTML = '';

        // Convert Set to Array and sort alphabetically
        const sortedLanguages = Array.from(languages).sort();

        if (sortedLanguages.length === 0) {
            skillsContainer.innerHTML = '<p class="no-skills">No programming languages detected</p>';
            return;
        }

        sortedLanguages.forEach(language => {
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card';
        skillCard.innerHTML = `
            <div class="skill-name">${language}</div>
        `;
        skillsContainer.appendChild(skillCard);
    });
    } catch (error) {
        console.error('Error updating skills:', error);
        throw new Error('Failed to update skills. Please try again.');
    }
}

function updateContact(user) {
    const githubLink = document.getElementById('github-link');
    const blogLink = document.getElementById('blog-link');
    const twitterLink = document.getElementById('twitter-link');
    const emailLink = document.getElementById('email-link');
    const emailSpan = document.getElementById('email');

    githubLink.href = user.html_url;
    
    if (user.blog) {
        blogLink.href = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
        blogLink.classList.remove('hidden');
    } else {
        blogLink.classList.add('hidden');
    }

    if (user.twitter_username) {
        twitterLink.href = `https://twitter.com/${user.twitter_username}`;
        twitterLink.classList.remove('hidden');
    } else {
        twitterLink.classList.add('hidden');
    }

    if (user.email) {
        emailLink.href = `mailto:${user.email}`;
        emailSpan.textContent = user.email;
        emailLink.classList.remove('hidden');
    } else {
        emailLink.classList.add('hidden');
    }
}

function extractUsername(input) {
    if (input.includes('github.com')) {
        const parts = input.split('/');
        return parts[parts.length - 1] || parts[parts.length - 2];
    }
    return input.trim();
}

function showLoading() {
    loading.classList.remove('hidden');
    portfolio.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

async function fetchUserData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (response.status === 404) {
            throw new Error('GitHub user not found. Please check the username.');
        }
        if (response.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

async function fetchRepos(username) {
    try {
        console.log('Fetching repos for:', username);
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=100`);
        
        console.log('Response status:', response.status);
        
        if (response.status === 403) {
            const rateLimit = response.headers.get('X-RateLimit-Remaining');
            const resetTime = new Date(response.headers.get('X-RateLimit-Reset') * 1000);
            const minutes = Math.ceil((resetTime - new Date()) / (1000 * 60));
            
            throw new Error(
                `GitHub API rate limit exceeded. \n\n` +
                `The rate limit resets in approximately ${minutes} minutes. \n` +
                `Please try again later or add your GitHub token for higher limits.`
            );
        }
        
        if (response.status === 404) {
            throw new Error('Repositories not found. Please check the username.');
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Repos found:', data.length);
        
        if (!Array.isArray(data)) {
            console.error('Invalid data format:', data);
            throw new Error('Invalid response format from GitHub API');
        }
        
        return data;
    } catch (error) {
        console.error('Detailed error:', error);
        // Pass through the rate limit message if that's what caused the error
        throw new Error(error.message.includes('rate limit') ? error.message : 'Failed to fetch repositories. Please try again.');
    }
}

// Add these functions to handle the modal
function initializeReposModal() {
    const seeMoreBtn = document.getElementById('see-more-repos');
    const modal = document.getElementById('repos-modal');
    const closeBtn = modal.querySelector('.close-modal');
    
    seeMoreBtn.addEventListener('click', () => {
        showAllRepositories();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function showAllRepositories() {
    const allReposContainer = document.getElementById('all-repositories');
    allReposContainer.innerHTML = '';
    
    // Sort repos by stars
    const sortedRepos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    
    sortedRepos.forEach(repo => {
        const repoCard = createRepoCard(repo);
        allReposContainer.appendChild(repoCard);
    });
}

function updateRepositories(reposData) {
    repos = reposData; // Store repos globally
    const reposContainer = document.getElementById('repositories');
    reposContainer.innerHTML = '';

    // Show only top 6 repos in main view
    const topRepos = reposData
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);

    topRepos.forEach(repo => {
        const repoCard = createRepoCard(repo);
        reposContainer.appendChild(repoCard);
    });
}

function createRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    
    const language = repo.language || 'Not specified';
    const description = repo.description || 'No description available';
    
    // Only use the homepage URL from GitHub
    const liveLinkButton = repo.homepage ? `
        <a href="${repo.homepage}" target="_blank" class="live-link-btn">
            <i class="fas fa-external-link-alt"></i> View Live
        </a>
    ` : `
        <button class="live-link-btn no-link" onclick="showNoLiveLink('${repo.name}')">
            <i class="fas fa-external-link-alt"></i> View Live
        </button>
    `;

    card.innerHTML = `
        <div class="repo-header">
        <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
            ${liveLinkButton}
        </div>
        <p>${description}</p>
        <div class="repo-stats">
            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
            <span><i class="fas fa-circle"></i> ${language}</span>
        </div>
    `;

    return card;
}

// Add this function to show the popup
function showNoLiveLink(repoName) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-content">
            <p>No live demo available for ${repoName}.</p>
            <p>Please check the repository directly.</p>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Remove popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// Add this after your existing event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Handle navigation link clicks
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            e.target.classList.add('active');
        });
    });

    // Handle scroll events for active nav state
    let lastKnownScrollPosition = 0;
    let ticking = false;

    function updateActiveNav() {
        const sections = ['home', 'projects', 'skills', 'contact'];
        const scrollPosition = window.scrollY + 150; // Offset for nav height

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    navLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            }
        });
    }

    document.addEventListener('scroll', () => {
        lastKnownScrollPosition = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveNav();
                ticking = false;
            });

            ticking = true;
        }
    });

    // Add AI bio generation functionality
    const generateAiBioBtn = document.getElementById('generate-ai-bio');
    const bioElement = document.getElementById('about-bio');

    generateAiBioBtn.addEventListener('click', async () => {
        const originalBio = bioElement.textContent;
        generateAiBioBtn.classList.add('loading');
        bioElement.classList.add('fading');

        try {
            const aiBio = await generateAIBio(userData, repos);
            if (aiBio) {
                await new Promise(resolve => setTimeout(resolve, 300));
                bioElement.textContent = aiBio;
                bioElement.classList.remove('fading');
                
                // Add switch back button
                const switchBack = document.createElement('button');
                switchBack.className = 'switch-bio-btn';
                switchBack.textContent = 'Revert to Original';
                switchBack.onclick = () => {
                    bioElement.classList.add('fading');
                    setTimeout(() => {
                        bioElement.textContent = originalBio;
                        bioElement.classList.remove('fading');
                        switchBack.remove();
                    }, 300);
                };
                
                bioElement.parentElement.appendChild(switchBack);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate AI bio. Please try again.');
            bioElement.textContent = originalBio;
            bioElement.classList.remove('fading');
        } finally {
            generateAiBioBtn.classList.remove('loading');
        }
    });
});

// Add this function to get top languages
function getTopLanguages(reposData) {
    const languageCount = {};
    reposData.forEach(repo => {
        if (repo.language) {
            languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
    });
    return Object.entries(languageCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang)
        .join(', ');
}

// Update the generateAIBio function
async function generateAIBio(userData, reposData) {
    const prompt = `Create a professional bio for a developer with the following information:
        Name: ${userData.name}
        Current Company: ${userData.company || 'Not specified'}
        Location: ${userData.location || 'Not specified'}
        Top Languages: ${getTopLanguages(reposData)}
        Repository Count: ${userData.public_repos}
        Original Bio: ${userData.bio || 'Not provided'}
        
        Please create a professional, third-person bio highlighting their expertise and achievements.`;

    const url = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': '4359430725msh8d26b3e2762caeap17a7c0jsne4725fc6f216',
            'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'gpt-4',
            max_tokens: 200,
            temperature: 0.7
        })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        // Extract the generated bio from the response
        if (result && result.choices && result.choices[0]) {
            return result.choices[0].message.content;
        } else {
            console.error('Unexpected API response format:', result);
            throw new Error('Failed to generate bio');
        }
    } catch (error) {
        console.error('Error generating AI bio:', error);
        throw error;
    }
}

// Add this after your existing code
async function downloadPortfolio() {
    try {
        // Create a ZIP file
        const zip = new JSZip();
        
        // Add HTML content
        const htmlContent = document.documentElement.outerHTML;
        const cleanedHTML = cleanHTML(htmlContent);
        zip.file("index.html", cleanedHTML);
        
        // Add CSS content
        const cssContent = Array.from(document.styleSheets)
            .filter(sheet => !sheet.href) // Only inline styles
            .map(sheet => Array.from(sheet.cssRules)
                .map(rule => rule.cssText)
                .join('\n'))
            .join('\n');
        zip.file("styles.css", cssContent);
        
        // Generate the ZIP file
        const content = await zip.generateAsync({ type: "blob" });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${userData.login}-portfolio.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Error downloading portfolio:', error);
        alert('Failed to download portfolio. Please try again.');
    }
}

// Helper function to clean HTML
function cleanHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove the input section
    const inputSection = doc.querySelector('.input-section');
    if (inputSection) inputSection.remove();
    
    // Remove the loading spinner
    const loading = doc.querySelector('#loading');
    if (loading) loading.remove();
    
    // Remove hidden class from portfolio
    const portfolio = doc.querySelector('#portfolio');
    if (portfolio) portfolio.classList.remove('hidden');
    
    // Update script tag to include JSZip
    const script = doc.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    doc.body.appendChild(script);
    
    const switchBioBtn = doc.querySelector('.switch-bio-btn');
    if (switchBioBtn) switchBioBtn.remove();
    
    return doc.documentElement.outerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    document.head.appendChild(script);
    
    const downloadBtn = document.getElementById('download-button');
    downloadBtn.addEventListener('click', downloadPortfolio);
});
