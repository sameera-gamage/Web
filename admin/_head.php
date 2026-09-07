<?php
require_once __DIR__ . '/auth.php';
$admin_title = $admin_title ?? 'Admin';
$cur = basename($_SERVER['SCRIPT_NAME'], '.php');
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($admin_title) ?> · <?= e(SITE_NAME) ?> Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root{--canvas:#0F0F11;--panel:#17181B;--panel2:#1E2024;--bronze:#C1955C;--bronze-hi:#D8AF71;--ink:#F3F0EA;--muted:#9E978B;--line:rgba(243,240,234,.1);}
  *{box-sizing:border-box}
  body{margin:0;background:var(--canvas);color:var(--ink);font-family:"Jost",system-ui,sans-serif;font-weight:300;font-size:15px}
  a{color:var(--bronze-hi);text-decoration:none}
  h1,h2,h3{font-family:"Cormorant Garamond",serif;font-weight:500;margin:0}
  .admin-top{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.4rem;border-bottom:1px solid var(--line);position:sticky;top:0;background:rgba(15,15,17,.9);backdrop-filter:blur(10px);z-index:10}
  .admin-brand{font-family:"Cormorant Garamond",serif;font-size:1.4rem;letter-spacing:.08em;color:var(--ink)}
  .admin-brand b{color:var(--bronze)}
  .admin-nav{display:flex;gap:.4rem;flex-wrap:wrap}
  .admin-nav a{padding:.5rem .9rem;border-radius:8px;color:var(--muted);font-size:.86rem}
  .admin-nav a:hover{color:var(--ink);background:var(--panel)}
  .admin-nav a.on{color:var(--canvas);background:var(--bronze)}
  .wrap{max-width:1100px;margin:2rem auto;padding:0 1.4rem}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:1.4rem;margin-bottom:1.4rem}
  table{width:100%;border-collapse:collapse}
  th,td{text-align:left;padding:.7rem .6rem;border-bottom:1px solid var(--line);vertical-align:top;font-size:.9rem}
  th{color:var(--muted);font-weight:500;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase}
  input,select,textarea{width:100%;font-family:inherit;font-size:.95rem;color:var(--ink);background:var(--canvas);border:1px solid var(--line);border-radius:8px;padding:.6rem .7rem}
  textarea{min-height:120px;resize:vertical}
  label{display:block;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 .35rem}
  .field{margin-bottom:1rem}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
  .btn{display:inline-flex;align-items:center;gap:.4em;cursor:pointer;font-family:inherit;font-size:.9rem;color:var(--canvas);background:var(--bronze);border:1px solid var(--bronze);border-radius:999px;padding:.6em 1.2em;transition:background .25s}
  .btn:hover{background:var(--bronze-hi)}
  .btn-sm{padding:.35em .8em;font-size:.8rem}
  .btn-ghost{background:transparent;color:var(--ink);border-color:var(--line)}
  .btn-danger{background:transparent;color:#e8a996;border-color:rgba(200,80,60,.4)}
  .flash{padding:.8rem 1rem;border-radius:10px;margin-bottom:1.2rem;background:rgba(193,149,92,.12);border:1px solid rgba(193,149,92,.3);color:var(--bronze-hi);font-size:.9rem}
  .pill{display:inline-block;font-size:.7rem;padding:.2em .6em;border-radius:999px;background:var(--panel2);color:var(--muted)}
  .pill.on{background:rgba(193,149,92,.18);color:var(--bronze-hi)}
  .thumb{width:64px;height:48px;object-fit:cover;border-radius:6px}
  .muted{color:var(--muted)}
  .actions{display:flex;gap:.4rem;flex-wrap:wrap}
</style>
</head>
<body>
<header class="admin-top">
  <span class="admin-brand"><b>Excello</b> Admin</span>
  <?php if (admin_logged_in()): ?>
  <nav class="admin-nav">
    <a href="<?= admin_url('') ?>" class="<?= $cur === 'index' ? 'on' : '' ?>">Dashboard</a>
    <a href="<?= admin_url('projects.php') ?>" class="<?= $cur === 'projects' ? 'on' : '' ?>">Projects</a>
    <a href="<?= admin_url('articles.php') ?>" class="<?= $cur === 'articles' ? 'on' : '' ?>">Articles</a>
    <a href="<?= admin_url('enquiries.php') ?>" class="<?= $cur === 'enquiries' ? 'on' : '' ?>">Enquiries</a>
    <a href="<?= url('') ?>" target="_blank">View site ↗</a>
    <a href="<?= admin_url('logout.php') ?>">Log out</a>
  </nav>
  <?php endif; ?>
</header>
<div class="wrap">
