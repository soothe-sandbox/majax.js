<? global $majax; ?>

<? ob_start(); ?>

  <? foreach ($majax->query->posts as $post): ?>

      <? global $post; ?>
      <? $post = get_post( $post->ID ); ?>
      <? get_template_part('gallery-post'); ?>

  <? endforeach ?>

<? $out['content'] = ob_get_contents(); ?>
<? ob_end_clean(); ?>

<? $out['meta']['posts_amount'] = $majax->posts_amount; ?>

<? wp_reset_query(); ?>

<? echo json_encode($out); ?>
<? wp_die();