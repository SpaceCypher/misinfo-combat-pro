USE university_fest;

INSERT IGNORE INTO fest (fest_id, fest_name, fest_year) VALUES 
('F001', 'TechFest 2024', 2024),
('F002', 'CulturalFest 2024', 2024);

INSERT IGNORE INTO team (team_id, team_name, no_of_members, team_type, fest_id) VALUES 
('T001', 'Tech Team', 5, 'ORG', 'F001'),
('T002', 'Cultural Team', 8, 'ORG', 'F002');

INSERT IGNORE INTO event (event_id, event_name, venue_block, venue_floor, venue_room, price, team_id) VALUES 
('E001', 'Coding Competition', 'Block A', 2, 'A201', 100.00, 'T001'),
('E002', 'Dance Competition', 'Block B', 1, 'B101', 150.00, 'T002'),
('E003', 'Debate Competition', 'Block C', 3, 'C301', 75.00, 'T001');

INSERT IGNORE INTO participant (srn, participant_name, gender, department, semester) VALUES 
('PES1UG20CS001', 'John Doe', 'M', 'Computer Science', 6),
('PES1UG20CS002', 'Jane Smith', 'F', 'Computer Science', 6),
('PES1UG20EC003', 'Bob Wilson', 'M', 'Electronics', 4);

INSERT IGNORE INTO item (item_id, item_name, item_type) VALUES 
('I001', 'Biryani', 'Non-veg'),
('I002', 'Samosa', 'Veg'),
('I003', 'Chicken Roll', 'Non-veg'),
('I004', 'Paneer Roll', 'Veg');

INSERT IGNORE INTO stall (stall_id, stall_name, fest_id) VALUES 
('S001', 'Food Court 1', 'F001'),
('S002', 'Snack Corner', 'F001');

INSERT IGNORE INTO stall_item (stall_id, item_id, price, stock_quantity) VALUES 
('S001', 'I001', 120.00, 50),
('S001', 'I002', 15.00, 100),
('S002', 'I003', 80.00, 30),
('S002', 'I004', 60.00, 40);

DELIMITER //
CREATE TRIGGER after_purchase_insert 
AFTER INSERT ON purchase
FOR EACH ROW
BEGIN
    UPDATE stall_item 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE stall_id = NEW.stall_id AND item_id = NEW.item_id;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_purchase_insert 
BEFORE INSERT ON purchase
FOR EACH ROW
BEGIN
    IF NEW.quantity > 5 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Cannot purchase more than 5 units of any single item in one transaction';
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GetStallSales(IN input_stall_id VARCHAR(10))
BEGIN
    DECLARE total_revenue DECIMAL(10,2) DEFAULT 0;
    
    SELECT COALESCE(SUM(p.total_amount), 0) INTO total_revenue
    FROM purchase p
    WHERE p.stall_id = input_stall_id;
    
    SELECT CONCAT('Total revenue for stall ', input_stall_id, ': Rs. ', total_revenue) AS 'Stall Sales Report';
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE RegisterParticipant(
    IN input_event_id VARCHAR(10),
    IN input_srn VARCHAR(15),
    IN input_registration_id VARCHAR(15)
)
BEGIN
    INSERT INTO registration (registration_number, event_id, srn, registration_date)
    VALUES (input_registration_id, input_event_id, input_srn, NOW());
    
    SELECT 'Participant successfully registered!' AS 'Registration Status';
END//
DELIMITER ;

DELIMITER //
CREATE FUNCTION GetEventCost(input_event_id VARCHAR(10))
RETURNS DECIMAL(6,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE event_price DECIMAL(6,2) DEFAULT 0;
    
    SELECT price INTO event_price
    FROM event
    WHERE event_id = input_event_id;
    
    RETURN COALESCE(event_price, 0);
END//
DELIMITER ;

DELIMITER //
CREATE FUNCTION GetParticipantPurchaseTotal(input_srn VARCHAR(15))
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_spent DECIMAL(10,2) DEFAULT 0;
    
    SELECT COALESCE(SUM(total_amount), 0) INTO total_spent
    FROM purchase
    WHERE srn = input_srn;
    
    RETURN total_spent;
END//
DELIMITER ;

SELECT 'TRIGGER 1 TEST - BEFORE PURCHASE:' as Status;
SELECT stall_id, item_id, item_name, stock_quantity, price
FROM stall_item si
JOIN item i ON si.item_id = i.item_id
WHERE stall_id = 'S001' AND si.item_id = 'I001';

INSERT INTO purchase (purchase_id, srn, stall_id, item_id, quantity, total_amount, purchase_date) 
VALUES ('P_STOCK_TEST', 'PES1UG20CS001', 'S001', 'I001', 4, 480.00, NOW());

SELECT 'TRIGGER 1 TEST - AFTER PURCHASE:' as Status;
SELECT stall_id, item_id, item_name, stock_quantity, price
FROM stall_item si
JOIN item i ON si.item_id = i.item_id
WHERE stall_id = 'S001' AND si.item_id = 'I001';

DROP TRIGGER IF EXISTS before_purchase_insert;

SELECT 'TRIGGER 2 TEST - BEFORE (No trigger, buying 10 units):' as Status;
SELECT stall_id, item_id, item_name, stock_quantity
FROM stall_item si
JOIN item i ON si.item_id = i.item_id
WHERE stall_id = 'S002' AND si.item_id = 'I004';

INSERT INTO purchase (purchase_id, srn, stall_id, item_id, quantity, total_amount) 
VALUES ('P_BEFORE_TRIGGER', 'PES1UG20CS002', 'S002', 'I004', 10, 600.00);

SELECT 'SUCCESS: 10 units purchased without trigger:' as Status;
SELECT * FROM purchase WHERE purchase_id = 'P_BEFORE_TRIGGER';

DELIMITER //
CREATE TRIGGER before_purchase_insert 
BEFORE INSERT ON purchase
FOR EACH ROW
BEGIN
    IF NEW.quantity > 5 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Cannot purchase more than 5 units of any single item in one transaction';
    END IF;
END//
DELIMITER ;

SELECT 'TRIGGER 2 CREATED - Now testing with 6 units (should fail):' as Status;

INSERT INTO purchase (purchase_id, srn, stall_id, item_id, quantity, total_amount) 
VALUES ('P_SHOULD_WORK', 'PES1UG20CS001', 'S002', 'I004', 5, 300.00);

SELECT 'SUCCESS: 5 units purchased with trigger active:' as Status;
SELECT * FROM purchase WHERE purchase_id = 'P_SHOULD_WORK';

SELECT 'PROCEDURE 1 - BEFORE: Current purchases for Stall S001' as Status;
SELECT p.purchase_id, p.srn, p.stall_id, p.item_id, p.quantity, p.total_amount
FROM purchase p 
WHERE p.stall_id = 'S001'
ORDER BY p.purchase_id;

SELECT 'Items in Stall S001:' as Status;
SELECT si.stall_id, si.item_id, i.item_name, si.price, si.stock_quantity
FROM stall_item si
JOIN item i ON si.item_id = i.item_id
WHERE si.stall_id = 'S001';

SELECT 'Manual Revenue Calculation for S001:' as Status;
SELECT COALESCE(SUM(p.total_amount), 0) as 'Expected Revenue'
FROM purchase p 
WHERE p.stall_id = 'S001';

SELECT 'PROCEDURE 1 - COMMAND: Calling GetStallSales' as Status;
CALL GetStallSales('S001');

SELECT 'PROCEDURE 1 - AFTER: Testing with Stall S002' as Status;
CALL GetStallSales('S002');

SELECT 'Testing with non-existent stall S999:' as Status;
CALL GetStallSales('S999');

SELECT 'PROCEDURE 2 - BEFORE: Current registrations' as Status;
SELECT COUNT(*) as 'Total Current Registrations' FROM registration;

SELECT 'Current Registration Details:' as Status;
SELECT r.registration_number, r.event_id, e.event_name, r.srn, p.participant_name
FROM registration r
LEFT JOIN event e ON r.event_id = e.event_id
LEFT JOIN participant p ON r.srn = p.srn
ORDER BY r.registration_date;

SELECT 'Available Events:' as Status;
SELECT event_id, event_name, price FROM event ORDER BY event_id;

SELECT 'Available Participants:' as Status;
SELECT srn, participant_name, department FROM participant ORDER BY srn;

SELECT 'PROCEDURE 2 - COMMAND: Registering participant' as Status;
CALL RegisterParticipant('E002', 'PES1UG20CS002', 'REG_PROC_TEST');

SELECT 'PROCEDURE 2 - AFTER: Updated registrations count' as Status;
SELECT COUNT(*) as 'Total Registrations After' FROM registration;

SELECT 'All Registration Details After Procedure:' as Status;
SELECT r.registration_number, r.event_id, e.event_name, r.srn, p.participant_name, r.registration_date
FROM registration r
JOIN event e ON r.event_id = e.event_id
JOIN participant p ON r.srn = p.srn
ORDER BY r.registration_date;

SELECT 'New Registration Specific Details:' as Status;
SELECT r.registration_number, r.event_id, e.event_name, e.price as 'Event Cost', 
       r.srn, p.participant_name, p.department, r.registration_date
FROM registration r
JOIN event e ON r.event_id = e.event_id
JOIN participant p ON r.srn = p.srn
WHERE r.registration_number = 'REG_PROC_TEST';

SELECT 'FUNCTION 1 - BEFORE: Available events and their costs' as Status;
SELECT event_id, event_name, venue_block, venue_room, price
FROM event
ORDER BY event_id;

SELECT 'Focusing on Event E001:' as Status;
SELECT event_id, event_name, price 
FROM event 
WHERE event_id = 'E001';

SELECT 'FUNCTION 1 - COMMAND: Calling GetEventCost function' as Status;
SELECT GetEventCost('E001') AS 'Event Cost for E001';

SELECT 'FUNCTION 1 - AFTER: Testing with all events' as Status;
SELECT 
    'E001' as Event_ID, 
    GetEventCost('E001') as Function_Result,
    (SELECT price FROM event WHERE event_id = 'E001') as Expected_Price
UNION ALL
SELECT 
    'E002' as Event_ID, 
    GetEventCost('E002') as Function_Result,
    (SELECT price FROM event WHERE event_id = 'E002') as Expected_Price
UNION ALL
SELECT 
    'E003' as Event_ID, 
    GetEventCost('E003') as Function_Result,
    (SELECT price FROM event WHERE event_id = 'E003') as Expected_Price;

SELECT 'Testing with non-existent event E999:' as Status;
SELECT GetEventCost('E999') AS 'Cost for Non-existent Event';

SELECT 'FUNCTION 2 - BEFORE: All purchases by participants' as Status;
SELECT p.srn, pt.participant_name, p.purchase_id, p.stall_id, p.item_id, p.quantity, p.total_amount
FROM purchase p
JOIN participant pt ON p.srn = pt.srn
ORDER BY p.srn, p.purchase_id;

SELECT 'Manual calculation for PES1UG20CS001:' as Status;
SELECT 
    p.srn,
    pt.participant_name,
    COUNT(p.purchase_id) as 'Total_Purchases',
    COALESCE(SUM(p.total_amount), 0) as 'Manual_Total_Spent'
FROM participant pt
LEFT JOIN purchase p ON pt.srn = p.srn
WHERE pt.srn = 'PES1UG20CS001'
GROUP BY pt.srn, pt.participant_name;

SELECT 'FUNCTION 2 - COMMAND: Calling GetParticipantPurchaseTotal' as Status;
SELECT GetParticipantPurchaseTotal('PES1UG20CS001') AS 'Total Spent by PES1UG20CS001';

SELECT 'FUNCTION 2 - AFTER: Testing with all participants' as Status;
SELECT 
    p.srn as 'Participant_SRN',
    p.participant_name,
    GetParticipantPurchaseTotal(p.srn) as 'Function_Result',
    (SELECT COALESCE(SUM(pur.total_amount), 0) 
     FROM purchase pur 
     WHERE pur.srn = p.srn) as 'Manual_Calculation'
FROM participant p
ORDER BY p.srn;

SELECT 'Testing with non-existent participant:' as Status;
SELECT GetParticipantPurchaseTotal('INVALID_SRN123') AS 'Total for Invalid SRN';

SELECT 'VERIFICATION - Current stock levels:' AS 'Info';
SELECT si.stall_id, si.item_id, i.item_name, si.stock_quantity, si.price
FROM stall_item si
JOIN item i ON si.item_id = i.item_id
ORDER BY si.stall_id, si.item_id;

SELECT 'VERIFICATION - All purchases:' AS 'Info';
SELECT p.purchase_id, p.srn, pt.participant_name, p.stall_id, p.item_id, i.item_name, p.quantity, p.total_amount
FROM purchase p
JOIN participant pt ON p.srn = pt.srn
JOIN item i ON p.item_id = i.item_id
ORDER BY p.purchase_id;

SELECT 'VERIFICATION - All registrations:' AS 'Info';
SELECT r.registration_number, r.event_id, e.event_name, r.srn, pt.participant_name, r.registration_date
FROM registration r
JOIN event e ON r.event_id = e.event_id
JOIN participant pt ON r.srn = pt.srn
ORDER BY r.registration_date;