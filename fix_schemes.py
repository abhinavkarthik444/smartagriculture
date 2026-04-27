import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='Abhinav_444',
        database='smart_agriculture'
    )
    
    if connection.is_connected():
        print('Connected to database, fixing schemes table...')
        
        cursor = connection.cursor()
        
        # Check if scheme_type column exists
        cursor.execute("SHOW COLUMNS FROM government_schemes LIKE 'scheme_type'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE government_schemes ADD COLUMN scheme_type ENUM('state', 'central') NOT NULL DEFAULT 'state'")
            connection.commit()
            print('Added scheme_type column')
        
        # Update existing schemes
        cursor.execute("UPDATE government_schemes SET scheme_type = 'central' WHERE id IN (1, 2, 3, 4, 5)")
        cursor.execute("UPDATE government_schemes SET scheme_type = 'state' WHERE id IN (6, 7, 8, 9, 10)")
        connection.commit()
        print('Updated existing schemes')
        
        # Add new schemes
        new_schemes = [
            ('Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)', 'Central scheme for enhancing water use efficiency in agriculture', 'All farmers with land holdings', 'Per drop more crop, financial assistance for micro irrigation', 'Apply online through PMKSY portal', '2024-12-31', '1800-180-1555', 'pmksy.gov.in', 'central'),
            ('National Food Security Mission (NFSM)', 'Central mission to increase production of rice, wheat, pulses', 'All farmers', 'Financial assistance for seeds, fertilizers, machinery', 'Apply through state agriculture department', '2024-11-30', '011-23063121', 'nfsm.gov.in', 'central'),
            ('Soil Health Card Scheme', 'Central scheme for soil testing and health management', 'All farmers', 'Free soil testing, fertilizer recommendations', 'Visit nearest soil testing center', '2024-12-15', '1800-180-1555', 'soilhealth.gov.in', 'central'),
            ('Maharashtra Farm Loan Waiver Scheme', 'State scheme for agricultural loan waiver', 'Farmers in Maharashtra with crop loans', 'Complete loan waiver up to ₹2 lakh', 'Apply through bank with required documents', '2024-10-31', '022-22013245', 'maharashtra.gov.in/agri', 'state'),
            ('Punjab Agriculture Diversification Scheme', 'State scheme for crop diversification', 'Farmers in Punjab', 'Financial assistance for alternative crops', 'Submit application to agriculture department', '2024-11-30', '0172-2743456', 'punjab.gov.in/agri', 'state'),
            ('Uttar Pradesh Krishi Rin Mafi Yojana', 'State loan waiver scheme for farmers', 'Small and marginal farmers in UP', 'Loan waiver up to ₹1 lakh', 'Apply through designated banks', '2024-12-20', '0522-2234567', 'up.gov.in/agri', 'state'),
            ('Madhya Pradesh Bhavantar Bhugtan Yojana', 'State scheme for price deficiency payment', 'Farmers in MP', 'Price difference compensation for crops', 'Register on MP Agriculture portal', '2024-11-15', '0755-2767890', 'mp.gov.in/agri', 'state'),
            ('Karnataka Raitha Siri Scheme', 'State scheme for income support to farmers', 'Farmers in Karnataka', 'Direct income support of ₹10,000 per hectare', 'Apply through Raitha Samparka Kendra', '2024-12-10', '080-22254321', 'karnataka.gov.in/agri', 'state'),
            ('Tamil Nadu Free Power Scheme', 'State scheme for free electricity to farmers', 'All farmers in Tamil Nadu', 'Free electricity for agricultural pumps', 'Apply through TNEB office', '2024-12-31', '044-28543210', 'tn.gov.in/agri', 'state'),
            ('Gujarat Sardar Patel Krishi Samman Yojana', 'State scheme for farmer welfare', 'Farmers in Gujarat', 'Financial assistance for agricultural inputs', 'Apply through e-Krishi portal', '2024-11-25', '079-23245678', 'gujarat.gov.in/agri', 'state')
        ]
        
        for scheme in new_schemes:
            cursor.execute('''
                INSERT IGNORE INTO government_schemes 
                (scheme_name, description, eligibility_criteria, benefits, application_process, deadline, contact_info, website, scheme_type, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ''', scheme)
        
        connection.commit()
        cursor.close()
        connection.close()
        print('Schemes database updated successfully!')
        
except Error as e:
    print(f'Database error: {e}')
