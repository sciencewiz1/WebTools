//javascript to manage overlays on which divs can be appended so that they can be moved
//One overlay per object
//around on the screen on top of other elements
//container - jquery object that represents the parent container of the overlay, where the overlay will be appended
var OverlayManager = function(container,close_event_name,close_event_callback){
	
	//main overlay container
	//this is set when the overlay is created
	var current_item_container_outer = undefined;
	
	//content container within overlay, any content put in the overlay will be placed
	//in this container
	//this is set when the overlay is created
	var current_item_container_inner = undefined;
	
	//instance of MoveHanlder that handles the movement operations on the main overlay container
	//this is set when the overlay is created
	var moveHandler = undefined;
	
	//set heights and widths
	//possibly allow this to be argument in later versions
	var height = "600px";
	var width = "600px";
	
	
	//returns true if the overlay is currently showing
	var is_created = function(){
		return current_item_container_outer !== undefined
	};
	
	//closes/hides the overlay
	var close_overlay_inner = function(e){
		if(e !== undefined){
			e.stopPropagation();
		}
		if(is_created()){
			current_item_container_outer.remove();
			current_item_container_outer = undefined;
			current_item_container_inner = undefined;
			close_button = undefined;
			
			//call on close callback
			if(close_event_callback !== undefined){
				close_event_callback();
			}
			
			//propagate close event to parent container
			$(container).trigger(close_event_name);
		}
	};
	//closes the overlay, this method is what is exposed via the API
	var close_overlay = function(){
		close_overlay_inner();
	}
	//generates a new button on the current_item_container_outer container that is used
	//to close the overlay
	var generate_close_button = function(){
		var close_button = $("<button>Close</button>");
		close_button.addClass("overlay-control-item");
		close_button.mousedown(close_overlay_inner);
		return close_button;
	};
	//creates a new overlay and regisers event handlers
	var create_overlay = function(){
	
		if(!is_created()){
			
			//create overlay divs
			current_item_container_outer = $("<div>");
			current_item_container_inner = $("<div>");
			
			//control bar is at the top of the overlay where the close button
			//and other overlay options are and can be used to move the overlay by clicking on it
			//and dragging
			var controlbar = $("<div>");
			
			//get the close button7
			var close_button = generate_close_button();
			
			//set up the control bar
			controlbar.addClass("overlay-control-bar");
			controlbar.append(close_button);
			
			//set up the overlay by appending appropraite components
			current_item_container_outer.append(controlbar);							
			current_item_container_outer.css("height",height);
			current_item_container_outer.css("width",width);
			current_item_container_outer.addClass("simple-overlay");
			current_item_container_outer.addClass("center");
			current_item_container_outer.on(close_event_name,close_overlay);
			current_item_container_outer.append(current_item_container_inner);
			
			//append the overlay to the container
			container.append(current_item_container_outer);
			
			//instantiate the MoveHandler for the overlay
			moveHandler = MoveHandler(current_item_container_outer,controlbar);
		}
	};
	//shows the overlay if it is already created
	var show_overlay = function(){
		if(is_created()){
			current_item_container_outer.fadeIn();
		}
	};
	//hides the overlay (remove it from view, does not close it) if the overlay is already created
	var hide_overlay = function(){
		if(is_created()){
			current_item_container_outer.fadeOut();
		}
	};
	//sets what function to call when the overlay is closed
	var set_close_event_callback=function(new_callback){
		close_event_callback = new_callback;
	};
	//loads html into the overlay, specifically it loads the 
	var load_html = function(html){
		if(is_created()){
			current_item_container_inner.html(html);
		}
	};
	//clears the html in the overlay
	var clear_overlay = function(){
		if(is_created()){
			current_item_container_inner.html("");
		}
	};
	//overlay object
	var overlay_manager = {
		create_overlay:create_overlay,
		load_html:load_html,
		is_created: is_created,
		set_close_event_callback:set_close_event_callback,
		close:close_overlay,
		show_overlay:show_overlay,
		hide_overlay:hide_overlay
	};
	return overlay_manager;
};
