-- ============================================================
-- Minhaj Digital Library — Seed Data
-- Run AFTER schema.sql
-- ============================================================

USE `minhaj_library`;

-- ============================================================
-- Categories
-- ============================================================
INSERT IGNORE INTO `categories` (`name`) VALUES
    ('Islamic Studies'),
    ('Science & Technology'),
    ('History'),
    ('Literature'),
    ('Philosophy'),
    ('Mathematics');

-- ============================================================
-- Books (>=5 with verified, legal, publicly accessible PDF URLs)
-- All PDFs below are from public domain / open-access sources.
-- ============================================================
INSERT INTO `books` (`title`, `author`, `category_id`, `description`, `cover_image`, `pdf_url`) VALUES
(
    'The Quran - English Translation',
    'Abdullah Yusuf Ali',
    (SELECT `id` FROM `categories` WHERE `name` = 'Islamic Studies'),
    'A widely respected English translation of the Holy Quran with commentary by Abdullah Yusuf Ali. This translation has been a cornerstone of English-language Quranic scholarship since its first publication.',
    NULL,
    'https://archive.org/download/the-meaning-of-the-holy-quran-yusuf-ali/The-Meaning-of-The-Holy-Quran-Yusuf-Ali.pdf'
),
(
    'The Wealth of Nations',
    'Adam Smith',
    (SELECT `id` FROM `categories` WHERE `name` = 'Philosophy'),
    'An Inquiry into the Nature and Causes of the Wealth of Nations, published in 1776, is a foundational work in classical economics. It explores the dynamics of free markets, division of labor, and the role of self-interest in economic prosperity.',
    NULL,
    'https://www.ibiblio.org/ml/libri/s/SmithA_WealthNations_p.pdf'
),
(
    'Relativity: The Special and General Theory',
    'Albert Einstein',
    (SELECT `id` FROM `categories` WHERE `name` = 'Science & Technology'),
    'Einstein''s own popular explanation of special and general relativity, written in 1916 for readers without advanced mathematics. It covers the relativity of simultaneity, space-time, gravitation, and the structure of the universe.',
    NULL,
    'https://www.ibiblio.org/ebooks/Einstein/Einstein_Relativity.pdf'
),
(
    'The Republic',
    'Plato',
    (SELECT `id` FROM `categories` WHERE `name` = 'Philosophy'),
    'One of the most influential works of philosophy and political theory in Western civilization. Plato examines justice, the ideal state, the nature of the soul, and the philosopher-king concept through Socratic dialogue.',
    NULL,
    'https://archive.org/download/cu31924032626446/cu31924032626446.pdf'
),
(
    'The Art of War',
    'Sun Tzu',
    (SELECT `id` FROM `categories` WHERE `name` = 'History'),
    'An ancient Chinese military treatise dating from the 5th century BC. The work is composed of 13 chapters covering strategy, tactics, and the philosophy of warfare. It has profoundly influenced both Eastern and Western military thinking.',
    NULL,
    'https://sites.ualberta.ca/~enoch/Readings/The_Art_Of_War.pdf'
),
(
    'Elements of Mathematics',
    'Euclid',
    (SELECT `id` FROM `categories` WHERE `name` = 'Mathematics'),
    'Euclid''s Elements is one of the most influential mathematical works in history, serving as the main textbook for teaching mathematics from its publication until the early 20th century. It covers geometry, number theory, and mathematical rigor.',
    NULL,
    'https://farside.ph.utexas.edu/books/Euclid/Elements.pdf'
),
(
    'Pride and Prejudice',
    'Jane Austen',
    (SELECT `id` FROM `categories` WHERE `name` = 'Literature'),
    'Published in 1813, this romantic novel follows the story of Elizabeth Bennet as she navigates issues of manners, upbringing, morality, and marriage in the society of the landed gentry of the British Regency.',
    NULL,
    'https://www.planetebook.com/free-ebooks/pride-and-prejudice.pdf'
);
