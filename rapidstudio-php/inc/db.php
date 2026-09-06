<?php
declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $config = require __DIR__ . '/config.php';
    $d = $config['db'];
    $opts = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    if (($d['driver'] ?? 'mysql') === 'sqlite') {
        $path = $d['sqlite_path'];
        $dir = dirname($path);
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }
        $fresh = !file_exists($path);
        $pdo = new PDO('sqlite:' . $path, null, null, $opts);
        $pdo->exec('PRAGMA foreign_keys = ON');
        sqlite_prepare($pdo, $fresh);
    } else {
        $dsn = "mysql:host={$d['host']};dbname={$d['name']};charset={$d['charset']}";
        $pdo = new PDO($dsn, $d['user'], $d['pass'], $opts);
    }
    return $pdo;
}

/** Create the schema (and drop in the sample projects) the first time. */
function sqlite_prepare(PDO $pdo, bool $fresh): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          ref TEXT NOT NULL DEFAULT '',
          client TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT '',
          line TEXT NOT NULL DEFAULT '',
          disciplines TEXT NOT NULL DEFAULT '',
          year TEXT NOT NULL DEFAULT '',
          cover TEXT NOT NULL DEFAULT '',
          brief TEXT, did TEXT, results TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          sort INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS media (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          kind TEXT NOT NULL DEFAULT 'image',
          src TEXT NOT NULL, poster TEXT NOT NULL DEFAULT '',
          cap TEXT NOT NULL DEFAULT '', sort INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
          budget TEXT NOT NULL DEFAULT '', message TEXT,
          seen INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );"
    );

    if (!$fresh) {
        return;
    }
    // fresh file → put the six samples in so the site is not empty
    $seedFile = __DIR__ . '/../sql/seed_data.php';
    if (!is_file($seedFile)) {
        return;
    }
    $seed = require $seedFile;
    $ins = $pdo->prepare('INSERT INTO projects (slug,ref,client,title,line,disciplines,year,cover,brief,did,results,status,sort)
                          VALUES (?,?,?,?,?,?,?,?,?,?,?,\'live\',?)');
    $insM = $pdo->prepare('INSERT INTO media (project_id,kind,src,cap,sort) VALUES (?,?,?,?,?)');
    foreach ($seed as $k => $s) {
        [$slug,$ref,$client,$title,$line,$disc,$year,$cover,$brief,$did,$res,$more] = $s;
        $ins->execute([$slug,$ref,$client,$title,$line,$disc,$year,"/uploads/seed/$cover.webp",$brief,$did,$res,$k*10]);
        $pid = (int) $pdo->lastInsertId();
        foreach ($more as $i => $m) {
            $insM->execute([$pid, 'image', "/uploads/seed/$m.webp", '', ($i + 1) * 10]);
        }
    }
}

/** Make sure the enquiries table exists, in whichever engine is in use. */
function ensure_leads(): void
{
    $config = require __DIR__ . '/config.php';
    if (($config['db']['driver'] ?? 'mysql') === 'sqlite') {
        db()->exec("CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
          budget TEXT NOT NULL DEFAULT '', message TEXT,
          seen INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')))");
    } else {
        db()->exec("CREATE TABLE IF NOT EXISTS leads (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          name VARCHAR(160) NOT NULL DEFAULT '', email VARCHAR(200) NOT NULL DEFAULT '',
          budget VARCHAR(60) NOT NULL DEFAULT '', message TEXT NULL,
          seen TINYINT(1) NOT NULL DEFAULT 0,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id), KEY ix_new (seen, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }
}

/** Every live project, in the order they are shown. */
function all_projects(bool $includeDrafts = false): array
{
    $sql = 'SELECT * FROM projects' . ($includeDrafts ? '' : " WHERE status = 'live'")
         . ' ORDER BY sort ASC, id ASC';
    return db()->query($sql)->fetchAll();
}

function project_by_slug(string $slug, bool $includeDrafts = false): ?array
{
    $sql = 'SELECT * FROM projects WHERE slug = ?' . ($includeDrafts ? '' : " AND status = 'live'");
    $st = db()->prepare($sql);
    $st->execute([$slug]);
    $row = $st->fetch();
    return $row ?: null;
}

function project_media(int $projectId): array
{
    $st = db()->prepare('SELECT * FROM media WHERE project_id = ? ORDER BY sort ASC, id ASC');
    $st->execute([$projectId]);
    return $st->fetchAll();
}

/** The one before and after, wrapping round, so a project page always has both. */
function project_neighbours(string $slug): array
{
    $live = all_projects();
    $n = count($live);
    if ($n === 0) {
        return ['prev' => null, 'next' => null];
    }
    $i = 0;
    foreach ($live as $k => $p) {
        if ($p['slug'] === $slug) { $i = $k; break; }
    }
    return [
        'prev' => $live[($i - 1 + $n) % $n],
        'next' => $live[($i + 1) % $n],
    ];
}
