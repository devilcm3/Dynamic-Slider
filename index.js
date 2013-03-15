$(document).ready(function(){
	$('#dynamicSlider').dynamicSlider();

});

(function($){

	var imageList = [];
	var settings = {
		thumbnailHeight: 0.15, //DEFAULT IS 15% THE HEIGHT
		thumbnailSlideDistance: "100%",
		thumbnailSlideSpeed: 'fast',
		animate:true,
		animateSpeed:2000,
	}
	var animateVar = {imgCount:0};

	var methods = {
		init: function(options){
			// DEFAULT SETTINGS FOR THE SLIDER
			settings = $.extend(settings,options);


			this.css('width',settings.width);

			// ADD NEW DIVS, SLIDER_DISPLAY FOR DISPLAYING IMAGE, TWO IMAGES WHICH IS USED TO ALTERNATE EACH OTHER, THUMBNAILS DIVS FOR CONTAINING THUMBNAILS.
			this.prepend(
				'<div id="slider_display"><img id="image_display" class="active"><img id="image_display_slave" class="inactive" style="display:none"></div>'+
				'<div id="slider_thumbnails"><a href="#" id="slider_button_left" class="slider_buttons" action="left"> </a><div></div><a href="#" id="slider_button_right" class="slider_buttons" action="right"> </a></div>'
			);

			this.children('img').each(function(index){
				// PUSH IMAGE DATA INTO IMAGELIST FOR FURTHER RETRIEVAL
				imageList[index] = { 
					'src':$(this).attr('src'), 
					'caption':$(this).attr('caption') 
				};
				$(this).attr('image_id',index);
			});


			// MOVE ALL CHILDREN INTO THE THUMBNAILS FOLDER
			this.children('img').remove().appendTo(this.find('#slider_thumbnails > div'));

			this.find('#image_display').attr('src',imageList[0].src);
			this.find('#image_display_slave').attr('src',imageList[1].src);



			this.find("#slider_thumbnails img:first").addClass('thumbnail_active');
			if(settings.animate){
				methods.startAnimate();
			}
			methods.initJqueryAction(this);

		},
		startAnimate: function(){
			animateVar.interval = setInterval(function(){
				var imageSrc = imageList[animateVar.imgCount].src;
				var nextImage = $('#slider_thumbnails img[image_id="'+animateVar.imgCount+'"]');
				methods.switchImage(nextImage);
				animateVar.imgCount++
				if(imageList[animateVar.imgCount] == undefined){
					animateVar.imgCount = 0;
				}

			},1000);
		},
		stopAnimate: function(){
			clearInterval(animateVar.interval);
		},
		initJqueryAction: function(elem){
			$(elem).find('.slider_buttons').click(function(){
				// IF LEFT OR RIGHT BUTTONS ARE CLICKED, INVOKE SLIDE FUNCTION
				methods.slideThumbnails($(this));
			});

			$(elem).find('#slider_thumbnails img').click(function(){
				// IF THUMBNAIL IMAGE IS CLICKED, DISPLAY IMAGE
				methods.switchImage($(this));
			});

			$(elem).find('#slider_thumbnails').hover(function(){
				// FADE IN SLIDER THUMBNAIL BUTTONS WHEN MOUSE IS HOVERING ABOVE THUMBNAILS
				$(this).children('.slider_buttons').fadeIn();
			},
			function(){
				// FADE IN SLIDER THUMBNAIL BUTTONS WHEN MOUSE IS HOVERING ABOVE THUMBNAILS
				$(this).children('.slider_buttons').fadeOut();
			});

			$(elem).find('#slider_display').hover(function(){
				methods.stopAnimate();
			},
			function(){
				methods.startAnimate();
			});
		},
		switchImage: function(elem){
			var img_id = elem.attr('image_id');
			$('#slider_thumbnails img').not(elem).removeClass('thumbnail_active');
			elem.addClass('thumbnail_active');
			image_active = $('#slider_display .active').attr('id');
			image_inactive = $('#slider_display .inactive').attr('id');
			if($('#slider_display .active').attr('src') != imageList[img_id].src){
				$('#slider_display .inactive').attr('src', imageList[img_id].src);
				$('#slider_display .inactive').fadeIn();
				$('#slider_display .active').fadeOut();
				$('img#'+image_inactive).removeClass('inactive').addClass('active');
				$('img#'+image_active).removeClass('active').addClass('inactive');
			}
		},
		slideThumbnails: function(slideButton){
			// GET PARENT DIV WIDTH (THE ONE THAT IS VISIBLE, EG:800PX)
			var thumbnailParentWidth = $('#slider_thumbnails').width();

			// GET CHILD DIV LEFT POSITION
			var thumbnailChildLeft = parseInt($('#slider_thumbnails > div').css('left'));

			// GET CHILD DIV WIDTH(THE ONE THAT IS PARTIALLY VISIBLE IF THE WIDTH IS LARGER THAN PARENT DIV, EG:1500PX, SO VISIBLE ONLY 800PX, THE REST IS OVERFLOW HIDDEN)
			var thumbnailChildWidth = $('#slider_thumbnails > div').width();

			// GET THE MAXIMUM PIXELS THE CHILD LEFT NEEDS TO MOVE BEFORE REACHING THE LAST THUMBNAIL
			var maxLeft = thumbnailParentWidth - thumbnailChildWidth;

			// GET THE BUTTON ACTION, EITHER LEFT OR RIGHT
			var slideAction = slideButton.attr('action');

			// HOW MANY PIXELS SHOULD THE CHILD DIV MOVE
			var moveVal;

			if(slideAction === 'left' && thumbnailChildLeft >= 0){
				// IF LEFT=0, MEANS CHILD DIV IS ON THE LEFT MOST POSITION (FIRST THUMBNAIL), HENCE DISABLING MOVE TO LEFT)
				return false;

			}else if(!(thumbnailChildLeft > maxLeft) && slideAction === 'right'){
				// IF LEFT=MAXIMUM, MEANS CHILD DIV IS ON THE RIGHT MOST POSITION (LAST THUMBNAIL), HENCE DISABLING MOVE TO RIGHT)
				return false;

			}else{
				switch(slideAction){
					case 'left':
						if(thumbnailParentWidth > Math.abs(thumbnailChildLeft)){
							// IF THE DISTANCE BETWEEN CURRENT POSITION AND THE FIRST THUMBNAIL POSITION IS LESS THAN THE WIDTH OF THE PARENT DIV, WILL MOVE TO FIRST THUMBNAIL POSITION DIRECTLY
							// EG: PARENT DIV:800PX , CURRENT LEFT:400PX.
							moveVal = '0px';

						}else{
							// OTHERWISE, MOVE TO THE LEFT ACCORDING TO THE SLIDE DISTANCE.
							// EG: PARENT DIV : 800PX , CURRENT LEFT : 1280PX.
							moveVal = '+='+settings.thumbnailSlideDistance;
						}
					break;
					case 'right':
						if( (thumbnailChildWidth - (thumbnailParentWidth + Math.abs(thumbnailChildLeft))) < thumbnailParentWidth ){
							// IF THE DISTANCE BETWEEN CURRENT POSITION AND THE LAST THUMBNAIL IS LESS THAN THE  WIDTH OF THE CHILD DIV, WILL MOVE TO THE LAST THUMBNAIL POSITION DIRECTLY.
							// HOW IT IS CALCULATED : MAXIMUM LEFT (1500PX)= CHILD DIV WIDTH (2300PX) - PARENT DIV WIDTH (800PX)
							// IF MAX LEFT (1500PX), CURRENT LEFT (1235PX) IS SMALLER THAN PARENT DIV WIDTH (800PX), THEN MOVE TO END.
							moveVal = -(thumbnailChildWidth - thumbnailParentWidth);
						}else{
							// OTHERWISE, MOVE TO THE RIGHT ACCORDING TO THE SLIDE DISTANCE
							// EG: MAX-LEFT (1500PX), CURRENT LEFT(300PX), PARENT DIV WIDTH(800PX)
							moveVal = '-='+settings.thumbnailSlideDistance;
						}
					break;
				}

				// ANIMATE THE SLIDE
				$('#slider_thumbnails > div').stop().animate({'left' : moveVal},settings.thumbnailSlideSpeed);
			}
		}
	}

	$.fn.dynamicSlider = function(method){
		if(methods[method]){
			// IF METHOD FOUND IN THE LIST, CALL THE METHOD, PASS THE ARGUMENTS
			return methods[method].apply(this, Array.prototype.slice.call(arguments,1));
		} else if(typeof method === 'object' || ! method){
			// IF METHOD ARGUMENT IS EMPTY, ASSUME USER INITIALIZING PLUGIN
			return methods.init.apply(this, arguments);
		} else {
			// OTHERWISE, METHOD NOT EXISTED
			$.error ( 'Method' + method + 'does not exist');
		}
	}
})(jQuery);