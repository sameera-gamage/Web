-- =====================================================================
-- Excello — manual database import (OPTIONAL)
-- The site creates and seeds this database by itself on first load, so
-- you normally do NOT need this file. It is here only if you prefer to
-- import through phpMyAdmin, or to move the site to another host.
--
-- phpMyAdmin: create a database named `excello`, open it, then
-- Import > choose this file > Go.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `excello` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `excello`;

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'villa',
  location VARCHAR(160) DEFAULT '',
  status VARCHAR(60) DEFAULT 'Completed',
  cover VARCHAR(255) DEFAULT '',
  excerpt VARCHAR(400) DEFAULT '',
  body TEXT,
  featured TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) DEFAULT '',
  category VARCHAR(60) DEFAULT 'Notes',
  cover VARCHAR(255) DEFAULT '',
  excerpt VARCHAR(400) DEFAULT '',
  body TEXT,
  status VARCHAR(20) DEFAULT 'live',
  published_at DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) DEFAULT '',
  phone VARCHAR(60) DEFAULT '',
  plot VARCHAR(200) DEFAULT '',
  message TEXT,
  handled TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO projects (title,type,location,status,cover,excerpt,featured,sort_order) VALUES
('Sea Esta','villa','Mount Lavinia','Lead development','chapter-04.jpg','Six beachfront villas where the ocean is the fifth wall. Our flagship land-to-handover development.',1,1),
('Dune House','house','Bentota','Completed','chapter-02.jpg','A single-family home folded into a coastal dune, built entirely in-house.',0,2),
('Palmyra Residences','house','Negombo','In construction','chapter-03.jpg','A row of courtyard homes shaded by the palms that were already there.',0,3),
('The Reef Hotel','hotel','Unawatuna','In design','chapter-01.jpg','A boutique reef-front hotel, from the land purchase to the front desk.',0,4),
('Galle Face Offices','commercial','Colombo 03','Completed','chapter-02.jpg','A workplace that reads as calm, delivered on one contract.',0,5),
('Cinnamon Court','villa','Ahangama','Completed','chapter-04.jpg','A garden villa around a lap pool, handed over with the keys and nothing left undone.',0,6);

INSERT INTO articles (title,slug,category,cover,excerpt,body,status,published_at) VALUES
('One team, one line of accountability','one-team','Notes','chapter-03.jpg','Why holding land, design, engineering and construction under one roof is the whole point.','Excello holds the line from the land to the keys. One team owns every stage, so nothing falls through the gaps.','live','2026-08-20'),
('What a beachfront plot really costs','beachfront-plot-cost','Guides','chapter-01.jpg','The setbacks, the soil, the access. A plain guide to reading coastal land before you buy.','We walk every plot before a client commits, and tell them what we find in plain words.','live','2026-07-11'),
('From flat plan to full model','plan-to-model','Press','chapter-02.jpg','A look inside how a drawing becomes a building you can walk before a single stone is poured.','We shape a project before we pour a single stone.','live','2026-06-02');
