-- RapidStudio
--
-- Run this once in phpMyAdmin (XAMPP → Admin next to MySQL) or from the shell:
--   mysql -u root < sql/schema.sql

CREATE DATABASE IF NOT EXISTS rapidstudio
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rapidstudio;

CREATE TABLE IF NOT EXISTS projects (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(120)  NOT NULL,
  ref           VARCHAR(12)   NOT NULL DEFAULT '',   -- the printed number, e.g. 001
  client        VARCHAR(160)  NOT NULL,
  title         VARCHAR(200)  NOT NULL DEFAULT '',
  line          VARCHAR(240)  NOT NULL DEFAULT '',   -- the one-line under the name
  disciplines   VARCHAR(240)  NOT NULL DEFAULT '',   -- comma separated
  year          VARCHAR(8)    NOT NULL DEFAULT '',
  cover         VARCHAR(255)  NOT NULL DEFAULT '',   -- url of the cover picture
  brief         TEXT          NULL,
  did           TEXT          NULL,                  -- one per line
  results       TEXT          NULL,                  -- "figure | label" one per line
  status        ENUM('draft','live') NOT NULL DEFAULT 'draft',
  sort          INT           NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_slug (slug),
  KEY ix_live (status, sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enquiries from the contact form on the home page.
CREATE TABLE IF NOT EXISTS leads (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(160) NOT NULL DEFAULT '',
  email       VARCHAR(200) NOT NULL DEFAULT '',
  budget      VARCHAR(60)  NOT NULL DEFAULT '',
  message     TEXT         NULL,
  seen        TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_new (seen, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id  INT UNSIGNED NOT NULL,
  kind        ENUM('image','video') NOT NULL DEFAULT 'image',
  src         VARCHAR(255) NOT NULL,
  poster      VARCHAR(255) NOT NULL DEFAULT '',      -- videos only
  cap         VARCHAR(240) NOT NULL DEFAULT '',
  sort        INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_project (project_id, sort),
  CONSTRAINT fk_media_project FOREIGN KEY (project_id)
    REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
