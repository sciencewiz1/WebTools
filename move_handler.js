//container - jquery object representing the div that will be allowed to be moved
//handle - jquery object representing the button or portion of the div that when clicked will initiate a 
//move operation, think of this as the point on the div where you can click and drag the div around
var MoveHandler = function(container, handle){

	//setup local variables
	//element generated around the drag-handle so that the mouse
	//movements are detected around the drag handle, indicating
	//where the note should be moved to. Think if this as a rectangle
	//around the grab handle that allows the grab handle to work
	var grab_region = undefined;
	
	
	//flag indicating whether a note is being moved
	var moving = false;
	
	//starting x and y (left and top) position/offset of the note prior to the move
	var xOffset = 0;
	var yOffset = 0;
	
	//mouse start coordinates
	var startX = 0;
	var startY = 0;
	
	//turns moving off if a movement operation
	//was in progress
	var reset = function(){
		if(moving === true){
			moving = false;
			container.removeClass("moving-outer");
			grab_region.remove();
		}
	};
	
	//event handler that initializes a movement operation
	//for a particular div
	var onMoveButtonMouseDown = function(e){
	
		// grab the mouse position
		startX = e.clientX;
		startY = e.clientY;

		// grab the clicked element's position
		xOffset = GetValue(container.css("left"));
		yOffset = GetValue(container.css("top"));
		
		grab_region = $(document.createElement("div"));
		grab_region.addClass("drag-region");
		container.append(grab_region);
		container.addClass("moving-outer");
		container.mousemove(onMouseMove);
		container.mouseup(onMouseUp);
		//set moving flag
		moving=true;
		
		//prevent default
		//e.preventDefault();
												
	};
	
	//mouse move event handler for
	//the grab region. The grab region is an 
	//element generated around the drag-handle so that the mouse
	//movements are detected around the drag handle, indicating
	//where the note should be moved to. Think if this as a rectangle
	//around the grab handle that allows the grab handle to work
	var onMouseMove = function(e){
						if(moving){
							// grab the mouse position
							currentX = e.clientX;
							currentY = e.clientY;
							container.css("left",xOffset+(currentX-startX));
							container.css("top",yOffset+(currentY-startY));
						}
					};
	//mouse up event handler for the drag handle that ends
	//a note move operation, the user let go of the note
	var onMouseUp = function(e){
						reset();
					};
					
	//sets up necessary event handler bindings
	var setUp = function(){
					handle.bind("mousedown",onMoveButtonMouseDown);
				};
	setUp();
	
	//could possibly extend this API so return empty
	//object for now
	var moveHandler = {};
	return moveHandler;
};