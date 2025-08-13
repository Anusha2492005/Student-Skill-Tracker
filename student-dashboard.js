// Student Dashboard Functionality
let skills = JSON.parse(localStorage.getItem('skills')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let certifications = JSON.parse(localStorage.getItem('certifications')) || [];
let currentRating = 0;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkStudentAuth();
    loadUserProfile();
    loadSkills();
    loadProjects();
    loadCertifications();
    updateStats();
    initializeCharts();
    setupSkillRating();
});

function checkStudentAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    const currentUser = JSON.parse(user);
    if (currentUser.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.email}!`;
}

function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userData = JSON.parse(localStorage.getItem('userData_' + user.email));
    
    if (userData) {
        document.getElementById('profileName').value = userData.fullName || '';
        document.getElementById('profileStudentId').value = userData.studentId || '';
        document.getElementById('profileEmail').value = userData.email || '';
        document.getElementById('profileDepartment').value = userData.department || '';
        document.getElementById('profileYear').value = userData.year + ' Year' || '';
    }
}

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Update charts if analytics section is shown
    if (sectionId === 'analytics') {
        updateCharts();
    }
}

// Skills Management
function setupSkillRating() {
    const stars = document.querySelectorAll('#skillRating .star');
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            currentRating = index + 1;
            updateStarDisplay();
        });
        
        star.addEventListener('mouseover', function() {
            const rating = index + 1;
            updateStarDisplay(rating);
        });
    });
    
    document.getElementById('skillRating').addEventListener('mouseleave', function() {
        updateStarDisplay();
    });
}

function updateStarDisplay(hoverRating = null) {
    const stars = document.querySelectorAll('#skillRating .star');
    const rating = hoverRating || currentRating;
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('empty');
        } else {
            star.classList.add('empty');
        }
    });
}

function addSkill(event) {
    event.preventDefault();
    
    const category = document.getElementById('skillCategory').value;
    const name = document.getElementById('skillName').value;
    const rating = currentRating;
    
    if (!rating) {
        alert('Please select a proficiency level');
        return;
    }
    
    const skill = {
        id: Date.now(),
        category,
        name,
        rating,
        dateAdded: new Date().toLocaleDateString()
    };
    
    skills.push(skill);
    localStorage.setItem('skills', JSON.stringify(skills));
    
    // Reset form
    document.getElementById('skillForm').reset();
    currentRating = 0;
    updateStarDisplay();
    
    loadSkills();
    updateStats();
    updateCharts();
}

function loadSkills() {
    const skillsList = document.getElementById('skillsList');
    
    if (skills.length === 0) {
        skillsList.innerHTML = '<p class="text-center text-gray">No skills added yet. Add your first skill!</p>';
        return;
    }
    
    const skillsHTML = skills.map(skill => `
        <div class="skill-item">
            <div>
                <strong>${skill.name}</strong>
                <br>
                <small class="text-gray">${skill.category}</small>
            </div>
            <div class="skill-rating">
                ${Array.from({length: 5}, (_, i) => 
                    `<i class="fas fa-star ${i < skill.rating ? '' : 'empty'}"></i>`
                ).join('')}
                <button onclick="removeSkill(${skill.id})" class="remove-btn" title="Remove skill">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    skillsList.innerHTML = skillsHTML;
}

function removeSkill(skillId) {
    if (confirm('Are you sure you want to remove this skill?')) {
        skills = skills.filter(skill => skill.id !== skillId);
        localStorage.setItem('skills', JSON.stringify(skills));
        loadSkills();
        updateStats();
        updateCharts();
    }
}

// Projects Management
function addProject(event) {
    event.preventDefault();
    
    const project = {
        id: Date.now(),
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        technologies: document.getElementById('projectTech').value,
        link: document.getElementById('projectLink').value,
        demo: document.getElementById('projectDemo').value,
        dateAdded: new Date().toLocaleDateString()
    };
    
    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    document.getElementById('projectForm').reset();
    loadProjects();
    updateStats();
}

function loadProjects() {
    const projectsList = document.getElementById('projectsList');
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<p class="text-center text-gray">No projects added yet. Showcase your work!</p>';
        return;
    }
    
    const projectsHTML = projects.map(project => `
        <div class="project-item" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0;">${project.title}</h4>
                    <p style="margin: 0 0 0.5rem 0; color: #64748b;">${project.description}</p>
                    <p style="margin: 0 0 0.5rem 0;"><strong>Tech:</strong> ${project.technologies}</p>
                    ${project.link ? `<p style="margin: 0 0 0.5rem 0;"><a href="${project.link}" target="_blank" style="color: #2563eb;">View Code</a></p>` : ''}
                    ${project.demo ? `<p style="margin: 0;"><a href="${project.demo}" target="_blank" style="color: #2563eb;">Live Demo</a></p>` : ''}
                </div>
                <button onclick="removeProject(${project.id})" class="remove-btn" title="Remove project">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    projectsList.innerHTML = projectsHTML;
}

function removeProject(projectId) {
    if (confirm('Are you sure you want to remove this project?')) {
        projects = projects.filter(project => project.id !== projectId);
        localStorage.setItem('projects', JSON.stringify(projects));
        loadProjects();
        updateStats();
    }
}

// Certifications Management
function addCertification(event) {
    event.preventDefault();
    
    const cert = {
        id: Date.now(),
        name: document.getElementById('certName').value,
        organization: document.getElementById('certOrg').value,
        issueDate: document.getElementById('certDate').value,
        expiryDate: document.getElementById('certExpiry').value,
        url: document.getElementById('certUrl').value,
        dateAdded: new Date().toLocaleDateString()
    };
    
    certifications.push(cert);
    localStorage.setItem('certifications', JSON.stringify(certifications));
    
    document.getElementById('certForm').reset();
    loadCertifications();
    updateStats();
}

function loadCertifications() {
    const certsList = document.getElementById('certificationsList');
    
    if (certifications.length === 0) {
        certsList.innerHTML = '<p class="text-center text-gray">No certifications added yet. Add your achievements!</p>';
        return;
    }
    
    const certsHTML = certifications.map(cert => `
        <div class="cert-item" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0;">${cert.name}</h4>
                    <p style="margin: 0 0 0.25rem 0; color: #64748b;">${cert.organization}</p>
                    <p style="margin: 0 0 0.25rem 0;"><strong>Issued:</strong> ${new Date(cert.issueDate).toLocaleDateString()}</p>
                    ${cert.expiryDate ? `<p style="margin: 0 0 0.25rem 0;"><strong>Expires:</strong> ${new Date(cert.expiryDate).toLocaleDateString()}</p>` : ''}
                    ${cert.url ? `<p style="margin: 0;"><a href="${cert.url}" target="_blank" style="color: #2563eb;">View Credential</a></p>` : ''}
                </div>
                <button onclick="removeCertification(${cert.id})" class="remove-btn" title="Remove certification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    certsList.innerHTML = certsHTML;
}

function removeCertification(certId) {
    if (confirm('Are you sure you want to remove this certification?')) {
        certifications = certifications.filter(cert => cert.id !== certId);
        localStorage.setItem('certifications', JSON.stringify(certifications));
        loadCertifications();
        updateStats();
    }
}

// Stats and Analytics
function updateStats() {
    document.getElementById('skillCount').textContent = skills.length;
    document.getElementById('projectCount').textContent = projects.length;
    document.getElementById('certCount').textContent = certifications.length;
    
    // Calculate placement readiness score
    const skillScore = Math.min(skills.length * 5, 40);
    const projectScore = Math.min(projects.length * 15, 30);
    const certScore = Math.min(certifications.length * 10, 30);
    const readinessScore = skillScore + projectScore + certScore;
    
    document.getElementById('readinessScore').textContent = readinessScore + '%';
}

function initializeCharts() {
    // Skills Distribution Chart
    const skillsCtx = document.getElementById('skillsChart').getContext('2d');
    window.skillsChart = new Chart(skillsCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Proficiency Levels Chart
    const proficiencyCtx = document.getElementById('proficiencyChart').getContext('2d');
    window.proficiencyChart = new Chart(proficiencyCtx, {
        type: 'bar',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Number of Skills',
                data: [0, 0, 0, 0, 0],
                backgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    updateCharts();
}

function updateCharts() {
    // Update Skills Distribution Chart
    const categoryCount = {};
    skills.forEach(skill => {
        categoryCount[skill.category] = (categoryCount[skill.category] || 0) + 1;
    });
    
    window.skillsChart.data.labels = Object.keys(categoryCount);
    window.skillsChart.data.datasets[0].data = Object.values(categoryCount);
    window.skillsChart.update();
    
    // Update Proficiency Chart
    const proficiencyCount = [0, 0, 0, 0, 0];
    skills.forEach(skill => {
        proficiencyCount[skill.rating - 1]++;
    });
    
    window.proficiencyChart.data.datasets[0].data = proficiencyCount;
    window.proficiencyChart.update();
}

// Resume Generation
function generateResume() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userData = JSON.parse(localStorage.getItem('userData_' + user.email));
    
    const resumeContent = `
        <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
            <header style="text-align: center; padding: 2rem 0; border-bottom: 2px solid #2563eb;">
                <h1 style="margin: 0; color: #2563eb;">${userData?.fullName || 'Student Name'}</h1>
                <p style="margin: 0.5rem 0; color: #64748b;">${userData?.email || ''}</p>
                <p style="margin: 0; color: #64748b;">${userData?.department || ''} - ${userData?.year || ''}${userData?.year ? ' Year' : ''}</p>
            </header>
            
            ${skills.length > 0 ? `
            <section style="margin: 2rem 0;">
                <h2 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">Skills</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    ${Object.keys(skills.reduce((acc, skill) => {
                        if (!acc[skill.category]) acc[skill.category] = [];
                        acc[skill.category].push(skill);
                        return acc;
                    }, {})).map(category => `
                        <div>
                            <h4 style="margin: 0.5rem 0; text-transform: capitalize;">${category}</h4>
                            <ul style="margin: 0; padding-left: 1rem;">
                                ${skills.filter(s => s.category === category).map(skill => 
                                    `<li>${skill.name} (${'★'.repeat(skill.rating)}${'☆'.repeat(5-skill.rating)})</li>`
                                ).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </section>
            ` : ''}
            
            ${projects.length > 0 ? `
            <section style="margin: 2rem 0;">
                <h2 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">Projects</h2>
                ${projects.map(project => `
                    <div style="margin: 1rem 0;">
                        <h3 style="margin: 0 0 0.5rem 0;">${project.title}</h3>
                        <p style="margin: 0 0 0.5rem 0;">${project.description}</p>
                        <p style="margin: 0 0 0.5rem 0;"><strong>Technologies:</strong> ${project.technologies}</p>
                        ${project.link ? `<p style="margin: 0;"><strong>Repository:</strong> ${project.link}</p>` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${certifications.length > 0 ? `
            <section style="margin: 2rem 0;">
                <h2 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">Certifications</h2>
                ${certifications.map(cert => `
                    <div style="margin: 1rem 0;">
                        <h3 style="margin: 0 0 0.25rem 0;">${cert.name}</h3>
                        <p style="margin: 0 0 0.25rem 0; color: #64748b;">${cert.organization}</p>
                        <p style="margin: 0;">Issued: ${new Date(cert.issueDate).toLocaleDateString()}</p>
                    </div>
                `).join('')}
            </section>
            ` : ''}
        </div>
    `;
    
    document.getElementById('resumeContent').innerHTML = resumeContent;
    document.getElementById('resumePreview').style.display = 'block';
    
    // Scroll to preview
    document.getElementById('resumePreview').scrollIntoView({ behavior: 'smooth' });
}

// CSS for additional styling
const additionalCSS = `
    .text-center { text-align: center; }
    .text-gray { color: #64748b; }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-top: 1rem;
    }
    .stat-item {
        text-align: center;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 8px;
    }
    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: #2563eb;
    }
    .stat-label {
        color: #64748b;
        font-size: 0.9rem;
    }
    .remove-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 0.5rem;
        font-size: 0.8rem;
    }
    .remove-btn:hover {
        background: #dc2626;
    }
    textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
    }
`;

// Add the CSS to the document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);