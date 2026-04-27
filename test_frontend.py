import webbrowser
import time

def test_frontend():
    """Open the frontend in browser"""
    print("Opening Smart Agriculture Portal in browser...")
    print("Please test the following:")
    print("1. Login with username: admin, password: admin123")
    print("2. Click on 'Community' in the sidebar")
    print("3. Try clicking on the different tabs: Forum, Groups, Members, My Profile")
    print("4. Test creating a group and joining it")
    print("5. Test opening group chat")
    
    # Open the HTML file
    file_path = "file:///c:/Users/ABHINAV KARTHIK PC/OneDrive/Desktop/smart/Smart-agri-main/index.html"
    webbrowser.open(file_path)
    
    print("\nFrontend opened in browser!")
    print("The Flask backend is running on http://localhost:5000")
    print("All community features should now be working.")

if __name__ == "__main__":
    test_frontend()
