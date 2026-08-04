-- =============================================================================
-- VIGYA PAURUSH MILESTONE PVT LTD (VPM REAL ESTATE)
-- Hostinger MySQL / MariaDB Complete Database Schema & Seed Data
-- Standard Encoding: UTF-8 (utf8mb4_unicode_ci)
-- Optimized for phpMyAdmin, MySQL Workbench, and MariaDB CLI
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `vpm_realestate` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vpm_realestate`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. USERS & ROLES TABLE
-- Stores Admins, Customers, Agents, Investors, and Staff Accounts
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `role` ENUM('admin', 'buyer', 'agent', 'investor') NOT NULL DEFAULT 'buyer',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `agent_id` VARCHAR(50) NULL DEFAULT NULL,
  `referral_code` VARCHAR(50) NULL DEFAULT NULL,
  `kyc_done` TINYINT(1) NOT NULL DEFAULT 0,
  `address` TEXT NULL DEFAULT NULL,
  `joined_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_commissions_earned` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_plots_booked` INT NOT NULL DEFAULT 0,
  `total_invested` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. PROJECTS TABLE
-- Stores Real Estate Townships & Commercial Layout Projects
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `tagline` VARCHAR(255) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `image` VARCHAR(500) NULL DEFAULT NULL,
  `total_plots` INT NOT NULL DEFAULT 0,
  `available_plots` INT NOT NULL DEFAULT 0,
  `price_range` VARCHAR(100) NULL DEFAULT NULL,
  `min_price_per_sqft` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `rera_number` VARCHAR(100) NULL DEFAULT NULL,
  `map_embed_url` TEXT NULL DEFAULT NULL,
  `latitude` DECIMAL(10,8) NULL DEFAULT NULL,
  `longitude` DECIMAL(11,8) NULL DEFAULT NULL,
  `brochure_url` VARCHAR(500) NULL DEFAULT NULL,
  `features_json` JSON NULL DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. PLOTS INVENTORY TABLE
-- Individual Plots Grid per Project
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `plots`;
CREATE TABLE `plots` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `plot_no` VARCHAR(50) NOT NULL,
  `size_sqft` DECIMAL(10,2) NOT NULL,
  `dimensions` VARCHAR(50) NOT NULL,
  `rate_per_sqft` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(15,2) NOT NULL,
  `facing` ENUM('North', 'East', 'West', 'South', 'Corner') NOT NULL DEFAULT 'East',
  `status` ENUM('available', 'booked', 'investor_locked', 'sold') NOT NULL DEFAULT 'available',
  `category` ENUM('Residential', 'Commercial', 'Corner Premium') NOT NULL DEFAULT 'Residential',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_project_plot` (`project_id`, `plot_no`),
  CONSTRAINT `fk_plots_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. BOOKINGS TABLE
-- Customer Plot Bookings and Installment Contracts
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `project_name` VARCHAR(150) NOT NULL,
  `plot_no` VARCHAR(50) NOT NULL,
  `plot_size_sqft` DECIMAL(10,2) NOT NULL,
  `rate_per_sqft` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(15,2) NOT NULL,
  `booking_amount_paid` DECIMAL(15,2) NOT NULL,
  `payment_method` VARCHAR(100) NOT NULL,
  `payment_id` VARCHAR(100) NULL DEFAULT NULL,
  `order_id` VARCHAR(100) NULL DEFAULT NULL,
  `booking_date` DATE NOT NULL,
  `status` ENUM('Pending Verification', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  `installment_plan` VARCHAR(100) NOT NULL DEFAULT '12 Months EMI',
  `agent_id` VARCHAR(50) NULL DEFAULT NULL,
  `agent_name` VARCHAR(100) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer_phone` (`customer_phone`),
  KEY `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. RAZORPAY PAYMENTS TABLE
-- Real-time Transactions, Razorpay Order IDs, Signatures, and Verification
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `order_id` VARCHAR(100) NOT NULL,
  `payment_id` VARCHAR(100) NULL DEFAULT NULL,
  `signature` VARCHAR(255) NULL DEFAULT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `status` ENUM('created', 'paid', 'failed', 'refunded', 'pending') NOT NULL DEFAULT 'created',
  `payment_type` ENUM('Booking', 'EMI', 'Subscription', 'Advance', 'Partial', 'One-Time') NOT NULL DEFAULT 'Booking',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'UPI',
  `purpose` TEXT NOT NULL,
  `receipt` VARCHAR(100) NOT NULL,
  `notes_json` JSON NULL DEFAULT NULL,
  `failure_reason` TEXT NULL DEFAULT NULL,
  `date_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_order_id` (`order_id`),
  KEY `idx_payment_id` (`payment_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. INVESTMENTS TABLE
-- High ROI Land Investment Records & Payout Tracking
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `investment_records`;
CREATE TABLE `investment_records` (
  `id` VARCHAR(50) NOT NULL,
  `investor_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `rate_per_sqft` DECIMAL(10,2) NOT NULL,
  `roi_percentage` DECIMAL(5,2) NOT NULL,
  `sqft_invested` DECIMAL(10,2) NOT NULL,
  `total_invested_amount` DECIMAL(15,2) NOT NULL,
  `base_plot_cost` DECIMAL(15,2) NOT NULL,
  `estimated_roi_payout` DECIMAL(15,2) NOT NULL,
  `investment_date` DATE NOT NULL,
  `status` ENUM('Active', 'Matured', 'Paid') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_investor_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. AGENT MLM NETWORK TABLE
-- Agent Hierarchies, Commissions, and Referrals
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `agent_network`;
CREATE TABLE `agent_network` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Agent',
  `phone` VARCHAR(20) NOT NULL,
  `total_sales` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `commission_earned` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `joined_date` DATE NOT NULL,
  `sponsor_id` VARCHAR(50) NOT NULL DEFAULT 'ROOT',
  `downline_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sponsor` (`sponsor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. LEADS & INQUIRIES TABLE
-- Site Visit Requests & Customer Inquiries
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `leads`;
CREATE TABLE `leads` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) NULL DEFAULT NULL,
  `interest` VARCHAR(150) NOT NULL,
  `message` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lead_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. FINANCIAL TRANSACTIONS TABLE
-- Inflow / Outflow / Cash Flow Accounting Ledger
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `financial_transactions`;
CREATE TABLE `financial_transactions` (
  `id` VARCHAR(50) NOT NULL,
  `transaction_type` ENUM('Income', 'Expense') NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `payment_mode` VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer',
  `reference_no` VARCHAR(100) NULL DEFAULT NULL,
  `party_name` VARCHAR(100) NULL DEFAULT NULL,
  `party_phone` VARCHAR(20) NULL DEFAULT NULL,
  `date` DATE NOT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `created_by` VARCHAR(100) NOT NULL DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type_date` (`transaction_type`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. COMMUNITY MEDIA GALLERY TABLE
-- Plot Holder, Investor, Event, and Video Testimonial Media
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `gallery_media`;
CREATE TABLE `gallery_media` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `user_role` VARCHAR(50) NOT NULL DEFAULT 'customer',
  `user_avatar` VARCHAR(500) NULL DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `media_type` ENUM('photo', 'video', 'audio', 'document') NOT NULL DEFAULT 'photo',
  `media_url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500) NULL DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `location` VARCHAR(100) NOT NULL,
  `project_id` VARCHAR(50) NULL DEFAULT NULL,
  `project_name` VARCHAR(150) NULL DEFAULT NULL,
  `upload_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'approved',
  `views` INT NOT NULL DEFAULT 0,
  `likes` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. SECURITY AUDIT LOGS TABLE
-- HMAC Signatures, Gateway Handshakes, and Administrative Actions
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(50) NULL DEFAULT '127.0.0.1',
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- SEED INITIAL DATA FOR QUICK DEPLOYMENT
-- =============================================================================

-- Seed Admin & Default Users
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `role`, `is_verified`, `kyc_done`, `address`) VALUES
('USR-ADMIN-101', 'Admin Director', 'admin@vigyapaurush.com', '9876543210', 'admin', 1, 1, 'Head Office, Ayodhya Highway, Lucknow'),
('USR-GUEST-102', 'Rajesh Sharma', 'rajesh@example.com', '9876543211', 'buyer', 1, 1, 'Gomti Nagar, Lucknow'),
('USR-AGENT-103', 'Sunil Kumar Agent', 'sunil@vpm.com', '9876543212', 'agent', 1, 1, 'Faizabad Road, Ayodhya');

-- Seed Real Estate Projects
INSERT INTO `projects` (`id`, `name`, `location`, `address`, `city`, `tagline`, `description`, `image`, `total_plots`, `available_plots`, `price_range`, `min_price_per_sqft`, `rera_number`, `is_featured`) VALUES
('PRJ-01', 'Greenfield Heights Township', 'Near Airport Highway', 'Sultanpur Road, Near International Airport Outer Ring Road', 'Lucknow', 'Lush Green Residential Plots with 100ft Roads', 'Premium Gated Community with Underground Electricity, Park, Club House & 24/7 Security.', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', 120, 85, '₹12.5 Lac - ₹45 Lac', 1250.00, 'UPRERAPRJ123456', 1),
('PRJ-02', 'Ayodhya Divine Residency', 'Near Ram Mandir Corridor', 'Faizabad-Ayodhya Highway, Near Bypass Junction', 'Ayodhya', 'Holy Corridor Residential & Resort Plots', 'Exclusive plotting township 15 mins from Ram Mandir with high appreciation potential.', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', 80, 42, '₹18 Lac - ₹60 Lac', 1450.00, 'UPRERAPRJ654321', 1);

-- Seed Sample Plots
INSERT INTO `plots` (`project_id`, `plot_no`, `size_sqft`, `dimensions`, `rate_per_sqft`, `total_price`, `facing`, `status`, `category`) VALUES
('PRJ-01', 'A-101', 1000.00, '25 x 40 ft', 1250.00, 1250000.00, 'East', 'available', 'Residential'),
('PRJ-01', 'A-102', 1200.00, '30 x 40 ft', 1250.00, 1500000.00, 'North', 'booked', 'Residential'),
('PRJ-02', 'B-201', 1500.00, '30 x 50 ft', 1450.00, 2175000.00, 'Corner', 'available', 'Corner Premium');

-- Seed Sample Razorpay Transaction
INSERT INTO `payments` (`id`, `user_id`, `name`, `mobile`, `email`, `order_id`, `payment_id`, `signature`, `amount`, `status`, `payment_type`, `payment_method`, `purpose`, `receipt`) VALUES
('PAY-1001', 'USR-GUEST-102', 'Rajesh Sharma', '9876543211', 'rajesh@example.com', 'order_Rzp1001Sample', 'pay_Rzp1001Verified', 'sig_hmac_sha256_sample_ok', 10000.00, 'paid', 'Booking', 'UPI', 'Plot Booking Token Fee @ Greenfield Heights Township (Plot A-102)', 'VPM-RCPT-9821');

-- Seed Security Audit Log
INSERT INTO `audit_logs` (`action`, `user_id`, `details`, `ip_address`) VALUES
('DATABASE_INITIALIZED', 'SYSTEM', 'Hostinger MySQL database schema and seed data imported successfully.', '127.0.0.1');

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- END OF HOSTINGER DATABASE SQL SCRIPT
-- =============================================================================
