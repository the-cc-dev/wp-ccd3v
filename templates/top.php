<!doctype html>
<html>
    <?php while (have_posts()) : the_post();  ?>
  <!-- <head> -->
    <?php get_template_part('templates/head'); ?>
  <!-- </head> -->
  <body>
    <!-- <header> -->  
      <?php get_template_part('templates/header'); ?>
    <!-- </header> -->  
    <main>