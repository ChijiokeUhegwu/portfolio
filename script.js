/**
 * Chijioke Christopher Uhegwu — Portfolio JavaScript
 * Dynamic data hydration, theme toggling, scroll animations, and interactive navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initScrollAnimations();
  loadAllContent();
});

/* ==========================================================================
   1. Theme Management (Dark / Light)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  const updateThemeUI = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'light' ? '☼' : '◐';
    }
  };

  // Determine starting theme
  const currentTheme = document.documentElement.getAttribute('data-theme') || 
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  updateThemeUI(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextTheme);
      updateThemeUI(nextTheme);
    });
  }
}

/* ==========================================================================
   2. Responsive Navigation & Active Link Tracking
   ========================================================================== */
function initNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav__link');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside or clicking any nav link
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section observer for nav link highlights
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          links.forEach(l => {
            if (l.getAttribute('href') === `#${id}`) {
              l.classList.add('is-active');
            } else {
              l.classList.remove('is-active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    sections.forEach(sec => observer.observe(sec));
  }
}

/* ==========================================================================
   3. Scroll Reveal Animation
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
}

/* ==========================================================================
   4. Asynchronous Data Fetching & Content Hydration
   ========================================================================== */
async function loadAllContent() {
  try {
    const [profileRes, projectsRes, articlesRes] = await Promise.all([
      fetch('./content/profile.json'),
      fetch('./content/projects.json'),
      fetch('./content/articles.json')
    ]);

    if (!profileRes.ok || !projectsRes.ok || !articlesRes.ok) {
      throw new Error('Failed to fetch one or more content files');
    }

    const [profileData, projectsData, articlesData] = await Promise.all([
      profileRes.json(),
      projectsRes.json(),
      articlesRes.json()
    ]);

    // Hydrate all sections
    renderHero(profileData);
    renderSkills(profileData.skills);
    renderPublications(articlesData);
    renderProjects(projectsData);
    renderExperience(profileData.experience);
    renderEducation(profileData.education);
    renderPresentations(profileData.presentations_and_workshops);
    renderAwards(profileData.awards);
    renderMemberships(profileData.memberships);
    renderFooter(profileData);

  } catch (error) {
    console.error('Error loading portfolio data:', error);
    const heroLead = document.getElementById('hero-lead');
    if (heroLead) {
      heroLead.textContent = 'Unable to load content dynamically. Please ensure content files are accessible.';
    }
  }
}

// Utility to normalize image paths (e.g. "/images/foo.png" -> "images/foo.png")
function normalizeImagePath(path) {
  if (!path) return '';
  return path.startsWith('/') ? path.slice(1) : path;
}

/* ==========================================================================
   5. Section Renderers
   ========================================================================== */

/** 5.1 Hero Section */
function renderHero(profile) {
  if (!profile || !profile.personal) return;
  const { personal, research_interest } = profile;

  const heroPhoto = document.getElementById('hero-photo');
  const heroName = document.getElementById('hero-name');
  const heroLead = document.getElementById('hero-lead');
  const heroSocial = document.getElementById('hero-social');
  const navBrand = document.getElementById('nav-brand');

  if (personal.name) {
    if (heroName) heroName.textContent = personal.name;
    if (navBrand) navBrand.textContent = personal.name.split(' ')[0] + ' ' + (personal.name.split(' ').pop() || '');
  }

  if (personal.thumbnail && heroPhoto) {
    heroPhoto.src = normalizeImagePath(personal.thumbnail);
    heroPhoto.alt = personal.name || 'Profile Photo';
  }

  if (research_interest && heroLead) {
    heroLead.textContent = research_interest;
  }

  if (heroSocial && personal.social) {
    const { email, social } = personal;
    let socialHtml = '';

    if (email) {
      socialHtml += `
        <a href="mailto:${email}" aria-label="Send email to ${email}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>
          </svg>
          <span>Email</span>
        </a>
      `;
    }

    if (social.google_scholar) {
      socialHtml += `
        <a href="${social.google_scholar}" target="_blank" rel="noopener" aria-label="Google Scholar Profile">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3 1 9l11 6 11-6-11-6zm0 13.9L5 13.1V16c0 1.7 3.1 3 7 3s7-1.3 7-3v-2.9l-7 3.8z"/>
          </svg>
          <span>Google Scholar</span>
        </a>
      `;
    }

    if (social.github) {
      socialHtml += `
        <a href="${social.github}" target="_blank" rel="noopener" aria-label="GitHub Profile">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.9 10.9c.6.1.8-.2.8-.5v-1.8c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/>
          </svg>
          <span>GitHub</span>
        </a>
      `;
    }

    if (social.linkedin) {
      socialHtml += `
        <a href="${social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn Profile">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5V9h3v10zM6.5 7.7A1.75 1.75 0 1 1 6.5 4.2a1.75 1.75 0 0 1 0 3.5zM19 19h-3v-5.3c0-3.2-4-3-4 0V19H9V9h3v1.8c1.4-2.6 7-2.8 7 2.5V19z"/>
          </svg>
          <span>LinkedIn</span>
        </a>
      `;
    }

    heroSocial.innerHTML = socialHtml;
  }
}

/** 5.2 Skills Section */
function renderSkills(skills) {
  const container = document.getElementById('skills-container');
  if (!container || !skills) return;

  const categoryLabels = {
    bioinformatics: 'Bioinformatics & Computational',
    laboratory: 'Wet Lab & Molecular Techniques',
    data_and_viz: 'Data Science & Visualization',
    domain_knowledge: 'Domain Specialization'
  };

  let html = '';
  for (const [key, items] of Object.entries(skills)) {
    if (Array.isArray(items) && items.length > 0) {
      const title = categoryLabels[key] || key.replace(/_/g, ' ');
      const pills = items.map(item => `<span class="badge">${escapeHtml(item)}</span>`).join('');
      html += `
        <div class="skill-category">
          <h3 class="skill-category__title">${escapeHtml(title)}</h3>
          <div class="skill-pills">
            ${pills}
          </div>
        </div>
      `;
    }
  }

  container.innerHTML = html;
}

/** 5.3 Publications Section */
function renderPublications(articles) {
  const list = document.getElementById('publications-list');
  if (!list || !Array.isArray(articles)) return;

  // Render publications as clean text rows without thumbnail images
  list.innerHTML = articles.map(pub => {
    const titleLink = pub.link ? 
      `<a href="${escapeHtml(pub.link)}" target="_blank" rel="noopener">${escapeHtml(pub.title)}</a>` : 
      escapeHtml(pub.title);

    const authors = pub.authors ? `<p class="pub__authors">${escapeHtml(pub.authors)}</p>` : '';
    const journalDetails = [pub.journal, pub.volume_details].filter(Boolean).map(escapeHtml).join(' · ');

    return `
      <li class="pub">
        <span class="pub__year">${escapeHtml(String(pub.year || ''))}</span>
        <div class="pub__content">
          <h3 class="pub__title">${titleLink}</h3>
          ${authors}
          ${journalDetails ? `<p class="pub__journal">${journalDetails}</p>` : ''}
        </div>
      </li>
    `;
  }).join('');
}

/** 5.4 Projects Section */
function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid || !Array.isArray(projects)) return;

  grid.innerHTML = projects.map(project => {
    const thumbPath = normalizeImagePath(project.thumbnail);
    const tools = Array.isArray(project.tools) 
      ? project.tools.map(tool => `<span class="badge badge--neutral">${escapeHtml(tool)}</span>`).join('') 
      : '';

    return `
      <article class="project-card">
        ${thumbPath ? `
          <div class="project-card__thumb-wrap">
            <img class="project-card__thumb" src="${escapeHtml(thumbPath)}" alt="${escapeHtml(project.title)}" loading="lazy" onerror="this.parentElement.style.display='none'" />
          </div>
        ` : ''}
        <div class="project-card__body">
          <h3 class="project-card__title">
            <a href="${escapeHtml(project.link || '#')}" target="_blank" rel="noopener">${escapeHtml(project.title)}</a>
          </h3>
          <p class="project-card__desc">${escapeHtml(project.description || '')}</p>
          <div class="project-card__footer">
            ${tools ? `<div class="project-card__tools">${tools}</div>` : ''}
            ${project.link ? `
              <a class="project-card__link" href="${escapeHtml(project.link)}" target="_blank" rel="noopener">
                <span>View on GitHub</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/** 5.5 Experience Section */
function renderExperience(experiences) {
  const timeline = document.getElementById('experience-timeline');
  if (!timeline || !Array.isArray(experiences)) return;

  timeline.innerHTML = experiences.map(exp => {
    const location = exp.location ? `<span class="timeline__location"> · ${escapeHtml(exp.location)}</span>` : '';
    return `
      <li class="timeline__item">
        <span class="timeline__date">${escapeHtml(exp.period || '')}</span>
        <h3 class="timeline__title">${escapeHtml(exp.role || '')}</h3>
        <p class="timeline__org">${escapeHtml(exp.organization || '')}${location}</p>
        ${exp.summary ? `<p class="timeline__desc">${escapeHtml(exp.summary)}</p>` : ''}
      </li>
    `;
  }).join('');
}

/** 5.6 Education Section */
function renderEducation(educations) {
  const timeline = document.getElementById('education-timeline');
  if (!timeline || !Array.isArray(educations)) return;

  timeline.innerHTML = educations.map(edu => `
    <li class="timeline__item">
      <span class="timeline__date">${escapeHtml(edu.period || '')}</span>
      <h3 class="timeline__title">${escapeHtml(edu.degree || '')}</h3>
      <p class="timeline__org">${escapeHtml(edu.institution || '')}</p>
    </li>
  `).join('');
}

/** 5.7 Presentations & Workshops Section */
function renderPresentations(presentations) {
  const list = document.getElementById('presentations-list');
  if (!list || !Array.isArray(presentations)) return;

  list.innerHTML = presentations.map(item => {
    const badgeRole = item.role ? `<span class="badge">${escapeHtml(item.role)}</span>` : '';
    const badgeType = item.type ? `<span class="badge badge--neutral">${escapeHtml(item.type)}</span>` : '';
    const dateStr = item.date ? `<span class="pres-card__date">${escapeHtml(item.date)}</span>` : '';
    const locationStr = item.location ? ` · ${escapeHtml(item.location)}` : '';

    return `
      <div class="pres-card">
        <div class="pres-card__header">
          <div class="pres-card__badge-group">
            ${badgeRole}
            ${badgeType}
          </div>
          ${dateStr}
        </div>
        <h3 class="pres-card__title">${escapeHtml(item.title || '')}</h3>
        <p class="pres-card__meta">
          <strong>${escapeHtml(item.event || '')}</strong>${locationStr}
        </p>
      </div>
    `;
  }).join('');
}

/** 5.8 Awards Section */
function renderAwards(awards) {
  const grid = document.getElementById('awards-grid');
  if (!grid || !Array.isArray(awards)) return;

  grid.innerHTML = awards.map(award => `
    <div class="award-card">
      <div class="award-card__date">${escapeHtml(award.date || '')}</div>
      <h3 class="award-card__title">${escapeHtml(award.title || '')}</h3>
      <p class="award-card__issuer">${escapeHtml(award.issuer || '')}</p>
    </div>
  `).join('');
}

/** 5.9 Memberships Section */
function renderMemberships(memberships) {
  const list = document.getElementById('memberships-list');
  if (!list || !Array.isArray(memberships)) return;

  list.innerHTML = memberships.map(mem => `
    <div class="membership-card">
      <span class="membership-card__role">${escapeHtml(mem.role || 'Member')}</span>
      <p class="membership-card__org">${escapeHtml(mem.organization || '')}</p>
    </div>
  `).join('');
}

/** 5.10 Footer */
function renderFooter(profile) {
  const footerLinks = document.getElementById('footer-links');
  const footerYear = document.getElementById('footer-year');

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  if (footerLinks && profile && profile.personal) {
    const { email, social } = profile.personal;
    let linksHtml = '';

    if (email) {
      linksHtml += `<a href="mailto:${email}">Email</a>`;
    }
    if (social && social.google_scholar) {
      linksHtml += `<a href="${social.google_scholar}" target="_blank" rel="noopener">Google Scholar</a>`;
    }
    if (social && social.github) {
      linksHtml += `<a href="${social.github}" target="_blank" rel="noopener">GitHub</a>`;
    }
    if (social && social.linkedin) {
      linksHtml += `<a href="${social.linkedin}" target="_blank" rel="noopener">LinkedIn</a>`;
    }

    footerLinks.innerHTML = linksHtml;
  }
}

/* ==========================================================================
   Helper: HTML Escaping
   ========================================================================== */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
