// Simple GitHub Profile Finder (frontend-only)

const form = document.getElementById('searchForm');
const input = document.getElementById('usernameInput');
const msg = document.getElementById('msg');
const profileSection = document.getElementById('profileSection');

const avatar = document.getElementById('avatar');
const nameEl = document.getElementById('name');
const bioEl = document.getElementById('bio');
const profileLink = document.getElementById('profileLink');
const reposEl = document.getElementById('repos');
const followersEl = document.getElementById('followers');
const followingEl = document.getElementById('following');
const companyEl = document.getElementById('company');
const locationEl = document.getElementById('location');
const blogEl = document.getElementById('blog');
const reposContainer = document.getElementById('reposContainer');

const GITHUB_API = 'https://api.github.com/users/';

function showMessage(text, isError = false){
  msg.textContent = text;
  msg.style.color = isError ? '#b91c1c' : '';
}

async function fetchProfile(username){
  showMessage('Loading...');
  profileSection.classList.add('hidden');
  reposContainer.innerHTML = '';

  try {
    const res = await fetch(GITHUB_API + username);
    if(res.status === 404){
      showMessage('User not found ❌', true);
      return null;
    }
    if(!res.ok){
      showMessage('Error fetching profile ❌', true);
      return null;
    }
    const data = await res.json();
    showMessage('');
    return data;
  } catch(err){
    showMessage('Network Error ❌', true);
    console.error(err);
    return null;
  }
}

async function fetchTopRepos(username, count = 8){
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await res.json();
    repos.sort((a,b)=> b.stargazers_count - a.stargazers_count);
    return repos.slice(0, count);
  } catch(err){
    console.error(err);
    return [];
  }
}

function renderProfile(data){
  avatar.src = data.avatar_url;
  nameEl.textContent = data.name || data.login;
  bioEl.textContent = data.bio || '';
  profileLink.href = data.html_url;

  reposEl.textContent = data.public_repos;
  followersEl.textContent = data.followers;
  followingEl.textContent = data.following;

  companyEl.textContent = data.company || '—';
  locationEl.textContent = data.location || '—';

  if(data.blog){
    blogEl.textContent = data.blog;
    blogEl.href = data.blog.startsWith('http') ? data.blog : `https://${data.blog}`;
  } else {
    blogEl.textContent = '—';
    blogEl.href = '#';
  }

  profileSection.classList.remove('hidden');
}

function renderRepos(repos){
  reposContainer.innerHTML = '';

  if(repos.length === 0){
    reposContainer.innerHTML = `<p>No repositories found</p>`;
    return;
  }

  repos.forEach(r =>{
    const element = document.createElement('div');
    element.className = 'repo';
    element.innerHTML = `
      <a href="${r.html_url}" target="_blank">${r.name}</a>
      <p>${r.description ? r.description.substring(0, 100) + '...' : 'No description'}</p>
      <p>⭐ ${r.stargazers_count} • Forks: ${r.forks_count}</p>
    `;
    reposContainer.appendChild(element);
  })
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const username = input.value.trim();
  if(!username) return;

  const profile = await fetchProfile(username);
  if(!profile) return;

  renderProfile(profile);

  const repos = await fetchTopRepos(username);
  renderRepos(repos);
});

// Load from hash URL like (#octocat)
window.addEventListener('load', ()=>{
  const userFromHash = window.location.hash.replace('#','');
  if(userFromHash){
    input.value = userFromHash;
    form.dispatchEvent(new Event('submit'));
  }
});
