var majax = { };

/* ==============================
 * # Majax - Config
 * ============================== */
majax.config = {
	gallery     : '.p-archive-product .b-list-product',
	galleryItem : '.b-product-card',
	btnLoadMore : '.btn-load-more',
}

/* ==============================
 * # Majax - Gallery
 * ============================== */
majax.gallery = {
	// Gallery
	container: jQuery(majax.config.gallery),

	itemClass: majax.config.galleryItem,

	animation: {
		duration: function(t,i) {
			return 500 + i*50;
		},
		easing: 'easeOutExpo',
		delay: function(t,i) {
			return i * 20;
		},
		opacity: {
			value: [0,1],
			duration: function(t,i) {
				return 250 + i*50;
			},
			easing: 'linear'
		},
 		translateY: [400,0],
		targets: this.itemClass+'.m-new',
	},

	// Get Present Gallery Entries
	getEntries:       function(){
		return this.container.find(this.itemClass).not('.drop-cats');
	},

	// # Remove
	// --------
	getEntriesWithDropBtn: function(){
		return this.container.find(this.itemClass);
	},

	// Get Present Gallery Entries Amount
	getEntriesAmount: function(){
		return this.getEntries().length;
	},

	// Rebuild Layout
	layout:           function(res, btnCatDisable){
		res = JSON.parse(res);

		// # Remove
		// --------
		// Incert Category Disable Btn
		// if(btnCatDisable){
			// this.container.prepend(btnCatDisable);
		// }

		// Category - Drop
		if(majax.params.data.catDrop){
			// Debug
			console.log('Layout: Drop');

			var oldEntries = this.getEntries();
			oldEntries.fadeOut(300, ()=>{
				oldEntries.remove();
			});

			setTimeout(()=>{
				// Incert Data
				if(res.content){
					this.container.append(res.content);

					// If no more posts are left - hide "Load More" btn
					if( this.getEntriesAmount()==res.meta.posts_amount*1 ){
						jQuery(btnLoadMore).fadeOut(300);
					} else {
						jQuery(btnLoadMore).fadeIn(300);
					}
				}

				this.container.imagesLoaded(()=>{
					// # Removed
					// ---------
					// this.container.masonry('reloadItems');
					// this.container.masonry('layout');

					// Inject Anime.js affect
					setTimeout(()=>{
						anime(this.animation);
						this.getEntries().removeClass('m-new');
					}, 350);
				})
			}, 315);
		}

		// Default
		if(!majax.params.data.catDrop) {
			// Debug
			console.log('Layout: Default');

			// Incert Data
			if(res.content){
				this.container.append(res.content);

				// If no more posts are left - hide "Load More" btn
				if( this.getEntriesAmount()==res.meta.posts_amount*1 ){
					jQuery(btnLoadMore).fadeOut(300);
				} else {
					jQuery(btnLoadMore).fadeIn(300);
				}
				// gallery.find('.drop-cats').prependTo(gallery);
			}

			this.container.imagesLoaded(()=>{
				// # Removed
				// ---------
				// this.container.masonry('reloadItems');
				// this.container.masonry('layout');

				// Inject Anime.js affect
				setTimeout(()=>{
					anime(this.animation);
					this.getEntries().removeClass('m-new');
				}, 350);
			})
		}
	},

	addCatDisableBtn: function(){
		// # Removed
		// ---------
		// var btnHtml = `
		// 	<li class="gallery_unit drop-cats m-unhvr">
		// 		<button class="btn-drop-cats" type="button">
		// 			<img src="`+ document.location.href.split('?')[0] +`/wp-content/themes/theme/custom/img/icon-arrow.svg" alt="">
		// 			<span class="drop-cats_txt">
		// 				All categories
		// 			</span>
		// 		</button>
		// 	</li>
		// `;
		// return btnHtml;
	}

}

/*
 * Filter Category
 */
majax.gallery.filterCategory = function(e){
	e.preventDefault();

	var
		el  = jQuery(e.target),
		cat = el.data('cat-id') *1;

	targetCats = this.getSpecificCategory(cat);
	excessCats = this.getEntries().not(targetCats);

	excessCats.fadeOut(300, ()=>{
		excessCats.remove();
	});
}

/*
 * Get Specific Category
 */
majax.gallery.getSpecificCategory = function(cat){
	var targetCats   = jQuery('');

	// Loop throw Entries
	this.getEntries().each((i,v)=>{
		var
			ths          = jQuery(v),
			entryCatsRaw = ths.find('.desc_cats a'),
			entryCats    = [];

		// Loop throw Cats
		entryCatsRaw.each((i, v)=>{
			entryCats.push( jQuery(v).data('cat-id') );
		});

		// Try to find necessary Cat
		entryCats.find((el)=>{

			if(el==cat) {
				targetCats = targetCats.add( jQuery(v) );
			}
		});
	});

	return targetCats;
}

/*
 * Get Exclude Posts Array
 */
majax.gallery.getExcludePostsArray = function(){
	var
		postsPresent = this.container.find(majax.gallery.itemClass+':visible'),
		postsExclude      = [];

	postsPresent.each((i,v)=>{
		ths = jQuery(v);
		id  = ths.data('post-id');

		postsExclude.push(id);
	});

	return postsExclude.join(',');
}

// Find out "Needed Posts" amout
majax.gallery.getCatNewNeededPostsAmount = function(cat){
	var
		postsAmount = majax.gallery.getSpecificCategory(cat).length,
		postsNeeded = 0;

	// Debug
	// console.log('Posts Amount: ' +postsAmount);

	if( postsAmount>majax.params.data.ppp ){
		postsRoundAmount = (postsAmount / majax.params.data.ppp) * majax.params.data.ppp;
		postsNeeded      = postsAmount - postsRoundAmount;

	} else if(postsAmount<=majax.params.data.ppp) {
		// console.log('Posts Amount are lover.');
		postsNeeded      = majax.params.data.ppp - postsAmount;
	}

	if(postsNeeded){
		majax.params.data.catNewNeededPosts = postsNeeded;
	}
}


/* ==============================
* Request
* ============================== */
majax.request = {
	// Request Paramethers
	request: function(callback, debug){
		// Debug
		if(debug){
			console.log( majax.params.data );
		}

		jQuery.post(
			majax.params.url,
			majax.params.data,
			callback
		);
	},
}

/*
 * Default Request (without Category)
 */
majax.request.requestSimple = function(){
	// Debug
	// console.log('Simple Request Begin');

	// Check Request Type
	if(majax.params.data.catId) return;

	// Setting Params
	majax.params.data.catId  = false;
	majax.params.data.catNew = false;
	majax.params.data.page  += 1;

	// Debug
	// console.log('Default Request');

	// Request..
	this.request( this.requestSimpleCallback, true );
}

majax.request.requestSimpleCallback = function(res){
	majax.gallery.layout(res);

	// Debug
	// console.log(res);
}

/*
 * Category Request - New Category
 */
majax.request.requestCategory = function(e){
	// Debug
	// console.log('Category Request Begin');

	e.preventDefault();

	var
		el  = jQuery(e.target),
		cat = el.data('cat-id') *1;

	// Setting Params
	majax.params.data.catId       = cat;
	majax.params.data.catNew      = true;
	majax.params.data.postExclude =
		majax.gallery.getExcludePostsArray();
	majax.params.data.page        = 1;

	// Find out "Needed Posts" amout
	majax.gallery.getCatNewNeededPostsAmount(cat);

	// Request..
	this.request( this.requestCategoryCallback, true );
}

majax.request.requestCategoryCallback = function(res){
	// Don't insert "Drop Cats" btn, if it already present
	if(jQuery('.drop-cats').length){
		majax.gallery.layout(res);
	} else {
		majax.gallery.layout(res, majax.gallery.addCatDisableBtn());
	}

	// Debug
	// console.log(res);

	// Reset Posts Exclude Array
	majax.params.data.postExclude       = [];
	majax.params.data.catNewNeededPosts = 0;
}

/*
 * Category Request - Load More
 */
majax.request.requestCategoryLoadMore = function(e){
	// Debug
	// console.log('Load More Category Request Begin');

	e.preventDefault();

	// Check Request Type
	if(!majax.params.data.catId) return;

	//Setting Params
	majax.params.data.page        = 1;
	majax.params.data.catNew      = false;
	majax.params.data.postExclude =
		majax.gallery.getExcludePostsArray();

	// Request..
	this.request( this.requestCategoryLoadMoreCallback, true );
}

majax.request.requestCategoryLoadMoreCallback = function(res){
	majax.gallery.layout(res);

	// Debug
	// console.log(res);

	// Reset Posts Exclude Array
	majax.params.data.postExclude = [];
}

/*
 * Category Request - Drop
 */
majax.request.requestCategoryDrop = function(e){
	// Debug
	// console.log('Drop Category Request Begin');

	// Setting Params
	majax.params.data.catDrop     = true;
	majax.params.data.page        = 1;
	majax.params.data.catId       = false;
	majax.params.data.catNew      = 0;
	majax.params.data.postExclude = [];

	// Request..
	this.request( this.requestCategoryDropCallback, true );
}

majax.request.requestCategoryDropCallback = function(res){
	majax.gallery.layout(res);

	// Debug
	// console.log(res);

	// Reset Params
	majax.params.data.catDrop = false;
}

/*
 * Get Query Variables
 */
majax.request.getQueryVars = function(variable){
	var
		query = window.location.search.substring(1),
		vars  = query.split("&");

	for( var i=0;i<vars.length;i++ ) {
		var pair = vars[i].split("=");
		if(pair[0] == variable){
			return pair[1];
		}
	}

	return(false);
}


/* ==============================
 * Params
 * ============================== */
majax.params = {
	url:     wpData.ajaxUrl,

	// Request Data Array
	data: {
		action: 'majax_load',

		ppp   : wpData.postAmount *1,
		page  : 1,

		catId       : false,
		catNew      : false,
		catNewNeededPosts: false,
		catDrop     : false,
		postExclude : [],
	}

}

/* ==============================
 * Handlers
 * ============================== */

// Category - Change
jQuery(document).on('click', majax.gallery.itemClass+' .desc_cats li a', majax.gallery.filterCategory.bind(majax.gallery) );
jQuery(document).on('click', majax.gallery.itemClass+' .desc_cats li a', majax.request.requestCategory.bind(majax.request) );

// Category - Load More
jQuery(document).on('click', '.btn-load-more', majax.request.requestSimple.bind(majax.request) );
jQuery(document).on('click', '.btn-load-more', majax.request.requestCategoryLoadMore.bind(majax.request) );

// Category - Drop
jQuery(document).on('click', majax.gallery.itemClass+'.drop-cats', majax.request.requestCategoryDrop.bind(majax.request) );

var queryParamCatId = majax.request.getQueryVars('cat_id');
if( queryParamCatId ){
	majax.params.data.catId = queryParamCatId;
}