import webbrowser
import time

def test_community_ui():
    """Test the community UI with debugging"""
    
    # Create a simple test HTML to verify the community section
    test_html = """
<!DOCTYPE html>
<html>
<head>
    <title>Community Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
        button { padding: 10px 20px; margin: 5px; border: none; border-radius: 6px; cursor: pointer; }
        .active { background: #2563eb; color: white; }
        .inactive { background: #6b7280; color: white; }
        #debug { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Community Section Test</h1>
    
    <div id="debug">
        <h3>Debug Info:</h3>
        <p id="debugText">Loading...</p>
    </div>
    
    <div class="card">
        <h3>Community Navigation</h3>
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <button onclick="showSection('forum')" id="forumBtn" class="active">📝 Forum</button>
            <button onclick="showSection('groups')" id="groupsBtn" class="inactive">👥 Groups</button>
            <button onclick="showSection('members')" id="membersBtn" class="inactive">👤 Members</button>
            <button onclick="showSection('profile')" id="profileBtn" class="inactive">⚙️ My Profile</button>
        </div>
        <div id="communityContent">
            <p>Forum content will appear here...</p>
        </div>
    </div>
    
    <div class="card">
        <h3>API Test Results:</h3>
        <div id="apiResults">
            <p>Testing API connections...</p>
        </div>
    </div>

    <script>
        function updateDebug(message) {
            document.getElementById('debugText').innerHTML += '<br>' + message;
        }
        
        function showSection(section) {
            updateDebug('Clicked section: ' + section);
            
            // Update button styles
            const buttons = {
                'forum': document.getElementById('forumBtn'),
                'groups': document.getElementById('groupsBtn'),
                'members': document.getElementById('membersBtn'),
                'profile': document.getElementById('profileBtn')
            };
            
            Object.keys(buttons).forEach(key => {
                if (buttons[key]) {
                    buttons[key].className = key === section ? 'active' : 'inactive';
                }
            });
            
            // Update content
            const contentDiv = document.getElementById('communityContent');
            
            switch(section) {
                case 'forum':
                    contentDiv.innerHTML = '<h3>📝 Forum</h3><p>This is the forum section. Posts and discussions appear here.</p>';
                    break;
                case 'groups':
                    contentDiv.innerHTML = '<h3>👥 Groups</h3><p>This is the groups section. Farmer groups and chat appear here.</p>';
                    break;
                case 'members':
                    contentDiv.innerHTML = '<h3>👤 Members</h3><p>This is the members section. Community members appear here.</p>';
                    break;
                case 'profile':
                    contentDiv.innerHTML = '<h3>⚙️ My Profile</h3><p>This is your profile section. Edit your community profile here.</p>';
                    break;
            }
        }
        
        // Test API connections
        async function testAPIs() {
            const results = document.getElementById('apiResults');
            results.innerHTML = '<p>Testing API connections...</p>';
            
            try {
                const response = await fetch('http://localhost:5000/api/health');
                const data = await response.json();
                results.innerHTML += '<p>✅ Health Check: ' + data.status + '</p>';
            } catch (e) {
                results.innerHTML += '<p>❌ Health Check Failed: ' + e.message + '</p>';
            }
            
            try {
                const response = await fetch('http://localhost:5000/api/community/groups');
                const data = await response.json();
                results.innerHTML += '<p>✅ Groups API: ' + data.groups.length + ' groups found</p>';
            } catch (e) {
                results.innerHTML += '<p>❌ Groups API Failed: ' + e.message + '</p>';
            }
            
            try {
                const response = await fetch('http://localhost:5000/api/community/members');
                const data = await response.json();
                results.innerHTML += '<p>✅ Members API: ' + data.members.length + ' members found</p>';
            } catch (e) {
                results.innerHTML += '<p>❌ Members API Failed: ' + e.message + '</p>';
            }
        }
        
        // Initialize
        window.onload = function() {
            updateDebug('Community test page loaded');
            testAPIs();
        };
    </script>
</body>
</html>
    """
    
    # Write test HTML file
    with open('community_test.html', 'w') as f:
        f.write(test_html)
    
    # Open in browser
    file_path = "file:///c:/Users/ABHINAV KARTHIK PC/OneDrive/Desktop/smart/Smart-agri-main/community_test.html"
    webbrowser.open(file_path)
    
    print("Community test page opened in browser!")
    print("This will help us debug the community section.")
    print("Please check:")
    print("1. Are the navigation buttons visible?")
    print("2. Do the buttons change color when clicked?")
    print("3. Does the content change when clicking buttons?")
    print("4. Are the API tests successful?")

if __name__ == "__main__":
    test_community_ui()
