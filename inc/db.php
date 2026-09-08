<?php
/* =====================================================================
   Database bootstrap — self-installing.
   On first load this connects to MySQL, creates the "excello" database
   and its tables if they do not exist, and seeds starter content so the
   site never looks empty. No manual phpMyAdmin import needed.
   ===================================================================== */

require_once __DIR__ . '/config.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $opts = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        // 1) connect without a database, create it if missing
        $root = new PDO(
            'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';charset=utf8mb4',
            DB_USER, DB_PASS, $opts
        );
        $root->exec(
            'CREATE DATABASE IF NOT EXISTS `' . DB_NAME .
            '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
        );

        // 2) connect to the database itself
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';port=' . DB_PORT .
            ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER, DB_PASS, $opts
        );
    } catch (PDOException $e) {
        http_response_code(500);
        die(
            '<div style="font:16px/1.5 system-ui;max-width:640px;margin:12vh auto;'
            . 'padding:2rem;background:#17181B;color:#F3F0EA;border-radius:14px">'
            . '<h2 style="font-weight:400">Cannot reach the database</h2>'
            . '<p style="color:#9E978B">Start <b>Apache</b> and <b>MySQL</b> in the '
            . 'XAMPP control panel, then reload. If your MySQL has a password, set it '
            . 'in <code>inc/config.php</code>.</p>'
            . '<p style="color:#9E978B;font-size:13px">' . htmlspecialchars($e->getMessage()) . '</p>'
            . '</div>'
        );
    }

    install_schema($pdo);
    return $pdo;
}

function install_schema(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS projects (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        title        VARCHAR(160) NOT NULL,
        type         VARCHAR(40)  NOT NULL DEFAULT 'villa',
        location     VARCHAR(160) DEFAULT '',
        status       VARCHAR(60)  DEFAULT 'Completed',
        cover        VARCHAR(255) DEFAULT '',
        excerpt      VARCHAR(400) DEFAULT '',
        body         TEXT,
        featured     TINYINT(1)   DEFAULT 0,
        sort_order   INT          DEFAULT 0,
        created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS articles (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        title        VARCHAR(200) NOT NULL,
        slug         VARCHAR(200) DEFAULT '',
        category     VARCHAR(60)  DEFAULT 'Notes',
        cover        VARCHAR(255) DEFAULT '',
        excerpt      VARCHAR(400) DEFAULT '',
        body         TEXT,
        status       VARCHAR(20)  DEFAULT 'live',
        published_at DATE,
        created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS enquiries (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        name         VARCHAR(120) NOT NULL,
        email        VARCHAR(160) DEFAULT '',
        phone        VARCHAR(60)  DEFAULT '',
        plot         VARCHAR(200) DEFAULT '',
        message      TEXT,
        handled      TINYINT(1)   DEFAULT 0,
        created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    seed($pdo);
}

function seed(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM projects')->fetchColumn();
    if ($count === 0) {
        $rows = [
            ['Sea Esta', 'villa', 'Mount Lavinia', 'Lead development', 'real/hero-exterior.jpg',
             'A quiet-luxury residence on the coast, carried from the land to the keys. Our flagship development.', 1, 1],
            ['Dune House', 'house', 'Bentota', 'Completed', 'real/living-1.jpg',
             'A single-family home folded into a coastal dune, built entirely in-house.', 0, 2],
            ['Palmyra Residences', 'house', 'Negombo', 'In construction', 'real/bedroom-1.jpg',
             'A row of courtyard homes shaded by the palms that were already there.', 0, 3],
            ['The Reef Hotel', 'hotel', 'Unawatuna', 'In design', 'real/rooftop-garden.jpg',
             'A boutique reef-front hotel, from the land purchase to the front desk.', 0, 4],
            ['Galle Face Offices', 'commercial', 'Colombo 03', 'Completed', 'real/living-2.jpg',
             'A workplace that reads as calm, delivered on one contract.', 0, 5],
            ['Cinnamon Court', 'villa', 'Ahangama', 'Completed', 'real/dining-1.jpg',
             'A garden villa around a lap pool, handed over with the keys and nothing left undone.', 0, 6],
        ];
        $st = $pdo->prepare('INSERT INTO projects
            (title,type,location,status,cover,excerpt,featured,sort_order)
            VALUES (?,?,?,?,?,?,?,?)');
        foreach ($rows as $r) $st->execute($r);
    }

    $count = (int) $pdo->query('SELECT COUNT(*) FROM articles')->fetchColumn();
    if ($count === 0) {
        $rows = [
            ['One team, one line of accountability', 'one-team', 'Notes', 'real/living-4.jpg',
             'Why holding land, design, engineering and construction under one roof is the whole point.',
             "When an architect, an engineer and a builder work for three different companies, the gaps between them become your problem. A drawing that cannot be built. A cost that appears late. A blame loop when something is wrong.\n\nExcello holds the line from the land to the keys. One team owns every stage, so nothing falls through the gaps.",
             'live', '2026-08-20'],
            ['What a beachfront plot really costs', 'beachfront-plot-cost', 'Guides', 'real/site.jpg',
             'The setbacks, the soil, the access. A plain guide to reading coastal land before you buy.',
             "A view is easy to fall for. The things that decide whether you can build are quieter: the coastal setback line, the water table, the way a lorry reaches the site.\n\nWe walk every plot before a client commits, and tell them what we find in plain words.",
             'live', '2026-07-11'],
            ['From flat plan to full model', 'plan-to-model', 'Press', 'real/kitchen.jpg',
             'A look inside how a drawing becomes a building you can walk before a single stone is poured.',
             "We shape a project before we pour a single stone. The flat plan rises into a model, the model is tested against light, wind and cost, and only then does the ground get broken.",
             'live', '2026-06-02'],
        ];
        $st = $pdo->prepare('INSERT INTO articles
            (title,slug,category,cover,excerpt,body,status,published_at)
            VALUES (?,?,?,?,?,?,?,?)');
        foreach ($rows as $r) $st->execute($r);
    }
}
