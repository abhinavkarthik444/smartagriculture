// --- Login ---
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Login attempt:', {username, password});
    
    if (!username || !password) return alert("Username and password required");
    
    try {
        const loginData = {username, password};
        console.log('Sending login request:', loginData);
        
        const res = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(loginData),
            credentials: 'include'
        });
        
        console.log('Response status:', res.status);
        console.log('Response headers:', res.headers);
        
        const data = await res.json();
        console.log('Response data:', data);
        
        if (res.ok) {
            // Store current user info for chat functionality
            localStorage.setItem('currentUser', JSON.stringify({username: username}));
            alert("Login successful!");
            showDashboard();
        } else {
            console.error('Login failed:', data);
            alert(data.error || "Login failed");
        }
    } catch (e) {
        console.error('Login exception:', e);
        alert("Network error: " + e.message);
    }
}

async function logout() {
    try {
        const response = await fetch('http://localhost:5000/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Clear local storage
            localStorage.removeItem('currentUser');
            // Smooth transition back to login
            showLoginPage();
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Still hide dashboard even if logout API fails
        localStorage.removeItem('currentUser');
        showLoginPage();
    }
}

function showLoginPage() {
    const dashboard = document.getElementById('dashboard');
    const loginPage = document.getElementById('loginPage');
    
    // Fade out dashboard
    dashboard.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    dashboard.style.opacity = '0';
    dashboard.style.transform = 'scale(0.95)';
    
    // Wait for fade out, then show login page
    setTimeout(() => {
        dashboard.classList.remove("active");
        dashboard.style.opacity = '';
        dashboard.style.transform = '';
        
        loginPage.style.display = "flex";
        loginPage.style.opacity = '0';
        loginPage.style.transform = 'scale(0.95)';
        
        // Fade in login page
        setTimeout(() => {
            loginPage.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            loginPage.style.opacity = '1';
            loginPage.style.transform = 'scale(1)';
        }, 50);
        
        // Clear login form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }, 300);
}

// --- Registration ---
async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const full_name = document.getElementById('regFullName').value;
    const farm_location = document.getElementById('regFarmLocation').value;

    if (!username || !email || !password) {
        alert('Username, email, and password are required!');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                full_name: full_name,
                farm_location: farm_location
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! You can now login.');
            showLoginForm();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Network error. Please check if the backend server is running.');
    }
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showDashboard() {
    const loginPage = document.getElementById('loginPage');
    const dashboard = document.getElementById('dashboard');
    
    // Fade out login page
    loginPage.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    loginPage.style.opacity = '0';
    loginPage.style.transform = 'scale(0.95)';
    
    // Wait for fade out, then show dashboard
    setTimeout(() => {
        loginPage.style.display = 'none';
        dashboard.classList.add('active');
        
        // Show dashboard content and hide content area
        document.getElementById('dashboardContent').style.display = 'block';
        document.getElementById('contentArea').style.display = 'none';
        
        // Initialize dashboard components
        setTimeout(() => initCharts(), 100);
        setTimeout(() => loadChatFromLocalStorage(), 150);
        setTimeout(() => startCamera(), 200);
    }, 300);
}

// --- Graph ---
function initCharts() {
    // Temperature Analysis - Bar Chart
    const tempCtx = document.getElementById('temperatureChart');
    new Chart(tempCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Temperature (°C)',
                data: [30, 32, 31, 29, 28, 27, 29],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40
                }
            }
        }
    });

    // Crop Distribution - Pie Chart
    const cropCtx = document.getElementById('cropChart');
    new Chart(cropCtx, {
        type: 'pie',
        data: {
            labels: ['Wheat', 'Rice', 'Corn', 'Soybean', 'Other'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(168, 85, 247, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });

    // Rainfall Pattern - Bar Chart
    const rainfallCtx = document.getElementById('rainfallChart');
    new Chart(rainfallCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Rainfall (mm)',
                data: [5, 12, 8, 2, 0, 15, 10],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 20
                }
            }
        }
    });

    // Yield Performance - Line Chart
    const yieldCtx = document.getElementById('yieldChart');
    new Chart(yieldCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Yield Index',
                data: [70, 85, 78, 65, 60, 90, 80],
                borderColor: 'rgba(34, 197, 94, 1)',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    document.getElementById("aiStatus").innerText = "Optimal conditions detected for crop growth 🌱📊";
}

// --- AI Assistant ---
async function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const chatBox = document.getElementById('chatBox');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.innerHTML = `<strong>You:</strong> ${message}`;
    userMsg.style.color = '#1f2937';
    userMsg.style.marginBottom = '10px';
    chatBox.appendChild(userMsg);
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    const typingMsg = document.createElement('div');
    typingMsg.innerHTML = `<strong>AI:</strong> <em>Thinking...</em>`;
    typingMsg.style.color = '#059669';
    typingMsg.style.marginBottom = '10px';
    chatBox.appendChild(typingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        // Send message to backend AI
        const response = await fetch('http://localhost:5000/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        // Remove typing indicator
        typingMsg.remove();
        
        if (response.ok) {
            const data = await response.json();
            
            // Add AI response
            const aiMsg = document.createElement('div');
            aiMsg.innerHTML = `<strong>AI:</strong> ${data.response}`;
            aiMsg.style.color = '#059669';
            aiMsg.style.marginBottom = '10px';
            aiMsg.style.padding = '8px';
            aiMsg.style.backgroundColor = '#f0fdf4';
            aiMsg.style.borderRadius = '6px';
            aiMsg.style.borderLeft = '4px solid #16a34a';
            chatBox.appendChild(aiMsg);
            
        } else {
            const error = await response.json();
            const errorMsg = document.createElement('div');
            errorMsg.innerHTML = `<strong>AI:</strong> Sorry, I encountered an error: ${error.error}`;
            errorMsg.style.color = '#dc2626';
            errorMsg.style.marginBottom = '10px';
            chatBox.appendChild(errorMsg);
        }
        
    } catch (error) {
        // Remove typing indicator
        typingMsg.remove();
        
        // Add error message
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = `<strong>AI:</strong> Sorry, I'm having trouble connecting. Please check your internet connection and try again.`;
        errorMsg.style.color = '#dc2626';
        errorMsg.style.marginBottom = '10px';
        chatBox.appendChild(errorMsg);
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Save chat to localStorage
    saveChatToLocalStorage();
}

function saveChatToLocalStorage() {
    const chatBox = document.getElementById('chatBox');
    const messages = [];
    
    chatBox.children.forEach(child => {
        messages.push(child.innerHTML);
    });
    
    localStorage.setItem('aiChatMessages', JSON.stringify(messages));
}

function loadChatFromLocalStorage() {
    const chatBox = document.getElementById('chatBox');
    const savedMessages = localStorage.getItem('aiChatMessages');
    
    if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        messages.forEach(messageHTML => {
            const msg = document.createElement('div');
            msg.innerHTML = messageHTML;
            msg.style.marginBottom = '10px';
            
            // Apply appropriate styling based on content
            if (messageHTML.includes('You:')) {
                msg.style.color = '#1f2937';
            } else if (messageHTML.includes('AI:')) {
                msg.style.color = '#059669';
                msg.style.padding = '8px';
                msg.style.backgroundColor = '#f0fdf4';
                msg.style.borderRadius = '6px';
                msg.style.borderLeft = '4px solid #16a34a';
            }
            
            chatBox.appendChild(msg);
        });
    } else {
        // Add welcome message
        const welcomeMsg = document.createElement('div');
        welcomeMsg.innerHTML = `<strong>AI:</strong> Hello! I'm your AI farming assistant. I can help with crop management, weather analysis, soil health, fertilization, pest control, and market information. How can I assist you today?`;
        welcomeMsg.style.color = '#059669';
        welcomeMsg.style.marginBottom = '10px';
        welcomeMsg.style.padding = '8px';
        welcomeMsg.style.backgroundColor = '#f0fdf4';
        welcomeMsg.style.borderRadius = '6px';
        welcomeMsg.style.borderLeft = '4px solid #16a34a';
        chatBox.appendChild(welcomeMsg);
    }
}

function addActivity(activity) {
    const list = document.getElementById('activities');
    const li = document.createElement('li');
    li.innerHTML = activity + " <button onclick='markDone(this)'>✔</button>";
    list.prepend(li);
}

function markDone(btn) {
    const li = btn.parentElement;
    li.style.textDecoration = "line-through"; li.style.color = "#9ca3af"; btn.remove();
}

// --- Camera ---
function startCamera() {
    const video = document.getElementById('video');
    
    // Check if video element exists
    if (!video) {
        console.error("Video element not found");
        return;
    }
    
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Browser doesn't support camera access");
        // Show fallback message
        const cameraCard = video.closest('.card');
        if (cameraCard) {
            cameraCard.innerHTML = `
                <h4>📷 Crop Camera</h4>
                <p style="color: #ef4444; padding: 20px; text-align: center;">
                    Camera not available in your browser or requires HTTPS connection.
                    <br><br>
                    Please use a modern browser (Chrome, Firefox, Edge) and ensure you're on HTTPS.
                </p>
                <button onclick="capturePhoto()" disabled style="opacity: 0.5;">Capture & Analyze</button>
            `;
        }
        return;
    }
    
    // Request camera access with better constraints
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'environment' // Prefer back camera on mobile
        } 
    })
    .then(stream => {
        video.srcObject = stream;
        console.log("Camera started successfully");
        
        // Add visual indicator that camera is working
        video.style.border = "2px solid #22c55e";
        video.style.borderRadius = "8px";
    })
    .catch(err => {
        console.error("Camera error:", err);
        
        // Show user-friendly error message
        const cameraCard = video.closest('.card');
        if (cameraCard) {
            let errorMessage = "Camera access denied or not available.";
            
            if (err.name === 'NotAllowedError') {
                errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
            } else if (err.name === 'NotFoundError') {
                errorMessage = "No camera found. Please connect a camera and try again.";
            } else if (err.name === 'NotReadableError') {
                errorMessage = "Camera is already in use by another application.";
            }
            
            cameraCard.innerHTML = `
                <h4>📷 Crop Camera</h4>
                <p style="color: #ef4444; padding: 20px; text-align: center;">
                    ${errorMessage}
                    <br><br>
                    <small>Please check your browser permissions and try again.</small>
                </p>
                <button onclick="startCamera()" style="background: #16a34a; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Retry Camera</button>
            `;
        }
    });
}
function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    // Check if video element exists and has stream
    if (!video || !video.srcObject) {
        alert("Camera is not active. Please start the camera first.");
        return;
    }
    
    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("Camera is still loading. Please wait a moment and try again.");
        return;
    }
    
    try {
        canvas.style.display = "block";
        canvas.width = video.videoWidth; 
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        // Show captured image briefly
        canvas.style.border = "2px solid #22c55e";
        canvas.style.borderRadius = "8px";
        
        // Add analysis result
        const analysis = "📷 AI analyzed photo: Crops healthy with slight heat stress.";
        addActivity(analysis);
        
        // Hide canvas after 2 seconds
        setTimeout(() => {
            canvas.style.display = "none";
        }, 2000);
        
    } catch (error) {
        console.error("Error capturing photo:", error);
        alert("Failed to capture photo. Please try again.");
    }
}
// --- Menu Navigation ---

function loadMenuContent(type) {
    const contentArea = document.getElementById('contentArea');
    const dashboardContent = document.getElementById('dashboardContent');
    console.log('Loading menu content:', type);
    
    // Remove active state from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active state to clicked nav item
    if (type !== 'home' && type !== 'Logout') {
        const clickedItem = document.querySelector(`.nav-item[onclick="loadMenuContent('${type}')"]`);
        if (clickedItem) {
            clickedItem.classList.add('active');
        }
    }
    
    // Handle home button separately - show dashboard, hide content area
    if (type === 'home') {
        console.log('Home button clicked - showing dashboard');
        
        // Simple fade out content area
        contentArea.classList.add('fade-out');
        
        setTimeout(() => {
            // Hide content area and show dashboard
            contentArea.style.display = 'none';
            dashboardContent.style.display = 'block';
            
            // Simple fade in dashboard
            dashboardContent.classList.remove('fade-out');
            dashboardContent.classList.add('fade-in');
            
            // Reinitialize dashboard components
            setTimeout(() => initCharts(), 100);
            setTimeout(() => loadChatFromLocalStorage(), 150);
            setTimeout(() => startCamera(), 200);
        }, 200); // Reduced timing for faster response
        return;
    }
    
    // For all other menu items, add simple smooth transitions
    // Simple fade out dashboard first
    dashboardContent.classList.add('fade-out');
    
    setTimeout(() => {
        // Hide dashboard and show content area
        dashboardContent.style.display = 'none';
        contentArea.style.display = 'block';
        
        // Load the content immediately
        console.log('Switch statement executing for:', type);
        switch(type) {
        case 'crop':
            loadCropManagement();
            break;
        case 'community':
            loadCommunity();
            break;
        case 'market':
            loadMarketplace();
            break;
        case 'land':
            loadLandDetails();
            break;
        case 'fertilizer':
            loadFertilizerShop();
            break;
        case 'govt':
            loadGovernmentSchemes();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'Logout':
            logout();
            break;
        default:
            // Show default dashboard with graph
            dashboardContent.style.display = 'block';
            contentArea.style.display = 'none';
        }
        
        // Simple fade in content area
        setTimeout(() => {
            contentArea.classList.remove('fade-out');
            contentArea.classList.add('fade-in');
        }, 50);
    }, 200); // Reduced timing for faster response
}

function loadDefaultDashboard() {
    const contentArea = document.getElementById('contentArea');
    
    // Restore the original home page content with AI Assistant and Camera
    contentArea.innerHTML = `
        <div class="grid" id="dashboardContent">
            <div class="card">
                <h4>🤖 AI Assistant</h4>
                <div class="chat-box" id="chatBox"></div>
                <div class="chat-input">
                    <input type="text" id="aiInput" placeholder="Ask AI..."
                        onkeypress="if(event.key==='Enter') sendAIMessage()" />
                    <button onclick="sendAIMessage()">Send</button>
                </div>
            </div>

            <div class="card">
                <h4>📷 Crop Camera</h4>
                <video id="video" autoplay></video>
                <canvas id="canvas" style="display:none;"></canvas>
                <button onclick="capturePhoto()">Capture & Analyze</button>
            </div>

            <div class="card">
                <h4>📌 Activities</h4>
                <ul id="activities"></ul>
            </div>
        </div>
    `;
    
    // Initialize charts after loading the default dashboard
    setTimeout(() => initCharts(), 100);
    // Initialize AI Assistant chat
    setTimeout(() => loadChatFromLocalStorage(), 150);
    // Start camera
    setTimeout(() => startCamera(), 200);
    
    // Ensure proper transition classes
    contentArea.classList.remove('fade-out');
    contentArea.classList.add('fade-in');
}

function refreshDashboard() {
    const contentArea = document.getElementById('contentArea');
    
    // Add fade-out transition
    contentArea.classList.add('fade-out');
    
    // Wait for fade-out to complete, then refresh content
    setTimeout(() => {
        loadDefaultDashboard();
        
        // Show a brief notification that dashboard has been refreshed
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: #16a34a; color: white; 
            padding: 10px 20px; border-radius: 6px; z-index: 1000; 
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = 'Dashboard refreshed!';
        document.body.appendChild(notification);
        
        // Remove notification after 2 seconds
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }, 300);
}

// --- COMPREHENSIVE CROP MANAGEMENT ---
async function loadCropManagement() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="crop-management-container">
            <div class="crop-header">
                <h2> Crop Management Hub</h2>
                <p>Comprehensive crop planning, monitoring, and yield optimization tools</p>
            </div>
            
            <div class="crop-modules-grid">
                <div class="crop-module-card" onclick="loadCropSelection()">
                    <div class="module-icon"></div>
                    <h3>Crop Selection</h3>
                    <p>AI-powered crop recommendations based on soil, climate, and market conditions</p>
                    <div class="module-features">
                        <span class="feature-tag"> AI Analysis</span>
                        <span class="feature-tag"> Data-Driven</span>
                    </div>
                </div>
                
                <div class="crop-module-card" onclick="loadCropCalendar()">
                    <div class="module-icon"></div>
                    <h3>Crop Calendar</h3>
                    <p>Seasonal planning and scheduling for optimal crop management</p>
                    <div class="module-features">
                        <span class="feature-tag"> Planning</span>
                        <span class="feature-tag"> Scheduling</span>
                    </div>
                </div>
                
                <div class="crop-module-card" onclick="loadDiseaseDetection()">
                    <div class="module-icon"></div>
                    <h3>Disease Detection</h3>
                    <p>AI-powered plant disease identification and treatment recommendations</p>
                    <div class="module-features">
                        <span class="feature-tag"> Image Analysis</span>
                        <span class="feature-tag"> Treatment</span>
                    </div>
                </div>
                
                <div class="crop-module-card" onclick="loadPestControl()">
                    <div class="module-icon"></div>
                    <h3>Pest Control</h3>
                    <p>Integrated pest management with organic and chemical solutions</p>
                    <div class="module-features">
                        <span class="feature-tag"> Organic</span>
                        <span class="feature-tag"> Chemical</span>
                    </div>
                </div>
                
                <div class="crop-module-card" onclick="loadGrowthTracking()">
                    <div class="module-icon"></div>
                    <h3>Growth Tracking</h3>
                    <p>Monitor crop development with detailed growth analytics</p>
                    <div class="module-features">
                        <span class="feature-tag"> Analytics</span>
                        <span class="feature-tag"> Mobile</span>
                    </div>
                </div>
                
                <div class="crop-module-card" onclick="loadYieldPrediction()">
                    <div class="module-icon"></div>
                    <h3>Yield Prediction</h3>
                    <p>AI-powered yield forecasting with revenue estimation</p>
                    <div class="module-features">
                        <span class="feature-tag"> AI Forecast</span>
                        <span class="feature-tag"> Revenue</span>
                    </div>
                </div>
                
                <div class="crop-module-card" onclick="loadIrrigationPlanner()">
                    <div class="module-icon"></div>
                    <h3>Irrigation Planner</h3>
                    <p>Smart water management with automated scheduling</p>
                    <div class="module-features">
                        <span class="feature-tag"> Water Saving</span>
                        <span class="feature-tag"> Automation</span>
                    </div>
                </div>
                
                <div class="crop-module-card" onclick="loadWeatherIntegration()">
                    <div class="module-icon"></div>
                    <h3>Weather Integration</h3>
                    <p>Real-time weather monitoring and climate-based recommendations</p>
                    <div class="module-features">
                        <span class="feature-tag"> Live Weather</span>
                        <span class="feature-tag"> Alerts</span>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3> Quick Actions</h3>
                <div class="actions-grid">
                    <button onclick="quickCropAnalysis()" class="action-btn">
                        <span class="btn-icon"></span>
                        <span class="btn-text">Quick Crop Analysis</span>
                    </button>
                    <button onclick="scheduleIrrigation()" class="action-btn">
                        <span class="btn-icon"></span>
                        <span class="btn-text">Schedule Irrigation</span>
                    </button>
                    <button onclick="checkWeather()" class="action-btn">
                        <span class="btn-icon"></span>
                        <span class="btn-text">Check Weather</span>
                    </button>
                    <button onclick="viewCropReports()" class="action-btn">
                        <span class="btn-icon"></span>
                        <span class="btn-text">View Reports</span>
                    </button>
                </div>
            </div>
        </div>
        
        <style>
        .crop-management-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .crop-header {
            text-align: center;
            background: linear-gradient(135deg, #16a34a, #22c55e);
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin-bottom: 40px;
        }
        
        .crop-header h2 {
            margin: 0 0 10px 0;
            font-size: 2.5rem;
        }
        
        .crop-header p {
            margin: 0;
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .crop-modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .crop-module-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
        }
        
        .crop-module-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            border-color: #16a34a;
        }
        
        .module-icon {
            font-size: 3.5rem;
            margin-bottom: 20px;
        }
        
        .crop-module-card h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 1.4rem;
        }
        
        .crop-module-card p {
            color: #6b7280;
            margin: 0 0 20px 0;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        .module-features {
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .feature-tag {
            background: #f0fdf4;
            color: #16a34a;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .quick-actions {
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
        }
        
        .quick-actions h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .action-btn {

        .action-btn.primary {
            background: linear-gradient(135deg, #16a34a, #22c55e);
            color: white;
        }

        .action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
        }

        .action-btn.secondary {
            background: white;
            color: #1f2937;
            border: 2px solid #e5e7eb;
        }

        .action-btn.secondary:hover {
            background: #f3f4f6;
            border-color: #16a34a;
            transform: translateY(-2px);
        }

        .action-btn span {
            font-size: 1.2rem;
        }

        @media (max-width: 768px) {
            .crop-modules-grid {
                grid-template-columns: 1fr;
            }
            
            .action-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .action-btn {
                width: 100%;
                max-width: 300px;
                justify-content: center;
            }
        }
        </style>
    `;
}

// --- CROP SUB-MODULES ---
async function loadCropSelection() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="crop-selection-container">
            <div class="selection-header">
                <h2>🌱 AI-Powered Crop Selection</h2>
                <p>Get personalized crop recommendations based on your soil, weather, and season</p>
            </div>
            
            <div class="selection-form">
                <div class="form-section">
                    <h3>🌍 Location & Soil Analysis</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Soil Type</label>
                            <select id="soilType" class="form-input">
                                <option value="">Select Soil Type</option>
                                <option value="clay">Clay Soil</option>
                                <option value="sandy">Sandy Soil</option>
                                <option value="loamy">Loamy Soil</option>
                                <option value="silty">Silty Soil</option>
                                <option value="peaty">Peaty Soil</option>
                                <option value="chalky">Chalky Soil</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>pH Level</label>
                            <input type="number" id="phLevel" class="form-input" placeholder="6.5" min="0" max="14" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Organic Matter (%)</label>
                            <input type="number" id="organicMatter" class="form-input" placeholder="2.5" min="0" max="10" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Drainage</label>
                            <select id="drainage" class="form-input">
                                <option value="">Select Drainage</option>
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="moderate">Moderate</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>🌤️ Weather & Season</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Current Season</label>
                            <select id="season" class="form-input">
                                <option value="">Select Season</option>
                                <option value="summer">Summer (Mar-Jun)</option>
                                <option value="monsoon">Monsoon (Jul-Oct)</option>
                                <option value="winter">Winter (Nov-Feb)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Average Temperature (°C)</label>
                            <input type="number" id="avgTemp" class="form-input" placeholder="28" min="10" max="45">
                        </div>
                        <div class="form-group">
                            <label>Rainfall (mm/year)</label>
                            <input type="number" id="rainfall" class="form-input" placeholder="800" min="0" max="3000">
                        </div>
                        <div class="form-group">
                            <label>Water Availability</label>
                            <select id="waterAvailability" class="form-input">
                                <option value="">Select Water Source</option>
                                <option value="abundant">Abundant</option>
                                <option value="moderate">Moderate</option>
                                <option value="limited">Limited</option>
                                <option value="scarce">Scarce</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>🎯 Farming Preferences</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Farming Type</label>
                            <select id="farmingType" class="form-input">
                                <option value="">Select Type</option>
                                <option value="organic">Organic</option>
                                <option value="conventional">Conventional</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Market Preference</label>
                            <select id="marketPreference" class="form-input">
                                <option value="">Select Market</option>
                                <option value="local">Local Market</option>
                                <option value="export">Export Market</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Investment Capacity</label>
                            <select id="investmentCapacity" class="form-input">
                                <option value="">Select Range</option>
                                <option value="low">Low (₹10,000-50,000)</option>
                                <option value="medium">Medium (₹50,000-2,00,000)</option>
                                <option value="high">High (₹2,00,000+)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Experience Level</label>
                            <select id="experienceLevel" class="form-input">
                                <option value="">Select Level</option>
                                <option value="beginner">Beginner (0-2 years)</option>
                                <option value="intermediate">Intermediate (2-5 years)</option>
                                <option value="experienced">Experienced (5+ years)</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="action-section">
                    <button onclick="analyzeCropSelection()" class="analyze-btn">
                        <span>🔍</span> Analyze & Recommend Crops
                    </button>
                    <button onclick="resetCropSelection()" class="reset-btn">
                        <span>🔄</span> Reset Form
                    </button>
                </div>
                
                <div id="cropRecommendations" class="recommendations-section" style="display: none;">
                    <h3>🌾 Recommended Crops</h3>
                    <div id="recommendedCropsList" class="crops-grid"></div>
                </div>
            </div>
        </div>
        
        <style>
        .crop-selection-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .selection-header {
            text-align: center;
            background: linear-gradient(135deg, #16a34a, #22c55e);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .selection-header h2 {
            margin: 0 0 10px 0;
            font-size: 2rem;
        }
        
        .selection-form {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .form-section {
            margin-bottom: 30px;
        }
        
        .form-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            font-size: 1.3rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
        }
        
        .form-group label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .form-input {
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #16a34a;
            box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }
        
        .action-section {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 30px 0;
        }
        
        .analyze-btn, .reset-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .analyze-btn {
            background: linear-gradient(135deg, #16a34a, #22c55e);
            color: white;
        }
        
        .analyze-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
        }
        
        .reset-btn {
            background: #f3f4f6;
            color: #6b7280;
            border: 2px solid #e5e7eb;
        }
        
        .reset-btn:hover {
            background: #e5e7eb;
            transform: translateY(-2px);
        }
        
        .recommendations-section {
            margin-top: 30px;
            padding: 25px;
            background: #f0fdf4;
            border-radius: 15px;
            border: 2px solid #16a34a;
        }
        
        .recommendations-section h3 {
            color: #16a34a;
            margin-bottom: 20px;
        }
        
        .crops-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .crop-recommendation {
            background: white;
            border-radius: 12px;
            padding: 20px;
            border: 2px solid #e5e7eb;
            transition: all 0.3s ease;
        }
        
        .crop-recommendation:hover {
            border-color: #16a34a;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        
        .crop-recommendation h4 {
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .crop-recommendation .match-score {
            background: #16a34a;
            color: white;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 10px;
        }
        
        .crop-recommendation .features {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
        }
        
        .crop-recommendation .feature-tag {
            background: #f3f4f6;
            color: #6b7280;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
        }
        </style>
    `;
}

async function analyzeCropSelection() {
    const soilType = document.getElementById('soilType').value;
    const phLevel = document.getElementById('phLevel').value;
    const season = document.getElementById('season').value;
    const avgTemp = document.getElementById('avgTemp').value;
    const rainfall = document.getElementById('rainfall').value;
    
    if (!soilType || !phLevel || !season || !avgTemp || !rainfall) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Simulate AI analysis
    const recommendations = generateCropRecommendations(soilType, phLevel, season, avgTemp, rainfall);
    
    const recommendationsSection = document.getElementById('cropRecommendations');
    const cropsList = document.getElementById('recommendedCropsList');
    
    recommendationsSection.style.display = 'block';
    
    cropsList.innerHTML = recommendations.map(crop => `
        <div class="crop-recommendation">
            <h4>${crop.name}</h4>
            <div class="match-score">${crop.matchScore}% Match</div>
            <p><strong>Expected Yield:</strong> ${crop.yield} quintals/hectare</p>
            <p><strong>Growing Period:</strong> ${crop.period} days</p>
            <p><strong>Water Need:</strong> ${crop.water}</p>
            <div class="features">
                ${crop.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
            </div>
            <button onclick="selectCrop('${crop.name}')" style="margin-top: 15px; background: #16a34a; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                Select This Crop
            </button>
        </div>
    `).join('');
    
    showNotification('Crop recommendations generated successfully!', 'success');
}

function generateCropRecommendations(soilType, phLevel, season, temp, rainfall) {
    const crops = [
        {
            name: 'Rice',
            matchScore: 92,
            yield: '45-50',
            period: '120-150',
            water: 'High',
            features: ['Monsoon Crop', 'High Yield', 'Water Intensive']
        },
        {
            name: 'Wheat',
            matchScore: 88,
            yield: '30-35',
            period: '110-130',
            water: 'Moderate',
            features: ['Winter Crop', 'Low Maintenance', 'Good Market']
        },
        {
            name: 'Cotton',
            matchScore: 85,
            yield: '15-20',
            period: '160-180',
            water: 'Moderate',
            features: ['Summer Crop', 'High Value', 'Export Potential']
        },
        {
            name: 'Sugarcane',
            matchScore: 82,
            yield: '70-80',
            period: '300-365',
            water: 'High',
            features: ['Year-round', 'High Profit', 'Industrial']
        }
    ];
    
    return crops.sort((a, b) => b.matchScore - a.matchScore);
}

async function loadCropCalendar() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="crop-calendar-container">
            <div class="calendar-header">
                <h2>📅 Crop Calendar Management</h2>
                <p>Plan sowing, irrigation, and harvesting schedules</p>
            </div>
            
            <div class="calendar-controls">
                <div class="control-group">
                    <label>Select Crop:</label>
                    <select id="calendarCrop" class="control-input">
                        <option value="">Choose a crop</option>
                        <option value="rice">Rice</option>
                        <option value="wheat">Wheat</option>
                        <option value="cotton">Cotton</option>
                        <option value="sugarcane">Sugarcane</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Season:</label>
                    <select id="calendarSeason" class="control-input">
                        <option value="summer">Summer</option>
                        <option value="monsoon">Monsoon</option>
                        <option value="winter">Winter</option>
                    </select>
                </div>
                <button onclick="generateCropCalendar()" class="generate-btn">
                    <span>📊</span> Generate Calendar
                </button>
            </div>
            
            <div id="calendarContent" class="calendar-content">
                <div class="calendar-timeline">
                    <div class="timeline-item">
                        <div class="timeline-date">Day 1-7</div>
                        <div class="timeline-content">
                            <h4>🌱 Land Preparation</h4>
                            <ul>
                                <li>Plow and level the field</li>
                                <li>Apply basal fertilizers</li>
                                <li>Prepare seedbeds</li>
                                <li>Test soil moisture</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-date">Day 8-14</div>
                        <div class="timeline-content">
                            <h4>🌾 Sowing</h4>
                            <ul>
                                <li>Optimal sowing time</li>
                                <li>Seed treatment</li>
                                <li>Maintain proper spacing</li>
                                <li>Initial irrigation</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-date">Day 15-45</div>
                        <div class="timeline-content">
                            <h4>🌱 Early Growth</h4>
                            <ul>
                                <li>Monitor germination</li>
                                <li>First fertilizer application</li>
                                <li>Weed control</li>
                                <li>Regular irrigation</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-date">Day 46-90</div>
                        <div class="timeline-content">
                            <h4>🌿 Vegetative Stage</h4>
                            <ul>
                                <li>Second fertilizer dose</li>
                                <li>Pest monitoring</li>
                                <li>Disease prevention</li>
                                <li>Optimal irrigation</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-date">Day 91-120</div>
                        <div class="timeline-content">
                            <h4>🌾 Flowering & Fruiting</h4>
                            <ul>
                                <li>Critical irrigation period</li>
                                <li>Third fertilizer dose</li>
                                <li>Intensive pest control</li>
                                <li>Stress management</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-date">Day 121-150</div>
                        <div class="timeline-content">
                            <h4>🌾 Harvesting</h4>
                            <ul>
                                <li>Stop irrigation 15 days before</li>
                                <li>Monitor crop maturity</li>
                                <li>Plan harvesting logistics</li>
                                <li>Post-harvest handling</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="calendar-actions">
                <button onclick="downloadCropCalendar()" class="download-btn">
                    <span>📥</span> Download Calendar
                </button>
                <button onclick="setCropReminders()" class="reminder-btn">
                    <span>⏰</span> Set Reminders
                </button>
            </div>
        </div>
        
        <style>
        .crop-calendar-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .calendar-header {
            text-align: center;
            background: linear-gradient(135deg, #3b82f6, #60a5fa);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .calendar-controls {
            display: flex;
            gap: 20px;
            align-items: end;
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .control-group label {
            font-weight: 600;
            color: #374151;
        }
        
        .control-input {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .generate-btn {
            background: linear-gradient(135deg, #3b82f6, #60a5fa);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .generate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
        
        .calendar-content {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .calendar-timeline {
            position: relative;
        }
        
        .timeline-item {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            position: relative;
        }
        
        .timeline-item::before {
            content: '';
            position: absolute;
            left: 80px;
            top: 40px;
            bottom: -30px;
            width: 2px;
            background: #e5e7eb;
        }
        
        .timeline-item:last-child::before {
            display: none;
        }
        
        .timeline-date {
            background: #3b82f6;
            color: white;
            padding: 12px 16px;
            border-radius: 10px;
            font-weight: 600;
            min-width: 120px;
            text-align: center;
        }
        
        .timeline-content {
            flex: 1;
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
        }
        
        .timeline-content h4 {
            margin: 0 0 15px 0;
            color: #1f2937;
        }
        
        .timeline-content ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .timeline-content li {
            margin-bottom: 8px;
            color: #4b5563;
        }
        
        .calendar-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .download-btn, .reminder-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .download-btn {
            background: #10b981;
            color: white;
        }
        
        .download-btn:hover {
            background: #059669;
            transform: translateY(-2px);
        }
        
        .reminder-btn {
            background: #f59e0b;
            color: white;
        }
        
        .reminder-btn:hover {
            background: #d97706;
            transform: translateY(-2px);
        }
        </style>
    `;
}

async function loadDiseaseDetection() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="disease-detection-container">
            <div class="detection-header">
                <h2>🔬 AI Disease Detection</h2>
                <p>Upload crop images for instant disease identification and treatment recommendations</p>
            </div>
            
            <div class="detection-upload">
                <div class="upload-area" onclick="document.getElementById('diseaseImageInput').click()">
                    <div class="upload-icon">📷</div>
                    <h3>Upload Crop Image</h3>
                    <p>Click to upload or drag & drop image here</p>
                    <input type="file" id="diseaseImageInput" accept="image/*" style="display: none;" onchange="analyzeDiseaseImage(this)">
                </div>
                
                <div class="upload-guidelines">
                    <h4>📋 Guidelines for Best Results:</h4>
                    <ul>
                        <li>📸 Clear, well-lit photos</li>
                        <li>🌾 Focus on affected areas</li>
                        <li>📏 Include scale reference if possible</li>
                        <li>🔄 Multiple angles recommended</li>
                        <li>☀️ Avoid shadows and glare</li>
                    </ul>
                </div>
            </div>
            
            <div id="diseaseResults" class="disease-results" style="display: none;">
                <h3>🔍 Analysis Results</h3>
                <div id="diseaseAnalysisContent" class="analysis-content"></div>
            </div>
            
            <div class="recent-detections">
                <h3>📊 Recent Detections</h3>
                <div class="detections-grid">
                    <div class="detection-card">
                        <img src="https://picsum.photos/seed/disease1/200/150.jpg" alt="Disease sample">
                        <div class="detection-info">
                            <h4>Leaf Blight</h4>
                            <p><strong>Confidence:</strong> 92%</p>
                            <p><strong>Date:</strong> 2 days ago</p>
                            <span class="severity high">High Severity</span>
                        </div>
                    </div>
                    <div class="detection-card">
                        <img src="https://picsum.photos/seed/disease2/200/150.jpg" alt="Disease sample">
                        <div class="detection-info">
                            <h4>Aphid Infestation</h4>
                            <p><strong>Confidence:</strong> 87%</p>
                            <p><strong>Date:</strong> 5 days ago</p>
                            <span class="severity medium">Medium Severity</span>
                        </div>
                    </div>
                    <div class="detection-card">
                        <img src="https://picsum.photos/seed/disease3/200/150.jpg" alt="Disease sample">
                        <div class="detection-info">
                            <h4>Healthy Plant</h4>
                            <p><strong>Confidence:</strong> 95%</p>
                            <p><strong>Date:</strong> 1 week ago</p>
                            <span class="severity low">No Issues</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .disease-detection-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .detection-header {
            text-align: center;
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .detection-upload {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .upload-area {
            border: 3px dashed #dc2626;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #fef2f2;
        }
        
        .upload-area:hover {
            border-color: #b91c1c;
            background: #fee2e2;
            transform: translateY(-3px);
        }
        
        .upload-icon {
            font-size: 4rem;
            margin-bottom: 15px;
        }
        
        .upload-guidelines {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .upload-guidelines h4 {
            color: #1f2937;
            margin-bottom: 15px;
        }
        
        .upload-guidelines ul {
            list-style: none;
            padding: 0;
        }
        
        .upload-guidelines li {
            margin-bottom: 10px;
            color: #4b5563;
            font-size: 0.95rem;
        }
        
        .disease-results {
            background: #f0fdf4;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            border: 2px solid #16a34a;
        }
        
        .disease-results h3 {
            color: #16a34a;
            margin-bottom: 20px;
        }
        
        .analysis-content {
            background: white;
            border-radius: 12px;
            padding: 25px;
        }
        
        .recent-detections h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .detections-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .detection-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .detection-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .detection-card img {
            width: 100%;
            height: 150px;
            object-fit: cover;
        }
        
        .detection-info {
            padding: 20px;
        }
        
        .detection-info h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        
        .detection-info p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .severity {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .severity.high {
            background: #dc2626;
            color: white;
        }
        
        .severity.medium {
            background: #f59e0b;
            color: white;
        }
        
        .severity.low {
            background: #16a34a;
            color: white;
        }
        </style>
    `;
}

async function analyzeDiseaseImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Simulate AI analysis
            setTimeout(() => {
                showDiseaseAnalysisResults(e.target.result);
            }, 2000);
            
            showNotification('Analyzing image...', 'info');
        };
        
        reader.readAsDataURL(file);
    }
}

function showDiseaseAnalysisResults(imageData) {
    const resultsSection = document.getElementById('diseaseResults');
    const analysisContent = document.getElementById('diseaseAnalysisContent');
    
    resultsSection.style.display = 'block';
    
    analysisContent.innerHTML = `
        <div class="result-grid">
            <div class="result-image">
                <img src="${imageData}" alt="Analyzed crop">
            </div>
            <div class="result-details">
                <h4>🔬 Analysis Complete</h4>
                <div class="disease-identified">
                    <h5>Identified Issue:</h5>
                    <p class="disease-name">Bacterial Leaf Blight</p>
                    <p class="confidence">Confidence: 89%</p>
                </div>
                
                <div class="treatment-plan">
                    <h5>🌿 Recommended Treatment:</h5>
                    <ul>
                        <li>Apply copper-based fungicide</li>
                        <li>Remove affected leaves immediately</li>
                        <li>Improve air circulation</li>
                        <li>Avoid overhead irrigation</li>
                        <li>Monitor for 7-10 days</li>
                    </ul>
                </div>
                
                <div class="prevention-tips">
                    <h5>🛡️ Prevention Tips:</h5>
                    <ul>
                        <li>Crop rotation every 2-3 years</li>
                        <li>Use disease-resistant varieties</li>
                        <li>Maintain proper spacing</li>
                        <li>Ensure good drainage</li>
                    </ul>
                </div>
                
                <div class="action-buttons">
                    <button onclick="saveDiseaseReport()" class="save-btn">
                        💾 Save Report
                    </button>
                    <button onclick="shareDiseaseReport()" class="share-btn">
                        📤 Share with Expert
                    </button>
                </div>
            </div>
        </div>
        
        <style>
        .result-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
        }
        
        .result-image img {
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .result-details h4 {
            color: #16a34a;
            margin-bottom: 20px;
        }
        
        .disease-identified {
            background: #fef2f2;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #dc2626;
        }
        
        .disease-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1f2937;
            margin: 5px 0;
        }
        
        .confidence {
            color: #059669;
            font-weight: 600;
        }
        
        .treatment-plan, .prevention-tips {
            background: #f0fdf4;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .treatment-plan {
            border-left: 4px solid #16a34a;
        }
        
        .prevention-tips {
            border-left: 4px solid #3b82f6;
        }
        
        .treatment-plan h5, .prevention-tips h5 {
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .treatment-plan ul, .prevention-tips ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .treatment-plan li, .prevention-tips li {
            margin-bottom: 8px;
            color: #4b5563;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            margin-top: 20px;
        }
        
        .save-btn, .share-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #16a34a;
            color: white;
        }
        
        .save-btn:hover {
            background: #15803d;
        }
        
        .share-btn {
            background: #3b82f6;
            color: white;
        }
        
        .share-btn:hover {
            background: #2563eb;
        }
        </style>
    `;
    
    showNotification('Disease analysis completed!', 'success');
}

async function loadPestControl() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="pest-control-container">
            <div class="pest-header">
                <h2>🐛 Integrated Pest Management</h2>
                <p>Comprehensive pest identification, prevention, and control solutions</p>
            </div>
            
            <div class="pest-categories">
                <div class="category-tabs">
                    <button onclick="showPestCategory('insects')" class="category-tab active">🐛 Insects</button>
                    <button onclick="showPestCategory('diseases')" class="category-tab">🦠 Diseases</button>
                    <button onclick="showPestCategory('weeds')" class="category-tab">🌿 Weeds</button>
                    <button onclick="showPestCategory('rodents')" class="category-tab">🐁 Rodents</button>
                </div>
                
                <div id="pestContent" class="pest-content">
                    <!-- Insects content by default -->
                    <div class="pest-grid">
                        <div class="pest-card">
                            <img src="https://picsum.photos/seed/aphid/200/150.jpg" alt="Aphid">
                            <div class="pest-info">
                                <h4>Aphids</h4>
                                <p class="pest-type">Sucking Insect</p>
                                <p class="pest-severity">High Risk</p>
                                <div class="treatment-options">
                                    <span class="treatment organic">🌿 Organic</span>
                                    <span class="treatment chemical">⚗️ Chemical</span>
                                </div>
                                <button onclick="viewPestDetails('aphids')" class="view-btn">View Details</button>
                            </div>
                        </div>
                        
                        <div class="pest-card">
                            <img src="https://picsum.photos/seed/bollworm/200/150.jpg" alt="Bollworm">
                            <div class="pest-info">
                                <h4>Bollworm</h4>
                                <p class="pest-type">Chewing Insect</p>
                                <p class="pest-severity">Medium Risk</p>
                                <div class="treatment-options">
                                    <span class="treatment organic">🌿 Organic</span>
                                    <span class="treatment chemical">⚗️ Chemical</span>
                                </div>
                                <button onclick="viewPestDetails('bollworm')" class="view-btn">View Details</button>
                            </div>
                        </div>
                        
                        <div class="pest-card">
                            <img src="https://picsum.photos/seed/whitefly/200/150.jpg" alt="Whitefly">
                            <div class="pest-info">
                                <h4>Whitefly</h4>
                                <p class="pest-type">Sucking Insect</p>
                                <p class="pest-severity">High Risk</p>
                                <div class="treatment-options">
                                    <span class="treatment organic">🌿 Organic</span>
                                    <span class="treatment chemical">⚗️ Chemical</span>
                                </div>
                                <button onclick="viewPestDetails('whitefly')" class="view-btn">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="pest-prevention">
                <h3>🛡️ Prevention Strategies</h3>
                <div class="prevention-grid">
                    <div class="prevention-card">
                        <div class="prevention-icon">🌾</div>
                        <h4>Crop Rotation</h4>
                        <p>Rotate crops every 2-3 years to break pest cycles</p>
                    </div>
                    <div class="prevention-card">
                        <div class="prevention-icon">🌱</div>
                        <h4>Resistant Varieties</h4>
                        <p>Use pest-resistant crop varieties when available</p>
                    </div>
                    <div class="prevention-card">
                        <div class="prevention-icon">🔍</div>
                        <h4>Regular Monitoring</h4>
                        <p>Weekly field scouting for early detection</p>
                    </div>
                    <div class="prevention-card">
                        <div class="prevention-icon">🧹</div>
                        <h4>Field Sanitation</h4>
                        <p>Remove crop debris and weeds regularly</p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .pest-control-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .pest-header {
            text-align: center;
            background: linear-gradient(135deg, #f59e0b, #f97316);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .category-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .category-tab {
            padding: 12px 24px;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .category-tab.active {
            background: #f59e0b;
            color: white;
            border-color: #f59e0b;
        }
        
        .category-tab:hover {
            border-color: #f59e0b;
            transform: translateY(-2px);
        }
        
        .pest-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .pest-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .pest-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .pest-card img {
            width: 100%;
            height: 150px;
            object-fit: cover;
        }
        
        .pest-info {
            padding: 20px;
        }
        
        .pest-info h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        
        .pest-type {
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 5px;
        }
        
        .pest-severity {
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .treatment-options {
            display: flex;
            gap: 8px;
            margin-bottom: 15px;
        }
        
        .treatment {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .treatment.organic {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .treatment.chemical {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .view-btn {
            background: #f59e0b;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .view-btn:hover {
            background: #d97706;
        }
        
        .pest-prevention {
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
        }
        
        .pest-prevention h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .prevention-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .prevention-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .prevention-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .prevention-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }
        
        .prevention-card h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        
        .prevention-card p {
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0;
        }
        </style>
    `;
}

async function loadGrowthTracking() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="growth-tracking-container">
            <div class="growth-header">
                <h2>📊 Growth Tracking System</h2>
                <p>Monitor weekly crop growth, health status, and development progress</p>
            </div>
            
            <div class="growth-controls">
                <div class="control-group">
                    <label>Select Crop:</label>
                    <select id="growthCrop" class="control-input">
                        <option value="">Choose a crop</option>
                        <option value="rice">Rice</option>
                        <option value="wheat">Wheat</option>
                        <option value="cotton">Cotton</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Planting Date:</label>
                    <input type="date" id="plantingDate" class="control-input">
                </div>
                <button onclick="generateGrowthReport()" class="generate-btn">
                    <span>📊</span> Generate Growth Report
                </button>
            </div>
            
            <div class="growth-dashboard">
                <div class="growth-stats">
                    <div class="stat-card">
                        <div class="stat-icon">🌱</div>
                        <h4>Current Stage</h4>
                        <p class="stat-value">Vegetative</p>
                        <p class="stat-label">Day 45-60</p>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📏</div>
                        <h4>Height</h4>
                        <p class="stat-value">45 cm</p>
                        <p class="stat-label">+12 cm this week</p>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🌿</div>
                        <h4>Leaf Count</h4>
                        <p class="stat-value">24 leaves</p>
                        <p class="stat-label">+8 this week</p>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💚</div>
                        <h4>Health Status</h4>
                        <p class="stat-value healthy">Excellent</p>
                        <p class="stat-label">No issues detected</p>
                    </div>
                </div>
                
                <div class="growth-chart">
                    <h3>📈 Growth Progress Chart</h3>
                    <canvas id="growthChart" width="400" height="200"></canvas>
                </div>
            </div>
            
            <div class="weekly-updates">
                <h3>📅 Weekly Growth Updates</h3>
                <div class="updates-timeline">
                    <div class="update-item">
                        <div class="update-date">Week 1</div>
                        <div class="update-content">
                            <h4>🌱 Germination Stage</h4>
                            <ul>
                                <li>Seeds successfully germinated</li>
                                <li>Initial root development visible</li>
                                <li>First true leaves emerged</li>
                                <li>Height: 5-8 cm</li>
                            </ul>
                            <div class="update-images">
                                <img src="https://picsum.photos/seed/week1/100/100.jpg" alt="Week 1">
                            </div>
                        </div>
                    </div>
                    
                    <div class="update-item">
                        <div class="update-date">Week 2</div>
                        <div class="update-content">
                            <h4>🌿 Seedling Development</h4>
                            <ul>
                                <li>Secondary leaves developing</li>
                                <li>Root system expanding</li>
                                <li>Height: 12-15 cm</li>
                                <li>Stem strengthening</li>
                            </ul>
                            <div class="update-images">
                                <img src="https://picsum.photos/seed/week2/100/100.jpg" alt="Week 2">
                            </div>
                        </div>
                    </div>
                    
                    <div class="update-item current">
                        <div class="update-date">Week 3</div>
                        <div class="update-content">
                            <h4>🌾 Early Vegetative</h4>
                            <ul>
                                <li>Rapid leaf expansion</li>
                                <li>Height: 25-30 cm</li>
                                <li>Lateral branching starting</li>
                                <li>Photosynthesis active</li>
                            </ul>
                            <div class="update-images">
                                <img src="https://picsum.photos/seed/week3/100/100.jpg" alt="Week 3">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="growth-actions">
                <button onclick="addGrowthUpdate()" class="action-btn primary">
                    <span>➕</span> Add Weekly Update
                </button>
                <button onclick="captureGrowthPhoto()" class="action-btn secondary">
                    <span>📷</span> Capture Growth Photo
                </button>
                <button onclick="downloadGrowthReport()" class="action-btn secondary">
                    <span>📥</span> Download Report
                </button>
            </div>
        </div>
        
        <style>
        .growth-tracking-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .growth-header {
            text-align: center;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .growth-controls {
            display: flex;
            gap: 20px;
            align-items: end;
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .control-group label {
            font-weight: 600;
            color: #374151;
        }
        
        .control-input {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .generate-btn {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .generate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }
        
        .growth-dashboard {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .growth-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .stat-card h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 5px 0;
            color: #10b981;
        }
        
        .stat-value.healthy {
            color: #059669;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0;
        }
        
        .growth-chart {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .growth-chart h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .weekly-updates {
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
        }
        
        .weekly-updates h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .updates-timeline {
            display: flex;
            gap: 20px;
            overflow-x: auto;
            padding: 10px 0;
        }
        
        .update-item {
            background: white;
            border-radius: 12px;
            padding: 20px;
            min-width: 300px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .update-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .update-item.current {
            border: 2px solid #10b981;
            background: #f0fdf4;
        }
        
        .update-date {
            background: #10b981;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-weight: 600;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .update-content h4 {
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .update-content ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .update-content li {
            margin-bottom: 5px;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .update-images {
            margin-top: 15px;
            text-align: center;
        }
        
        .update-images img {
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .growth-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn.primary {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }
        
        .action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }
        
        .action-btn.secondary {
            background: white;
            color: #1f2937;
            border: 2px solid #e5e7eb;
        }
        
        .action-btn.secondary:hover {
            background: #f3f4f6;
            border-color: #10b981;
            transform: translateY(-2px);
        }
        
        .action-btn span {
            font-size: 1.2rem;
        }
        </style>
    `;
    
    // Initialize growth chart
    setTimeout(() => initGrowthChart(), 100);
}

function initGrowthChart() {
    const ctx = document.getElementById('growthChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                datasets: [{
                    label: 'Plant Height (cm)',
                    data: [8, 15, 25, 35, 42, 48],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Leaf Count',
                    data: [4, 8, 16, 22, 28, 32],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

async function loadYieldPrediction() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="yield-prediction-container">
            <div class="yield-header">
                <h2>📈 AI Yield Prediction</h2>
                <p>Data-driven yield forecasting based on historical data and current conditions</p>
            </div>
            
            <div class="prediction-inputs">
                <div class="input-grid">
                    <div class="input-group">
                        <label>🌾 Crop Type</label>
                        <select id="yieldCrop" class="input-field">
                            <option value="">Select Crop</option>
                            <option value="rice">Rice</option>
                            <option value="wheat">Wheat</option>
                            <option value="cotton">Cotton</option>
                            <option value="sugarcane">Sugarcane</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>📏 Area (acres)</label>
                        <input type="number" id="yieldArea" class="input-field" placeholder="5.0" step="0.1">
                    </div>
                    <div class="input-group">
                        <label>🌍 Soil Quality</label>
                        <select id="soilQuality" class="input-field">
                            <option value="">Select Quality</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="moderate">Moderate</option>
                            <option value="poor">Poor</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>💧 Irrigation</label>
                        <select id="irrigationType" class="input-field">
                            <option value="">Select Type</option>
                            <option value="drip">Drip Irrigation</option>
                            <option value="flood">Flood Irrigation</option>
                            <option value="sprinkler">Sprinkler</option>
                            <option value="rainfed">Rainfed</option>
                        </select>
                    </div>
                </div>
                
                <div class="input-grid">
                    <div class="input-group">
                        <label>🌱 Seed Quality</label>
                        <select id="seedQuality" class="input-field">
                            <option value="">Select Quality</option>
                            <option value="certified">Certified</option>
                            <option value="improved">Improved</option>
                            <option value="local">Local</option>
                            <option value="saved">Saved</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>🌤️ Weather Conditions</label>
                        <select id="weatherConditions" class="input-field">
                            <option value="">Select Conditions</option>
                            <option value="optimal">Optimal</option>
                            <option value="good">Good</option>
                            <option value="moderate">Moderate</option>
                            <option value="stress">Stress Conditions</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>📅 Planting Date</label>
                        <input type="date" id="plantingDate" class="input-field">
                    </div>
                    <div class="input-group">
                        <label>🧪 Fertilizer Usage</label>
                        <select id="fertilizerUsage" class="input-field">
                            <option value="">Select Usage</option>
                            <option value="high">High (Recommended Dose)</option>
                            <option value="moderate">Moderate (75% Dose)</option>
                            <option value="low">Low (50% Dose)</option>
                            <option value="none">No Fertilizer</option>
                        </select>
                    </div>
                </div>
                
                <button onclick="predictYield()" class="predict-btn">
                    <span>🤖</span> Generate AI Prediction
                </button>
            </div>
            
            <div id="yieldResults" class="yield-results" style="display: none;">
                <div class="results-header">
                    <h3>🎯 Yield Prediction Results</h3>
                    <div class="prediction-confidence">
                        <span class="confidence-label">AI Confidence:</span>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: 92%;"></div>
                        </div>
                        <span class="confidence-value">92%</span>
                    </div>
                </div>
                
                <div class="prediction-grid">
                    <div class="prediction-card primary">
                        <div class="prediction-icon">🌾</div>
                        <h4>Expected Yield</h4>
                        <p class="prediction-value">45-52 quintals/hectare</p>
                        <p class="prediction-range">Range: 40-55 q/ha</p>
                        <div class="prediction-details">
                            <span class="trend up">↑ 15% above average</span>
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-icon">💰</div>
                        <h4>Revenue Estimate</h4>
                        <p class="prediction-value">₹2,25,000 - ₹2,60,000</p>
                        <p class="prediction-range">Based on current market rates</p>
                        <div class="prediction-details">
                            <span class="trend up">↑ 12% profit margin</span>
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-icon">📅</div>
                        <h4>Harvest Timeline</h4>
                        <p class="prediction-value">120-135 days</p>
                        <p class="prediction-range">Optimal: Day 125-130</p>
                        <div class="prediction-details">
                            <span class="trend stable">→ On schedule</span>
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-icon">⚠️</div>
                        <h4>Risk Factors</h4>
                        <div class="risk-list">
                            <div class="risk-item low">
                                <span>Weather Risk:</span>
                                <span>Low</span>
                            </div>
                            <div class="risk-item medium">
                                <span>Pest Risk:</span>
                                <span>Medium</span>
                            </div>
                            <div class="risk-item low">
                                <span>Market Risk:</span>
                                <span>Low</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="optimization-tips">
                    <h3>💡 Yield Optimization Tips</h3>
                    <div class="tips-grid">
                        <div class="tip-card">
                            <div class="tip-icon">🌱</div>
                            <h4>Seed Treatment</h4>
                            <p>Treat seeds with bio-fertilizers for 15% yield increase</p>
                        </div>
                        <div class="tip-card">
                            <div class="tip-icon">💧</div>
                            <h4>Optimal Irrigation</h4>
                            <p>Follow drip irrigation schedule for 20% water saving</p>
                        </div>
                        <div class="tip-card">
                            <div class="tip-icon">🧪</div>
                            <h4>Balanced Fertilization</h4>
                            <p>Apply NPK in 4:2:1 ratio for best results</p>
                        </div>
                        <div class="tip-card">
                            <div class="tip-icon">🌿</div>
                            <h4>Timely Weed Control</h4>
                            <p>Control weeds in first 30 days for 25% yield boost</p>
                        </div>
                    </div>
                </div>
                
                <div class="prediction-actions">
                    <button onclick="saveYieldPrediction()" class="action-btn primary">
                        <span>💾</span> Save Prediction
                    </button>
                    <button onclick="downloadYieldReport()" class="action-btn secondary">
                        <span>📄</span> Download Report
                    </button>
                    <button onclick="compareYieldData()" class="action-btn secondary">
                        <span>📊</span> Compare Historical Data
                    </button>
                </div>
            </div>
        </div>
        
        <style>
        .yield-prediction-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .yield-header {
            text-align: center;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .prediction-inputs {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .input-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .input-group label {
            font-weight: 600;
            color: #374151;
        }
        
        .input-field {
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .input-field:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .predict-btn {
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
            width: 100%;
            justify-content: center;
        }
        
        .predict-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(139, 92, 246, 0.3);
        }
        
        .yield-results {
            background: #f0f9ff;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            border: 2px solid #8b5cf6;
        }
        
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        
        .results-header h3 {
            color: #1f2937;
            margin: 0;
        }
        
        .prediction-confidence {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .confidence-label {
            font-weight: 600;
            color: #6b7280;
        }
        
        .confidence-bar {
            width: 200px;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #8b5cf6, #6366f1);
            transition: width 1s ease;
        }
        
        .confidence-value {
            font-weight: 700;
            color: #8b5cf6;
            font-size: 1.1rem;
        }
        
        .prediction-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .prediction-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .prediction-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .prediction-card.primary {
            border: 2px solid #8b5cf6;
            background: linear-gradient(135deg, #f0f9ff, #e0e7ff);
        }
        
        .prediction-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }
        
        .prediction-card h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        
        .prediction-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #1f2937;
            margin: 5px 0;
        }
        
        .prediction-range {
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0 0 10px 0;
        }
        
        .prediction-details {
            margin-top: 10px;
        }
        
        .trend {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .trend.up {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .trend.stable {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .risk-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .risk-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        
        .risk-item.low {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .risk-item.medium {
            background: #fef3c7;
            color: #d97706;
        }
        
        .optimization-tips {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
        }
        
        .optimization-tips h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .tips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .tip-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .tip-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .tip-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .tip-card h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        
        .tip-card p {
            color: #4b5563;
            font-size: 0.9rem;
            margin: 0;
        }
        
        .prediction-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn.primary {
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: white;
        }
        
        .action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
        }
        
        .action-btn.secondary {
            background: white;
            color: #1f2937;
            border: 2px solid #e5e7eb;
        }
        
        .action-btn.secondary:hover {
            background: #f3f4f6;
            border-color: #8b5cf6;
            transform: translateY(-2px);
        }
        
        .action-btn span {
            font-size: 1.2rem;
        }
        </style>
    `;
}

async function loadIrrigationPlanner() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="irrigation-planner-container">
            <div class="irrigation-header">
                <h2>💧 Smart Irrigation Planner</h2>
                <p>Optimize water usage with AI-powered irrigation scheduling and monitoring</p>
            </div>
            
            <div class="irrigation-overview">
                <div class="overview-stats">
                    <div class="stat-card">
                        <div class="stat-icon">💧</div>
                        <h4>Water Usage</h4>
                        <p class="stat-value">2,450 L</p>
                        <p class="stat-label">This week</p>
                        <div class="stat-trend down">↓ 15% vs last week</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🌾</div>
                        <h4>Soil Moisture</h4>
                        <p class="stat-value">68%</p>
                        <p class="stat-label">Current level</p>
                        <div class="stat-trend optimal">Optimal</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <h4>Next Irrigation</h4>
                        <p class="stat-value">Tomorrow</p>
                        <p class="stat-label">6:00 AM</p>
                        <div class="stat-trend">Scheduled</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <h4>Water Cost</h4>
                        <p class="stat-value">₹1,245</p>
                        <p class="stat-label">This month</p>
                        <div class="stat-trend down">↓ 8% vs last month</div>
                    </div>
                </div>
            </div>
            
            <div class="irrigation-controls">
                <div class="control-section">
                    <h3>🎛 Irrigation Control Panel</h3>
                    <div class="control-grid">
                        <div class="control-card">
                            <div class="control-header">
                                <h4>Field 1 - Rice</h4>
                                <div class="status-indicator active">Active</div>
                            </div>
                            <div class="control-actions">
                                <button onclick="startIrrigation('field1')" class="control-btn start">
                                    ▶️ Start
                                </button>
                                <button onclick="stopIrrigation('field1')" class="control-btn stop">
                                    ⏹️ Stop
                                </button>
                                <button onclick="scheduleIrrigation('field1')" class="control-btn schedule">
                                    📅 Schedule
                                </button>
                            </div>
                            <div class="control-info">
                                <p><strong>Last run:</strong> 2 hours ago</p>
                                <p><strong>Duration:</strong> 45 minutes</p>
                                <p><strong>Water used:</strong> 850 L</p>
                            </div>
                        </div>
                        
                        <div class="control-card">
                            <div class="control-header">
                                <h4>Field 2 - Wheat</h4>
                                <div class="status-indicator inactive">Inactive</div>
                            </div>
                            <div class="control-actions">
                                <button onclick="startIrrigation('field2')" class="control-btn start">
                                    ▶️ Start
                                </button>
                                <button onclick="stopIrrigation('field2')" class="control-btn stop" disabled>
                                    ⏹️ Stop
                                </button>
                                <button onclick="scheduleIrrigation('field2')" class="control-btn schedule">
                                    📅 Schedule
                                </button>
                            </div>
                            <div class="control-info">
                                <p><strong>Last run:</strong> 3 days ago</p>
                                <p><strong>Duration:</strong> 30 minutes</p>
                                <p><strong>Water used:</strong> 620 L</p>
                            </div>
                        </div>
                        
                        <div class="control-card">
                            <div class="control-header">
                                <h4>Field 3 - Cotton</h4>
                                <div class="status-indicator scheduled">Scheduled</div>
                            </div>
                            <div class="control-actions">
                                <button onclick="startIrrigation('field3')" class="control-btn start">
                                    ▶️ Start
                                </button>
                                <button onclick="stopIrrigation('field3')" class="control-btn stop" disabled>
                                    ⏹️ Stop
                                </button>
                                <button onclick="scheduleIrrigation('field3')" class="control-btn schedule">
                                    📅 Schedule
                                </button>
                            </div>
                            <div class="control-info">
                                <p><strong>Next run:</strong> Tomorrow 5:00 AM</p>
                                <p><strong>Duration:</strong> 40 minutes</p>
                                <p><strong>Estimated water:</strong> 750 L</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="irrigation-schedule">
                <h3>📅 Irrigation Schedule</h3>
                <div class="schedule-grid">
                    <div class="schedule-card">
                        <div class="schedule-header">
                            <h4>Today's Schedule</h4>
                            <div class="schedule-date">April 27, 2024</div>
                        </div>
                        <div class="schedule-timeline">
                            <div class="schedule-item completed">
                                <div class="schedule-time">5:00 AM</div>
                                <div class="schedule-details">
                                    <p><strong>Field 1 - Rice</strong></p>
                                    <p><strong>Duration:</strong> 45 min</p>
                                    <p><strong>Water:</strong> 850 L</p>
                                    <div class="status-badge completed">✅ Completed</div>
                                </div>
                            </div>
                            
                            <div class="schedule-item current">
                                <div class="schedule-time">6:00 PM</div>
                                <div class="schedule-details">
                                    <p><strong>Field 2 - Wheat</strong></p>
                                    <p><strong>Duration:</strong> 30 min</p>
                                    <p><strong>Water:</strong> 620 L</p>
                                    <div class="status-badge current">🔄 In Progress</div>
                                </div>
                            </div>
                            
                            <div class="schedule-item upcoming">
                                <div class="schedule-time">8:00 PM</div>
                                <div class="schedule-details">
                                    <p><strong>Field 3 - Cotton</strong></p>
                                    <p><strong>Duration:</strong> 40 min</p>
                                    <p><strong>Water:</strong> 750 L</p>
                                    <div class="status-badge upcoming">⏰ Scheduled</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="weather-integration">
                <h3>🌤️ Weather-Based Recommendations</h3>
                <div class="weather-cards">
                    <div class="weather-card">
                        <div class="weather-icon">☀️</div>
                        <h4>Current Weather</h4>
                        <p><strong>Temperature:</strong> 32°C</p>
                        <p><strong>Humidity:</strong> 65%</p>
                        <p><strong>Rainfall:</strong> 0 mm</p>
                        <div class="weather-recommendation">
                            <span class="rec-label">Recommendation:</span>
                            <p>Irrigation recommended due to high temperature</p>
                        </div>
                    </div>
                    
                    <div class="weather-card">
                        <div class="weather-icon">📅</div>
                        <h4>7-Day Forecast</h4>
                        <div class="forecast-list">
                            <div class="forecast-item">
                                <span class="forecast-day">Mon</span>
                                <span class="forecast-temp">30°C</span>
                                <span class="forecast-rain">2mm</span>
                            </div>
                            <div class="forecast-item">
                                <span class="forecast-day">Tue</span>
                                <span class="forecast-temp">31°C</span>
                                <span class="forecast-rain">0mm</span>
                            </div>
                            <div class="forecast-item">
                                <span class="forecast-day">Wed</span>
                                <span class="forecast-temp">29°C</span>
                                <span class="forecast-rain">5mm</span>
                            </div>
                        </div>
                        <div class="weather-advice">
                            <p><strong>AI Advice:</strong> Reduce irrigation on Wednesday due to expected rainfall</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="irrigation-actions">
                <button onclick="optimizeIrrigation()" class="action-btn primary">
                    <span>🤖</span> Optimize Schedule
                </button>
                <button onclick="viewWaterUsage()" class="action-btn secondary">
                    <span>📊</span> Water Usage Analytics
                </button>
                <button onclick="exportIrrigationData()" class="action-btn secondary">
                    <span>📥</span> Export Data
                </button>
            </div>
        </div>
        
        <style>
        .irrigation-planner-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .irrigation-header {
            text-align: center;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .irrigation-overview {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .overview-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .stat-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .stat-card h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #06b6d4;
            margin: 5px 0;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0 0 10px 0;
        }
        
        .stat-trend {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .stat-trend.down {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .stat-trend.optimal {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .irrigation-controls {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .control-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .control-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .control-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            border: 2px solid #e5e7eb;
            transition: all 0.3s ease;
        }
        
        .control-card:hover {
            border-color: #06b6d4;
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .control-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .control-header h4 {
            margin: 0;
            color: #1f2937;
        }
        
        .status-indicator {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .status-indicator.active {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .status-indicator.inactive {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .status-indicator.scheduled {
            background: #fef3c7;
            color: #d97706;
        }
        
        .control-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 15px;
        }
        
        .control-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .control-btn.start {
            background: #16a34a;
            color: white;
        }
        
        .control-btn.start:hover {
            background: #15803d;
        }
        
        .control-btn.stop {
            background: #dc2626;
            color: white;
        }
        
        .control-btn.stop:hover:not(:disabled) {
            background: #b91c1c;
        }
        
        .control-btn.stop:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .control-btn.schedule {
            background: #0891b2;
            color: white;
        }
        
        .control-btn.schedule:hover {
            background: #0e7490;
        }
        
        .control-info {
            font-size: 0.85rem;
            color: #6b7280;
        }
        
        .control-info p {
            margin: 3px 0;
        }
        
        .irrigation-schedule {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .irrigation-schedule h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .schedule-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .schedule-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            border: 2px solid #e5e7eb;
        }
        
        .schedule-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .schedule-header h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
        }
        
        .schedule-date {
            color: #0891b2;
            font-weight: 600;
        }
        
        .schedule-timeline {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .schedule-item {
            background: white;
            border-radius: 8px;
            padding: 15px;
            border-left: 4px solid #e5e7eb;
            transition: all 0.3s ease;
        }
        
        .schedule-item:hover {
            transform: translateX(5px);
        }
        
        .schedule-item.completed {
            border-left-color: #16a34a;
        }
        
        .schedule-item.current {
            border-left-color: #0891b2;
            background: #f0f9ff;
        }
        
        .schedule-item.upcoming {
            border-left-color: #f59e0b;
        }
        
        .schedule-time {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .schedule-details p {
            margin: 3px 0;
            color: #4b5563;
            font-size: 0.85rem;
        }
        
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-top: 8px;
        }
        
        .status-badge.completed {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .status-badge.current {
            background: #dbeafe;
            color: #1d4ed8;
        }
        
        .status-badge.upcoming {
            background: #fef3c7;
            color: #d97706;
        }
        
        .weather-integration {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .weather-integration h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .weather-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .weather-card {
            background: #f0f9ff;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 2px solid #3b82f6;
        }
        
        .weather-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        
        .weather-card h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        
        .weather-card p {
            margin: 5px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .weather-recommendation {
            margin-top: 15px;
            padding: 12px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .rec-label {
            font-weight: 600;
            color: #3b82f6;
            display: block;
            margin-bottom: 5px;
        }
        
        .weather-recommendation p {
            margin: 0;
            color: #1f2937;
            font-size: 0.85rem;
        }
        
        .forecast-list {
            margin: 10px 0;
        }
        
        .forecast-item {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            background: white;
            border-radius: 6px;
            margin-bottom: 5px;
        }
        
        .forecast-day {
            font-weight: 600;
            color: #1f2937;
        }
        
        .forecast-temp {
            color: #dc2626;
            font-weight: 600;
        }
        
        .forecast-rain {
            color: #3b82f6;
            font-weight: 600;
        }
        
        .weather-advice {
            margin-top: 10px;
            padding: 12px;
            background: #dbeafe;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .weather-advice p {
            margin: 0;
            color: #1d4ed8;
            font-weight: 600;
        }
        
        .irrigation-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn.primary {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
        }
        
        .action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(6, 182, 212, 0.3);
        }
        
        .action-btn.secondary {
            background: white;
            color: #1f2937;
            border: 2px solid #e5e7eb;
        }
        
        .action-btn.secondary:hover {
            background: #f3f4f6;
            border-color: #06b6d4;
            transform: translateY(-2px);
        }
        
        .action-btn span {
            font-size: 1.2rem;
        }
        </style>
    `;
}

async function loadWeatherIntegration() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="weather-integration-container">
            <div class="weather-header">
                <h2>🌤️ Weather Integration Hub</h2>
                <p>Real-time weather monitoring, alerts, and climate analysis for smart farming</p>
            </div>
            
            <div class="current-weather">
                <div class="weather-main">
                    <div class="weather-display">
                        <div class="weather-icon-large">☀️</div>
                        <div class="weather-info">
                            <h3>Current Weather</h3>
                            <div class="weather-details">
                                <p><strong>Temperature:</strong> <span class="temp-value">32°C</span></p>
                                <p><strong>Feels Like:</strong> 35°C</p>
                                <p><strong>Humidity:</strong> 65%</p>
                                <p><strong>Wind Speed:</strong> 12 km/h</p>
                                <p><strong>Pressure:</strong> 1012 mb</p>
                                <p><strong>Visibility:</strong> 10 km</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="weather-alerts">
                        <h3>🚨 Weather Alerts</h3>
                        <div class="alert-list">
                            <div class="alert-item high">
                                <div class="alert-icon">🌡️</div>
                                <div class="alert-content">
                                    <h4>Heat Wave Warning</h4>
                                    <p>Temperature expected to reach 38°C tomorrow</p>
                                    <p><strong>Recommendation:</strong> Increase irrigation, provide shade for sensitive crops</p>
                                    <div class="alert-time">Issued: 2 hours ago</div>
                                </div>
                            </div>
                            
                            <div class="alert-item medium">
                                <div class="alert-icon">🌧️</div>
                                <div class="alert-content">
                                    <h4>Low Humidity Alert</h4>
                                    <p>Humidity below 40% for next 3 days</p>
                                    <p><strong>Recommendation:</strong> Increase irrigation frequency</p>
                                    <div class="alert-time">Issued: 5 hours ago</div>
                                </div>
                            </div>
                            
                            <div class="alert-item low">
                                <div class="alert-icon">🌧️</div>
                                <div class="alert-content">
                                    <h4>Rainfall Expected</h4>
                                    <p>30mm rainfall expected in 2 days</p>
                                    <p><strong>Recommendation:</strong> Postpone fertilization, prepare drainage</p>
                                    <div class="alert-time">Issued: 1 day ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="weather-sun-moon">
                    <div class="sun-info">
                        <h4>☀️ Sun & Moon</h4>
                        <div class="sun-details">
                            <p><strong>Sunrise:</strong> 6:15 AM</p>
                            <p><strong>Sunset:</strong> 6:45 PM</p>
                            <p><strong>Day Length:</strong> 12h 30m</p>
                            <p><strong>UV Index:</strong> 9 (Very High)</p>
                        </div>
                    </div>
                    
                    <div class="moon-info">
                        <h4>🌙 Moon Phase</h4>
                        <div class="moon-details">
                            <p><strong>Phase:</strong> Waxing Gibbous</p>
                            <p><strong>Illumination:</strong> 78%</p>
                            <p><strong>Next Full Moon:</strong> 3 days</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="weather-forecast">
                <h3>📅 7-Day Weather Forecast</h3>
                <div class="forecast-grid">
                    <div class="forecast-day">
                        <div class="forecast-date">Today</div>
                        <div class="forecast-icon">☀️</div>
                        <div class="forecast-details">
                            <p class="temp-high">High: 35°C</p>
                            <p class="temp-low">Low: 28°C</p>
                            <p class="rain-info">☀️ Sunny</p>
                            <p class="wind-info">💨 10 km/h</p>
                        </div>
                    </div>
                    
                    <div class="forecast-day">
                        <div class="forecast-date">Tomorrow</div>
                        <div class="forecast-icon">🌤️</div>
                        <div class="forecast-details">
                            <p class="temp-high">High: 38°C</p>
                            <p class="temp-low">Low: 30°C</p>
                            <p class="rain-info">🌡️ Very Hot</p>
                            <p class="wind-info">💨 8 km/h</p>
                        </div>
                    </div>
                    
                    <div class="forecast-day">
                        <div class="forecast-date">Wed</div>
                        <div class="forecast-icon">🌧️</div>
                        <div class="forecast-details">
                            <p class="temp-high">High: 32°C</p>
                            <p class="temp-low">Low: 26°C</p>
                            <p class="rain-info">🌧️ Thundershowers</p>
                            <p class="wind-info">💨 15 km/h</p>
                        </div>
                    </div>
                    
                    <div class="forecast-day">
                        <div class="forecast-date">Thu</div>
                        <div class="forecast-icon">🌧️</div>
                        <div class="forecast-details">
                            <p class="temp-high">High: 30°C</p>
                            <p class="temp-low">Low: 24°C</p>
                            <p class="rain-info">🌧️ Rainy</p>
                            <p class="wind-info">💨 12 km/h</p>
                        </div>
                    </div>
                    
                    <div class="forecast-day">
                        <div class="forecast-date">Fri</div>
                        <div class="forecast-icon">⛅</div>
                        <div class="forecast-details">
                            <p class="temp-high">High: 31°C</p>
                            <p class="temp-low">Low: 25°C</p>
                            <p class="rain-info">⛅ Partly Cloudy</p>
                            <p class="wind-info">💨 10 km/h</p>
                        </div>
                    </div>
                    
                    <div class="forecast-day">
                        <div class="forecast-date">Sat</div>
                        <div class="forecast-icon">☀️</div>
                        <div class="forecast-details">
                            <p class="temp-high">High: 33°C</p>
                            <p class="temp-low">Low: 27°C</p>
                            <p class="rain-info">☀️ Sunny</p>
                            <p class="wind-info">💨 8 km/h</p>
                        </div>
                    </div>
                    
                    <div class="forecast-day">
                        <div class="forecast-date">Sun</div>
                        <div class="forecast-icon">☀️</div>
                        <div class="forecast-details">
                            <p class="temp-high">High: 34°C</p>
                            <p class="temp-low">Low: 28°C</p>
                            <p class="rain-info">☀️ Sunny</p>
                            <p class="wind-info">💨 6 km/h</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="weather-analysis">
                <h3>📊 Climate Analysis & Recommendations</h3>
                <div class="analysis-grid">
                    <div class="analysis-card">
                        <div class="analysis-icon">🌾</div>
                        <h4>Crop Suitability</h4>
                        <div class="analysis-content">
                            <div class="suitability-score">
                                <span class="score-label">Overall Score:</span>
                                <div class="score-bar">
                                    <div class="score-fill" style="width: 85%;"></div>
                                </div>
                                <span class="score-value">85%</span>
                            </div>
                            <div class="crop-recommendations">
                                <h5>Recommended Crops:</h5>
                                <div class="crop-list">
                                    <div class="crop-item">
                                        <span class="crop-name">🌾 Rice</span>
                                        <span class="crop-score">92% Match</span>
                                    </div>
                                    <div class="crop-item">
                                        <span class="crop-name">🌾 Cotton</span>
                                        <span class="crop-score">78% Match</span>
                                    </div>
                                    <div class="crop-item">
                                        <span class="crop-name">🌾 Sugarcane</span>
                                        <span class="crop-score">71% Match</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-card">
                        <div class="analysis-icon">💧</div>
                        <h4>Water Management</h4>
                        <div class="analysis-content">
                            <div class="water-stats">
                                <p><strong>Soil Moisture:</strong> <span class="moisture-level optimal">68% (Optimal)</span></p>
                                <p><strong>Evaporation Rate:</strong> 6mm/day</p>
                                <p><strong>Irrigation Need:</strong> <span class="irrigation-need moderate">Moderate</span></p>
                                <p><strong>Rainfall Deficit:</strong> 45mm this month</p>
                            </div>
                            <div class="water-recommendations">
                                <h5>Irrigation Recommendations:</h5>
                                <ul>
                                    <li>• Increase irrigation frequency by 20%</li>
                                    <li>• Best time: Early morning (5-7 AM)</li>
                                    <li>• Use drip irrigation for water efficiency</li>
                                    <li>• Monitor soil moisture daily</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-card">
                        <div class="analysis-icon">🛡️</div>
                        <h4>Risk Assessment</h4>
                        <div class="analysis-content">
                            <div class="risk-indicators">
                                <div class="risk-item low">
                                    <span>Drought Risk:</span>
                                    <span class="risk-level">Low</span>
                                </div>
                                <div class="risk-item medium">
                                    <span>Flood Risk:</span>
                                    <span class="risk-level">Medium</span>
                                </div>
                                <div class="risk-item high">
                                    <span>Pest/Disease Risk:</span>
                                    <span class="risk-level">High</span>
                                </div>
                                <div class="risk-item low">
                                    <span>Wind Damage Risk:</span>
                                    <span class="risk-level">Low</span>
                                </div>
                            </div>
                            <div class="risk-recommendations">
                                <h5>Risk Mitigation:</h5>
                                <ul>
                                    <li>• Apply preventive pest control measures</li>
                                    <li>• Ensure proper field drainage</li>
                                    <li>• Monitor weather forecasts daily</li>
                                    <li>• Have emergency irrigation backup ready</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="weather-actions">
                <button onclick="setWeatherAlerts()" class="action-btn primary">
                    <span>🔔</span> Configure Alerts
                </button>
                <button onclick="downloadWeatherReport()" class="action-btn secondary">
                    <span>📄</span> Download Report
                </button>
                <button onclick="shareWeatherData()" class="action-btn secondary">
                    <span>📤</span> Share Data
                </button>
            </div>
        </div>
        
        <style>
        .weather-integration-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .weather-header {
            text-align: center;
            background: linear-gradient(135deg, #3b82f6, #60a5fa);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .current-weather {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .weather-main {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .weather-display {
            display: flex;
            gap: 30px;
            align-items: center;
        }
        
        .weather-icon-large {
            font-size: 6rem;
            text-align: center;
        }
        
        .weather-info h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .weather-details p {
            margin: 8px 0;
            color: #4b5563;
            font-size: 1rem;
        }
        
        .weather-details strong {
            color: #1f2937;
        }
        
        .temp-value {
            color: #dc2626;
            font-weight: 700;
            font-size: 1.2rem;
        }
        
        .weather-alerts {
            background: #fef2f2;
            border-radius: 15px;
            padding: 30px;
            border: 2px solid #dc2626;
        }
        
        .weather-alerts h3 {
            color: #dc2626;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .alert-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .alert-item {
            background: white;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            gap: 20px;
            align-items: start;
            transition: all 0.3s ease;
        }
        
        .alert-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .alert-icon {
            font-size: 2rem;
            min-width: 60px;
            text-align: center;
        }
        
        .alert-content h4 {
            margin: 0 0 8px 0;
            color: #1f2937;
        }
        
        .alert-content p {
            margin: 5px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .alert-content strong {
            color: #1f2937;
        }
        
        .alert-time {
            font-size: 0.8rem;
            color: #6b7280;
            margin-top: 10px;
        }
        
        .alert-item.high {
            border-left: 4px solid #dc2626;
        }
        
        .alert-item.medium {
            border-left: 4px solid #f59e0b;
        }
        
        .alert-item.low {
            border-left: 4px solid #3b82f6;
        }
        
        .weather-sun-moon {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .sun-info, .moon-info {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        
        .sun-info h4, .moon-info h4 {
            color: #1f2937;
            margin-bottom: 15px;
        }
        
        .sun-details p, .moon-details p {
            margin: 5px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .sun-details strong, .moon-details strong {
            color: #1f2937;
        }
        
        .weather-forecast {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .weather-forecast h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .forecast-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .forecast-day {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .forecast-day:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            border-color: #3b82f6;
        }
        
        .forecast-date {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .forecast-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .forecast-details {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .temp-high {
            color: #dc2626;
            font-weight: 600;
        }
        
        .temp-low {
            color: #3b82f6;
            font-weight: 600;
        }
        
        .rain-info, .wind-info {
            font-size: 0.85rem;
            color: #4b5563;
        }
        
        .weather-analysis {
            background: #f0f9ff;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            border: 2px solid #3b82f6;
        }
        
        .weather-analysis h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .analysis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        
        .analysis-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .analysis-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .analysis-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .analysis-card h4 {
            margin: 0 0 15px 0;
            color: #1f2937;
            text-align: center;
        }
        
        .analysis-content {
            text-align: left;
        }
        
        .suitability-score {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .score-label {
            font-weight: 600;
            color: #6b7280;
        }
        
        .score-bar {
            width: 150px;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #16a34a, #22c55e);
            transition: width 1s ease;
        }
        
        .score-value {
            font-weight: 700;
            color: #16a34a;
            font-size: 1.1rem;
        }
        
        .crop-recommendations h5 {
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .crop-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .crop-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background: #f8fafc;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        
        .crop-name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .crop-score {
            color: #16a34a;
            font-weight: 600;
        }
        
        .water-stats p {
            margin: 8px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .water-stats strong {
            color: #1f2937;
        }
        
        .moisture-level.optimal {
            color: #16a34a;
            font-weight: 600;
        }
        
        .irrigation-need.moderate {
            color: #f59e0b;
            font-weight: 600;
        }
        
        .water-recommendations h5, .risk-recommendations h5 {
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .water-recommendations ul, .risk-recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .water-recommendations li, .risk-recommendations li {
            margin-bottom: 5px;
            color: #4b5563;
            font-size: 0.85rem;
        }
        
        .risk-indicators {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .risk-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        
        .risk-item.low {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .risk-item.medium {
            background: #fef3c7;
            color: #d97706;
        }
        
        .risk-item.high {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .risk-level {
            font-weight: 600;
        }
        
        .weather-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn.primary {
            background: linear-gradient(135deg, #3b82f6, #60a5fa);
            color: white;
        }
        
        .action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
        
        .action-btn.secondary {
            background: white;
            color: #1f2937;
            border: 2px solid #e5e7eb;
        }
        
        .action-btn.secondary:hover {
            background: #f3f4f6;
            border-color: #3b82f6;
            transform: translateY(-2px);
        }
        
        .action-btn span {
            font-size: 1.2rem;
        }
        </style>
    `;
}

async function loadCrops() {
    try {
        const response = await fetch('http://localhost:5000/api/crops', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const cropList = document.getElementById('cropList');
            
            if (data.crops.length === 0) {
                cropList.innerHTML = '<p>No crops added yet.</p>';
            } else {
                cropList.innerHTML = data.crops.map(crop => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <h4>${crop.crop_name} (${crop.crop_type})</h4>
                        <p><strong>Area:</strong> ${crop.area_acres || 'N/A'} acres</p>
                        <p><strong>Stage:</strong> ${crop.current_stage || 'N/A'}</p>
                        <p><strong>Health:</strong> <span style="color: ${crop.health_status === 'Healthy' ? '#16a34a' : '#dc2626'}">${crop.health_status || 'N/A'}</span></p>
                        <p><strong>Planted:</strong> ${crop.planting_date || 'N/A'}</p>
                        <p><strong>Expected Harvest:</strong> ${crop.expected_harvest_date || 'N/A'}</p>
                        ${crop.notes ? `<p><strong>Notes:</strong> ${crop.notes}</p>` : ''}
                    </div>
                `).join('');
            }
        } else {
            document.getElementById('cropList').innerHTML = '<p>Error loading crops.</p>';
        }
    } catch (error) {
        console.error('Error loading crops:', error);
        document.getElementById('cropList').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

function showAddCropForm() {
    document.getElementById('addCropForm').style.display = 'block';
}

function hideAddCropForm() {
    document.getElementById('addCropForm').style.display = 'none';
}

async function addCrop(event) {
    event.preventDefault();
    
    const cropData = {
        crop_name: document.getElementById('cropName').value,
        crop_type: document.getElementById('cropType').value,
        planting_date: document.getElementById('plantingDate').value,
        expected_harvest_date: document.getElementById('harvestDate').value,
        area_acres: parseFloat(document.getElementById('areaAcres').value) || null,
        notes: document.getElementById('cropNotes').value
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/crops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cropData),
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Crop added successfully!');
            hideAddCropForm();
            loadCrops();
            // Clear form
            document.getElementById('cropName').value = '';
            document.getElementById('cropType').value = '';
            document.getElementById('plantingDate').value = '';
            document.getElementById('harvestDate').value = '';
            document.getElementById('areaAcres').value = '';
            document.getElementById('cropNotes').value = '';
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to add crop');
        }
    } catch (error) {
        console.error('Error adding crop:', error);
        alert('Network error. Please try again.');
    }
}

// --- COMMUNITY ---
function loadCommunity() {
    console.log('loadCommunity called');
    const contentArea = document.getElementById('contentArea');
    
    if (!contentArea) {
        console.error('contentArea not found');
        return;
    }
    
    contentArea.innerHTML = `
        <div class="card">
            <h3>👥 Community</h3>
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <button onclick="showCommunityOption('forum')" id="forumBtn" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 6px;">Forum</button>
                <button onclick="showCommunityOption('farmers')" id="farmersBtn" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px;">Farmers</button>
                <button onclick="showCommunityOption('chat')" id="chatBtn" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px;">Chat</button>
                <button onclick="showCommunityOption('others-crops')" id="othersCropsBtn" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px;">🌾 Others Crop</button>
            </div>
            <div id="communityContent"></div>
        </div>
    `;
    
    console.log('Community HTML set successfully');
    
    // Load forum by default
    showCommunityOption('forum');
}

function showCommunityOption(option) {
    console.log('showCommunityOption called with:', option);
    
    // Update button styles
    const forumBtn = document.getElementById('forumBtn');
    const farmersBtn = document.getElementById('farmersBtn');
    const chatBtn = document.getElementById('chatBtn');
    const othersCropsBtn = document.getElementById('othersCropsBtn');
    
    if (forumBtn) forumBtn.style.background = option === 'forum' ? '#2563eb' : '#6b7280';
    if (farmersBtn) farmersBtn.style.background = option === 'farmers' ? '#2563eb' : '#6b7280';
    if (chatBtn) chatBtn.style.background = option === 'chat' ? '#2563eb' : '#6b7280';
    if (othersCropsBtn) othersCropsBtn.style.background = option === 'others-crops' ? '#2563eb' : '#6b7280';
    
    const contentDiv = document.getElementById('communityContent');
    if (!contentDiv) {
        console.error('communityContent not found');
        return;
    }
    
    switch(option) {
        case 'forum':
            contentDiv.innerHTML = `
                <div class="card">
                    <h4>📝 Forum</h4>
                    <button onclick="showCreatePostForm()" style="background: #16a34a; color: white; padding: 8px 16px; border: none; border-radius: 6px; margin: 10px 0;">+ Create Post</button>
                    <div id="communityPosts"></div>
                    <div id="createPostForm" style="display: none;" class="card">
                        <h4>Create New Post</h4>
                        <form onsubmit="createPost(event)">
                            <input type="text" id="postTitle" placeholder="Post Title" required style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                            <select id="postCategory" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="General">General</option>
                                <option value="Crop Management">Crop Management</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Organic Farming">Organic Farming</option>
                            </select>
                            <textarea id="postContent" placeholder="Share your thoughts..." required style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; height: 120px;"></textarea>
                            <button type="submit" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 6px;">Post</button>
                            <button type="button" onclick="hideCreatePostForm()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 6px; margin-left: 10px;">Cancel</button>
                        </form>
                    </div>
                </div>
            `;
            loadCommunityPosts();
            break;
        case 'farmers':
            contentDiv.innerHTML = `
                <div class="card">
                    <h4>👤 Farmers</h4>
                    <div id="farmersList"></div>
                </div>
            `;
            loadFarmers();
            break;
        case 'chat':
            contentDiv.innerHTML = `
                <div class="card">
                    <h4>💬 Chat</h4>
                    <div style="height: 300px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; padding: 15px; margin: 10px 0;">
                        <div id="chatMessages" style="height: 200px; overflow-y: auto; margin-bottom: 10px; padding: 10px; background: white; border-radius: 6px;">
                            <p style="color: #6b7280; text-align: center;">Welcome to Community Chat! Start a conversation...</p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="chatInput" placeholder="Type your message..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" onkeypress="if(event.key==='Enter') sendChatMessage()">
                            <button onclick="sendChatMessage()" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 6px;">Send</button>
                        </div>
                    </div>
                </div>
            `;
            loadChatMessages();
            break;
        case 'others-crops':
            contentDiv.innerHTML = `
                <div class="card">
                    <h4>🌾 Others Crop</h4>
                    <p style="color: #6b7280; margin-bottom: 15px;">See what crops other farmers in the community are planting</p>
                    <div id="othersCropsList"></div>
                </div>
            `;
            loadOthersCrops();
            break;
    }
    
    console.log('Content loaded for:', option);
}

async function loadCommunityPosts() {
    try {
        const response = await fetch('http://localhost:5000/api/community/posts');
        
        if (response.ok) {
            const data = await response.json();
            const postsContainer = document.getElementById('communityPosts');
            
            if (data.posts.length === 0) {
                postsContainer.innerHTML = '<p>No posts yet. Be the first to share!</p>';
            } else {
                postsContainer.innerHTML = data.posts.map(post => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <h4>${post.title}</h4>
                        <p style="color: #6b7280; font-size: 0.9rem;">By ${post.full_name || post.username} • ${new Date(post.created_at).toLocaleDateString()}</p>
                        <p style="color: #059669; font-size: 0.8rem;">Category: ${post.category}</p>
                        <p>${post.content}</p>
                        <div style="margin-top: 10px;">
                            <span style="color: #6b7280;">👍 ${post.likes_count || 0} likes</span>
                            <span style="color: #6b7280; margin-left: 20px;">💬 ${post.replies_count || 0} replies</span>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            document.getElementById('communityPosts').innerHTML = '<p>Error loading posts.</p>';
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('communityPosts').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

function showCreatePostForm() {
    document.getElementById('createPostForm').style.display = 'block';
}

function hideCreatePostForm() {
    document.getElementById('createPostForm').style.display = 'none';
}

async function createPost(event) {
    event.preventDefault();
    
    const postData = {
        title: document.getElementById('postTitle').value,
        content: document.getElementById('postContent').value,
        category: document.getElementById('postCategory').value
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/community/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Post created successfully!');
            hideCreatePostForm();
            loadCommunityPosts();
            // Clear form
            document.getElementById('postTitle').value = '';
            document.getElementById('postContent').value = '';
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to create post');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Network error. Please try again.');
    }
}

// --- FARMERS FUNCTION ---
async function loadFarmers() {
    try {
        const response = await fetch('http://localhost:5000/api/community/members');
        
        if (response.ok) {
            const data = await response.json();
            const farmersContainer = document.getElementById('farmersList');
            
            if (data.members.length === 0) {
                farmersContainer.innerHTML = '<p>No farmers found.</p>';
            } else {
                farmersContainer.innerHTML = data.members.map(member => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <span style="font-size: 24px;">👤</span>
                            </div>
                            <div>
                                <h4 style="margin: 0;">${member.full_name || member.username}</h4>
                                <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">${member.farm_location || member.profile_location || 'Location not specified'}</p>
                            </div>
                        </div>
                        ${member.bio ? `<p style="margin: 10px 0;">${member.bio}</p>` : ''}
                        ${member.expertise ? `<p style="margin: 5px 0;"><strong>Expertise:</strong> ${member.expertise.replace(/[\[\]"]/g, '').split(',').join(', ')}</p>` : ''}
                        ${member.farm_size_acres ? `<p style="margin: 5px 0;"><strong>Farm Size:</strong> ${member.farm_size_acres} acres</p>` : ''}
                        <p style="color: #6b7280; font-size: 0.8rem; margin-top: 10px;">Joined ${new Date(member.joined_community_at).toLocaleDateString()}</p>
                    </div>
                `).join('');
            }
        } else {
            document.getElementById('farmersList').innerHTML = '<p>Error loading farmers.</p>';
        }
    } catch (error) {
        console.error('Error loading farmers:', error);
        document.getElementById('farmersList').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

// --- OTHERS CROP FUNCTION ---
async function loadOthersCrops() {
    try {
        const response = await fetch('http://localhost:5000/api/community/others-crops');
        
        if (response.ok) {
            const data = await response.json();
            const cropsContainer = document.getElementById('othersCropsList');
            
            if (data.crops.length === 0) {
                cropsContainer.innerHTML = '<p>No crops found from other farmers yet.</p>';
            } else {
                cropsContainer.innerHTML = data.crops.map(crop => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <div>
                                <h4 style="margin: 0;">${crop.crop_name}</h4>
                                <p style="margin: 5px 0; color: #059669; font-size: 0.9rem;">
                                    ${crop.crop_type}
                                </p>
                                <p style="margin: 5px 0; color: #6b7280; font-size: 0.8rem;">
                                    Planted by: ${crop.full_name || crop.username}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <span style="background: #16a34a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                                    Active
                                </span>
                            </div>
                        </div>
                        <div style="margin: 10px 0;">
                            <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Location:</strong> ${crop.farm_location || 'Not specified'}</p>
                            <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Planting Date:</strong> ${new Date(crop.planting_date).toLocaleDateString()}</p>
                            ${crop.harvest_date ? `<p style="margin: 5px 0; font-size: 0.9rem;"><strong>Expected Harvest:</strong> ${new Date(crop.harvest_date).toLocaleDateString()}</p>` : ''}
                        </div>
                        <div style="margin-top: 15px;">
                            <button onclick="contactFarmerAboutCrop(${crop.user_id}, '${crop.crop_name}')" style="background: #2563eb; color: white; padding: 6px 12px; border: none; border-radius: 4px; margin-right: 10px;">Contact Farmer</button>
                            <button onclick="viewCropDetails(${crop.id})" style="background: #16a34a; color: white; padding: 6px 12px; border: none; border-radius: 4px;">View Details</button>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            document.getElementById('othersCropsList').innerHTML = '<p>Error loading crops from other farmers.</p>';
        }
    } catch (error) {
        console.error('Error loading others crops:', error);
        document.getElementById('othersCropsList').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

function contactFarmerAboutCrop(userId, cropName) {
    // This would typically open a chat interface or contact form
    alert(`Contact feature coming soon! You want to contact the farmer about ${cropName}.`);
}

async function viewCropDetails(cropId) {
    try {
        // For now, show a simple modal with crop details
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); display: flex; align-items: center; 
            justify-content: center; z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 500px;">
                <h3>Crop Details</h3>
                <p>This feature will show detailed information about the crop, farming practices, and growing conditions.</p>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 4px; margin-top: 10px;">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error viewing crop details:', error);
        alert('Failed to load crop details');
    }
}

// --- CHAT FUNCTION ---
async function loadChatMessages() {
    try {
        // For now, we'll create a simple chat that stores messages locally
        // In a real implementation, this would connect to a backend chat API
        const messagesContainer = document.getElementById('chatMessages');
        const storedMessages = JSON.parse(localStorage.getItem('communityChatMessages') || '[]');
        
        if (storedMessages.length === 0) {
            messagesContainer.innerHTML = '<p style="color: #6b7280; text-align: center;">Welcome to Community Chat! Start a conversation...</p>';
        } else {
            messagesContainer.innerHTML = storedMessages.map(msg => `
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #1f2937;">${msg.username}</div>
                    <div style="background: #f3f4f6; padding: 8px 12px; border-radius: 8px; margin-top: 4px; display: inline-block;">${msg.message}</div>
                    <div style="color: #6b7280; font-size: 0.7rem; margin-top: 4px;">${new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
            `).join('');
        }
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
    } catch (error) {
        console.error('Error loading chat messages:', error);
        document.getElementById('chatMessages').innerHTML = '<p style="color: #dc2626;">Error loading chat.</p>';
    }
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    try {
        // Get current user info (simplified - in real app, this would come from session)
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"username": "Anonymous"}');
        
        // Create new message
        const newMessage = {
            username: currentUser.username,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        // Store in localStorage (in real app, this would be sent to backend)
        const storedMessages = JSON.parse(localStorage.getItem('communityChatMessages') || '[]');
        storedMessages.push(newMessage);
        localStorage.setItem('communityChatMessages', JSON.stringify(storedMessages));
        
        // Clear input and reload messages
        chatInput.value = '';
        await loadChatMessages();
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
}


// --- MARKETPLACE ---
async function loadMarketplace() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <h3>🛒 Agricultural Marketplace</h3>
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <button onclick="showMarketSection('marketplace')" id="marketplaceBtn" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 6px;">Marketplace</button>
                <button onclick="showMarketSection('stores')" id="storesBtn" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px;">Nearby Stores</button>
            </div>
            <div id="marketContent"></div>
        </div>
    `;
    
    // Load marketplace by default
    await showMarketSection('marketplace');
}

async function showMarketSection(section) {
    // Update button styles
    const marketplaceBtn = document.getElementById('marketplaceBtn');
    const storesBtn = document.getElementById('storesBtn');
    
    if (marketplaceBtn) marketplaceBtn.style.background = section === 'marketplace' ? '#2563eb' : '#6b7280';
    if (storesBtn) storesBtn.style.background = section === 'stores' ? '#2563eb' : '#6b7280';
    
    const contentDiv = document.getElementById('marketContent');
    
    switch(section) {
        case 'marketplace':
            contentDiv.innerHTML = `
                <button onclick="showMarketItemForm()" style="background: #16a34a; color: white; padding: 8px 16px; border: none; border-radius: 6px; margin-bottom: 20px;">+ List Item for Sale</button>
                <div id="marketplaceItems"></div>
                <div id="marketItemForm" style="display: none;" class="card">
                    <h4>List Item for Sale</h4>
                    <form onsubmit="createMarketItem(event)">
                        <input type="text" id="marketTitle" placeholder="Item Title" required style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <select id="marketCategory" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="Seeds">Seeds</option>
                            <option value="Fertilizer">Fertilizer</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Tools">Tools</option>
                            <option value="Produce">Produce</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="number" id="marketPrice" placeholder="Price" step="0.01" required style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <input type="number" id="marketQuantity" placeholder="Quantity" required style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <textarea id="marketDescription" placeholder="Description" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; height: 80px;"></textarea>
                        <button type="submit" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 6px;">List Item</button>
                        <button type="button" onclick="hideMarketItemForm()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 6px; margin-left: 10px;">Cancel</button>
                    </form>
                </div>
            `;
            await loadMarketplaceItems();
            break;
        case 'stores':
            contentDiv.innerHTML = `
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <button onclick="showStoreType('government')" id="govtStoresBtn" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 6px;">🏛️ Government Stores</button>
                    <button onclick="showStoreType('private')" id="privateStoresBtn" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px;">🏪 Private Stores</button>
                </div>
                <div id="storesContent"></div>
            `;
            await showStoreType('government');
            break;
    }
}

async function loadMarketplaceItems() {
    try {
        const response = await fetch('http://localhost:5000/api/marketplace/items');
        
        if (response.ok) {
            const data = await response.json();
            const itemsContainer = document.getElementById('marketplaceItems');
            
            if (data.items.length === 0) {
                itemsContainer.innerHTML = '<p>No items available in the marketplace.</p>';
            } else {
                itemsContainer.innerHTML = data.items.map(item => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <h4>${item.title}</h4>
                        <p style="color: #059669; font-weight: bold;">₹${item.price} per ${item.unit}</p>
                        <p><strong>Category:</strong> ${item.category}</p>
                        <p><strong>Quantity:</strong> ${item.quantity} ${item.unit}</p>
                        <p><strong>Location:</strong> ${item.location || 'Not specified'}</p>
                        <p><strong>Seller:</strong> ${item.full_name || item.username}</p>
                        ${item.description ? `<p>${item.description}</p>` : ''}
                        ${item.contact_info ? `<p><strong>Contact:</strong> ${item.contact_info}</p>` : ''}
                        <p style="color: #6b7280; font-size: 0.8rem;">Listed on ${new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                `).join('');
            }
        } else {
            document.getElementById('marketplaceItems').innerHTML = '<p>Error loading marketplace items.</p>';
        }
    } catch (error) {
        console.error('Error loading marketplace items:', error);
        document.getElementById('marketplaceItems').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

function showMarketItemForm() {
    document.getElementById('marketItemForm').style.display = 'block';
}

function hideMarketItemForm() {
    document.getElementById('marketItemForm').style.display = 'none';
}

async function createMarketItem(event) {
    event.preventDefault();
    
    const itemData = {
        title: document.getElementById('marketTitle').value,
        category: document.getElementById('marketCategory').value,
        description: document.getElementById('marketDescription').value,
        price: parseFloat(document.getElementById('marketPrice').value),
        quantity: parseInt(document.getElementById('marketQuantity').value),
        unit: 'kg', // Default unit
        location: 'Not specified', // Default location
        contact_info: 'Not specified' // Default contact
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/marketplace/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData),
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Item listed successfully!');
            hideMarketItemForm();
            loadMarketplaceItems();
            // Clear form
            document.getElementById('marketTitle').value = '';
            document.getElementById('marketDescription').value = '';
            document.getElementById('marketPrice').value = '';
            document.getElementById('marketQuantity').value = '';
            document.getElementById('marketCategory').value = 'Seeds';
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to list item');
        }
    } catch (error) {
        console.error('Error listing item:', error);
        alert('Network error. Please try again.');
    }
}

async function showStoreType(storeType) {
    // Update button styles
    const govtStoresBtn = document.getElementById('govtStoresBtn');
    const privateStoresBtn = document.getElementById('privateStoresBtn');
    
    if (govtStoresBtn) govtStoresBtn.style.background = storeType === 'government' ? '#2563eb' : '#6b7280';
    if (privateStoresBtn) privateStoresBtn.style.background = storeType === 'private' ? '#2563eb' : '#6b7280';
    
    const contentDiv = document.getElementById('storesContent');
    contentDiv.innerHTML = '<p>Loading stores...</p>';
    
    try {
        const response = await fetch(`http://localhost:5000/api/stores?type=${storeType}`);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.stores.length === 0) {
                contentDiv.innerHTML = `<p>No ${storeType} stores found.</p>`;
            } else {
                contentDiv.innerHTML = data.stores.map(store => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <div>
                                <h4 style="margin: 0;">${store.store_name}</h4>
                                <p style="margin: 5px 0; color: #059669; font-size: 0.9rem;">
                                    ${store.category} ${store.is_verified ? '✅ Verified' : ''}
                                </p>
                                <p style="margin: 5px 0; color: #6b7280; font-size: 0.8rem;">
                                    ⭐ ${store.rating.toFixed(1)} • ${store.city}, ${store.state}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <span style="background: ${store.store_type === 'government' ? '#dc2626' : '#059669'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                                    ${store.store_type === 'government' ? 'Government' : 'Private'}
                                </span>
                            </div>
                        </div>
                        <p style="margin: 10px 0; color: #374151;">${store.description || 'No description available'}</p>
                        <div style="margin: 10px 0;">
                            <p style="margin: 5px 0; font-size: 0.9rem;">📍 ${store.address}</p>
                            <p style="margin: 5px 0; font-size: 0.9rem;">📞 ${store.phone || 'No phone available'}</p>
                            <p style="margin: 5px 0; font-size: 0.9rem;">🕒 ${store.opening_hours || 'Hours not specified'}</p>
                        </div>
                        <div style="margin-top: 15px;">
                            <button onclick="viewStoreDetails(${store.id})" style="background: #2563eb; color: white; padding: 6px 12px; border: none; border-radius: 4px; margin-right: 10px;">View Details</button>
                            <button onclick="viewStoreProducts(${store.id})" style="background: #16a34a; color: white; padding: 6px 12px; border: none; border-radius: 4px;">View Products</button>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            contentDiv.innerHTML = '<p>Error loading stores.</p>';
        }
    } catch (error) {
        console.error('Error loading stores:', error);
        contentDiv.innerHTML = '<p>Network error. Please try again.</p>';
    }
}

async function viewStoreDetails(storeId) {
    try {
        const response = await fetch(`http://localhost:5000/api/stores/${storeId}/reviews`);
        
        if (response.ok) {
            const data = await response.json();
            const reviews = data.reviews || [];
            
            // Show store details modal or section
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.5); display: flex; align-items: center; 
                justify-content: center; z-index: 1000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                    <h3>Store Reviews</h3>
                    ${reviews.length === 0 ? '<p>No reviews yet.</p>' : reviews.map(review => `
                        <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                            <div style="display: flex; justify-content: space-between;">
                                <strong>${review.full_name || review.username}</strong>
                                <span>⭐ ${review.rating}</span>
                            </div>
                            <p style="margin: 5px 0; color: #6b7280;">${new Date(review.created_at).toLocaleDateString()}</p>
                            <p style="margin: 5px 0;">${review.review_text || 'No comment'}</p>
                        </div>
                    `).join('')}
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 4px; margin-top: 10px;">Close</button>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    } catch (error) {
        console.error('Error loading store details:', error);
        alert('Failed to load store details');
    }
}

async function viewStoreProducts(storeId) {
    try {
        const response = await fetch(`http://localhost:5000/api/stores/${storeId}/products`);
        
        if (response.ok) {
            const data = await response.json();
            const products = data.products || [];
            
            // Show products modal or section
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.5); display: flex; align-items: center; 
                justify-content: center; z-index: 1000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; max-width: 700px; max-height: 80vh; overflow-y: auto;">
                    <h3>Store Products</h3>
                    ${products.length === 0 ? '<p>No products available.</p>' : products.map(product => `
                        <div style="border: 1px solid #e5e7eb; padding: 10px; margin: 10px 0; border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <h4 style="margin: 0;">${product.product_name}</h4>
                                    <p style="margin: 5px 0; color: #6b7280; font-size: 0.9rem;">${product.brand} • ${product.category}</p>
                                    <p style="margin: 5px 0;">${product.description || 'No description'}</p>
                                </div>
                                <div style="text-align: right;">
                                    <p style="margin: 0; font-weight: bold; color: #059669;">₹${product.price}/${product.unit}</p>
                                    <p style="margin: 0; font-size: 0.8rem; color: ${product.stock_quantity > 0 ? '#059669' : '#dc2626'};">
                                        ${product.stock_quantity > 0 ? `Stock: ${product.stock_quantity}` : 'Out of Stock'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 4px; margin-top: 10px;">Close</button>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    } catch (error) {
        console.error('Error loading store products:', error);
        alert('Failed to load store products');
    }
}

// --- LAND DETAILS ---
async function loadLandDetails() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <h3>🌍 Land Details</h3>
            <button onclick="showLandForm()" style="background: #16a34a; color: white; padding: 8px 16px; border: none; border-radius: 6px; margin-bottom: 20px;">+ Add Land Details</button>
            <div id="landList"></div>
        </div>
        <div id="landForm" style="display: none;" class="card">
            <h4>Add Land Details</h4>
            <form onsubmit="addLandDetails(event)">
                <input type="text" id="landName" placeholder="Land Name (Optional)" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                <input type="number" id="landArea" placeholder="Total Area (acres)" step="0.1" required style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" id="soilType" placeholder="Soil Type" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                <input type="number" id="soilPh" placeholder="Soil pH (6.0-8.0)" step="0.1" min="0" max="14" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" id="waterSource" placeholder="Water Source" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" id="irrigationSystem" placeholder="Irrigation System" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" id="landLocation" placeholder="Location" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                <select id="ownershipType" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="">Select Ownership Type</option>
                    <option value="Owned">Owned</option>
                    <option value="Rented">Rented</option>
                    <option value="Leased">Leased</option>
                </select>
                <button type="submit" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 6px;">Add Land</button>
                <button type="button" onclick="hideLandForm()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 6px; margin-left: 10px;">Cancel</button>
            </form>
        </div>
    `;
    
    await loadLands();
}

async function loadLands() {
    try {
        const response = await fetch('http://localhost:5000/api/land/details', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const landList = document.getElementById('landList');
            
            if (data.lands.length === 0) {
                landList.innerHTML = '<p>No land details added yet.</p>';
            } else {
                landList.innerHTML = data.lands.map(land => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <h4>${land.land_name || 'Land ' + land.id}</h4>
                        <p><strong>Total Area:</strong> ${land.total_area_acres} acres</p>
                        <p><strong>Soil Type:</strong> ${land.soil_type || 'N/A'}</p>
                        <p><strong>Soil pH:</strong> ${land.soil_ph || 'N/A'}</p>
                        <p><strong>Water Source:</strong> ${land.water_source || 'N/A'}</p>
                        <p><strong>Irrigation:</strong> ${land.irrigation_system || 'N/A'}</p>
                        <p><strong>Location:</strong> ${land.location || 'N/A'}</p>
                        <p><strong>Ownership:</strong> ${land.ownership_type || 'N/A'}</p>
                    </div>
                `).join('');
            }
        } else {
            document.getElementById('landList').innerHTML = '<p>Error loading land details.</p>';
        }
    } catch (error) {
        console.error('Error loading land details:', error);
        document.getElementById('landList').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

function showLandForm() {
    document.getElementById('landForm').style.display = 'block';
}

function hideLandForm() {
    document.getElementById('landForm').style.display = 'none';
}

async function addLandDetails(event) {
    event.preventDefault();
    
    const landData = {
        land_name: document.getElementById('landName').value,
        total_area_acres: parseFloat(document.getElementById('landArea').value),
        soil_type: document.getElementById('soilType').value,
        soil_ph: parseFloat(document.getElementById('soilPh').value) || null,
        water_source: document.getElementById('waterSource').value,
        irrigation_system: document.getElementById('irrigationSystem').value,
        location: document.getElementById('landLocation').value,
        ownership_type: document.getElementById('ownershipType').value
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/land/details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(landData),
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Land details added successfully!');
            hideLandForm();
            loadLands();
            // Clear form
            document.getElementById('landName').value = '';
            document.getElementById('landArea').value = '';
            document.getElementById('soilType').value = '';
            document.getElementById('soilPh').value = '';
            document.getElementById('waterSource').value = '';
            document.getElementById('irrigationSystem').value = '';
            document.getElementById('landLocation').value = '';
            document.getElementById('ownershipType').value = '';
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to add land details');
        }
    } catch (error) {
        console.error('Error adding land details:', error);
        alert('Network error. Please try again.');
    }
}

// --- FERTILIZER SHOP ---
async function loadFertilizerShop() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <h3>🧪 Fertilizer Shop</h3>
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <button onclick="showFertilizerType('government')" id="govtFertilizerBtn" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 6px;">🏛️ Government Fertilizer Shops</button>
                <button onclick="showFertilizerType('private')" id="privateFertilizerBtn" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px;">🏪 Private Fertilizer Shops</button>
            </div>
            <div id="fertilizerContent"></div>
        </div>
    `;
    
    // Load government fertilizer shops by default
    await showFertilizerType('government');
}

async function showFertilizerType(fertilizerType) {
    // Update button styles
    const govtFertilizerBtn = document.getElementById('govtFertilizerBtn');
    const privateFertilizerBtn = document.getElementById('privateFertilizerBtn');
    
    if (govtFertilizerBtn) govtFertilizerBtn.style.background = fertilizerType === 'government' ? '#2563eb' : '#6b7280';
    if (privateFertilizerBtn) privateFertilizerBtn.style.background = fertilizerType === 'private' ? '#2563eb' : '#6b7280';
    
    const contentDiv = document.getElementById('fertilizerContent');
    contentDiv.innerHTML = '<p>Loading fertilizer shops...</p>';
    
    try {
        const response = await fetch(`http://localhost:5000/api/stores?type=${fertilizerType}&category=Fertilizer`);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.stores.length === 0) {
                contentDiv.innerHTML = `<p>No ${fertilizerType} fertilizer shops found.</p>`;
            } else {
                contentDiv.innerHTML = data.stores.map(store => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <div>
                                <h4 style="margin: 0;">${store.store_name}</h4>
                                <p style="margin: 5px 0; color: #059669; font-size: 0.9rem;">
                                    Fertilizer Shop ${store.is_verified ? '✅ Verified' : ''}
                                </p>
                                <p style="margin: 5px 0; color: #6b7280; font-size: 0.8rem;">
                                    ⭐ ${store.rating.toFixed(1)} • ${store.city}, ${store.state}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <span style="background: ${store.store_type === 'government' ? '#dc2626' : '#059669'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                                    ${store.store_type === 'government' ? 'Government' : 'Private'}
                                </span>
                            </div>
                        </div>
                        <p style="margin: 10px 0; color: #374151;">${store.description || 'No description available'}</p>
                        <div style="margin: 10px 0;">
                            <p style="margin: 5px 0; font-size: 0.9rem;">📍 ${store.address}</p>
                            <p style="margin: 5px 0; font-size: 0.9rem;">📞 ${store.phone || 'No phone available'}</p>
                            <p style="margin: 5px 0; font-size: 0.9rem;">🕒 ${store.opening_hours || 'Hours not specified'}</p>
                        </div>
                        <div style="margin-top: 15px;">
                            <button onclick="viewFertilizerShopDetails(${store.id})" style="background: #2563eb; color: white; padding: 6px 12px; border: none; border-radius: 4px; margin-right: 10px;">View Details</button>
                            <button onclick="viewFertilizerShopProducts(${store.id})" style="background: #16a34a; color: white; padding: 6px 12px; border: none; border-radius: 4px;">View Products</button>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            contentDiv.innerHTML = '<p>Error loading fertilizer shops.</p>';
        }
    } catch (error) {
        console.error('Error loading fertilizer shops:', error);
        contentDiv.innerHTML = '<p>Network error. Please try again.</p>';
    }
}

async function viewFertilizerShopDetails(shopId) {
    try {
        const response = await fetch(`http://localhost:5000/api/stores/${shopId}/reviews`);
        
        if (response.ok) {
            const data = await response.json();
            const reviews = data.reviews || [];
            
            // Show shop details modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.5); display: flex; align-items: center; 
                justify-content: center; z-index: 1000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                    <h3>Fertilizer Shop Reviews</h3>
                    ${reviews.length === 0 ? '<p>No reviews yet.</p>' : reviews.map(review => `
                        <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                            <div style="display: flex; justify-content: space-between;">
                                <strong>${review.full_name || review.username}</strong>
                                <span>⭐ ${review.rating}</span>
                            </div>
                            <p style="margin: 5px 0; color: #6b7280;">${new Date(review.created_at).toLocaleDateString()}</p>
                            <p style="margin: 5px 0;">${review.review_text || 'No comment'}</p>
                        </div>
                    `).join('')}
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 4px; margin-top: 10px;">Close</button>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    } catch (error) {
        console.error('Error loading shop details:', error);
        alert('Failed to load shop details');
    }
}

async function viewFertilizerShopProducts(shopId) {
    try {
        const response = await fetch(`http://localhost:5000/api/stores/${shopId}/products`);
        
        if (response.ok) {
            const data = await response.json();
            const products = data.products || [];
            
            // Show products modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.5); display: flex; align-items: center; 
                justify-content: center; z-index: 1000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; max-width: 700px; max-height: 80vh; overflow-y: auto;">
                    <h3>Fertilizer Products</h3>
                    ${products.length === 0 ? '<p>No fertilizer products available.</p>' : products.map(product => `
                        <div style="border: 1px solid #e5e7eb; padding: 10px; margin: 10px 0; border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <h4 style="margin: 0;">${product.product_name}</h4>
                                    <p style="margin: 5px 0; color: #6b7280; font-size: 0.9rem;">${product.brand} • ${product.category}</p>
                                    <p style="margin: 5px 0;">${product.description || 'No description'}</p>
                                </div>
                                <div style="text-align: right;">
                                    <p style="margin: 0; font-weight: bold; color: #059669;">₹${product.price}/${product.unit}</p>
                                    <p style="margin: 0; font-size: 0.8rem; color: ${product.stock_quantity > 0 ? '#059669' : '#dc2626'};">
                                        ${product.stock_quantity > 0 ? `Stock: ${product.stock_quantity}` : 'Out of Stock'}
                                    </p>
                                </div>
                            </div>
                            <div style="margin-top: 10px;">
                                <button onclick="orderFertilizerFromShop(${product.id}, '${product.product_name}', ${product.price})" style="background: #16a34a; color: white; padding: 6px 12px; border: none; border-radius: 4px;">Order Now</button>
                            </div>
                        </div>
                    `).join('')}
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 4px; margin-top: 10px;">Close</button>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    } catch (error) {
        console.error('Error loading shop products:', error);
        alert('Failed to load shop products');
    }
}

function orderFertilizerFromShop(productId, productName, price) {
    const quantity = prompt(`Enter quantity for ${productName}:`);
    if (quantity && !isNaN(quantity) && parseFloat(quantity) > 0) {
        alert(`Order placed for ${quantity} units of ${productName} at ₹${price} each! Total: ₹${(parseFloat(quantity) * price).toFixed(2)}`);
    }
}

async function loadFertilizerProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/fertilizer/products');
        
        if (response.ok) {
            const data = await response.json();
            const productsContainer = document.getElementById('fertilizerProducts');
            
            if (data.products.length === 0) {
                productsContainer.innerHTML = '<p>No fertilizer products available.</p>';
            } else {
                productsContainer.innerHTML = data.products.map(product => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <h4>${product.name}</h4>
                        <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
                        <p><strong>Type:</strong> ${product.type || 'N/A'}</p>
                        <p><strong>NPK Ratio:</strong> ${product.npk_ratio || 'N/A'}</p>
                        <p><strong>Price:</strong> $${product.price_per_kg} per kg</p>
                        <p><strong>Stock:</strong> ${product.stock_quantity} kg available</p>
                        ${product.description ? `<p>${product.description}</p>` : ''}
                        ${product.application_method ? `<p><strong>Application:</strong> ${product.application_method}</p>` : ''}
                        <button onclick="orderFertilizer(${product.id}, '${product.name}', ${product.price_per_kg})" style="background: #16a34a; color: white; padding: 8px 16px; border: none; border-radius: 6px; margin-top: 10px;">Order Now</button>
                    </div>
                `).join('');
            }
        } else {
            document.getElementById('fertilizerProducts').innerHTML = '<p>Error loading fertilizer products.</p>';
        }
    } catch (error) {
        console.error('Error loading fertilizer products:', error);
        document.getElementById('fertilizerProducts').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

function orderFertilizer(productId, productName, pricePerKg) {
    const quantity = prompt(`Enter quantity (kg) for ${productName}:`);
    if (quantity && !isNaN(quantity) && parseFloat(quantity) > 0) {
        placeFertilizerOrder(productId, parseFloat(quantity), pricePerKg);
    }
}

async function placeFertilizerOrder(productId, quantity, pricePerKg) {
    const orderData = {
        product_id: productId,
        quantity_kg: quantity,
        delivery_address: prompt('Enter delivery address:') || ''
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/fertilizer/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Order placed successfully! Total: $${result.total_price.toFixed(2)}`);
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Network error. Please try again.');
    }
}

// --- GOVERNMENT SCHEMES ---
async function loadGovernmentSchemes() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <h3>🏛️ Government Schemes</h3>
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <button onclick="showSchemeType('central')" id="centralSchemesBtn" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 6px;">🇮🇳 Central Government Schemes</button>
                <button onclick="showSchemeType('state')" id="stateSchemesBtn" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px;">🏢 State Government Schemes</button>
            </div>
            <div id="schemesContent"></div>
        </div>
    `;
    
    // Load central schemes by default
    await showSchemeType('central');
}

async function showSchemeType(schemeType) {
    // Update button styles
    const centralSchemesBtn = document.getElementById('centralSchemesBtn');
    const stateSchemesBtn = document.getElementById('stateSchemesBtn');
    
    if (centralSchemesBtn) centralSchemesBtn.style.background = schemeType === 'central' ? '#2563eb' : '#6b7280';
    if (stateSchemesBtn) stateSchemesBtn.style.background = schemeType === 'state' ? '#2563eb' : '#6b7280';
    
    const contentDiv = document.getElementById('schemesContent');
    contentDiv.innerHTML = '<p>Loading schemes...</p>';
    
    try {
        const response = await fetch(`http://localhost:5000/api/government/schemes?type=${schemeType}`);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.schemes.length === 0) {
                contentDiv.innerHTML = `<p>No ${schemeType} schemes available.</p>`;
            } else {
                contentDiv.innerHTML = data.schemes.map(scheme => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <div>
                                <h4 style="margin: 0;">${scheme.scheme_name}</h4>
                                <p style="margin: 5px 0; color: #059669; font-size: 0.9rem;">
                                    ${scheme.applications_count || 0} applications
                                </p>
                                <p style="margin: 5px 0; color: #6b7280; font-size: 0.8rem;">
                                    📅 Deadline: ${new Date(scheme.deadline).toLocaleDateString()}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <span style="background: ${scheme.scheme_type === 'central' ? '#dc2626' : '#059669'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                                    ${scheme.scheme_type === 'central' ? 'Central' : 'State'}
                                </span>
                            </div>
                        </div>
                        <p style="margin: 10px 0; color: #374151;">${scheme.description}</p>
                        <div style="margin: 10px 0;">
                            <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Eligibility:</strong> ${scheme.eligibility_criteria}</p>
                            <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Benefits:</strong> ${scheme.benefits}</p>
                            <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Application Process:</strong> ${scheme.application_process}</p>
                        </div>
                        <div style="margin-top: 15px;">
                            <button onclick="applyForScheme(${scheme.id})" style="background: #2563eb; color: white; padding: 6px 12px; border: none; border-radius: 4px; margin-right: 10px;">Apply Now</button>
                            <button onclick="viewSchemeDetails(${scheme.id})" style="background: #16a34a; color: white; padding: 6px 12px; border: none; border-radius: 4px;">View Details</button>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            contentDiv.innerHTML = '<p>Error loading schemes.</p>';
        }
    } catch (error) {
        console.error('Error loading schemes:', error);
        contentDiv.innerHTML = '<p>Network error. Please try again.</p>';
    }
}

async function loadSchemes() {
    try {
        const response = await fetch('http://localhost:5000/api/schemes');
        
        if (response.ok) {
            const data = await response.json();
            const schemesContainer = document.getElementById('schemesList');
            
            if (data.schemes.length === 0) {
                schemesContainer.innerHTML = '<p>No government schemes available.</p>';
            } else {
                schemesContainer.innerHTML = data.schemes.map(scheme => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <h4>${scheme.scheme_name}</h4>
                        <p style="color: #059669; font-weight: bold;">Type: ${scheme.scheme_type}</p>
                        <p><strong>Deadline:</strong> ${new Date(scheme.deadline).toLocaleDateString()}</p>
                        <p><strong>Description:</strong> ${scheme.description}</p>
                        <p><strong>Benefits:</strong> ${scheme.benefits}</p>
                        <p><strong>Eligibility:</strong> ${scheme.eligibility_criteria}</p>
                        <button onclick="applyForScheme(${scheme.id}, '${scheme.scheme_name}')" style="background: #16a34a; color: white; padding: 8px 16px; border: none; border-radius: 6px; margin-top: 10px;">Apply Now</button>
                    </div>
                `).join('');
            }
        } else {
            document.getElementById('schemesList').innerHTML = '<p>Error loading schemes.</p>';
        }
    } catch (error) {
        console.error('Error loading schemes:', error);
        document.getElementById('schemesList').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

async function applyForScheme(schemeId) {
    try {
        const response = await fetch(`http://localhost:5000/api/schemes/${schemeId}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                scheme_id: schemeId,
                application_data: {}
            }),
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Application submitted successfully!');
            // Refresh the schemes list to update application count
            const schemeType = document.getElementById('centralSchemesBtn').style.background === 'rgb(37, 99, 235)' ? 'central' : 'state';
            await showSchemeType(schemeType);
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to submit application');
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        alert('Network error. Please try again.');
    }
}

async function viewSchemeDetails(schemeId) {
    try {
        const response = await fetch(`http://localhost:5000/api/schemes/${schemeId}/details`);
        
        if (response.ok) {
            const data = await response.json();
            const scheme = data.scheme;
            
            // Show scheme details modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.5); display: flex; align-items: center; 
                justify-content: center; z-index: 1000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                    <h3>${scheme.scheme_name}</h3>
                    <p style="color: #6b7280; margin: 10px 0;">Type: ${scheme.scheme_type === 'central' ? 'Central Government' : 'State Government'}</p>
                    <p style="margin: 10px 0;"><strong>Description:</strong> ${scheme.description}</p>
                    <p style="margin: 10px 0;"><strong>Eligibility:</strong> ${scheme.eligibility_criteria}</p>
                    <p style="margin: 10px 0;"><strong>Benefits:</strong> ${scheme.benefits}</p>
                    <p style="margin: 10px 0;"><strong>Application Process:</strong> ${scheme.application_process}</p>
                    <p style="margin: 10px 0;"><strong>Deadline:</strong> ${new Date(scheme.deadline).toLocaleDateString()}</p>
                    <p style="margin: 10px 0;"><strong>Contact:</strong> ${scheme.contact_info}</p>
                    <p style="margin: 10px 0;"><strong>Website:</strong> <a href="http://${scheme.website}" target="_blank">${scheme.website}</a></p>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 4px; margin-top: 10px;">Close</button>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    } catch (error) {
        console.error('Error loading scheme details:', error);
        alert('Failed to load scheme details');
    }
}

// --- COMPREHENSIVE ORDERS MODULE ---
async function loadOrders() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="orders-container">
            <div class="orders-header">
                <h2>📦 Orders Management</h2>
                <p>Complete buying/selling tracking with real-time status updates</p>
            </div>
            
            <div class="orders-modules-grid">
                <div class="order-module-card" onclick="loadOrderHistory()">
                    <div class="module-icon">📋</div>
                    <h3>Order History</h3>
                    <p>View complete history of all your buying and selling transactions</p>
                    <div class="module-features">
                        <span class="feature-tag">📊 Analytics</span>
                        <span class="feature-tag">📅 Timeline</span>
                    </div>
                </div>
                
                <div class="order-module-card" onclick="loadTrackOrders()">
                    <div class="module-icon">🚚</div>
                    <h3>Track Orders</h3>
                    <p>Real-time order tracking with live status updates</p>
                    <div class="module-features">
                        <span class="feature-tag">📍 Live Tracking</span>
                        <span class="feature-tag">⚡ Real-time</span>
                    </div>
                </div>
                
                <div class="order-module-card" onclick="loadPaymentDetails()">
                    <div class="module-icon">💳</div>
                    <h3>Payment Details</h3>
                    <p>Manage payment methods and view transaction history</p>
                    <div class="module-features">
                        <span class="feature-tag">💰 Transactions</span>
                        <span class="feature-tag">🔒 Secure</span>
                    </div>
                </div>
                
                <div class="order-module-card" onclick="loadInvoiceDownload()">
                    <div class="module-icon">📄</div>
                    <h3>Invoice Download</h3>
                    <p>Download invoices and receipts for all orders</p>
                    <div class="module-features">
                        <span class="feature-tag">📥 PDF Export</span>
                        <span class="feature-tag">📊 Reports</span>
                    </div>
                </div>
                
                <div class="order-module-card" onclick="loadReturnRefund()">
                    <div class="module-icon">🔄</div>
                    <h3>Return/Refund</h3>
                    <p>Request returns and refunds for damaged or wrong items</p>
                    <div class="module-features">
                        <span class="feature-tag">🛡️ Protection</span>
                        <span class="feature-tag">⚡ Quick Process</span>
                    </div>
                </div>
                
                <div class="order-module-card" onclick="loadDeliveryTracking()">
                    <div class="module-icon">📍</div>
                    <h3>Delivery Tracking</h3>
                    <p>Track delivery status and estimated arrival times</p>
                    <div class="module-features">
                        <span class="feature-tag">🗺️ Map View</span>
                        <span class="feature-tag">⏰ ETA</span>
                    </div>
                </div>
                
                <div class="order-module-card" onclick="loadBulkOrderManagement()">
                    <div class="module-icon">📦</div>
                    <h3>Bulk Orders</h3>
                    <p>Manage bulk purchases and wholesale orders</p>
                    <div class="module-features">
                        <span class="feature-tag">🏭 Wholesale</span>
                        <span class="feature-tag">💰 Discounts</span>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>⚡ Quick Actions</h3>
                <div class="actions-grid">
                    <button onclick="createNewOrder()" class="action-btn">
                        <span class="btn-icon">➕</span>
                        <span class="btn-text">New Order</span>
                    </button>
                    <button onclick="viewPendingOrders()" class="action-btn">
                        <span class="btn-icon">⏳</span>
                        <span class="btn-text">Pending Orders</span>
                    </button>
                    <button onclick="viewRecentTransactions()" class="action-btn">
                        <span class="btn-icon">💰</span>
                        <span class="btn-text">Recent Transactions</span>
                    </button>
                    <button onclick="contactSupport()" class="action-btn">
                        <span class="btn-icon">📞</span>
                        <span class="btn-text">Contact Support</span>
                    </button>
                </div>
            </div>
        </div>
        
        <style>
        .orders-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .orders-header {
            text-align: center;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin-bottom: 40px;
        }
        
        .orders-header h2 {
            margin: 0 0 10px 0;
            font-size: 2.5rem;
        }
        
        .orders-header p {
            margin: 0;
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .orders-modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .order-module-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
        }
        
        .order-module-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            border-color: #f59e0b;
        }
        
        .module-icon {
            font-size: 3.5rem;
            margin-bottom: 20px;
        }
        
        .order-module-card h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 1.4rem;
        }
        
        .order-module-card p {
            color: #6b7280;
            margin: 0 0 20px 0;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        .module-features {
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .feature-tag {
            background: #fef3c7;
            color: #d97706;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .quick-actions {
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
        }
        
        .quick-actions h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .action-btn {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .action-btn:hover {
            border-color: #f59e0b;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .btn-icon {
            font-size: 2rem;
        }
        
        .btn-text {
            font-weight: 600;
            color: #1f2937;
            text-align: center;
        }
        </style>
    `;
}

// --- ORDERS SUB-MODULES ---
async function loadOrderHistory() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="order-history-container">
            <div class="history-header">
                <h2>📋 Order History</h2>
                <p>Complete transaction history with filtering and analytics</p>
            </div>
            
            <div class="history-filters">
                <div class="filter-row">
                    <select id="orderTypeFilter" class="filter-input">
                        <option value="all">All Orders</option>
                        <option value="buy">Buy Orders</option>
                        <option value="sell">Sell Orders</option>
                    </select>
                    <select id="statusFilter" class="filter-input">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <input type="date" id="dateFilter" class="filter-input">
                    <button onclick="applyOrderFilters()" class="filter-btn">Apply Filters</button>
                </div>
            </div>
            
            <div class="history-stats">
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <h4>Total Orders</h4>
                    <p class="stat-value">156</p>
                    <p class="stat-label">All time</p>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <h4>Total Spent</h4>
                    <p class="stat-value">₹2,45,680</p>
                    <p class="stat-label">This year</p>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <h4>Total Earned</h4>
                    <p class="stat-value">₹3,12,450</p>
                    <p class="stat-label">From sales</p>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <h4>Avg Rating</h4>
                    <p class="stat-value">4.8</p>
                    <p class="stat-label">5 stars</p>
                </div>
            </div>
            
            <div class="order-list">
                <div class="order-item">
                    <div class="order-header">
                        <h4>📦 Buy Order - Organic Fertilizers</h4>
                        <div class="order-meta">
                            <span class="order-id">#ORD-2024-0456</span>
                            <span class="order-date">Apr 15, 2024</span>
                            <span class="order-status delivered">Delivered</span>
                        </div>
                    </div>
                    <div class="order-details">
                        <div class="order-items">
                            <div class="item">
                                <span class="item-name">Organic NPK Fertilizer</span>
                                <span class="item-quantity">5 bags × ₹450</span>
                            </div>
                            <div class="item">
                                <span class="item-name">Organic Compost</span>
                                <span class="item-quantity">10 bags × ₹180</span>
                            </div>
                        </div>
                        <div class="order-summary">
                            <p><strong>Total Amount:</strong> ₹4,050</p>
                            <p><strong>Payment:</strong> UPI</p>
                            <p><strong>Delivery:</strong> Apr 18, 2024</p>
                        </div>
                    </div>
                </div>
                
                <div class="order-item">
                    <div class="order-header">
                        <h4>🌾 Sell Order - Premium Rice</h4>
                        <div class="order-meta">
                            <span class="order-id">#SELL-2024-0123</span>
                            <span class="order-date">Apr 10, 2024</span>
                            <span class="order-status processing">Processing</span>
                        </div>
                    </div>
                    <div class="order-details">
                        <div class="order-items">
                            <div class="item">
                                <span class="item-name">Premium Basmati Rice</span>
                                <span class="item-quantity">500 kg × ₹45</span>
                            </div>
                        </div>
                        <div class="order-summary">
                            <p><strong>Total Amount:</strong> ₹22,500</p>
                            <p><strong>Payment:</strong> Bank Transfer</p>
                            <p><strong>Expected:</strong> Apr 20, 2024</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .order-history-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .history-header {
            text-align: center;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .history-filters {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .filter-row {
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .filter-input {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .filter-btn {
            background: #f59e0b;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .filter-btn:hover {
            background: #d97706;
        }
        
        .history-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .stat-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .stat-card h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
        }
        
        .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #f59e0b;
            margin: 5px 0;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0;
        }
        
        .order-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .order-item {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .order-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .order-header h4 {
            margin: 0;
            color: #1f2937;
            font-size: 1.2rem;
        }
        
        .order-meta {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        
        .order-id {
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .order-date {
            color: #6b7280;
            font-size: 0.85rem;
        }
        
        .order-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .order-status.delivered {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .order-status.processing {
            background: #fef3c7;
            color: #d97706;
        }
        
        .order-details {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }
        
        .order-items {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .item-name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .item-quantity {
            color: #6b7280;
        }
        
        .order-summary {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
        }
        
        .order-summary p {
            margin: 5px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .order-summary strong {
            color: #1f2937;
        }
        </style>
    `;
}

async function loadTrackOrders() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="track-orders-container">
            <div class="track-header">
                <h2>🚚 Track Orders</h2>
                <p>Real-time order tracking with live status updates</p>
            </div>
            
            <div class="track-search">
                <div class="search-box">
                    <input type="text" id="trackingInput" placeholder="Enter Order ID or Tracking Number" class="search-input">
                    <button onclick="trackOrder()" class="search-btn">🔍 Track</button>
                </div>
            </div>
            
            <div class="active-tracking">
                <h3>📍 Currently Tracking</h3>
                <div class="tracking-item">
                    <div class="tracking-info">
                        <div class="tracking-header">
                            <h4>📦 Order #ORD-2024-0456</h4>
                            <span class="tracking-status in-transit">In Transit</span>
                        </div>
                        <div class="tracking-details">
                            <p><strong>Product:</strong> Organic Fertilizers Package</p>
                            <p><strong>Estimated Delivery:</strong> Apr 18, 2024</p>
                            <p><strong>Carrier:</strong> BlueDart Express</p>
                            <p><strong>Tracking Number:</strong> BD1234567890</p>
                        </div>
                    </div>
                    <div class="tracking-timeline">
                        <div class="timeline-item completed">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h5>Order Placed</h5>
                                <p>Apr 15, 2024 - 10:30 AM</p>
                            </div>
                        </div>
                        <div class="timeline-item completed">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h5>Order Confirmed</h5>
                                <p>Apr 15, 2024 - 11:45 AM</p>
                            </div>
                        </div>
                        <div class="timeline-item completed">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h5>Shipped</h5>
                                <p>Apr 16, 2024 - 2:00 PM</p>
                            </div>
                        </div>
                        <div class="timeline-item current">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h5>In Transit</h5>
                                <p>Apr 17, 2024 - 9:00 AM</p>
                                <p>Package is on the way to your location</p>
                            </div>
                        </div>
                        <div class="timeline-item upcoming">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h5>Out for Delivery</h5>
                                <p>Expected: Apr 18, 2024 - Morning</p>
                            </div>
                        </div>
                        <div class="timeline-item upcoming">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h5>Delivered</h5>
                                <p>Expected: Apr 18, 2024 - Afternoon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tracking-actions">
                <button onclick="getTrackingUpdates()" class="action-btn">
                    <span>📱</span> Get SMS Updates
                </button>
                <button onclick="shareTracking()" class="action-btn">
                    <span>📤</span> Share Tracking
                </button>
                <button onclick="contactCarrier()" class="action-btn">
                    <span>📞</span> Contact Carrier
                </button>
            </div>
        </div>
        
        <style>
        .track-orders-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .track-header {
            text-align: center;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .track-search {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .search-box {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        
        .search-input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .search-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .search-btn:hover {
            background: #2563eb;
        }
        
        .active-tracking {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .active-tracking h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .tracking-item {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
        }
        
        .tracking-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
        }
        
        .tracking-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .tracking-header h4 {
            margin: 0;
            color: #1f2937;
        }
        
        .tracking-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .tracking-status.in-transit {
            background: #dbeafe;
            color: #1d4ed8;
        }
        
        .tracking-details p {
            margin: 8px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .tracking-details strong {
            color: #1f2937;
        }
        
        .tracking-timeline {
            position: relative;
        }
        
        .timeline-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            position: relative;
        }
        
        .timeline-marker {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #e5e7eb;
            border: 3px solid white;
            margin-right: 15px;
            position: relative;
            z-index: 2;
        }
        
        .timeline-item.completed .timeline-marker {
            background: #16a34a;
        }
        
        .timeline-item.current .timeline-marker {
            background: #3b82f6;
            animation: pulse 2s infinite;
        }
        
        .timeline-item.upcoming .timeline-marker {
            background: #e5e7eb;
        }
        
        .timeline-content {
            flex: 1;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .timeline-content h5 {
            margin: 0 0 5px 0;
            color: #1f2937;
        }
        
        .timeline-content p {
            margin: 0;
            color: #6b7280;
            font-size: 0.85rem;
        }
        
        .tracking-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn:first-child {
            background: #16a34a;
            color: white;
        }
        
        .action-btn:nth-child(2) {
            background: #3b82f6;
            color: white;
        }
        
        .action-btn:last-child {
            background: #f59e0b;
            color: white;
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        </style>
    `;
}

async function loadPaymentDetails() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="payment-details-container">
            <div class="payment-header">
                <h2>💳 Payment Details</h2>
                <p>Manage payment methods and view transaction history</p>
            </div>
            
            <div class="payment-methods">
                <h3>💳 Saved Payment Methods</h3>
                <div class="payment-cards">
                    <div class="payment-card">
                        <div class="card-info">
                            <div class="card-type">Visa</div>
                            <div class="card-number">•••• ••• ••• 4242</div>
                            <div class="card-holder">John Farmer</div>
                        </div>
                        <div class="card-actions">
                            <button class="card-btn primary">Default</button>
                            <button class="card-btn">Edit</button>
                            <button class="card-btn danger">Remove</button>
                        </div>
                    </div>
                    
                    <div class="payment-card">
                        <div class="card-info">
                            <div class="card-type">UPI</div>
                            <div class="card-number">johnfarmer@ybl</div>
                            <div class="card-holder">UPI ID</div>
                        </div>
                        <div class="card-actions">
                            <button class="card-btn">Edit</button>
                            <button class="card-btn danger">Remove</button>
                        </div>
                    </div>
                    
                    <div class="payment-card">
                        <div class="card-info">
                            <div class="card-type">Bank Account</div>
                            <div class="card-number">•••• ••• ••• 7890</div>
                            <div class="card-holder">SBI Bank</div>
                        </div>
                        <div class="card-actions">
                            <button class="card-btn">Edit</button>
                            <button class="card-btn danger">Remove</button>
                        </div>
                    </div>
                </div>
                
                <button onclick="addPaymentMethod()" class="add-payment-btn">
                    <span>➕</span> Add New Payment Method
                </button>
            </div>
            
            <div class="transaction-history">
                <h3>📊 Recent Transactions</h3>
                <div class="transaction-list">
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-header">
                                <h4>Payment for Order #ORD-2024-0456</h4>
                                <span class="transaction-status completed">Completed</span>
                            </div>
                            <div class="transaction-details">
                                <p><strong>Amount:</strong> ₹4,050</p>
                                <p><strong>Method:</strong> UPI</p>
                                <p><strong>Date:</strong> Apr 15, 2024</p>
                                <p><strong>Transaction ID:</strong> TXN123456789</p>
                            </div>
                        </div>
                        <div class="transaction-actions">
                            <button class="receipt-btn">📄 Download Receipt</button>
                        </div>
                    </div>
                    
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-header">
                                <h4>Refund for Order #ORD-2024-0445</h4>
                                <span class="transaction-status completed">Completed</span>
                            </div>
                            <div class="transaction-details">
                                <p><strong>Amount:</strong> ₹1,200</p>
                                <p><strong>Method:</strong> Bank Transfer</p>
                                <p><strong>Date:</strong> Apr 12, 2024</p>
                                <p><strong>Transaction ID:</strong> TXN987654321</p>
                            </div>
                        </div>
                        <div class="transaction-actions">
                            <button class="receipt-btn">📄 Download Receipt</button>
                        </div>
                    </div>
                    
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-header">
                                <h4>Payment Received for Rice Sale</h4>
                                <span class="transaction-status completed">Completed</span>
                            </div>
                            <div class="transaction-details">
                                <p><strong>Amount:</strong> ₹22,500</p>
                                <p><strong>Method:</strong> Direct Deposit</p>
                                <p><strong>Date:</strong> Apr 10, 2024</p>
                                <p><strong>Transaction ID:</strong> TXN456789123</p>
                            </div>
                        </div>
                        <div class="transaction-actions">
                            <button class="receipt-btn">📄 Download Receipt</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="payment-actions">
                <button onclick="viewPaymentAnalytics()" class="action-btn">
                    <span>📊</span> Payment Analytics
                </button>
                <button onclick="downloadPaymentHistory()" class="action-btn">
                    <span>📥</span> Download History
                </button>
                <button onclick="setPaymentAlerts()" class="action-btn">
                    <span>🔔</span> Payment Alerts
                </button>
            </div>
        </div>
        
        <style>
        .payment-details-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .payment-header {
            text-align: center;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .payment-methods {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .payment-methods h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .payment-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .payment-card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        .payment-card:hover {
            border-color: #10b981;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .card-info {
            margin-bottom: 15px;
        }
        
        .card-type {
            font-size: 1.2rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .card-number {
            font-size: 1.1rem;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .card-holder {
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .card-actions {
            display: flex;
            gap: 10px;
        }
        
        .card-btn {
            padding: 6px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .card-btn.primary {
            background: #10b981;
            color: white;
            border-color: #10b981;
        }
        
        .card-btn.danger {
            background: #dc2626;
            color: white;
            border-color: #dc2626;
        }
        
        .add-payment-btn {
            width: 100%;
            padding: 15px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .add-payment-btn:hover {
            background: #059669;
        }
        
        .transaction-history {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .transaction-history h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .transaction-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .transaction-item {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        .transaction-item:hover {
            border-color: #10b981;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .transaction-info {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }
        
        .transaction-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .transaction-header h4 {
            margin: 0;
            color: #1f2937;
        }
        
        .transaction-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .transaction-status.completed {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .transaction-details p {
            margin: 5px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .transaction-details strong {
            color: #1f2937;
        }
        
        .transaction-actions {
            display: flex;
            justify-content: center;
        }
        
        .receipt-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .receipt-btn:hover {
            background: #2563eb;
        }
        
        .payment-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn:first-child {
            background: #10b981;
            color: white;
        }
        
        .action-btn:nth-child(2) {
            background: #3b82f6;
            color: white;
        }
        
        .action-btn:last-child {
            background: #f59e0b;
            color: white;
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadInvoiceDownload() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="invoice-download-container">
            <div class="invoice-header">
                <h2>📄 Invoice Download</h2>
                <p>Download invoices and receipts for all your orders</p>
            </div>
            
            <div class="invoice-filters">
                <div class="filter-row">
                    <select id="invoiceType" class="filter-input">
                        <option value="all">All Invoices</option>
                        <option value="purchase">Purchase Invoices</option>
                        <option value="sale">Sale Invoices</option>
                    </select>
                    <input type="date" id="invoiceDateFrom" class="filter-input" placeholder="From Date">
                    <input type="date" id="invoiceDateTo" class="filter-input" placeholder="To Date">
                    <button onclick="filterInvoices()" class="filter-btn">Filter</button>
                </div>
            </div>
            
            <div class="invoice-stats">
                <div class="stat-card">
                    <div class="stat-icon">📄</div>
                    <h4>Total Invoices</h4>
                    <p class="stat-value">156</p>
                    <p class="stat-label">All time</p>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <h4>Total Value</h4>
                    <p class="stat-value">₹5,58,130</p>
                    <p class="stat-label">Invoiced</p>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📥</div>
                    <h4>Downloads</h4>
                    <p class="stat-value">89</p>
                    <p class="stat-label">This month</p>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <h4>Pending</h4>
                    <p class="stat-value">12</p>
                    <p class="stat-label">To process</p>
                </div>
            </div>
            
            <div class="invoice-list">
                <div class="invoice-item">
                    <div class="invoice-info">
                        <div class="invoice-header">
                            <h4>📦 Purchase Invoice - Organic Fertilizers</h4>
                            <span class="invoice-status completed">Completed</span>
                        </div>
                        <div class="invoice-details">
                            <p><strong>Invoice Number:</strong> INV-2024-0456</p>
                            <p><strong>Order ID:</strong> #ORD-2024-0456</p>
                            <p><strong>Date:</strong> Apr 15, 2024</p>
                            <p><strong>Amount:</strong> ₹4,050</p>
                            <p><strong>Vendor:</strong> Organic Supplies Co.</p>
                        </div>
                    </div>
                    <div class="invoice-actions">
                        <button onclick="downloadInvoice('INV-2024-0456')" class="download-btn">
                            <span>📥</span> Download PDF
                        </button>
                        <button onclick="viewInvoice('INV-2024-0456')" class="view-btn">
                            <span>👁️</span> View
                        </button>
                        <button onclick="shareInvoice('INV-2024-0456')" class="share-btn">
                            <span>📤</span> Share
                        </button>
                    </div>
                </div>
                
                <div class="invoice-item">
                    <div class="invoice-info">
                        <div class="invoice-header">
                            <h4>🌾 Sale Invoice - Premium Rice</h4>
                            <span class="invoice-status processing">Processing</span>
                        </div>
                        <div class="invoice-details">
                            <p><strong>Invoice Number:</strong> SINV-2024-0123</p>
                            <p><strong>Order ID:</strong> #SELL-2024-0123</p>
                            <p><strong>Date:</strong> Apr 10, 2024</p>
                            <p><strong>Amount:</strong> ₹22,500</p>
                            <p><strong>Buyer:</strong> Agro Traders Ltd.</p>
                        </div>
                    </div>
                    <div class="invoice-actions">
                        <button onclick="downloadInvoice('SINV-2024-0123')" class="download-btn">
                            <span>📥</span> Download PDF
                        </button>
                        <button onclick="viewInvoice('SINV-2024-0123')" class="view-btn">
                            <span>👁️</span> View
                        </button>
                        <button onclick="shareInvoice('SINV-2024-0123')" class="share-btn">
                            <span>📤</span> Share
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="invoice-actions">
                <button onclick="downloadAllInvoices()" class="action-btn">
                    <span>📥</span> Download All
                </button>
                <button onclick="generateInvoiceReport()" class="action-btn">
                    <span>📊</span> Generate Report
                </button>
                <button onclick="emailInvoices()" class="action-btn">
                    <span>📧</span> Email Invoices
                </button>
            </div>
        </div>
        
        <style>
        .invoice-download-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .invoice-header {
            text-align: center;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .invoice-filters {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .filter-row {
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .filter-input {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .filter-btn {
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .filter-btn:hover {
            background: #7c3aed;
        }
        
        .invoice-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .stat-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .stat-card h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
        }
        
        .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #8b5cf6;
            margin: 5px 0;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0;
        }
        
        .invoice-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .invoice-item {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            align-items: center;
        }
        
        .invoice-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .invoice-header h4 {
            margin: 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .invoice-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .invoice-status.completed {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .invoice-status.processing {
            background: #fef3c7;
            color: #d97706;
        }
        
        .invoice-details p {
            margin: 5px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .invoice-details strong {
            color: #1f2937;
        }
        
        .invoice-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .download-btn, .view-btn, .share-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            justify-content: center;
        }
        
        .download-btn {
            background: #8b5cf6;
            color: white;
        }
        
        .view-btn {
            background: #3b82f6;
            color: white;
        }
        
        .share-btn {
            background: #10b981;
            color: white;
        }
        
        .download-btn:hover, .view-btn:hover, .share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .invoice-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn:first-child {
            background: #8b5cf6;
            color: white;
        }
        
        .action-btn:nth-child(2) {
            background: #3b82f6;
            color: white;
        }
        
        .action-btn:last-child {
            background: #10b981;
            color: white;
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadReturnRefund() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="return-refund-container">
            <div class="return-header">
                <h2>🔄 Return & Refund</h2>
                <p>Request returns and refunds for damaged or wrong items</p>
            </div>
            
            <div class="return-form">
                <h3>📋 Request Return/Refund</h3>
                <div class="form-section">
                    <div class="form-group">
                        <label>Order ID</label>
                        <input type="text" id="returnOrderId" class="form-input" placeholder="Enter Order ID">
                    </div>
                    <div class="form-group">
                        <label>Return Type</label>
                        <select id="returnType" class="form-input">
                            <option value="">Select Type</option>
                            <option value="damaged">Damaged Item</option>
                            <option value="wrong">Wrong Item</option>
                            <option value="defective">Defective Product</option>
                            <option value="expired">Expired Product</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Reason</label>
                        <textarea id="returnReason" class="form-input" placeholder="Describe the issue in detail" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Upload Images</label>
                        <input type="file" id="returnImages" class="form-input" accept="image/*" multiple>
                    </div>
                    <div class="form-group">
                        <label>Preferred Resolution</label>
                        <select id="returnResolution" class="form-input">
                            <option value="">Select Resolution</option>
                            <option value="refund">Full Refund</option>
                            <option value="replacement">Replacement</option>
                            <option value="exchange">Exchange</option>
                            <option value="partial">Partial Refund</option>
                        </select>
                    </div>
                </div>
                <button onclick="submitReturnRequest()" class="submit-btn">Submit Return Request</button>
            </div>
            
            <div class="return-history">
                <h3>📊 Return History</h3>
                <div class="return-list">
                    <div class="return-item">
                        <div class="return-info">
                            <div class="return-header">
                                <h4>🔄 Return Request - Damaged Seeds</h4>
                                <span class="return-status approved">Approved</span>
                            </div>
                            <div class="return-details">
                                <p><strong>Request ID:</strong> RET-2024-0234</p>
                                <p><strong>Order ID:</strong> #ORD-2024-0432</p>
                                <p><strong>Date:</strong> Apr 12, 2024</p>
                                <p><strong>Reason:</strong> Seeds arrived damaged and unusable</p>
                                <p><strong>Resolution:</strong> Full Refund</p>
                            </div>
                        </div>
                        <div class="return-actions">
                            <button onclick="trackReturn('RET-2024-0234')" class="track-btn">Track Status</button>
                        </div>
                    </div>
                    
                    <div class="return-item">
                        <div class="return-info">
                            <div class="return-header">
                                <h4>🔄 Return Request - Wrong Fertilizer</h4>
                                <span class="return-status processing">Processing</span>
                            </div>
                            <div class="return-details">
                                <p><strong>Request ID:</strong> RET-2024-0235</p>
                                <p><strong>Order ID:</strong> #ORD-2024-0440</p>
                                <p><strong>Date:</strong> Apr 14, 2024</p>
                                <p><strong>Reason:</strong> Received wrong fertilizer type</p>
                                <p><strong>Resolution:</strong> Replacement</p>
                            </div>
                        </div>
                        <div class="return-actions">
                            <button onclick="trackReturn('RET-2024-0235')" class="track-btn">Track Status</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="return-actions">
                <button onclick="viewReturnPolicy()" class="action-btn">
                    <span>📋</span> Return Policy
                </button>
                <button onclick="contactReturnSupport()" class="action-btn">
                    <span>📞</span> Contact Support
                </button>
                <button onclick="viewReturnFAQ()" class="action-btn">
                    <span>❓</span> FAQ
                </button>
            </div>
        </div>
        
        <style>
        .return-refund-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .return-header {
            text-align: center;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .return-form {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .return-form h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .form-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
        }
        
        .form-group label {
            color: #1f2937;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .form-input {
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-input:focus {
            border-color: #ef4444;
            outline: none;
        }
        
        .submit-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .submit-btn:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .return-history {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .return-history h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .return-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .return-item {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            align-items: center;
        }
        
        .return-item:hover {
            border-color: #ef4444;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .return-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .return-header h4 {
            margin: 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .return-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .return-status.approved {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .return-status.processing {
            background: #fef3c7;
            color: #d97706;
        }
        
        .return-details p {
            margin: 5px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .return-details strong {
            color: #1f2937;
        }
        
        .return-actions {
            display: flex;
            justify-content: center;
        }
        
        .track-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .track-btn:hover {
            background: #2563eb;
        }
        
        .return-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn:first-child {
            background: #ef4444;
            color: white;
        }
        
        .action-btn:nth-child(2) {
            background: #3b82f6;
            color: white;
        }
        
        .action-btn:last-child {
            background: #f59e0b;
            color: white;
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadDeliveryTracking() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="delivery-tracking-container">
            <div class="tracking-header">
                <h2>📍 Delivery Tracking</h2>
                <p>Track delivery status and estimated arrival times</p>
            </div>
            
            <div class="tracking-search">
                <div class="search-box">
                    <input type="text" id="deliveryTrackingInput" placeholder="Enter Order ID or Tracking Number" class="search-input">
                    <button onclick="trackDelivery()" class="search-btn">🔍 Track Delivery</button>
                </div>
            </div>
            
            <div class="active-deliveries">
                <h3>🚚 Active Deliveries</h3>
                <div class="delivery-item">
                    <div class="delivery-map">
                        <div class="map-placeholder">
                            <span>🗺️</span>
                            <p>Live Map View</p>
                            <p>Package is currently in transit</p>
                        </div>
                    </div>
                    <div class="delivery-info">
                        <div class="delivery-header">
                            <h4>📦 Order #ORD-2024-0456</h4>
                            <span class="delivery-status in-transit">In Transit</span>
                        </div>
                        <div class="delivery-details">
                            <p><strong>Tracking Number:</strong> BD1234567890</p>
                            <p><strong>Carrier:</strong> BlueDart Express</p>
                            <p><strong>Current Location:</strong> Hyderabad, Telangana</p>
                            <p><strong>Estimated Delivery:</strong> Apr 18, 2024 - 2:00 PM</p>
                            <p><strong>Distance:</strong> 45 km away</p>
                        </div>
                        <div class="delivery-timeline">
                            <div class="timeline-step completed">
                                <div class="step-marker"></div>
                                <div class="step-content">
                                    <h5>Picked Up</h5>
                                    <p>Apr 16, 2024 - 2:00 PM</p>
                                </div>
                            </div>
                            <div class="timeline-step completed">
                                <div class="step-marker"></div>
                                <div class="step-content">
                                    <h5>In Transit</h5>
                                    <p>Apr 17, 2024 - 9:00 AM</p>
                                </div>
                            </div>
                            <div class="timeline-step current">
                                <div class="step-marker"></div>
                                <div class="step-content">
                                    <h5>Out for Delivery</h5>
                                    <p>Expected: Apr 18, 2024 - 10:00 AM</p>
                                </div>
                            </div>
                            <div class="timeline-step upcoming">
                                <div class="step-marker"></div>
                                <div class="step-content">
                                    <h5>Delivered</h5>
                                    <p>Expected: Apr 18, 2024 - 2:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="delivery-actions">
                <button onclick="getDeliveryUpdates()" class="action-btn">
                    <span>📱</span> Get SMS Updates
                </button>
                <button onclick="contactDelivery()" class="action-btn">
                    <span>📞</span> Contact Delivery
                </button>
                <button onclick="changeDeliveryAddress()" class="action-btn">
                    <span>🏠</span> Change Address
                </button>
                <button onclick="scheduleDelivery()" class="action-btn">
                    <span>📅</span> Schedule Delivery
                </button>
            </div>
        </div>
        
        <style>
        .delivery-tracking-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .tracking-header {
            text-align: center;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .tracking-search {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .search-box {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        
        .search-input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .search-btn {
            background: #06b6d4;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .search-btn:hover {
            background: #0891b2;
        }
        
        .active-deliveries {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .active-deliveries h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .delivery-item {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
        }
        
        .delivery-map {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        
        .map-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .map-placeholder span {
            font-size: 3rem;
        }
        
        .map-placeholder p {
            margin: 0;
            color: #6b7280;
        }
        
        .delivery-info {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .delivery-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .delivery-header h4 {
            margin: 0;
            color: #1f2937;
            font-size: 1.2rem;
        }
        
        .delivery-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .delivery-status.in-transit {
            background: #dbeafe;
            color: #1d4ed8;
        }
        
        .delivery-details {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
        }
        
        .delivery-details p {
            margin: 8px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .delivery-details strong {
            color: #1f2937;
        }
        
        .delivery-timeline {
            display: flex;
            gap: 15px;
            overflow-x: auto;
        }
        
        .timeline-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 120px;
            position: relative;
        }
        
        .step-marker {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #e5e7eb;
            border: 3px solid white;
            margin-bottom: 8px;
            position: relative;
            z-index: 2;
        }
        
        .timeline-step.completed .step-marker {
            background: #16a34a;
        }
        
        .timeline-step.current .step-marker {
            background: #06b6d4;
            animation: pulse 2s infinite;
        }
        
        .timeline-step.upcoming .step-marker {
            background: #e5e7eb;
        }
        
        .step-content {
            background: white;
            padding: 10px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .step-content h5 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 0.85rem;
        }
        
        .step-content p {
            margin: 0;
            color: #6b7280;
            font-size: 0.75rem;
        }
        
        .delivery-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn:first-child {
            background: #06b6d4;
            color: white;
        }
        
        .action-btn:nth-child(2) {
            background: #3b82f6;
            color: white;
        }
        
        .action-btn:nth-child(3) {
            background: #10b981;
            color: white;
        }
        
        .action-btn:last-child {
            background: #f59e0b;
            color: white;
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(6, 182, 212, 0); }
            100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
        }
        </style>
    `;
}

async function loadBulkOrderManagement() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="bulk-order-container">
            <div class="bulk-header">
                <h2>📦 Bulk Order Management</h2>
                <p>Manage bulk purchases and wholesale orders with special pricing</p>
            </div>
            
            <div class="bulk-stats">
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <h4>Active Bulk Orders</h4>
                    <p class="stat-value">8</p>
                    <p class="stat-label">Currently processing</p>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <h4>Total Bulk Value</h4>
                    <p class="stat-value">₹12,45,000</p>
                    <p class="stat-label">This quarter</p>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏭</div>
                    <h4>Wholesale Partners</h4>
                    <p class="stat-value">15</p>
                    <p class="stat-label">Active suppliers</p>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💸</div>
                    <h4>Savings</h4>
                    <p class="stat-value">₹2,34,500</p>
                    <p class="stat-label">From bulk pricing</p>
                </div>
            </div>
            
            <div class="bulk-form">
                <h3>📋 Create Bulk Order</h3>
                <div class="form-section">
                    <div class="form-group">
                        <label>Product Category</label>
                        <select id="bulkCategory" class="form-input">
                            <option value="">Select Category</option>
                            <option value="seeds">Seeds</option>
                            <option value="fertilizers">Fertilizers</option>
                            <option value="pesticides">Pesticides</option>
                            <option value="equipment">Equipment</option>
                            <option value="feed">Animal Feed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Product Name</label>
                        <input type="text" id="bulkProduct" class="form-input" placeholder="Enter product name">
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" id="bulkQuantity" class="form-input" placeholder="Enter quantity">
                    </div>
                    <div class="form-group">
                        <label>Unit</label>
                        <select id="bulkUnit" class="form-input">
                            <option value="">Select Unit</option>
                            <option value="kg">Kilograms</option>
                            <option value="tons">Tons</option>
                            <option value="bags">Bags</option>
                            <option value="liters">Liters</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Expected Delivery Date</label>
                        <input type="date" id="bulkDeliveryDate" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Budget Range</label>
                        <select id="bulkBudget" class="form-input">
                            <option value="">Select Budget</option>
                            <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                            <option value="100000-500000">₹1,00,000 - ₹5,00,000</option>
                            <option value="500000-1000000">₹5,00,000 - ₹10,00,000</option>
                            <option value="1000000+">Above ₹10,00,000</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Special Requirements</label>
                    <textarea id="bulkRequirements" class="form-input" placeholder="Enter any special requirements or specifications" rows="3"></textarea>
                </div>
                <button onclick="submitBulkOrder()" class="submit-btn">Submit Bulk Order</button>
            </div>
            
            <div class="bulk-orders-list">
                <h3>📊 Current Bulk Orders</h3>
                <div class="bulk-order-item">
                    <div class="order-info">
                        <div class="order-header">
                            <h4>🌾 Bulk Order - Premium Rice Seeds</h4>
                            <span class="order-status processing">Processing</span>
                        </div>
                        <div class="order-details">
                            <p><strong>Order ID:</strong> BULK-2024-001</p>
                            <p><strong>Quantity:</strong> 2 tons</p>
                            <p><strong>Unit Price:</strong> ₹45/kg</p>
                            <p><strong>Total Value:</strong> ₹90,000</p>
                            <p><strong>Supplier:</strong> Agro Seeds Ltd.</p>
                            <p><strong>Expected Delivery:</strong> Apr 25, 2024</p>
                        </div>
                    </div>
                    <div class="order-actions">
                        <button onclick="viewBulkOrder('BULK-2024-001')" class="view-btn">View Details</button>
                        <button onclick="trackBulkOrder('BULK-2024-001')" class="track-btn">Track</button>
                        <button onclick="contactSupplier('BULK-2024-001')" class="contact-btn">Contact Supplier</button>
                    </div>
                </div>
                
                <div class="bulk-order-item">
                    <div class="order-info">
                        <div class="order-header">
                            <h4>🌱 Bulk Order - Organic Fertilizers</h4>
                            <span class="order-status confirmed">Confirmed</span>
                        </div>
                        <div class="order-details">
                            <p><strong>Order ID:</strong> BULK-2024-002</p>
                            <p><strong>Quantity:</strong> 500 bags</p>
                            <p><strong>Unit Price:</strong> ₹380/bag</p>
                            <p><strong>Total Value:</strong> ₹1,90,000</p>
                            <p><strong>Supplier:</strong> Organic Supplies Co.</p>
                            <p><strong>Expected Delivery:</strong> Apr 28, 2024</p>
                        </div>
                    </div>
                    <div class="order-actions">
                        <button onclick="viewBulkOrder('BULK-2024-002')" class="view-btn">View Details</button>
                        <button onclick="trackBulkOrder('BULK-2024-002')" class="track-btn">Track</button>
                        <button onclick="contactSupplier('BULK-2024-002')" class="contact-btn">Contact Supplier</button>
                    </div>
                </div>
            </div>
            
            <div class="bulk-actions">
                <button onclick="viewBulkPricing()" class="action-btn">
                    <span>💰</span> View Bulk Pricing
                </button>
                <button onclick="findSuppliers()" class="action-btn">
                    <span>🔍</span> Find Suppliers
                </button>
                <button onclick="bulkOrderHistory()" class="action-btn">
                    <span>📊</span> Order History
                </button>
            </div>
        </div>
        
        <style>
        .bulk-order-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .bulk-header {
            text-align: center;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .bulk-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .stat-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .stat-card h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
        }
        
        .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #6366f1;
            margin: 5px 0;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0;
        }
        
        .bulk-form {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .bulk-form h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .form-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
        }
        
        .form-group label {
            color: #1f2937;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .form-input {
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-input:focus {
            border-color: #6366f1;
            outline: none;
        }
        
        .submit-btn {
            background: #6366f1;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .submit-btn:hover {
            background: #4f46e5;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .bulk-orders-list {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .bulk-orders-list h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .bulk-order-item {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            transition: all 0.3s ease;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            align-items: center;
        }
        
        .bulk-order-item:hover {
            border-color: #6366f1;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .order-header h4 {
            margin: 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .order-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .order-status.processing {
            background: #fef3c7;
            color: #d97706;
        }
        
        .order-status.confirmed {
            background: #dbeafe;
            color: #1d4ed8;
        }
        
        .order-details p {
            margin: 5px 0;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .order-details strong {
            color: #1f2937;
        }
        
        .order-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .view-btn, .track-btn, .contact-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .view-btn {
            background: #6366f1;
            color: white;
        }
        
        .track-btn {
            background: #10b981;
            color: white;
        }
        
        .contact-btn {
            background: #f59e0b;
            color: white;
        }
        
        .view-btn:hover, .track-btn:hover, .contact-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .bulk-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-btn:first-child {
            background: #6366f1;
            color: white;
        }
        
        .action-btn:nth-child(2) {
            background: #10b981;
            color: white;
        }
        
        .action-btn:last-child {
            background: #f59e0b;
            color: white;
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadUserOrders() {
    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const ordersContainer = document.getElementById('ordersList');
            
            if (data.orders.length === 0) {
                ordersContainer.innerHTML = '<p>No orders yet.</p>';
            } else {
                ordersContainer.innerHTML = data.orders.map(order => `
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <h4>${order.order_type} Order</h4>
                        <p><strong>Order ID:</strong> #${order.id}</p>
                        <p><strong>Total Amount:</strong> $${order.total_amount}</p>
                        <p><strong>Status:</strong> <span style="color: ${order.order_status === 'Delivered' ? '#16a34a' : '#f59e0b'}">${order.order_status}</span></p>
                        <p><strong>Payment:</strong> ${order.payment_status}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
                        ${order.expected_delivery ? `<p><strong>Expected Delivery:</strong> ${new Date(order.expected_delivery).toLocaleDateString()}</p>` : ''}
                        ${order.tracking_number ? `<p><strong>Tracking:</strong> ${order.tracking_number}</p>` : ''}
                    </div>
                `).join('');
            }
        } else {
            document.getElementById('ordersList').innerHTML = '<p>Error loading orders.</p>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersList').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

// --- COMPREHENSIVE PROFILE MODULE ---
async function loadProfile() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <h2>👤 My Profile</h2>
                <p>Manage your personal information and farm details</p>
            </div>
            
            <div class="profile-modules-grid">
                <div class="profile-module-card" onclick="loadPersonalDetails()">
                    <div class="module-icon">👤</div>
                    <h3>Personal Details</h3>
                    <p>Update your personal information and contact details</p>
                    <div class="module-features">
                        <span class="feature-tag">📋 Info</span>
                        <span class="feature-tag">📞 Contact</span>
                    </div>
                </div>
                
                <div class="profile-module-card" onclick="loadFarmDetails()">
                    <div class="module-icon">🌾</div>
                    <h3>Farm Details</h3>
                    <p>Manage your farm information, land size, and crop details</p>
                    <div class="module-features">
                        <span class="feature-tag">📏 Land Size</span>
                        <span class="feature-tag">🌱 Crops</span>
                    </div>
                </div>
                
                <div class="profile-module-card" onclick="loadKycVerification()">
                    <div class="module-icon">✅</div>
                    <h3>KYC Verification</h3>
                    <p>Complete identity verification for government schemes</p>
                    <div class="module-features">
                        <span class="feature-tag">🆔 Identity</span>
                        <span class="feature-tag">📄 Documents</span>
                    </div>
                </div>
                
                <div class="profile-module-card" onclick="loadBankDetails()">
                    <div class="module-icon">🏦</div>
                    <h3>Bank Details</h3>
                    <p>Manage bank accounts for payments and subsidies</p>
                    <div class="module-features">
                        <span class="feature-tag">💰 Payments</span>
                        <span class="feature-tag">🏛️ Subsidies</span>
                    </div>
                </div>
                
                <div class="profile-module-card" onclick="loadActivityHistory()">
                    <div class="module-icon">📊</div>
                    <h3>Activity History</h3>
                    <p>View your farming activities and transaction history</p>
                    <div class="module-features">
                        <span class="feature-tag">📈 Analytics</span>
                        <span class="feature-tag">📅 Timeline</span>
                    </div>
                </div>
                
                <div class="profile-module-card" onclick="loadSavedCrops()">
                    <div class="module-icon">💾</div>
                    <h3>Saved Crops</h3>
                    <p>View your saved crop preferences and templates</p>
                    <div class="module-features">
                        <span class="feature-tag">🌾 Templates</span>
                        <span class="feature-tag">⭐ Favorites</span>
                    </div>
                </div>
                
                <div class="profile-module-card" onclick="loadAchievements()">
                    <div class="module-icon">🏆</div>
                    <h3>Achievements & Rewards</h3>
                    <p>Track your farming achievements and earned rewards</p>
                    <div class="module-features">
                        <span class="feature-tag">🎯 Goals</span>
                        <span class="feature-tag">🎁 Rewards</span>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>⚡ Quick Actions</h3>
                <div class="actions-grid">
                    <button onclick="editProfile()" class="action-btn">
                        <span class="btn-icon">✏️</span>
                        <span class="btn-text">Edit Profile</span>
                    </button>
                    <button onclick="exportProfile()" class="action-btn">
                        <span class="btn-icon">📥</span>
                        <span class="btn-text">Export Data</span>
                    </button>
                    <button onclick="privacySettings()" class="action-btn">
                        <span class="btn-icon">🔒</span>
                        <span class="btn-text">Privacy</span>
                    </button>
                    <button onclick="helpSupport()" class="action-btn">
                        <span class="btn-icon">💬</span>
                        <span class="btn-text">Help & Support</span>
                    </button>
                </div>
            </div>
        </div>
        
        <style>
        .profile-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .profile-header {
            text-align: center;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin-bottom: 40px;
        }
        
        .profile-header h2 {
            margin: 0 0 10px 0;
            font-size: 2.5rem;
        }
        
        .profile-header p {
            margin: 0;
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .profile-modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .profile-module-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
        }
        
        .profile-module-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            border-color: #10b981;
        }
        
        .module-icon {
            font-size: 3.5rem;
            margin-bottom: 20px;
        }
        
        .profile-module-card h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 1.4rem;
        }
        
        .profile-module-card p {
            color: #6b7280;
            margin: 0 0 20px 0;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        .module-features {
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .feature-tag {
            background: #f3f4f6;
            color: #6b7280;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .quick-actions {
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
        }
        
        .quick-actions h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .action-btn {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .action-btn:hover {
            border-color: #10b981;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .btn-icon {
            font-size: 2rem;
        }
        
        .btn-text {
            font-weight: 600;
            color: #1f2937;
            text-align: center;
        }
        </style>
    `;
}

// --- PROFILE SUB-MODULES ---
async function loadPersonalDetails() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="personal-details-container">
            <div class="personal-header">
                <h2>👤 Personal Details</h2>
                <p>Update your personal information and contact details</p>
            </div>
            
            <div class="personal-form">
                <div class="form-section">
                    <h3>📋 Basic Information</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="fullName" placeholder="Enter your full name" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Date of Birth</label>
                            <input type="date" id="dob" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Gender</label>
                            <select id="gender" class="form-select">
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Blood Group</label>
                            <select id="bloodGroup" class="form-select">
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>📞 Contact Information</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Mobile Number</label>
                            <input type="tel" id="mobile" placeholder="+91 9876543210" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Alternative Mobile</label>
                            <input type="tel" id="altMobile" placeholder="+91 9876543211" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" id="email" placeholder="your@email.com" class="form-input" readonly>
                        </div>
                        <div class="form-group">
                            <label>WhatsApp Number</label>
                            <input type="tel" id="whatsapp" placeholder="+91 9876543210" class="form-input">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>🏠 Address Information</h3>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>Street Address</label>
                            <input type="text" id="street" placeholder="Enter street address" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Village/Town</label>
                            <input type="text" id="village" placeholder="Enter village/town" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>District</label>
                            <input type="text" id="district" placeholder="Enter district" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>State</label>
                            <select id="state" class="form-select">
                                <option value="">Select State</option>
                                <option value="andhra-pradesh">Andhra Pradesh</option>
                                <option value="telangana">Telangana</option>
                                <option value="karnataka">Karnataka</option>
                                <option value="tamil-nadu">Tamil Nadu</option>
                                <option value="maharashtra">Maharashtra</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Pin Code</label>
                            <input type="text" id="pincode" placeholder="Enter pin code" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Country</label>
                            <input type="text" id="country" value="India" class="form-input" readonly>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>🆔 Identity Information</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Aadhaar Number</label>
                            <input type="text" id="aadhaar" placeholder="XXXX-XXXX-XXXX" class="form-input" maxlength="14">
                        </div>
                        <div class="form-group">
                            <label>PAN Number</label>
                            <input type="text" id="pan" placeholder="XXXXX0000X" class="form-input" maxlength="10">
                        </div>
                        <div class="form-group">
                            <label>Voter ID</label>
                            <input type="text" id="voterId" placeholder="Enter voter ID" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Driving License</label>
                            <input type="text" id="drivingLicense" placeholder="Enter license number" class="form-input">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="personal-actions">
                <button onclick="savePersonalDetails()" class="save-btn">💾 Save Details</button>
                <button onclick="cancelPersonalEdit()" class="cancel-btn">❌ Cancel</button>
                <button onclick="uploadDocuments()" class="upload-btn">📄 Upload Documents</button>
            </div>
        </div>
        
        <style>
        .personal-details-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .personal-header {
            text-align: center;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .personal-form {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .form-section {
            margin-bottom: 30px;
        }
        
        .form-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        .form-group label {
            color: #1f2937;
            font-weight: 600;
        }
        
        .form-input, .form-select {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .form-input:focus, .form-select:focus {
            border-color: #3b82f6;
            outline: none;
        }
        
        .form-input[readonly] {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .personal-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .save-btn, .cancel-btn, .upload-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #3b82f6;
            color: white;
        }
        
        .cancel-btn {
            background: #6b7280;
            color: white;
        }
        
        .upload-btn {
            background: #10b981;
            color: white;
        }
        
        .save-btn:hover, .cancel-btn:hover, .upload-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadFarmDetails() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="farm-details-container">
            <div class="farm-header">
                <h2>🌾 Farm Details</h2>
                <p>Manage your farm information, land size, and crop details</p>
            </div>
            
            <div class="farm-form">
                <div class="form-section">
                    <h3>🏡 Farm Information</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Farm Name</label>
                            <input type="text" id="farmName" placeholder="Enter farm name" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Farm Type</label>
                            <select id="farmType" class="form-select">
                                <option value="">Select Farm Type</option>
                                <option value="owned">Owned Land</option>
                                <option value="leased">Leased Land</option>
                                <option value="shared">Shared Farming</option>
                                <option value="contract">Contract Farming</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Years of Farming</label>
                            <input type="number" id="farmingYears" placeholder="Enter years" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Farming Method</label>
                            <select id="farmingMethod" class="form-select">
                                <option value="">Select Method</option>
                                <option value="organic">Organic</option>
                                <option value="conventional">Conventional</option>
                                <option value="natural">Natural Farming</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>📏 Land Details</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Total Land Area (Acres)</label>
                            <input type="number" id="totalArea" placeholder="Enter total area" class="form-input" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Cultivated Area (Acres)</label>
                            <input type="number" id="cultivatedArea" placeholder="Enter cultivated area" class="form-input" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Soil Type</label>
                            <select id="soilType" class="form-select">
                                <option value="">Select Soil Type</option>
                                <option value="black-cotton">Black Cotton Soil</option>
                                <option value="red-soil">Red Soil</option>
                                <option value="alluvial">Alluvial Soil</option>
                                <option value="clay">Clay Soil</option>
                                <option value="sandy">Sandy Soil</option>
                                <option value="loamy">Loamy Soil</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Irrigation Source</label>
                            <select id="irrigationSource" class="form-select">
                                <option value="">Select Source</option>
                                <option value="borewell">Borewell</option>
                                <option value="canal">Canal</option>
                                <option value="well">Well</option>
                                <option value="rainfed">Rainfed</option>
                                <option value="drip">Drip Irrigation</option>
                                <option value="sprinkler">Sprinkler</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>🌱 Crop Information</h3>
                    <div class="crops-grid">
                        <div class="crop-item">
                            <label>Primary Crop</label>
                            <select id="primaryCrop" class="form-select">
                                <option value="">Select Crop</option>
                                <option value="paddy">Paddy</option>
                                <option value="wheat">Wheat</option>
                                <option value="cotton">Cotton</option>
                                <option value="sugarcane">Sugarcane</option>
                                <option value="turmeric">Turmeric</option>
                                <option value="chilli">Chilli</option>
                                <option value="tomato">Tomato</option>
                            </select>
                        </div>
                        <div class="crop-item">
                            <label>Secondary Crop</label>
                            <select id="secondaryCrop" class="form-select">
                                <option value="">Select Crop</option>
                                <option value="paddy">Paddy</option>
                                <option value="wheat">Wheat</option>
                                <option value="cotton">Cotton</option>
                                <option value="sugarcane">Sugarcane</option>
                                <option value="turmeric">Turmeric</option>
                                <option value="chilli">Chilli</option>
                                <option value="tomato">Tomato</option>
                            </select>
                        </div>
                        <div class="crop-item">
                            <label>Crop Season</label>
                            <select id="cropSeason" class="form-select">
                                <option value="">Select Season</option>
                                <option value="kharif">Kharif</option>
                                <option value="rabi">Rabi</option>
                                <option value="zaid">Zaid</option>
                                <option value="year-round">Year Round</option>
                            </select>
                        </div>
                        <div class="crop-item">
                            <label>Expected Yield (tons/acre)</label>
                            <input type="number" id="expectedYield" placeholder="Enter expected yield" class="form-input" step="0.01">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>📍 Location Details</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Survey Number</label>
                            <input type="text" id="surveyNumber" placeholder="Enter survey number" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Khata Number</label>
                            <input type="text" id="khataNumber" placeholder="Enter khata number" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>GPS Coordinates</label>
                            <div class="coords-input">
                                <input type="number" id="latitude" placeholder="Latitude" class="form-input" step="0.000001">
                                <input type="number" id="longitude" placeholder="Longitude" class="form-input" step="0.000001">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Nearby Landmark</label>
                            <input type="text" id="landmark" placeholder="Enter nearby landmark" class="form-input">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="farm-actions">
                <button onclick="saveFarmDetails()" class="save-btn">💾 Save Details</button>
                <button onclick="cancelFarmEdit()" class="cancel-btn">❌ Cancel</button>
                <button onclick="uploadFarmDocuments()" class="upload-btn">📄 Upload Documents</button>
                <button onclick="getLocationFromGPS()" class="gps-btn">📍 Get GPS Location</button>
            </div>
        </div>
        
        <style>
        .farm-details-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .farm-header {
            text-align: center;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .farm-form {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .form-section {
            margin-bottom: 30px;
        }
        
        .form-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .crops-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .form-group, .crop-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .form-group label, .crop-item label {
            color: #1f2937;
            font-weight: 600;
        }
        
        .form-input, .form-select {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .form-input:focus, .form-select:focus {
            border-color: #10b981;
            outline: none;
        }
        
        .coords-input {
            display: flex;
            gap: 10px;
        }
        
        .coords-input input {
            flex: 1;
        }
        
        .farm-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .save-btn, .cancel-btn, .upload-btn, .gps-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #10b981;
            color: white;
        }
        
        .cancel-btn {
            background: #6b7280;
            color: white;
        }
        
        .upload-btn {
            background: #3b82f6;
            color: white;
        }
        
        .gps-btn {
            background: #f59e0b;
            color: white;
        }
        
        .save-btn:hover, .cancel-btn:hover, .upload-btn:hover, .gps-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadKycVerification() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="kyc-container">
            <div class="kyc-header">
                <h2>✅ KYC Verification</h2>
                <p>Complete identity verification for government schemes and benefits</p>
            </div>
            
            <div class="kyc-status">
                <div class="status-card ${kycStatus === 'verified' ? 'verified' : kycStatus === 'pending' ? 'pending' : 'not-verified'}">
                    <div class="status-icon">${kycStatus === 'verified' ? '✅' : kycStatus === 'pending' ? '⏳' : '❌'}</div>
                    <div class="status-info">
                        <h3>${kycStatus === 'verified' ? 'KYC Verified' : kycStatus === 'pending' ? 'KYC Pending' : 'KYC Not Verified'}</h3>
                        <p>${kycStatus === 'verified' ? 'Your identity has been verified successfully' : kycStatus === 'pending' ? 'Your verification is under review' : 'Complete verification to access all features'}</p>
                    </div>
                </div>
            </div>
            
            <div class="kyc-form">
                <div class="form-section">
                    <h3>📄 Document Upload</h3>
                    <div class="documents-grid">
                        <div class="document-item">
                            <div class="document-icon">🆔</div>
                            <h4>Aadhaar Card</h4>
                            <p>Upload front and back of your Aadhaar card</p>
                            <div class="upload-area">
                                <input type="file" id="aadhaarFront" accept="image/*" style="display: none;">
                                <button onclick="document.getElementById('aadhaarFront').click()" class="upload-btn-small">📷 Upload Front</button>
                                <input type="file" id="aadhaarBack" accept="image/*" style="display: none;">
                                <button onclick="document.getElementById('aadhaarBack').click()" class="upload-btn-small">📷 Upload Back</button>
                            </div>
                        </div>
                        
                        <div class="document-item">
                            <div class="document-icon">🪪</div>
                            <h4>PAN Card</h4>
                            <p>Upload your PAN card for financial verification</p>
                            <div class="upload-area">
                                <input type="file" id="panCard" accept="image/*" style="display: none;">
                                <button onclick="document.getElementById('panCard').click()" class="upload-btn-small">📷 Upload PAN</button>
                            </div>
                        </div>
                        
                        <div class="document-item">
                            <div class="document-icon">🏛️</div>
                            <h4>Land Records</h4>
                            <p>Upload your land ownership documents</p>
                            <div class="upload-area">
                                <input type="file" id="landRecords" accept="image/*,application/pdf" style="display: none;">
                                <button onclick="document.getElementById('landRecords').click()" class="upload-btn-small">📄 Upload Records</button>
                            </div>
                        </div>
                        
                        <div class="document-item">
                            <div class="document-icon">📸</div>
                            <h4>Passport Photo</h4>
                            <p>Upload a recent passport size photograph</p>
                            <div class="upload-area">
                                <input type="file" id="passportPhoto" accept="image/*" style="display: none;">
                                <button onclick="document.getElementById('passportPhoto').click()" class="upload-btn-small">📷 Upload Photo</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>📝 Verification Details</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Aadhaar Number</label>
                            <input type="text" id="aadhaarNumber" placeholder="XXXX-XXXX-XXXX" class="form-input" maxlength="14">
                        </div>
                        <div class="form-group">
                            <label>PAN Number</label>
                            <input type="text" id="panNumber" placeholder="XXXXX0000X" class="form-input" maxlength="10">
                        </div>
                        <div class="form-group">
                            <label>State of Residence</label>
                            <select id="kycState" class="form-select">
                                <option value="">Select State</option>
                                <option value="andhra-pradesh">Andhra Pradesh</option>
                                <option value="telangana">Telangana</option>
                                <option value="karnataka">Karnataka</option>
                                <option value="tamil-nadu">Tamil Nadu</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>District</label>
                            <input type="text" id="kycDistrict" placeholder="Enter district" class="form-input">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>🔐 Declaration</h3>
                    <div class="declaration-box">
                        <div class="checkbox-item">
                            <input type="checkbox" id="termsAccepted">
                            <label for="termsAccepted">I declare that all information provided is true and correct</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="consentGiven">
                            <label for="consentGiven">I consent to the verification process and terms</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="dataProcessing">
                            <label for="dataProcessing">I agree to data processing for verification purposes</label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="kyc-actions">
                <button onclick="submitKyc()" class="submit-btn">📤 Submit for Verification</button>
                <button onclick="saveKycDraft()" class="save-btn">💾 Save as Draft</button>
                <button onclick="checkKycStatus()" class="status-btn">📊 Check Status</button>
            </div>
        </div>
        
        <style>
        .kyc-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .kyc-header {
            text-align: center;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .kyc-status {
            margin-bottom: 30px;
        }
        
        .status-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .status-card.verified {
            border-left: 5px solid #10b981;
        }
        
        .status-card.pending {
            border-left: 5px solid #f59e0b;
        }
        
        .status-card.not-verified {
            border-left: 5px solid #ef4444;
        }
        
        .status-icon {
            font-size: 3rem;
        }
        
        .status-info h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 1.5rem;
        }
        
        .status-info p {
            margin: 0;
            color: #6b7280;
            font-size: 1rem;
        }
        
        .kyc-form {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .form-section {
            margin-bottom: 30px;
        }
        
        .form-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .documents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .document-item {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .document-item:hover {
            border-color: #8b5cf6;
            transform: translateY(-3px);
        }
        
        .document-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }
        
        .document-item h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 1.2rem;
        }
        
        .document-item p {
            margin: 0 0 15px 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .upload-area {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        
        .upload-btn-small {
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .upload-btn-small:hover {
            background: #7c3aed;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .form-group label {
            color: #1f2937;
            font-weight: 600;
        }
        
        .form-input, .form-select {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .form-input:focus, .form-select:focus {
            border-color: #8b5cf6;
            outline: none;
        }
        
        .declaration-box {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
        }
        
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .checkbox-item input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }
        
        .checkbox-item label {
            color: #1f2937;
            font-weight: 500;
            cursor: pointer;
        }
        
        .kyc-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .submit-btn, .save-btn, .status-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .submit-btn {
            background: #8b5cf6;
            color: white;
        }
        
        .save-btn {
            background: #6b7280;
            color: white;
        }
        
        .status-btn {
            background: #10b981;
            color: white;
        }
        
        .submit-btn:hover, .save-btn:hover, .status-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadBankDetails() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="bank-details-container">
            <div class="bank-header">
                <h2>🏦 Bank Details</h2>
                <p>Manage bank accounts for payments and subsidies</p>
            </div>
            
            <div class="bank-form">
                <div class="form-section">
                    <h3>🏦 Primary Bank Account</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Bank Name</label>
                            <select id="bankName" class="form-select">
                                <option value="">Select Bank</option>
                                <option value="sbi">State Bank of India</option>
                                <option value="hdfc">HDFC Bank</option>
                                <option value="icici">ICICI Bank</option>
                                <option value="axis">Axis Bank</option>
                                <option value="pnb">Punjab National Bank</option>
                                <option value="bob">Bank of Baroda</option>
                                <option value="canara">Canara Bank</option>
                                <option value="union">Union Bank of India</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Account Holder Name</label>
                            <input type="text" id="accountHolder" placeholder="Enter account holder name" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Account Number</label>
                            <input type="text" id="accountNumber" placeholder="Enter account number" class="form-input" maxlength="20">
                        </div>
                        <div class="form-group">
                            <label>IFSC Code</label>
                            <input type="text" id="ifscCode" placeholder="Enter IFSC code" class="form-input" maxlength="11">
                        </div>
                        <div class="form-group">
                            <label>Branch Name</label>
                            <input type="text" id="branchName" placeholder="Enter branch name" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Account Type</label>
                            <select id="accountType" class="form-select">
                                <option value="">Select Type</option>
                                <option value="savings">Savings Account</option>
                                <option value="current">Current Account</option>
                                <option value="joint">Joint Account</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>💳 Payment Methods</h3>
                    <div class="payment-methods">
                        <div class="payment-item">
                            <div class="payment-icon">📱</div>
                            <div class="payment-info">
                                <h4>UPI ID</h4>
                                <p>Link your UPI ID for instant payments</p>
                            </div>
                            <div class="payment-input">
                                <input type="text" id="upiId" placeholder="yourupi@paytm" class="form-input">
                            </div>
                        </div>
                        
                        <div class="payment-item">
                            <div class="payment-icon">💳</div>
                            <div class="payment-info">
                                <h4>Debit Card</h4>
                                <p>Add debit card for online payments</p>
                            </div>
                            <div class="payment-input">
                                <input type="text" id="cardNumber" placeholder="XXXX-XXXX-XXXX-XXXX" class="form-input" maxlength="19">
                            </div>
                        </div>
                        
                        <div class="payment-item">
                            <div class="payment-icon">📞</div>
                            <div class="payment-info">
                                <h4>Registered Mobile</h4>
                                <p>Mobile number linked to bank account</p>
                            </div>
                            <div class="payment-input">
                                <input type="tel" id="registeredMobile" placeholder="+91 9876543210" class="form-input">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>🏛️ Government Subsidy Account</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Subsidy Bank</label>
                            <select id="subsidyBank" class="form-select">
                                <option value="">Select Bank</option>
                                <option value="sbi">State Bank of India</option>
                                <option value="pnb">Punjab National Bank</option>
                                <option value="bob">Bank of Baroda</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Subsidy Account Number</label>
                            <input type="text" id="subsidyAccount" placeholder="Enter subsidy account number" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>PM Kisan Account</label>
                            <select id="pmKisanAccount" class="form-select">
                                <option value="">Select Status</option>
                                <option value="linked">Linked</option>
                                <option value="not-linked">Not Linked</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Aadhaar Linked</label>
                            <select id="aadhaarLinked" class="form-select">
                                <option value="">Select Status</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bank-actions">
                <button onclick="saveBankDetails()" class="save-btn">💾 Save Bank Details</button>
                <button onclick="verifyBankAccount()" class="verify-btn">✅ Verify Account</button>
                <button onclick="addAnotherAccount()" class="add-btn">➕ Add Another Account</button>
                <button onclick="downloadBankStatement()" class="download-btn">📥 Download Statement</button>
            </div>
        </div>
        
        <style>
        .bank-details-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .bank-header {
            text-align: center;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .bank-form {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .form-section {
            margin-bottom: 30px;
        }
        
        .form-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .form-group label {
            color: #1f2937;
            font-weight: 600;
        }
        
        .form-input, .form-select {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .form-input:focus, .form-select:focus {
            border-color: #f59e0b;
            outline: none;
        }
        
        .payment-methods {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .payment-item {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: all 0.3s ease;
        }
        
        .payment-item:hover {
            border-color: #f59e0b;
            transform: translateY(-3px);
        }
        
        .payment-icon {
            font-size: 2rem;
        }
        
        .payment-info {
            flex: 1;
        }
        
        .payment-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .payment-info p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .payment-input {
            min-width: 200px;
        }
        
        .bank-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .save-btn, .verify-btn, .add-btn, .download-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #f59e0b;
            color: white;
        }
        
        .verify-btn {
            background: #10b981;
            color: white;
        }
        
        .add-btn {
            background: #3b82f6;
            color: white;
        }
        
        .download-btn {
            background: #6b7280;
            color: white;
        }
        
        .save-btn:hover, .verify-btn:hover, .add-btn:hover, .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadActivityHistory() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="activity-history-container">
            <div class="history-header">
                <h2>📊 Activity History</h2>
                <p>View your farming activities and transaction history</p>
            </div>
            
            <div class="history-filters">
                <div class="filter-group">
                    <label>Date Range</label>
                    <div class="date-range">
                        <input type="date" id="startDate" class="date-input">
                        <span>to</span>
                        <input type="date" id="endDate" class="date-input">
                    </div>
                </div>
                <div class="filter-group">
                    <label>Activity Type</label>
                    <select id="activityType" class="filter-select">
                        <option value="all">All Activities</option>
                        <option value="farming">Farming Activities</option>
                        <option value="orders">Orders</option>
                        <option value="payments">Payments</option>
                        <option value="schemes">Scheme Applications</option>
                    </select>
                </div>
                <div class="filter-group">
                    <button onclick="applyFilters()" class="filter-btn">🔍 Apply Filters</button>
                    <button onclick="resetFilters()" class="reset-btn">🔄 Reset</button>
                </div>
            </div>
            
            <div class="history-stats">
                <div class="stat-card">
                    <div class="stat-icon">🌾</div>
                    <div class="stat-info">
                        <h4>Total Farming Days</h4>
                        <p class="stat-number">247</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-info">
                        <h4>Total Orders</h4>
                        <p class="stat-number">156</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h4>Total Revenue</h4>
                        <p class="stat-number">₹2,45,000</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-info">
                        <h4>Achievements</h4>
                        <p class="stat-number">12</p>
                    </div>
                </div>
            </div>
            
            <div class="history-timeline">
                <h3>📅 Recent Activities</h3>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-date">
                            <div class="date">Dec 15, 2024</div>
                            <div class="time">10:30 AM</div>
                        </div>
                        <div class="timeline-content">
                            <div class="activity-icon farming">🌾</div>
                            <div class="activity-details">
                                <h4>Planted Paddy Crop</h4>
                                <p>Started planting paddy in 5 acres of land</p>
                                <div class="activity-tags">
                                    <span class="tag">Farming</span>
                                    <span class="tag">Kharif Season</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-date">
                            <div class="date">Dec 14, 2024</div>
                            <div class="time">2:15 PM</div>
                        </div>
                        <div class="timeline-content">
                            <div class="activity-icon order">📦</div>
                            <div class="activity-details">
                                <h4>Order Placed</h4>
                                <p>Ordered organic fertilizers worth ₹5,000</p>
                                <div class="activity-tags">
                                    <span class="tag">Order</span>
                                    <span class="tag">Fertilizers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-date">
                            <div class="date">Dec 13, 2024</div>
                            <div class="time">11:45 AM</div>
                        </div>
                        <div class="timeline-content">
                            <div class="activity-icon payment">💰</div>
                            <div class="activity-details">
                                <h4>Payment Received</h4>
                                <p>Received payment for cotton crop: ₹45,000</p>
                                <div class="activity-tags">
                                    <span class="tag">Payment</span>
                                    <span class="tag">Cotton Sale</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-date">
                            <div class="date">Dec 12, 2024</div>
                            <div class="time">4:20 PM</div>
                        </div>
                        <div class="timeline-content">
                            <div class="activity-icon scheme">🏛️</div>
                            <div class="activity-details">
                                <h4>Scheme Applied</h4>
                                <p>Applied for PM Kisan Samman Nidhi</p>
                                <div class="activity-tags">
                                    <span class="tag">Government Scheme</span>
                                    <span class="tag">Pending</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="history-actions">
                <button onclick="exportHistory()" class="export-btn">📥 Export History</button>
                <button onclick="generateReport()" class="report-btn">📊 Generate Report</button>
                <button onclick="viewMoreHistory()" class="view-btn">👁️ View More</button>
            </div>
        </div>
        
        <style>
        .activity-history-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .history-header {
            text-align: center;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .history-filters {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            display: flex;
            gap: 20px;
            align-items: end;
            flex-wrap: wrap;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .filter-group label {
            color: #1f2937;
            font-weight: 600;
        }
        
        .date-range {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .date-input, .filter-select {
            padding: 8px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .filter-btn, .reset-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .filter-btn {
            background: #6366f1;
            color: white;
        }
        
        .reset-btn {
            background: #6b7280;
            color: white;
        }
        
        .filter-btn:hover, .reset-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .history-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .stat-icon {
            font-size: 2.5rem;
        }
        
        .stat-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1rem;
        }
        
        .stat-number {
            margin: 0;
            color: #6366f1;
            font-size: 1.8rem;
            font-weight: 700;
        }
        
        .history-timeline {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .history-timeline h3 {
            color: #1f2937;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .timeline {
            position: relative;
        }
        
        .timeline::before {
            content: '';
            position: absolute;
            left: 20px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #e5e7eb;
        }
        
        .timeline-item {
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
            position: relative;
        }
        
        .timeline-date {
            min-width: 120px;
            text-align: center;
        }
        
        .date {
            font-weight: 600;
            color: #1f2937;
            font-size: 0.9rem;
        }
        
        .time {
            color: #6b7280;
            font-size: 0.8rem;
        }
        
        .timeline-content {
            flex: 1;
            display: flex;
            gap: 20px;
            align-items: start;
        }
        
        .activity-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
        }
        
        .activity-icon.farming {
            background: #10b981;
        }
        
        .activity-icon.order {
            background: #f59e0b;
        }
        
        .activity-icon.payment {
            background: #6366f1;
        }
        
        .activity-icon.scheme {
            background: #8b5cf6;
        }
        
        .activity-details h4 {
            margin: 0 0 8px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .activity-details p {
            margin: 0 0 10px 0;
            color: #6b7280;
            font-size: 0.95rem;
        }
        
        .activity-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .tag {
            background: #f3f4f6;
            color: #6b7280;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .history-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .export-btn, .report-btn, .view-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .export-btn {
            background: #6366f1;
            color: white;
        }
        
        .report-btn {
            background: #10b981;
            color: white;
        }
        
        .view-btn {
            background: #6b7280;
            color: white;
        }
        
        .export-btn:hover, .report-btn:hover, .view-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadSavedCrops() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="saved-crops-container">
            <div class="crops-header">
                <h2>💾 Saved Crops</h2>
                <p>View your saved crop preferences and templates</p>
            </div>
            
            <div class="crops-tabs">
                <button class="tab-btn active" onclick="showCropTemplates()">🌾 Templates</button>
                <button class="tab-btn" onclick="showFavoriteCrops()">⭐ Favorites</button>
                <button class="tab-btn" onclick="showCropHistory()">📅 History</button>
                <button class="tab-btn" onclick="showCropRecommendations()">💡 Recommendations</button>
            </div>
            
            <div class="crops-content">
                <div class="templates-grid">
                    <div class="template-card">
                        <div class="template-header">
                            <h3>🌾 Paddy Template</h3>
                            <div class="template-actions">
                                <button onclick="useTemplate('paddy')" class="use-btn">🔄 Use</button>
                                <button onclick="editTemplate('paddy')" class="edit-btn">✏️ Edit</button>
                            </div>
                        </div>
                        <div class="template-details">
                            <div class="detail-item">
                                <span class="label">Season:</span>
                                <span class="value">Kharif</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Duration:</span>
                                <span class="value">120 days</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Water Required:</span>
                                <span class="value">High</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Expected Yield:</span>
                                <span class="value">2.5 tons/acre</span>
                            </div>
                        </div>
                        <div class="template-features">
                            <span class="feature-tag">🌱 High Yield</span>
                            <span class="feature-tag">💧 Water Intensive</span>
                            <span class="feature-tag">🌞 Sun Loving</span>
                        </div>
                    </div>
                    
                    <div class="template-card">
                        <div class="template-header">
                            <h3>🌾 Cotton Template</h3>
                            <div class="template-actions">
                                <button onclick="useTemplate('cotton')" class="use-btn">🔄 Use</button>
                                <button onclick="editTemplate('cotton')" class="edit-btn">✏️ Edit</button>
                            </div>
                        </div>
                        <div class="template-details">
                            <div class="detail-item">
                                <span class="label">Season:</span>
                                <span class="value">Kharif</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Duration:</span>
                                <span class="value">160 days</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Water Required:</span>
                                <span class="value">Medium</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Expected Yield:</span>
                                <span class="value">1.8 tons/acre</span>
                            </div>
                        </div>
                        <div class="template-features">
                            <span class="feature-tag">💰 High Value</span>
                            <span class="feature-tag">🌞 Drought Tolerant</span>
                            <span class="feature-tag">🏭 Industrial Crop</span>
                        </div>
                    </div>
                    
                    <div class="template-card">
                        <div class="template-header">
                            <h3>🌾 Turmeric Template</h3>
                            <div class="template-actions">
                                <button onclick="useTemplate('turmeric')" class="use-btn">🔄 Use</button>
                                <button onclick="editTemplate('turmeric')" class="edit-btn">✏️ Edit</button>
                            </div>
                        </div>
                        <div class="template-details">
                            <div class="detail-item">
                                <span class="label">Season:</span>
                                <span class="value">Kharif</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Duration:</span>
                                <span class="value">210 days</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Water Required:</span>
                                <span class="value">Medium</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Expected Yield:</span>
                                <span class="value">1.2 tons/acre</span>
                            </div>
                        </div>
                        <div class="template-features">
                            <span class="feature-tag">💰 Premium Price</span>
                            <span class="feature-tag">🌱 Long Duration</span>
                            <span class="feature-tag">🏥 Medicinal</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="crops-actions">
                <button onclick="createNewTemplate()" class="create-btn">➕ Create Template</button>
                <button onclick="importTemplates()" class="import-btn">📥 Import</button>
                <button onclick="exportTemplates()" class="export-btn">📤 Export</button>
                <button onclick="shareTemplates()" class="share-btn">📤 Share</button>
            </div>
        </div>
        
        <style>
        .saved-crops-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .crops-header {
            text-align: center;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .crops-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .tab-btn {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px 20px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .tab-btn.active {
            background: #10b981;
            color: white;
            border-color: #10b981;
        }
        
        .tab-btn:hover:not(.active) {
            border-color: #10b981;
            transform: translateY(-2px);
        }
        
        .crops-content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
        }
        
        .template-card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 25px;
            transition: all 0.3s ease;
        }
        
        .template-card:hover {
            border-color: #10b981;
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        
        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .template-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 1.3rem;
        }
        
        .template-actions {
            display: flex;
            gap: 8px;
        }
        
        .use-btn, .edit-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .use-btn {
            background: #10b981;
            color: white;
        }
        
        .edit-btn {
            background: #3b82f6;
            color: white;
        }
        
        .use-btn:hover, .edit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .template-details {
            margin-bottom: 20px;
        }
        
        .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .detail-item:last-child {
            border-bottom: none;
        }
        
        .label {
            color: #6b7280;
            font-weight: 500;
        }
        
        .value {
            color: #1f2937;
            font-weight: 600;
        }
        
        .template-features {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .feature-tag {
            background: #f3f4f6;
            color: #6b7280;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .crops-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .create-btn, .import-btn, .export-btn, .share-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .create-btn {
            background: #10b981;
            color: white;
        }
        
        .import-btn {
            background: #3b82f6;
            color: white;
        }
        
        .export-btn {
            background: #6b7280;
            color: white;
        }
        
        .share-btn {
            background: #f59e0b;
            color: white;
        }
        
        .create-btn:hover, .import-btn:hover, .export-btn:hover, .share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadAchievements() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="achievements-container">
            <div class="achievements-header">
                <h2>🏆 Achievements & Rewards</h2>
                <p>Track your farming achievements and earned rewards</p>
            </div>
            
            <div class="achievements-stats">
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-info">
                        <h4>Total Achievements</h4>
                        <p class="stat-number">24</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎁</div>
                    <div class="stat-info">
                        <h4>Rewards Earned</h4>
                        <p class="stat-number">18</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <h4>Farmer Points</h4>
                        <p class="stat-number">2,450</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🥇</div>
                    <div class="stat-info">
                        <h4>Current Rank</h4>
                        <p class="stat-number">Expert</p>
                    </div>
                </div>
            </div>
            
            <div class="achievements-tabs">
                <button class="tab-btn active" onclick="showAllAchievements()">🏆 All</button>
                <button class="tab-btn" onclick="showRecentAchievements()">🆕 Recent</button>
                <button class="tab-btn" onclick="showLockedAchievements()">🔒 Locked</button>
                <button class="tab-btn" onclick="showRewards()">🎁 Rewards</button>
            </div>
            
            <div class="achievements-content">
                <div class="achievements-grid">
                    <div class="achievement-card unlocked">
                        <div class="achievement-icon">🌾</div>
                        <div class="achievement-info">
                            <h4>First Harvest</h4>
                            <p>Successfully harvested your first crop</p>
                            <div class="achievement-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 100%"></div>
                                </div>
                                <span class="progress-text">Completed</span>
                            </div>
                            <div class="achievement-reward">
                                <span class="reward-icon">💎</span>
                                <span class="reward-text">+100 Points</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="achievement-card unlocked">
                        <div class="achievement-icon">💧</div>
                        <div class="achievement-info">
                            <h4>Water Saver</h4>
                            <p>Saved 1000 liters of water through drip irrigation</p>
                            <div class="achievement-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 100%"></div>
                                </div>
                                <span class="progress-text">Completed</span>
                            </div>
                            <div class="achievement-reward">
                                <span class="reward-icon">💎</span>
                                <span class="reward-text">+150 Points</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="achievement-card unlocked">
                        <div class="achievement-icon">🌱</div>
                        <div class="achievement-info">
                            <h4>Organic Farmer</h4>
                            <p>Grew crops using only organic methods for 6 months</p>
                            <div class="achievement-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 100%"></div>
                                </div>
                                <span class="progress-text">Completed</span>
                            </div>
                            <div class="achievement-reward">
                                <span class="reward-icon">💎</span>
                                <span class="reward-text">+200 Points</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="achievement-card progress">
                        <div class="achievement-icon">🏆</div>
                        <div class="achievement-info">
                            <h4>Master Farmer</h4>
                            <p>Complete 50 successful farming cycles</p>
                            <div class="achievement-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 72%"></div>
                                </div>
                                <span class="progress-text">36/50</span>
                            </div>
                            <div class="achievement-reward">
                                <span class="reward-icon">💎</span>
                                <span class="reward-text">+500 Points</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="achievement-card locked">
                        <div class="achievement-icon">🌟</div>
                        <div class="achievement-info">
                            <h4>Legend Farmer</h4>
                            <p>Reach Expert level in all farming categories</p>
                            <div class="achievement-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 0%"></div>
                                </div>
                                <span class="progress-text">Locked</span>
                            </div>
                            <div class="achievement-reward">
                                <span class="reward-icon">💎</span>
                                <span class="reward-text">+1000 Points</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="rewards-section">
                <h3>🎁 Available Rewards</h3>
                <div class="rewards-grid">
                    <div class="reward-card">
                        <div class="reward-icon">🎫</div>
                        <h4>10% Discount Coupon</h4>
                        <p>Get 10% off on your next fertilizer purchase</p>
                        <div class="reward-cost">
                            <span class="points">500 Points</span>
                        </div>
                        <button onclick="claimReward('discount10')" class="claim-btn">Claim</button>
                    </div>
                    
                    <div class="reward-card">
                        <div class="reward-icon">📚</div>
                        <h4>Farming Guide Book</h4>
                        <p>Free access to premium farming guide</p>
                        <div class="reward-cost">
                            <span class="points">750 Points</span>
                        </div>
                        <button onclick="claimReward('guide')" class="claim-btn">Claim</button>
                    </div>
                    
                    <div class="reward-card">
                        <div class="reward-icon">🏷️</div>
                        <h4>Premium Seeds</h4>
                        <p>Get premium quality seeds for next season</p>
                        <div class="reward-cost">
                            <span class="points">1200 Points</span>
                        </div>
                        <button onclick="claimReward('seeds')" class="claim-btn">Claim</button>
                    </div>
                </div>
            </div>
            
            <div class="achievements-actions">
                <button onclick="shareAchievements()" class="share-btn">📤 Share Achievements</button>
                <button onclick="viewLeaderboard()" class="leaderboard-btn">🏆 Leaderboard</button>
                <button onclick="redeemPoints()" class="redeem-btn">💰 Redeem Points</button>
            </div>
        </div>
        
        <style>
        .achievements-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .achievements-header {
            text-align: center;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .achievements-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .stat-icon {
            font-size: 2.5rem;
        }
        
        .stat-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1rem;
        }
        
        .stat-number {
            margin: 0;
            color: #f59e0b;
            font-size: 1.8rem;
            font-weight: 700;
        }
        
        .achievements-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .tab-btn {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px 20px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .tab-btn.active {
            background: #f59e0b;
            color: white;
            border-color: #f59e0b;
        }
        
        .tab-btn:hover:not(.active) {
            border-color: #f59e0b;
            transform: translateY(-2px);
        }
        
        .achievements-content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .achievements-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .achievement-card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        .achievement-card.unlocked {
            border-color: #10b981;
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        }
        
        .achievement-card.progress {
            border-color: #f59e0b;
            background: linear-gradient(135deg, #fffbeb, #fef3c7);
        }
        
        .achievement-card.locked {
            opacity: 0.6;
            filter: grayscale(1);
        }
        
        .achievement-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        
        .achievement-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .achievement-info h4 {
            margin: 0 0 8px 0;
            color: #1f2937;
            font-size: 1.2rem;
        }
        
        .achievement-info p {
            margin: 0 0 15px 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .achievement-progress {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .progress-bar {
            flex: 1;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: #10b981;
            transition: width 0.3s ease;
        }
        
        .progress-text {
            font-size: 0.8rem;
            font-weight: 600;
            color: #6b7280;
        }
        
        .achievement-reward {
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
        }
        
        .reward-icon {
            font-size: 1.2rem;
        }
        
        .reward-text {
            font-weight: 600;
            color: #f59e0b;
        }
        
        .rewards-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .rewards-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .rewards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .reward-card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .reward-card:hover {
            border-color: #f59e0b;
            transform: translateY(-3px);
        }
        
        .reward-card .reward-icon {
            font-size: 2rem;
            margin-bottom: 15px;
        }
        
        .reward-card h4 {
            margin: 0 0 8px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .reward-card p {
            margin: 0 0 15px 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .reward-cost {
            margin-bottom: 15px;
        }
        
        .points {
            background: #fef3c7;
            color: #d97706;
            padding: 4px 12px;
            border-radius: 15px;
            font-weight: 600;
        }
        
        .claim-btn {
            background: #f59e0b;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .claim-btn:hover {
            background: #d97706;
            transform: translateY(-2px);
        }
        
        .achievements-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .share-btn, .leaderboard-btn, .redeem-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .share-btn {
            background: #10b981;
            color: white;
        }
        
        .leaderboard-btn {
            background: #6b7280;
            color: white;
        }
        
        .redeem-btn {
            background: #f59e0b;
            color: white;
        }
        
        .share-btn:hover, .leaderboard-btn:hover, .redeem-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadProfileData() {
    try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const profileContent = document.getElementById('profileContent');
            
            profileContent.innerHTML = `
                <div style="display: grid; gap: 15px;">
                    <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
                        <h4 style="margin: 0 0 10px 0; color: #374151;">📋 Personal Information</h4>
                        <p><strong>Full Name:</strong> ${data.user.full_name}</p>
                        <p><strong>Username:</strong> ${data.user.username}</p>
                        <p><strong>Email:</strong> ${data.user.email}</p>
                    </div>
                    
                    <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
                        <h4 style="margin: 0 0 10px 0; color: #374151;">📞 Contact Information</h4>
                        <p><strong>Phone Number:</strong> ${data.user.phone_number}</p>
                        <p><strong>Farm Location:</strong> ${data.user.farm_location}</p>
                        <p><strong>Address:</strong> ${data.user.address}</p>
                    </div>
                    
                    <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
                        <h4 style="margin: 0 0 10px 0; color: #374151;">📅 Account Information</h4>
                        <p><strong>Member Since:</strong> ${data.user.created_at ? new Date(data.user.created_at).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Last Updated:</strong> ${data.user.updated_at ? new Date(data.user.updated_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    
                    <button onclick="showEditProfileForm()" style="background: #16a34a; color: white; padding: 8px 16px; border: none; border-radius: 6px;">✏️ Edit Profile</button>
                </div>
            `;
            
            // Store user data for editing
            window.currentUserProfile = data.user;
            
        } else {
            document.getElementById('profileContent').innerHTML = '<p>Error loading profile information.</p>';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileContent').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

function showEditProfileForm() {
    const user = window.currentUserProfile;
    if (!user) return;
    
    // Populate form with current data
    document.getElementById('profileFullName').value = user.full_name !== 'Not specified' ? user.full_name : '';
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePhone').value = user.phone_number !== 'Not specified' ? user.phone_number : '';
    document.getElementById('profileFarmLocation').value = user.farm_location !== 'Not specified' ? user.farm_location : '';
    document.getElementById('profileAddress').value = user.address !== 'Not specified' ? user.address : '';
    
    // Show edit form
    document.getElementById('editProfileForm').style.display = 'block';
}

function cancelEditProfile() {
    document.getElementById('editProfileForm').style.display = 'none';
}

async function updateProfile(event) {
    event.preventDefault();
    
    const profileData = {
        full_name: document.getElementById('profileFullName').value || null,
        phone_number: document.getElementById('profilePhone').value || null,
        farm_location: document.getElementById('profileFarmLocation').value || null,
        address: document.getElementById('profileAddress').value || null
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Profile updated successfully!');
            cancelEditProfile();
            await loadProfileData(); // Reload profile data
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Network error. Please try again.');
    }
}

// --- COMPREHENSIVE SETTINGS MODULE ---
async function loadSettings() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="settings-container">
            <div class="settings-header">
                <h2>⚙️ Settings</h2>
                <p>Customize your app experience and manage preferences</p>
            </div>
            
            <div class="settings-modules-grid">
                <div class="settings-module-card" onclick="loadLanguageSelection()">
                    <div class="module-icon">🌐</div>
                    <h3>Language Selection</h3>
                    <p>Choose your preferred language (Telugu, Hindi, English)</p>
                    <div class="module-features">
                        <span class="feature-tag">🗣️ Multi-language</span>
                        <span class="feature-tag">🔄 Auto-translate</span>
                    </div>
                </div>
                
                <div class="settings-module-card" onclick="loadNotificationSettings()">
                    <div class="module-icon">🔔</div>
                    <h3>Notification Settings</h3>
                    <p>Manage push notifications, email alerts, and SMS preferences</p>
                    <div class="module-features">
                        <span class="feature-tag">📱 Push</span>
                        <span class="feature-tag">📧 Email</span>
                    </div>
                </div>
                
                <div class="settings-module-card" onclick="loadPrivacyControls()">
                    <div class="module-icon">🔒</div>
                    <h3>Privacy Controls</h3>
                    <p>Control data sharing, profile visibility, and privacy settings</p>
                    <div class="module-features">
                        <span class="feature-tag">🛡️ Security</span>
                        <span class="feature-tag">👁️ Visibility</span>
                    </div>
                </div>
                
                <div class="settings-module-card" onclick="loadThemeSettings()">
                    <div class="module-icon">🎨</div>
                    <h3>Theme Settings</h3>
                    <p>Switch between light and dark mode themes</p>
                    <div class="module-features">
                        <span class="feature-tag">🌞 Light</span>
                        <span class="feature-tag">🌙 Dark</span>
                    </div>
                </div>
                
                <div class="settings-module-card" onclick="loadLocationSettings()">
                    <div class="module-icon">📍</div>
                    <h3>Location Settings</h3>
                    <p>Set your farm location and manage location-based services</p>
                    <div class="module-features">
                        <span class="feature-tag">🗺️ GPS</span>
                        <span class="feature-tag">📍 Manual</span>
                    </div>
                </div>
                
                <div class="settings-module-card" onclick="loadDataSyncOptions()">
                    <div class="module-icon">🔄</div>
                    <h3>Data Sync Options</h3>
                    <p>Configure automatic data backup and synchronization</p>
                    <div class="module-features">
                        <span class="feature-tag">☁️ Cloud</span>
                        <span class="feature-tag">📱 Mobile</span>
                    </div>
                </div>
                
                <div class="settings-module-card" onclick="loadAppPermissions()">
                    <div class="module-icon">🔐</div>
                    <h3>App Permissions</h3>
                    <p>Manage camera, location, and storage permissions</p>
                    <div class="module-features">
                        <span class="feature-tag">📷 Camera</span>
                        <span class="feature-tag">📍 Location</span>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>⚡ Quick Actions</h3>
                <div class="actions-grid">
                    <button onclick="resetToDefaults()" class="action-btn">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">Reset to Defaults</span>
                    </button>
                    <button onclick="exportSettings()" class="action-btn">
                        <span class="btn-icon">📥</span>
                        <span class="btn-text">Export Settings</span>
                    </button>
                    <button onclick="importSettings()" class="action-btn">
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">Import Settings</span>
                    </button>
                    <button onclick="clearCache()" class="action-btn">
                        <span class="btn-icon">🗑️</span>
                        <span class="btn-text">Clear Cache</span>
                    </button>
                </div>
            </div>
        </div>
        
        <style>
        .settings-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .settings-header {
            text-align: center;
            background: linear-gradient(135deg, #6b7280, #4b5563);
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin-bottom: 40px;
        }
        
        .settings-header h2 {
            margin: 0 0 10px 0;
            font-size: 2.5rem;
        }
        
        .settings-header p {
            margin: 0;
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .settings-modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .settings-module-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
        }
        
        .settings-module-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            border-color: #6b7280;
        }
        
        .module-icon {
            font-size: 3.5rem;
            margin-bottom: 20px;
        }
        
        .settings-module-card h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 1.4rem;
        }
        
        .settings-module-card p {
            color: #6b7280;
            margin: 0 0 20px 0;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        .module-features {
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .feature-tag {
            background: #f3f4f6;
            color: #6b7280;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .quick-actions {
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
        }
        
        .quick-actions h3 {
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .action-btn {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .action-btn:hover {
            border-color: #6b7280;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .btn-icon {
            font-size: 2rem;
        }
        
        .btn-text {
            font-weight: 600;
            color: #1f2937;
            text-align: center;
        }
        </style>
    `;
}

// --- SETTINGS SUB-MODULES ---
async function loadLanguageSelection() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="language-selection-container">
            <div class="language-header">
                <h2>🌐 Language Selection</h2>
                <p>Choose your preferred language for the app interface</p>
            </div>
            
            <div class="language-options">
                <div class="language-card" onclick="selectLanguage('en')">
                    <div class="language-flag">🇺🇸</div>
                    <h3>English</h3>
                    <p>Default language with full feature support</p>
                    <div class="language-status">
                        <span class="status-indicator active">✓ Active</span>
                    </div>
                </div>
                
                <div class="language-card" onclick="selectLanguage('hi')">
                    <div class="language-flag">🇮🇳</div>
                    <h3>हिंदी (Hindi)</h3>
                    <p>हिंदी में पूर्ण ऐप अनुभव</p>
                    <div class="language-status">
                        <span class="status-indicator">Available</span>
                    </div>
                </div>
                
                <div class="language-card" onclick="selectLanguage('te')">
                    <div class="language-flag">🇮🇳</div>
                    <h3>తెలుగు (Telugu)</h3>
                    <p>తెలుగులో పూర్త యాప్ అనుభవం</p>
                    <div class="language-status">
                        <span class="status-indicator">Available</span>
                    </div>
                </div>
                
                <div class="language-card" onclick="selectLanguage('ta')">
                    <div class="language-flag">🇮🇳</div>
                    <h3>தமிழ் (Tamil)</h3>
                    <p>முழுமை பயன்பாட்டை</p>
                    <div class="language-status">
                        <span class="status-indicator">Coming Soon</span>
                    </div>
                </div>
                
                <div class="language-card" onclick="selectLanguage('mr')">
                    <div class="language-flag">🇮🇳</div>
                    <h3>मराठी (Marathi)</h3>
                    <p>मराठीत पूर्ण अॅप अनुभव</p>
                    <div class="language-status">
                        <span class="status-indicator">Coming Soon</span>
                    </div>
                </div>
            </div>
            
            <div class="language-settings">
                <h3>⚙️ Language Settings</h3>
                <div class="settings-grid">
                    <div class="setting-item">
                        <label>Auto-translate Content</label>
                        <select id="autoTranslate" class="setting-input">
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Show Original Text</label>
                        <select id="showOriginal" class="setting-input">
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Voice Assistant Language</label>
                        <select id="voiceLanguage" class="setting-input">
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="te">Telugu</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="language-actions">
                <button onclick="saveLanguageSettings()" class="save-btn">💾 Save Settings</button>
                <button onclick="testLanguage()" class="test-btn">🧪 Test Language</button>
                <button onclick="downloadLanguagePack()" class="download-btn">📥 Download Pack</button>
            </div>
        </div>
        
        <style>
        .language-selection-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .language-header {
            text-align: center;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .language-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .language-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
        }
        
        .language-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            border-color: #3b82f6;
        }
        
        .language-flag {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        
        .language-card h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 1.3rem;
        }
        
        .language-card p {
            color: #6b7280;
            margin: 0 0 15px 0;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .language-status {
            margin-top: 10px;
        }
        
        .status-indicator {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .status-indicator.active {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .status-indicator:not(.active) {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .language-settings {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .language-settings h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .setting-item {
            display: flex;
            flex-direction: column;
        }
        
        .setting-item label {
            color: #1f2937;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .setting-input {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .language-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .save-btn, .test-btn, .download-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #3b82f6;
            color: white;
        }
        
        .test-btn {
            background: #10b981;
            color: white;
        }
        
        .download-btn {
            background: #f59e0b;
            color: white;
        }
        
        .save-btn:hover, .test-btn:hover, .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadNotificationSettings() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="notification-settings-container">
            <div class="notification-header">
                <h2>🔔 Notification Settings</h2>
                <p>Manage how you receive notifications and alerts</p>
            </div>
            
            <div class="notification-categories">
                <div class="notification-section">
                    <h3>📱 Push Notifications</h3>
                    <div class="notification-options">
                        <div class="notification-item">
                            <div class="notification-info">
                                <h4>Order Updates</h4>
                                <p>Get notified about order status changes</p>
                            </div>
                            <div class="notification-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="orderPush" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="notification-item">
                            <div class="notification-info">
                                <h4>Weather Alerts</h4>
                                <p>Daily weather updates and severe weather warnings</p>
                            </div>
                            <div class="notification-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="weatherPush" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="notification-item">
                            <div class="notification-info">
                                <h4>Market Prices</h4>
                                <p>Price changes for your crops and products</p>
                            </div>
                            <div class="notification-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="marketPush">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="notification-section">
                    <h3>📧 Email Notifications</h3>
                    <div class="notification-options">
                        <div class="notification-item">
                            <div class="notification-info">
                                <h4>Order Confirmations</h4>
                                <p>Email receipts and order confirmations</p>
                            </div>
                            <div class="notification-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="orderEmail" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="notification-item">
                            <div class="notification-info">
                                <h4>Weekly Reports</h4>
                                <p>Weekly summary of farming activities</p>
                            </div>
                            <div class="notification-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="weeklyEmail" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="notification-item">
                            <div class="notification-info">
                                <h4>Promotional Offers</h4>
                                <p>Special deals and discount notifications</p>
                            </div>
                            <div class="notification-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="promoEmail">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="notification-section">
                    <h3>📱 SMS Notifications</h3>
                    <div class="notification-options">
                        <div class="notification-item">
                            <div class="notification-info">
                                <h4>Critical Alerts</h4>
                                <p>Urgent notifications about your farm</p>
                            </div>
                            <div class="notification-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="criticalSms" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="notification-item">
                            <div class="notification-info">
                                <h4>Delivery Updates</h4>
                                <p>SMS updates for order deliveries</p>
                            </div>
                            <div class="notification-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="deliverySms" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="notification-schedule">
                <h3>⏰ Notification Schedule</h3>
                <div class="schedule-options">
                    <div class="schedule-item">
                        <label>Quiet Hours</label>
                        <div class="time-range">
                            <input type="time" id="quietStart" value="22:00" class="time-input">
                            <span>to</span>
                            <input type="time" id="quietEnd" value="07:00" class="time-input">
                        </div>
                    </div>
                    <div class="schedule-item">
                        <label>Daily Summary Time</label>
                        <input type="time" id="summaryTime" value="18:00" class="time-input">
                    </div>
                    <div class="schedule-item">
                        <label>Frequency</label>
                        <select id="notificationFreq" class="freq-input">
                            <option value="realtime">Real-time</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="notification-actions">
                <button onclick="saveNotificationSettings()" class="save-btn">💾 Save Settings</button>
                <button onclick="testNotifications()" class="test-btn">🧪 Test Notifications</button>
                <button onclick="viewNotificationHistory()" class="history-btn">📊 View History</button>
            </div>
        </div>
        
        <style>
        .notification-settings-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .notification-header {
            text-align: center;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .notification-categories {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .notification-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .notification-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .notification-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .notification-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .notification-info p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .notification-toggle {
            position: relative;
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #10b981;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        .notification-schedule {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .notification-schedule h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .schedule-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .schedule-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .schedule-item label {
            color: #1f2937;
            font-weight: 600;
        }
        
        .time-range {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .time-input, .freq-input {
            padding: 8px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .notification-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .save-btn, .test-btn, .history-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #10b981;
            color: white;
        }
        
        .test-btn {
            background: #3b82f6;
            color: white;
        }
        
        .history-btn {
            background: #f59e0b;
            color: white;
        }
        
        .save-btn:hover, .test-btn:hover, .history-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadPrivacyControls() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="privacy-controls-container">
            <div class="privacy-header">
                <h2>🔒 Privacy Controls</h2>
                <p>Manage your data sharing and privacy preferences</p>
            </div>
            
            <div class="privacy-sections">
                <div class="privacy-section">
                    <h3>👤 Profile Privacy</h3>
                    <div class="privacy-options">
                        <div class="privacy-item">
                            <div class="privacy-info">
                                <h4>Profile Visibility</h4>
                                <p>Control who can see your profile information</p>
                            </div>
                            <select id="profileVisibility" class="privacy-select">
                                <option value="public">Public</option>
                                <option value="farmers">Farmers Only</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        
                        <div class="privacy-item">
                            <div class="privacy-info">
                                <h4>Show Contact Information</h4>
                                <p>Display phone number and email to other users</p>
                            </div>
                            <div class="privacy-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="showContact">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="privacy-item">
                            <div class="privacy-info">
                                <h4>Show Farm Location</h4>
                                <p>Display your farm location on maps</p>
                            </div>
                            <div class="privacy-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="showLocation">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="privacy-section">
                    <h3>📊 Data Sharing</h3>
                    <div class="privacy-options">
                        <div class="privacy-item">
                            <div class="privacy-info">
                                <h4>Share Farm Data</h4>
                                <p>Share crop yields and farming data for research</p>
                            </div>
                            <div class="privacy-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="shareFarmData">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="privacy-item">
                            <div class="privacy-info">
                                <h4>Analytics Data</h4>
                                <p>Help improve app with usage analytics</p>
                            </div>
                            <div class="privacy-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="analyticsData" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="privacy-item">
                            <div class="privacy-info">
                                <h4>Marketing Communications</h4>
                                <p>Receive promotional offers and updates</p>
                            </div>
                            <div class="privacy-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="marketingComms">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="privacy-section">
                    <h3>🛡️ Security Settings</h3>
                    <div class="privacy-options">
                        <div class="privacy-item">
                            <div class="privacy-info">
                                <h4>Two-Factor Authentication</h4>
                                <p>Add extra security to your account</p>
                            </div>
                            <div class="privacy-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="twoFactorAuth">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="privacy-item">
                            <div class="privacy-info">
                                <h4>Login Alerts</h4>
                                <p>Get notified when someone logs into your account</p>
                            </div>
                            <div class="privacy-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="loginAlerts" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="privacy-item">
                            <div class="privacy-info">
                                <h4>Session Management</h4>
                                <p>Manage active sessions across devices</p>
                            </div>
                            <button onclick="manageSessions()" class="session-btn">Manage Sessions</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="privacy-actions">
                <button onclick="savePrivacySettings()" class="save-btn">💾 Save Settings</button>
                <button onclick="downloadMyData()" class="download-btn">📥 Download My Data</button>
                <button onclick="deleteMyAccount()" class="delete-btn">🗑️ Delete Account</button>
            </div>
        </div>
        
        <style>
        .privacy-controls-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .privacy-header {
            text-align: center;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .privacy-sections {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .privacy-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .privacy-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .privacy-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .privacy-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .privacy-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .privacy-info p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .privacy-select {
            padding: 8px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .privacy-toggle {
            position: relative;
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #ef4444;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        .session-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .session-btn:hover {
            background: #2563eb;
        }
        
        .privacy-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .save-btn, .download-btn, .delete-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #ef4444;
            color: white;
        }
        
        .download-btn {
            background: #3b82f6;
            color: white;
        }
        
        .delete-btn {
            background: #6b7280;
            color: white;
        }
        
        .save-btn:hover, .download-btn:hover, .delete-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadThemeSettings() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="theme-settings-container">
            <div class="theme-header">
                <h2>🎨 Theme Settings</h2>
                <p>Customize the appearance of your app</p>
            </div>
            
            <div class="theme-options">
                <div class="theme-section">
                    <h3>🌞 Light Theme</h3>
                    <div class="theme-preview light-theme">
                        <div class="preview-header">Header</div>
                        <div class="preview-content">
                            <div class="preview-card">Card</div>
                            <div class="preview-text">Sample text content</div>
                        </div>
                    </div>
                    <button onclick="selectTheme('light')" class="theme-btn light">Select Light Theme</button>
                </div>
                
                <div class="theme-section">
                    <h3>🌙 Dark Theme</h3>
                    <div class="theme-preview dark-theme">
                        <div class="preview-header">Header</div>
                        <div class="preview-content">
                            <div class="preview-card">Card</div>
                            <div class="preview-text">Sample text content</div>
                        </div>
                    </div>
                    <button onclick="selectTheme('dark')" class="theme-btn dark">Select Dark Theme</button>
                </div>
                
                <div class="theme-section">
                    <h3>🌅 Auto Theme</h3>
                    <div class="theme-preview auto-theme">
                        <div class="preview-header">Auto</div>
                        <div class="preview-content">
                            <div class="preview-card">Adaptive</div>
                            <div class="preview-text">Follows system settings</div>
                        </div>
                    </div>
                    <button onclick="selectTheme('auto')" class="theme-btn auto">Select Auto Theme</button>
                </div>
            </div>
            
            <div class="theme-customization">
                <h3>⚙️ Customization Options</h3>
                <div class="customization-grid">
                    <div class="custom-item">
                        <label>Accent Color</label>
                        <input type="color" id="accentColor" value="#10b981" class="color-input">
                    </div>
                    <div class="custom-item">
                        <label>Font Size</label>
                        <select id="fontSize" class="custom-select">
                            <option value="small">Small</option>
                            <option value="medium" selected>Medium</option>
                            <option value="large">Large</option>
                            <option value="extra-large">Extra Large</option>
                        </select>
                    </div>
                    <div class="custom-item">
                        <label>Font Family</label>
                        <select id="fontFamily" class="custom-select">
                            <option value="system">System Default</option>
                            <option value="arial">Arial</option>
                            <option value="verdana">Verdana</option>
                            <option value="georgia">Georgia</option>
                        </select>
                    </div>
                    <div class="custom-item">
                        <label>Border Radius</label>
                        <select id="borderRadius" class="custom-select">
                            <option value="sharp">Sharp</option>
                            <option value="rounded" selected>Rounded</option>
                            <option value="very-rounded">Very Rounded</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="theme-actions">
                <button onclick="saveThemeSettings()" class="save-btn">💾 Save Theme</button>
                <button onclick="resetTheme()" class="reset-btn">🔄 Reset to Default</button>
                <button onclick="previewTheme()" class="preview-btn">👁️ Preview Changes</button>
            </div>
        </div>
        
        <style>
        .theme-settings-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .theme-header {
            text-align: center;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .theme-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .theme-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .theme-section:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .theme-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .theme-preview {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            min-height: 120px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .light-theme {
            background: #ffffff;
            color: #1f2937;
        }
        
        .dark-theme {
            background: #1f2937;
            color: #f9fafb;
        }
        
        .auto-theme {
            background: linear-gradient(135deg, #ffffff, #1f2937);
            color: #374151;
        }
        
        .preview-header {
            padding: 8px;
            border-radius: 4px;
            font-weight: 600;
            text-align: center;
        }
        
        .light-theme .preview-header {
            background: #f3f4f6;
            color: #1f2937;
        }
        
        .dark-theme .preview-header {
            background: #374151;
            color: #f9fafb;
        }
        
        .auto-theme .preview-header {
            background: #9ca3af;
            color: #1f2937;
        }
        
        .preview-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .preview-card {
            padding: 8px;
            border-radius: 4px;
            text-align: center;
        }
        
        .light-theme .preview-card {
            background: #e5e7eb;
            color: #1f2937;
        }
        
        .dark-theme .preview-card {
            background: #374151;
            color: #f9fafb;
        }
        
        .auto-theme .preview-card {
            background: #d1d5db;
            color: #1f2937;
        }
        
        .theme-btn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .theme-btn.light {
            background: #f59e0b;
            color: white;
        }
        
        .theme-btn.dark {
            background: #1f2937;
            color: white;
        }
        
        .theme-btn.auto {
            background: linear-gradient(135deg, #f59e0b, #1f2937);
            color: white;
        }
        
        .theme-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .theme-customization {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .theme-customization h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .customization-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .custom-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .custom-item label {
            color: #1f2937;
            font-weight: 600;
        }
        
        .color-input, .custom-select {
            padding: 8px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .theme-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .save-btn, .reset-btn, .preview-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #8b5cf6;
            color: white;
        }
        
        .reset-btn {
            background: #6b7280;
            color: white;
        }
        
        .preview-btn {
            background: #10b981;
            color: white;
        }
        
        .save-btn:hover, .reset-btn:hover, .preview-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadLocationSettings() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="location-settings-container">
            <div class="location-header">
                <h2>📍 Location Settings</h2>
                <p>Set your farm location and manage location-based services</p>
            </div>
            
            <div class="location-sections">
                <div class="location-section">
                    <h3>🗺️ Farm Location</h3>
                    <div class="location-inputs">
                        <div class="location-item">
                            <label>Farm Name</label>
                            <input type="text" id="farmName" placeholder="Enter your farm name" class="location-input">
                        </div>
                        <div class="location-item">
                            <label>Address</label>
                            <input type="text" id="farmAddress" placeholder="Enter farm address" class="location-input">
                        </div>
                        <div class="location-item">
                            <label>Village/Town</label>
                            <input type="text" id="farmVillage" placeholder="Enter village/town" class="location-input">
                        </div>
                        <div class="location-item">
                            <label>District</label>
                            <input type="text" id="farmDistrict" placeholder="Enter district" class="location-input">
                        </div>
                        <div class="location-item">
                            <label>State</label>
                            <select id="farmState" class="location-select">
                                <option value="">Select State</option>
                                <option value="andhra-pradesh">Andhra Pradesh</option>
                                <option value="telangana">Telangana</option>
                                <option value="karnataka">Karnataka</option>
                                <option value="tamil-nadu">Tamil Nadu</option>
                                <option value="maharashtra">Maharashtra</option>
                                <option value="uttar-pradesh">Uttar Pradesh</option>
                                <option value="punjab">Punjab</option>
                                <option value="gujarat">Gujarat</option>
                                <option value="rajasthan">Rajasthan</option>
                            </select>
                        </div>
                        <div class="location-item">
                            <label>Pin Code</label>
                            <input type="text" id="farmPincode" placeholder="Enter pin code" class="location-input">
                        </div>
                    </div>
                </div>
                
                <div class="location-section">
                    <h3>📡 GPS Coordinates</h3>
                    <div class="gps-options">
                        <div class="gps-item">
                            <div class="gps-info">
                                <h4>Current Location</h4>
                                <p>Use device GPS to get current location</p>
                            </div>
                            <button onclick="getCurrentLocation()" class="gps-btn">📍 Get Location</button>
                        </div>
                        
                        <div class="gps-item">
                            <div class="gps-info">
                                <h4>Manual Entry</h4>
                                <p>Enter coordinates manually</p>
                            </div>
                            <div class="manual-coords">
                                <input type="number" id="latitude" placeholder="Latitude" class="coord-input" step="0.000001">
                                <input type="number" id="longitude" placeholder="Longitude" class="coord-input" step="0.000001">
                            </div>
                        </div>
                        
                        <div class="gps-item">
                            <div class="gps-info">
                                <h4>Location Accuracy</h4>
                                <p>Current GPS accuracy</p>
                            </div>
                            <div class="accuracy-display">
                                <span class="accuracy-value">±5 meters</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="location-section">
                    <h3>🌾 Location-Based Services</h3>
                    <div class="location-services">
                        <div class="service-item">
                            <div class="service-info">
                                <h4>Weather Updates</h4>
                                <p>Get weather for your farm location</p>
                            </div>
                            <div class="service-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="weatherLocation" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="service-item">
                            <div class="service-info">
                                <h4>Market Prices</h4>
                                <p>Show local market prices</p>
                            </div>
                            <div class="service-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="marketLocation" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="service-item">
                            <div class="service-info">
                                <h4>Nearby Services</h4>
                                <p>Find nearby suppliers and services</p>
                            </div>
                            <div class="service-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="nearbyServices" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="location-map">
                <h3>🗺️ Farm Location Map</h3>
                <div class="map-container">
                    <div class="map-placeholder">
                        <span class="map-icon">🗺️</span>
                        <p>Interactive map will appear here</p>
                        <p>Click "Get Location" to show your farm on map</p>
                    </div>
                </div>
            </div>
            
            <div class="location-actions">
                <button onclick="saveLocationSettings()" class="save-btn">💾 Save Location</button>
                <button onclick="testLocationServices()" class="test-btn">🧪 Test Services</button>
                <button onclick="shareLocation()" class="share-btn">📤 Share Location</button>
            </div>
        </div>
        
        <style>
        .location-settings-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .location-header {
            text-align: center;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .location-sections {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .location-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .location-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .location-inputs {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .location-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .location-item label {
            color: #1f2937;
            font-weight: 600;
        }
        
        .location-input, .location-select {
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .location-input:focus, .location-select:focus {
            border-color: #06b6d4;
            outline: none;
        }
        
        .gps-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .gps-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .gps-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .gps-info p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .gps-btn {
            background: #06b6d4;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .gps-btn:hover {
            background: #0891b2;
        }
        
        .manual-coords {
            display: flex;
            gap: 10px;
        }
        
        .coord-input {
            padding: 8px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.9rem;
            width: 120px;
        }
        
        .accuracy-display {
            padding: 8px 12px;
            background: #dcfce7;
            color: #16a34a;
            border-radius: 6px;
            font-weight: 600;
        }
        
        .location-services {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .service-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .service-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .service-info p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .service-toggle {
            position: relative;
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #06b6d4;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        .location-map {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .location-map h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .map-container {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            min-height: 200px;
        }
        
        .map-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .map-icon {
            font-size: 3rem;
        }
        
        .map-placeholder p {
            margin: 0;
            color: #6b7280;
        }
        
        .location-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .save-btn, .test-btn, .share-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #06b6d4;
            color: white;
        }
        
        .test-btn {
            background: #10b981;
            color: white;
        }
        
        .share-btn {
            background: #f59e0b;
            color: white;
        }
        
        .save-btn:hover, .test-btn:hover, .share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadDataSyncOptions() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="data-sync-container">
            <div class="sync-header">
                <h2>🔄 Data Sync Options</h2>
                <p>Configure automatic data backup and synchronization</p>
            </div>
            
            <div class="sync-sections">
                <div class="sync-section">
                    <h3>☁️ Cloud Backup</h3>
                    <div class="sync-options">
                        <div class="sync-item">
                            <div class="sync-info">
                                <h4>Auto Backup</h4>
                                <p>Automatically backup data to cloud</p>
                            </div>
                            <div class="sync-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="autoBackup" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="sync-item">
                            <div class="sync-info">
                                <h4>Backup Frequency</h4>
                                <p>How often to backup data</p>
                            </div>
                            <select id="backupFrequency" class="sync-select">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        
                        <div class="sync-item">
                            <div class="sync-info">
                                <h4>Storage Used</h4>
                                <p>Cloud storage usage</p>
                            </div>
                            <div class="storage-usage">
                                <div class="usage-bar">
                                    <div class="usage-fill" style="width: 35%"></div>
                                </div>
                                <span class="usage-text">3.5 GB / 10 GB</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="sync-section">
                    <h3>📱 Device Sync</h3>
                    <div class="sync-options">
                        <div class="sync-item">
                            <div class="sync-info">
                                <h4>Cross-Device Sync</h4>
                                <p>Sync data across all devices</p>
                            </div>
                            <div class="sync-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="crossDeviceSync" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="sync-item">
                            <div class="sync-info">
                                <h4>Sync Over WiFi Only</h4>
                                <p>Save mobile data by syncing only on WiFi</p>
                            </div>
                            <div class="sync-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="wifiOnlySync" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="sync-item">
                            <div class="sync-info">
                                <h4>Connected Devices</h4>
                                <p>Manage devices with access</p>
                            </div>
                            <button onclick="manageDevices()" class="device-btn">Manage Devices</button>
                        </div>
                    </div>
                </div>
                
                <div class="sync-section">
                    <h3>📊 Data Types</h3>
                    <div class="sync-options">
                        <div class="sync-item">
                            <div class="sync-info">
                                <h4>Farm Data</h4>
                                <p>Crop records, yields, soil data</p>
                            </div>
                            <div class="sync-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="farmDataSync" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="sync-item">
                            <div class="sync-info">
                                <h4>Financial Data</h4>
                                <p>Orders, payments, transactions</p>
                            </div>
                            <div class="sync-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="financialDataSync" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="sync-item">
                            <div class="sync-info">
                                <h4>Photos & Documents</h4>
                                <p>Farm photos, documents, receipts</p>
                            </div>
                            <div class="sync-toggle">
                                <label class="switch">
                                    <input type="checkbox" id="mediaSync">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="sync-status">
                <h3>📈 Sync Status</h3>
                <div class="status-grid">
                    <div class="status-item">
                        <div class="status-icon success">✓</div>
                        <div class="status-info">
                            <h4>Last Sync</h4>
                            <p>2 hours ago</p>
                        </div>
                    </div>
                    
                    <div class="status-item">
                        <div class="status-icon pending">⏳</div>
                        <div class="status-info">
                            <h4>Next Sync</h4>
                            <p>In 22 hours</p>
                        </div>
                    </div>
                    
                    <div class="status-item">
                        <div class="status-icon success">✓</div>
                        <div class="status-info">
                            <h4>Sync Health</h4>
                            <p>Good</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="sync-actions">
                <button onclick="saveSyncSettings()" class="save-btn">💾 Save Settings</button>
                <button onclick="manualSync()" class="sync-btn">🔄 Sync Now</button>
                <button onclick="viewSyncHistory()" class="history-btn">📊 Sync History</button>
            </div>
        </div>
        
        <style>
        .data-sync-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .sync-header {
            text-align: center;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .sync-sections {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .sync-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .sync-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .sync-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .sync-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .sync-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1.1rem;
        }
        
        .sync-info p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .sync-toggle {
            position: relative;
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #6366f1;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        .sync-select {
            padding: 8px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .storage-usage {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .usage-bar {
            width: 150px;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .usage-fill {
            height: 100%;
            background: #6366f1;
            transition: width 0.3s ease;
        }
        
        .usage-text {
            font-size: 0.8rem;
            color: #6b7280;
        }
        
        .device-btn {
            background: #6366f1;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .device-btn:hover {
            background: #4f46e5;
        }
        
        .sync-status {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .sync-status h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .status-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .status-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.2rem;
        }
        
        .status-icon.success {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .status-icon.pending {
            background: #fef3c7;
            color: #d97706;
        }
        
        .status-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1rem;
        }
        
        .status-info p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .sync-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .save-btn, .sync-btn, .history-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .save-btn {
            background: #6366f1;
            color: white;
        }
        
        .sync-btn {
            background: #10b981;
            color: white;
        }
        
        .history-btn {
            background: #f59e0b;
            color: white;
        }
        
        .save-btn:hover, .sync-btn:hover, .history-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadAppPermissions() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="permissions-container">
            <div class="permissions-header">
                <h2>🔐 App Permissions</h2>
                <p>Manage camera, location, and storage permissions</p>
            </div>
            
            <div class="permissions-grid">
                <div class="permission-card">
                    <div class="permission-icon">📷</div>
                    <h3>Camera Access</h3>
                    <p>Allow app to access camera for crop photos and disease detection</p>
                    <div class="permission-status">
                        <span class="status-badge granted">✓ Granted</span>
                    </div>
                    <div class="permission-details">
                        <p><strong>Used for:</strong> Crop photos, disease detection, farm documentation</p>
                        <p><strong>Last accessed:</strong> 2 days ago</p>
                    </div>
                    <div class="permission-actions">
                        <button onclick="manageCameraPermission()" class="manage-btn">Manage</button>
                        <button onclick="revokeCameraPermission()" class="revoke-btn">Revoke</button>
                    </div>
                </div>
                
                <div class="permission-card">
                    <div class="permission-icon">📍</div>
                    <h3>Location Access</h3>
                    <p>Allow app to access your location for weather and local services</p>
                    <div class="permission-status">
                        <span class="status-badge granted">✓ Granted</span>
                    </div>
                    <div class="permission-details">
                        <p><strong>Used for:</strong> Weather updates, nearby services, farm mapping</p>
                        <p><strong>Accuracy:</strong> ±5 meters</p>
                    </div>
                    <div class="permission-actions">
                        <button onclick="manageLocationPermission()" class="manage-btn">Manage</button>
                        <button onclick="revokeLocationPermission()" class="revoke-btn">Revoke</button>
                    </div>
                </div>
                
                <div class="permission-card">
                    <div class="permission-icon">💾</div>
                    <h3>Storage Access</h3>
                    <p>Allow app to store photos, documents, and data</p>
                    <div class="permission-status">
                        <span class="status-badge granted">✓ Granted</span>
                    </div>
                    <div class="permission-details">
                        <p><strong>Storage used:</strong> 2.3 GB</p>
                        <p><strong>Available:</strong> 11.7 GB</p>
                    </div>
                    <div class="permission-actions">
                        <button onclick="manageStoragePermission()" class="manage-btn">Manage</button>
                        <button onclick="clearStorage()" class="clear-btn">Clear Storage</button>
                    </div>
                </div>
                
                <div class="permission-card">
                    <div class="permission-icon">📞</div>
                    <h3>Phone/Messages</h3>
                    <p>Allow app to make calls and send messages for support</p>
                    <div class="permission-status">
                        <span class="status-badge denied">✗ Denied</span>
                    </div>
                    <div class="permission-details">
                        <p><strong>Required for:</strong> Emergency support, order updates</p>
                        <p><strong>Alternative:</strong> In-app messaging available</p>
                    </div>
                    <div class="permission-actions">
                        <button onclick="grantPhonePermission()" class="grant-btn">Grant</button>
                        <button onclick="learnMorePhone()" class="learn-btn">Learn More</button>
                    </div>
                </div>
                
                <div class="permission-card">
                    <div class="permission-icon">🎤</div>
                    <h3>Microphone Access</h3>
                    <p>Allow app to access microphone for voice commands</p>
                    <div class="permission-status">
                        <span class="status-badge granted">✓ Granted</span>
                    </div>
                    <div class="permission-details">
                        <p><strong>Used for:</strong> Voice commands, voice notes</p>
                        <p><strong>Last used:</strong> 1 week ago</p>
                    </div>
                    <div class="permission-actions">
                        <button onclick="manageMicrophonePermission()" class="manage-btn">Manage</button>
                        <button onclick="revokeMicrophonePermission()" class="revoke-btn">Revoke</button>
                    </div>
                </div>
                
                <div class="permission-card">
                    <div class="permission-icon">🔔</div>
                    <h3>Notifications</h3>
                    <p>Allow app to send notifications and alerts</p>
                    <div class="permission-status">
                        <span class="status-badge granted">✓ Granted</span>
                    </div>
                    <div class="permission-details">
                        <p><strong>Types:</strong> Order updates, weather alerts, reminders</p>
                        <p><strong>Quiet hours:</strong> 10 PM - 7 AM</p>
                    </div>
                    <div class="permission-actions">
                        <button onclick="manageNotificationPermission()" class="manage-btn">Manage</button>
                        <button onclick="testNotification()" class="test-btn">Test</button>
                    </div>
                </div>
            </div>
            
            <div class="permissions-summary">
                <h3>📊 Permissions Summary</h3>
                <div class="summary-stats">
                    <div class="stat-item">
                        <div class="stat-icon granted">✓</div>
                        <div class="stat-info">
                            <h4>Granted</h4>
                            <p>5 permissions</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon denied">✗</div>
                        <div class="stat-info">
                            <h4>Denied</h4>
                            <p>1 permission</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon partial">⚠️</div>
                        <div class="stat-info">
                            <h4>Partial</h4>
                            <p>0 permissions</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="permissions-actions">
                <button onclick="reviewAllPermissions()" class="review-btn">🔍 Review All</button>
                <button onclick="resetPermissions()" class="reset-btn">🔄 Reset to Default</button>
                <button onclick="exportPermissions()" class="export-btn">📥 Export Report</button>
            </div>
        </div>
        
        <style>
        .permissions-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .permissions-header {
            text-align: center;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .permissions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .permission-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .permission-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .permission-icon {
            font-size: 3rem;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .permission-card h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 1.3rem;
            text-align: center;
        }
        
        .permission-card p {
            color: #6b7280;
            margin: 0 0 15px 0;
            font-size: 0.9rem;
            line-height: 1.4;
            text-align: center;
        }
        
        .permission-status {
            text-align: center;
            margin-bottom: 15px;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .status-badge.granted {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .status-badge.denied {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .permission-details {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        .permission-details p {
            margin: 5px 0;
            color: #4b5563;
            font-size: 0.85rem;
        }
        
        .permission-details strong {
            color: #1f2937;
        }
        
        .permission-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        
        .manage-btn, .revoke-btn, .grant-btn, .clear-btn, .learn-btn, .test-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .manage-btn {
            background: #3b82f6;
            color: white;
        }
        
        .revoke-btn {
            background: #ef4444;
            color: white;
        }
        
        .grant-btn {
            background: #10b981;
            color: white;
        }
        
        .clear-btn {
            background: #f59e0b;
            color: white;
        }
        
        .learn-btn {
            background: #6b7280;
            color: white;
        }
        
        .test-btn {
            background: #8b5cf6;
            color: white;
        }
        
        .manage-btn:hover, .revoke-btn:hover, .grant-btn:hover, .clear-btn:hover, .learn-btn:hover, .test-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .permissions-summary {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .permissions-summary h3 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.2rem;
        }
        
        .stat-icon.granted {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .stat-icon.denied {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .stat-icon.partial {
            background: #fef3c7;
            color: #d97706;
        }
        
        .stat-info h4 {
            margin: 0 0 5px 0;
            color: #1f2937;
            font-size: 1rem;
        }
        
        .stat-info p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .permissions-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .review-btn, .reset-btn, .export-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .review-btn {
            background: #f59e0b;
            color: white;
        }
        
        .reset-btn {
            background: #6b7280;
            color: white;
        }
        
        .export-btn {
            background: #3b82f6;
            color: white;
        }
        
        .review-btn:hover, .reset-btn:hover, .export-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        </style>
    `;
}

async function loadUserSettings() {
    try {
        const response = await fetch('http://localhost:5000/api/settings', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const settings = data.settings;
            
            document.getElementById('settingsForm').innerHTML = `
                <form onsubmit="updateSettings(event)">
                    <div style="margin: 15px 0;">
                        <label>
                            <input type="checkbox" id="notificationEmail" ${settings.notification_email ? 'checked' : ''}>
                            Email Notifications
                        </label>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>
                            <input type="checkbox" id="notificationSms" ${settings.notification_sms ? 'checked' : ''}>
                            SMS Notifications
                        </label>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>
                            Language:
                            <select id="language" style="margin-left: 10px; padding: 4px;">
                                <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                                <option value="hi" ${settings.language === 'hi' ? 'selected' : ''}>Hindi</option>
                            </select>
                        </label>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>
                            Currency:
                            <select id="currency" style="margin-left: 10px; padding: 4px;">
                                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                                <option value="INR" ${settings.currency === 'INR' ? 'selected' : ''}>INR (₹)</option>
                            </select>
                        </label>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>
                            Measurement:
                            <select id="measurementUnit" style="margin-left: 10px; padding: 4px;">
                                <option value="metric" ${settings.measurement_unit === 'metric' ? 'selected' : ''}>Metric</option>
                                <option value="imperial" ${settings.measurement_unit === 'imperial' ? 'selected' : ''}>Imperial</option>
                            </select>
                        </label>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>
                            Theme:
                            <select id="theme" style="margin-left: 10px; padding: 4px;">
                                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            </select>
                        </label>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>
                            <input type="checkbox" id="autoRefreshData" ${settings.auto_refresh_data ? 'checked' : ''}>
                            Auto-refresh Data
                        </label>
                    </div>
                    <button type="submit" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 6px;">Save Settings</button>
                </form>
            `;
        } else {
            document.getElementById('settingsForm').innerHTML = '<p>Error loading settings.</p>';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        document.getElementById('settingsForm').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

async function updateSettings(event) {
    event.preventDefault();
    
    const settingsData = {
        notification_email: document.getElementById('notificationEmail').checked,
        notification_sms: document.getElementById('notificationSms').checked,
        language: document.getElementById('language').value,
        currency: document.getElementById('currency').value,
        measurement_unit: document.getElementById('measurementUnit').value,
        theme: document.getElementById('theme').value,
        auto_refresh_data: document.getElementById('autoRefreshData').checked
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settingsData),
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Settings updated successfully!');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to update settings');
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        alert('Network error. Please try again.');
    }
}

