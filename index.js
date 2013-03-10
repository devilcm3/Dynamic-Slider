$(document).ready(function(){
	$('#dynamicSlider').dynamicSlider({
		
	});
});

(function($){

	var imageList = [];

	var methods = {
		init: function(options){
			// DEFAULT SETTINGS FOR THE SLIDER
			var settings = $.extend({
				thumbnailHeight: 0.15 //DEFAULT IS 15% THE HEIGHT
			},options);


			this.css('width',settings.width);

			// ADD NEW DIVS, SLIDER_DISPLAY FOR DISPLAYING IMAGE, THUMBNAILS FOR .. WELL, THUMBNAILS
			this.prepend(
				'<div id="slider_display"><img id="image_display" class="active"><img id="image_display_slave" class="inactive"></div>'+
				'<div id="slider_thumbnails"><a href="#" id="slider_button_left" class="slider_buttons" action="left"> </a><div></div><a href="#" id="slider_button_right" class="slider_buttons" action="right"> </a></div>'
			);

			this.children('img').each(function(){
				//SET THE MAX-HEIGHT ACCORDING TO THE LARGEST IMAGE, OR PREDEFINED OPTIONS
				if( settings.height && ($(this).height() > settings.height)){
					settings.height = $(this).height();
				}
				//RETRIEVE IMAGE DATA INTO IMAGELIST
				imageList.push({ 'source':$(this).attr('src'), 'caption':$(this).attr('caption') });
			});


			// MOVE ALL CHILDREN INTO THE THUMBNAILS FOLDER
			this.children('img').remove().appendTo(this.find('#slider_thumbnails > div'));

			this.imageDisplay = this.find('#image_display');
			this.imageDisplay.css({
				'max-width':settings.width
			});
			this.find('#image_display').attr('src',imageList[0].source);
			this.find('#image_display_slave').attr('src',imageList[1].source);

			this.find('.slider_buttons').click(function(){

				var thumbnailChildLeft = parseInt($('#slider_thumbnails > div').css('left'));
				var thumbnailChildWidth = $('#slider_thumbnails > div').width();
				var thumbnailParentWidth = $('#slider_thumbnails').width();
				var slideThreshold = (thumbnailParentWidth * 0.9) - thumbnailChildWidth;
				var slideAction = $(this).attr('action');
				var slideValue = '100%';

				console.log('left'+$('#slider_thumbnails > div').css('left'));
				if(slideAction === 'left' && thumbnailChildLeft >= 0){
					return false;
				}else if(!(thumbnailChildLeft > slideThreshold) && slideAction === 'right'){
					return false;
				}else{
					actionVal = '100%';
					console.log( $('#slider_thumbnails > div').css('left') );
					switch(slideAction){
						case 'left':
							if(thumbnailParentWidth > Math.abs(thumbnailChildLeft)){
								actionVal = '0px'
							}else{
								actionVal = '+='+slideValue;
							}
						break;
						case 'right':
							if( (thumbnailChildWidth - (thumbnailParentWidth + Math.abs(thumbnailChildLeft))) < thumbnailParentWidth ){
								actionVal = -(thumbnailChildWidth - thumbnailParentWidth);
							}else{
								actionVal = '-='+slideValue;
							}
						break;
					}
					$('#slider_thumbnails > div').stop().animate({'left' : actionVal},1000);
				}
			});

			this.find('#slider_thumbnails img').click(function(){
				srcValue = $(this).attr('src');
				image_active = $('#slider_display .active').attr('id');
				image_inactive = $('#slider_display .inactive').attr('id');
				if($('#slider_display .active').attr('src') != srcValue){
					$('#slider_display .inactive').attr('src',srcValue);
					$('#slider_display .inactive').fadeIn();
					$('#slider_display .active').fadeOut();
					$('img#'+image_inactive).removeClass('inactive').addClass('active');
					$('img#'+image_active).removeClass('active').addClass('inactive');
				}
			});

		},
		start: function(){
			
		},
		stop: function(){

		}
	}

	$.fn.dynamicSlider = function(method){
		if(methods[method]){
			return methods[method].apply(this, Array.prototype.slice.call(arguments,1));
		} else if(typeof method === 'object' || ! method){
			return methods.init.apply(this, arguments);
		} else {
			$.error ( 'Method' + method + 'does not exist');
		}
	}
})(jQuery);