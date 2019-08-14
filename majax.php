<?
add_action('wp_ajax_majax_load', array('Majax', 'client_responce'));
add_action('wp_ajax_nopriv_majax_load', array('Majax', 'client_responce'));

class Majax
{
  // Request Paramethers
  public static function client_request_params()
  {
    $params = array(
      'post_type'      => 'portfolio',
      'posts_per_page' => $_POST['ppp'],
    );

    // Params for Category Request
    if( self::client_request_type()=='client_responce_category' ){
      $params['posts_per_page'] = -1;

      $params['post__not_in'] = explode(",", $_POST['postExclude']);
      $params['tax_query']    = array(
        array(
          'taxonomy' => 'category',
          'field'    => 'id',
          'terms'    => $_POST['catId'],
        ),
      );
    }

    // Params for Category Load More Request
    if( self::client_request_type()=='client_responce_category_load_more' ){
      $params['posts_per_page'] = -1;

      $params['post__not_in'] = explode(",", $_POST['postExclude']);
      $params['tax_query']    = array(
        array(
          'taxonomy' => 'category',
          'field'    => 'id',
          'terms'    => $_POST['catId'],
        ),
      );
    }

    // Params for Category Drop Request
    if( self::client_request_type()=='client_responce_category_drop' ){
      $params['page']           = $_POST['page'];
      $params['posts_per_page'] = $_POST['ppp'];
      $params['post__not_in']   = false;
      $params['tax_query']      = false;
    }

    return $params;
  }

  // Find out Request Type
  public static function client_request_type()
  {
    if( $_POST['catId']=='false' &&
        $_POST['catDrop']=='false') {
      return 'client_responce_default';

    } elseif( $_POST['catId']!='false' &&
              $_POST['catNew']!='false') {
      return 'client_responce_category';

    } elseif( $_POST['catId']!='false' &&
              $_POST['catNew']=='false') {
      return 'client_responce_category_load_more';

    } elseif( $_POST['catDrop']=='true' ) {
      return 'client_responce_category_drop';
    }
  }


  /* ==============================
   * Client Responses
   * ============================== */

  /*
   * Responce
   */
  public static function client_responce()
  {
    // Find out Request Type
    $req_type = self::client_request_type();

    // Fire Responce
    self::{$req_type}();

    // End..
    die();
  }

  /*
   * Responce Type - Default
   */
  public static function client_responce_default()
  {
    // Settings Paramethers
    $params = self::client_request_params();
    $params['paged'] = $_POST['page'];

    // Fire DB Request
    global $majax;
    $majax->query = self::db_request($params);

    // Debug
    // error_log('Default');

    // Fire Client Responce
    self::client_responce_body();
  }

  /*
   * Responce Type - Category
   */
  public static function client_responce_category()
  {
    // Settings Paramethers
    $params = self::client_request_params();

    // Fire DB Request
    global $majax;
    $majax->query = self::db_request($params);

    // Debug
    // error_log('Category - New');

    // Process DB Responce
    self::db_process_responce();

    // Fire Client Responce
    self::client_responce_body();
  }

  /*
   * Responce Type - Category Load More
   */
  public static function client_responce_category_load_more()
  {
    // Settings Paramethers
    $params = self::client_request_params();

    // Fire DB Request
    global $majax;
    $majax->query = self::db_request($params);

    // Debug
    // error_log('Category - Load More');

    // Process DB Responce
    self::db_process_responce();

    // Fire Client Responce
    self::client_responce_body();
  }

  /*
   * Responce Type - Category Drop
   */
  public static function client_responce_category_drop()
  {
    // Settings Paramethers
    $params = self::client_request_params();

    // Fire DB Request
    global $majax;
    $majax->query = self::db_request($params);

    // Debug
    // error_log('Category - Drop');

    // Fire Client Responce
    self::client_responce_body();
  }

  // Client Responce Body
  public static function client_responce_body()
  {
    // Get Query Posts Amount
    self::client_responce_get_posts_amount();

    if( self::client_request_type()=='client_responce_category_load_more' ||
        self::client_request_type()=='client_responce_category'){
      get_template_part('custom/inc/majax-responce-category');
    } else {
      get_template_part('custom/inc/majax-responce');
    }

  }

  public static function client_responce_get_posts_amount()
  {
    global $majax;

    // Set DB Requery Params
    $params = self::client_request_params();

    if(isset($params['post__not_in'])){
      unset($params['post__not_in']);
    }

    // Fire DB Request for all Posts (wtihout "Exclude" array)
    $query = self::db_request($params);

    $majax->posts_amount = $query->found_posts;

    // Debug
    // error_log('Total Posts Amount: '.$majax->posts_amount);
  }


  /* ==============================
   * Process Client Request
   * ============================== */

  /*
   * Fire Data Base Request
   */
  public static function db_request( $params )
  {
    // Make Query
    $query = new WP_Query( $params );

    return $query;
  }

  /*
   * Process DB Responce
   */
  public static function db_process_responce()
  {
    global $majax;
    $ppp      = intval($_POST['ppp']);
    $page     = intval($_POST['page']);
    $db_posts = $majax->query->posts;

    // Find out Target Posts
    $target_posts_begin = ($ppp * $page) - $ppp;
    $target_posts_end   = $target_posts_begin + $ppp;

    // Exclude Excess Posts
    $i = 0;

    foreach ($db_posts as $post) {

      if( !($i>=$target_posts_begin) || !($i<$target_posts_end) ) {
        unset( $db_posts[$i] );
      }

      $i++;
    }

    // Check for New Category Needed Posts Amount
    if( $_POST['catNewNeededPosts']!=0 ){

      // Rewrite Global Query variable
      $db_posts                = array_slice($db_posts, 0, $_POST['catNewNeededPosts']);
      $majax->query->posts      = $db_posts;
      $majax->query->post_count = count($_POST['catNewNeededPosts']);
    } else {
      // Rewrite Global Query variable
      $majax->query->posts      = $db_posts;
      $majax->query->post_count = count($db_posts);
    }

    // ob_start();
      // echo 'Category Rensponse';
      // print_r($majax_query->posts);

    // $out = ob_get_contents();
    // ob_end_clean(); wp_reset_query();

    // echo $out;
  }
}