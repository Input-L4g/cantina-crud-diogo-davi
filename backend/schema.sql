CREATE DATABASE IF NOT EXISTS cantina_escolar CHARACTER
SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cantina_escolar;

CREATE TABLE IF NOT EXISTS
    produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(100) NOT NULL UNIQUE,
        `category` VARCHAR(50) NOT NULL,
        `price` DECIMAL(10, 2) NOT NULL,
        `time_stamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
