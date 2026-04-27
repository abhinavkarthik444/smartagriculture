import mysql.connector
from mysql.connector import Error

def add_sample_community_posts():
    """Add sample community posts for demonstration"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Abhinav_444',
            database='smart_agriculture'
        )
        
        if connection.is_connected():
            print("Connected to database, adding sample community posts...")
            
            cursor = connection.cursor()
            
            # Sample posts with realistic farming content
            sample_posts = [
                {
                    'user_id': 1,  # admin user
                    'title': 'Best practices for wheat cultivation this season',
                    'content': 'I wanted to share some tips for growing wheat that have worked well for me this season:\n\n1. Plant 2-3 inches deep in well-drained soil\n2. Use crop rotation to maintain soil health\n3. Apply nitrogen fertilizer at the right growth stages\n4. Monitor for aphids and rust diseases regularly\n\nWhat techniques have worked for you all? Let\'s share our experiences!',
                    'category': 'Crop Management'
                },
                {
                    'user_id': 2,  # farmer user
                    'title': 'New drip irrigation system installation - amazing results!',
                    'content': 'Just installed a new drip irrigation system on my 5-acre farm and the results are amazing! Water usage is down by 40% and crop yield is up by 25%. \n\nKey benefits I\'ve noticed:\n- Precise water delivery to roots\n- Reduced weed growth\n- Better nutrient absorption\n- Lower labor costs\n\nThe initial investment was high but it\'s paying off quickly. Anyone else using drip irrigation?',
                    'category': 'Equipment'
                },
                {
                    'user_id': 1,
                    'title': 'Organic pest control methods that actually work',
                    'content': 'After years of chemical pesticides, I switched to organic methods and want to share what\'s working:\n\n🌿 Neem oil spray for aphids and mites\n🐞 Ladybugs for natural pest control\n🌼 Marigold borders to repel nematodes\n🧄 Garlic spray for fungal infections\n\nIt takes more patience but the soil health improvement is worth it. What organic methods do you recommend?',
                    'category': 'Organic Farming'
                },
                {
                    'user_id': 2,
                    'title': 'Government subsidy for solar water pumps - Apply now!',
                    'content': 'Great news fellow farmers! The government just announced a 50% subsidy for solar water pumps. I applied last month and got approved within 2 weeks.\n\nBenefits:\n- Zero electricity bills for water pumping\n- Environmentally friendly\n- Low maintenance\n- 25-year warranty on most systems\n\nTotal cost for my farm: ₹80,000\nSubsidy amount: ₹40,000\nFinal cost: Only ₹40,000!\n\nContact your local agricultural office for applications. Deadline is December 31st.',
                    'category': 'General'
                },
                {
                    'user_id': 1,
                    'title': 'Tomato prices soaring - Time to plant more!',
                    'content': 'Market analysis shows tomato prices have increased by 35% this month due to supply chain issues. This might be a great opportunity for farmers to expand tomato cultivation.\n\nCurrent market rates:\n- Delhi: ₹60-80 per kg\n- Mumbai: ₹55-75 per kg\n- Bangalore: ₹50-70 per kg\n\nI\'m planning to plant an additional 2 acres. What\'s your experience with tomato farming? Any particular varieties that give good yields?',
                    'category': 'Market'
                },
                {
                    'user_id': 2,
                    'title': 'Soil testing results - Need advice on improving pH levels',
                    'content': 'Just got my soil test results back and my pH is 5.2 (too acidic). The lab recommends:\n\n- Add lime: 2-3 tons per acre\n- Use organic compost regularly\n- Plant acid-tolerant crops temporarily\n\nHas anyone dealt with acidic soil? How long did it take to see improvement? What crops grow well in pH 5.2 while I\'m working to improve it?',
                    'category': 'Crop Management'
                }
            ]
            
            # Insert sample posts
            for post in sample_posts:
                cursor.execute("""
                    INSERT INTO community_posts (user_id, title, content, category)
                    VALUES (%s, %s, %s, %s)
                """, (post['user_id'], post['title'], post['content'], post['category']))
            
            # Add some sample replies
            sample_replies = [
                (1, 1, 'Great tips! I especially agree with crop rotation. It has made a huge difference in my soil health over the past 3 years.'),
                (2, 1, 'Thanks for sharing! What wheat variety are you using? I\'m looking for recommendations for my region.'),
                (1, 2, 'That\'s fantastic! Can you share which brand of drip irrigation you went with? I\'m researching options.'),
                (2, 3, 'Neem oil has been a game changer for me too! Have you tried using chili-garlic spray as well? Works great for caterpillars.'),
                (1, 4, 'Thanks for the heads up! I\'m applying this week. Do we need any specific documents for the application?'),
                (2, 5, 'I grow hybrid tomatoes - they give excellent yields but need more care. Heirloom varieties taste better but yield less.'),
                (1, 6, 'I had similar pH issues. It took about 6 months to see improvement after adding lime. Be patient!')
            ]
            
            for reply in sample_replies:
                cursor.execute("""
                    INSERT INTO community_replies (post_id, user_id, content)
                    VALUES (%s, %s, %s)
                """, reply)
            
            # Update reply counts
            cursor.execute("""
                UPDATE community_posts p 
                SET replies_count = (
                    SELECT COUNT(*) FROM community_replies r 
                    WHERE r.post_id = p.id
                )
            """)
            
            connection.commit()
            cursor.close()
            connection.close()
            print("Sample community posts and replies added successfully!")
            
    except Error as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    add_sample_community_posts()
