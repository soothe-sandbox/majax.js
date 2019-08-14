<? global $majax; ?>
<? $query = $majax->query; ?>

<? ob_start(); ?>

  <? while($query->have_posts()): ?>
  <? $query->the_post(); ?>
      <? $post = get_post( get_the_ID() ); ?>

      <? get_template_part('gallery-post'); ?>

  <? endwhile; ?>

<? $out['content'] = ob_get_contents(); ?>
<? ob_end_clean(); ?>

<? $out['meta']['posts_amount'] = $majax->posts_amount; ?>

<? wp_reset_query(); ?>

<? echo json_encode($out); ?>
<? wp_die();