<?php
require_once __DIR__ . '/helpers.php';
$page_title = $page_title ?? SITE_NAME;
$page_desc  = $page_desc  ?? 'A design-build firm that carries a project the whole way: land, design, engineering, construction, handover.';
$body_class = $body_class ?? '';
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($page_title) ?> · <?= e(SITE_NAME) ?></title>
  <meta name="description" content="<?= e($page_desc) ?>">

  <!-- Open Graph / share -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="<?= e($page_title) ?> · <?= e(SITE_NAME) ?>">
  <meta property="og:description" content="<?= e($page_desc) ?>">
  <meta property="og:image" content="<?= asset('img/posters/chapter-04.svg') ?>">

  <!-- Fonts: modern-luxury pairing (Cormorant Garamond + Jost) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="<?= asset('css/lenis.css') ?>">
  <link rel="stylesheet" href="<?= asset('css/style.css') ?>">
</head>
<body class="<?= e($body_class) ?>">
