const form = document.getElementById('github-form');
const loading = document.getElementById('loading');
const portfolio = document.getElementById('portfolio');
const backButton = document.getElementById('back-button');
const header = document.querySelector('header');
const inputSection = document.querySelector('.input-section');

// Back button functionality
backButton.addEventListener('click', () => {
    portfolio.classList.add('hidden');
    header.classList.remove('hidden');
    inputSection.classList.remove('hidden');
    form.reset();
});

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
        const [userData, reposData] = await Promise.all([
            fetchUserData(username),
            fetchRepos(username)
        ]);
        
        // Update all sections
        updateNavigation(userData);
        updateProfile(userData);
        updateStats(userData, reposData);
        updateAboutSection(userData);
        await updateSkills(username, reposData);
        updateRepositories(reposData);
        updateContact(userData);

        hideLoading();
        // Hide header and input section, show portfolio
        header.classList.add('hidden');
        inputSection.classList.add('hidden');
        portfolio.classList.remove('hidden');
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
    document.getElementById('bio').textContent = user.bio || 'No bio available';
    
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

async function updateSkills(username, repos) {
    const languages = {};
    let totalSize = 0;

    // Fetch language statistics for each repository
    await Promise.all(repos.map(async repo => {
        try {
            const response = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`);
            if (!response.ok) return;
            const repoLanguages = await response.json();
            
            for (const [lang, size] of Object.entries(repoLanguages)) {
                languages[lang] = (languages[lang] || 0) + size;
                totalSize += size;
            }
        } catch (error) {
            console.error(`Error fetching languages for ${repo.name}:`, error);
        }
    }));

    // Create skills cards
    const skillsContainer = document.getElementById('languages-chart');
    skillsContainer.innerHTML = '';

    // Sort languages by size and get all of them
    const sortedLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a);

    sortedLanguages.forEach(([language, size]) => {
        const percentage = ((size / totalSize) * 100).toFixed(1);
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card';
        skillCard.innerHTML = `
            <div class="skill-name">${language}</div>
            <div class="skill-percentage">${percentage}%</div>
        `;
        skillsContainer.appendChild(skillCard);
    });
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
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=100`);
        if (response.status === 404) {
            throw new Error('Repositories not found.');
        }
        if (response.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}

function updateStats(user, repos) {
    document.getElementById('repos-count').textContent = user.public_repos;
    document.getElementById('followers-count').textContent = user.followers;
    
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    document.getElementById('stars-count').textContent = totalStars;
}

function updateRepositories(repos) {
    const reposContainer = document.getElementById('repositories');
    reposContainer.innerHTML = '';

    // Sort repos by stars and get top 6
    const topRepos = repos
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

    card.innerHTML = `
        <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
        <p>${description}</p>
        <div class="repo-stats">
            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
            <span><i class="fas fa-circle"></i> ${language}</span>
        </div>
    `;

    return card;
}
