-- Update government schemes table to add scheme_type
USE smart_agriculture;

-- Add scheme_type column if it doesn't exist
ALTER TABLE government_schemes 
ADD COLUMN IF NOT EXISTS scheme_type ENUM('state', 'central') NOT NULL DEFAULT 'state';

-- Update existing schemes to have proper scheme_type
UPDATE government_schemes SET scheme_type = 'central' WHERE id IN (1, 2, 3, 4, 5);
UPDATE government_schemes SET scheme_type = 'state' WHERE id IN (6, 7, 8, 9, 10);

-- Add more sample schemes for both state and central
INSERT IGNORE INTO government_schemes (
    scheme_name, description, eligibility, benefits, application_deadline, 
    contact_info, website, scheme_type, created_at
) VALUES
-- Central Government Schemes
('Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)', 'Central scheme for enhancing water use efficiency in agriculture', 'All farmers with land holdings', 'Per drop more crop, financial assistance for micro irrigation', '2024-12-31', '1800-180-1555', 'pmksy.gov.in', 'central', NOW()),
('National Food Security Mission (NFSM)', 'Central mission to increase production of rice, wheat, pulses', 'All farmers', 'Financial assistance for seeds, fertilizers, machinery', '2024-11-30', '011-23063121', 'nfsm.gov.in', 'central', NOW()),
('Soil Health Card Scheme', 'Central scheme for soil testing and health management', 'All farmers', 'Free soil testing, fertilizer recommendations', '2024-12-15', '1800-180-1555', 'soilhealth.gov.in', 'central', NOW()),

-- State Government Schemes  
('Maharashtra Farm Loan Waiver Scheme', 'State scheme for agricultural loan waiver', 'Farmers in Maharashtra with crop loans', 'Complete loan waiver up to ₹2 lakh', '2024-10-31', '022-22013245', 'maharashtra.gov.in/agri', 'state', NOW()),
('Punjab Agriculture Diversification Scheme', 'State scheme for crop diversification', 'Farmers in Punjab', 'Financial assistance for alternative crops', '2024-11-30', '0172-2743456', 'punjab.gov.in/agri', 'state', NOW()),
('Uttar Pradesh Krishi Rin Mafi Yojana', 'State loan waiver scheme for farmers', 'Small and marginal farmers in UP', 'Loan waiver up to ₹1 lakh', '2024-12-20', '0522-2234567', 'up.gov.in/agri', 'state', NOW()),
('Madhya Pradesh Bhavantar Bhugtan Yojana', 'State scheme for price deficiency payment', 'Farmers in MP', 'Price difference compensation for crops', '2024-11-15', '0755-2767890', 'mp.gov.in/agri', 'state', NOW()),
('Karnataka Raitha Siri Scheme', 'State scheme for income support to farmers', 'Farmers in Karnataka', 'Direct income support of ₹10,000 per hectare', '2024-12-10', '080-22254321', 'karnataka.gov.in/agri', 'state', NOW()),
('Tamil Nadu Free Power Scheme', 'State scheme for free electricity to farmers', 'All farmers in Tamil Nadu', 'Free electricity for agricultural pumps', '2024-12-31', '044-28543210', 'tn.gov.in/agri', 'state', NOW()),
('Gujarat Sardar Patel Krishi Samman Yojana', 'State scheme for farmer welfare', 'Farmers in Gujarat', 'Financial assistance for agricultural inputs', '2024-11-25', '079-23245678', 'gujarat.gov.in/agri', 'state', NOW());
