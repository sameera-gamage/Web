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
    $dsn = "mysql:host={$d['host']};dbname={$d['name']};charset={$d['charset']}";
    $pdo = new PDO($dsn, $d['user'], $d['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        // real prepared statements, so a value can never be parsed as SQL
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
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
