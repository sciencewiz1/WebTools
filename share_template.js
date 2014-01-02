//javascript user with the search and share re-usable parital view in the views/templates folder
//element_id - integer representing the id of the element (on the server) to be shared
//container_base - represents the base string or prefix of the container names of the html
//objects in the share panel
//share_base_link - url where share request should be made (assume restful type link structure)
var SearchAndShare2 = function(element_id,container_base,share_base_link){

	//gets the share panel container and finds the necessary objects within the container
	var share_panel = $("div[data_id="+container_base+"-"+element_id+"-share-dialog]");
	var search_bar = share_panel.find(".share-dialog-add-users-input");
	var search_results = share_panel.find(".share-dialog-add-users-results-outer");
	var current_users = share_panel.find(".share-dialog-current-users-results");
	
	//internal data structure that holds the basic data the server needs to identify the user requesting the share, the 
	//element to be shared, and the search query (for user search)
	var basic_data_to_send = {element_id:GetValue(element_id),username:search_bar.val(),authenticity_token: window._token};
	var data_to_send = $.extend(true,{},basic_data_to_send);
	
	//sequence number counter needed for searching to avoid stale results from being
	//displayed after current results just because they were delayed in the network
	var seq_num = 0;
	
	//updates the data to send to the server to include the most recent search query string
	var update_data_to_send = function(){
		data_to_send.username = search_bar.val();
	};
	
	//resets the data to be sent to the server to defaults
	var reset_data_to_send = function(){
		data_to_send = basic_data_to_send;
	};
	
	//adds more data to be sent to the server to the data_to_send object
	var set_data_to_send = function(more_data){
		data_to_send = $.extend(basic_data_to_send,more_data);
	};
	
	//search click event handler
	var on_search_click = function(){
		update_data_to_send();
		if(data_to_send.username === ""){
			search_results.html("No results!");
			return;
		}
		//increment sequence number
		seq_num+=1
		current_num = seq_num;
		
		//make request to the server
		$.ajax({type:"POST", url:share_base_link+"search", data:data_to_send, dataType:"json"}).done(function(response){
			//only the most recent search query can update the UI
			if(current_num === seq_num){
				if($(response.data.users).length > 0){
					search_results.html(response.data.html);
					
					//handle the results of the search and set up the appropriate objects
					$.each(response.data.users,function(index, user){
						ShareNewUserV2(response.data.element.id, user.id,response.data.prefix,response.data.base_url);
					});
				}else{
					search_results.html("No results!");
				}
				seq_num = 0;
			}
		}).error(function(){
			alert("Could not get search results, please try again later!");
		});
	};
	//sets up the basic event handlers
	var setup_event_handlers = function(){
		search_bar.bind("keyup",on_search_click);
	};	
	
	//sets up everything
	var setup = function(){
		setup_event_handlers();
	};
	setup();

};
//represents a search results from searching for users to share the element with (new user to share element with)
//element_id - integer representing the id of the element (on the server) to be shared
//container_base - represents the base string or prefix of the container names of the html
//objects in the share panel
//share_base_link - url where share request should be made (assume restful type link structure)
var ShareNewUserV2 = function(element_id,user_id,container_base,share_base_link){
	//get the necessary objects within the container
	var current_users_container = $("table[data_id="+container_base+"-"+element_id+"-share-dialog-current-users-results]");
	var new_user_search_result = $("tr[data_id="+container_base+"-"+element_id+"-share-dialog-new-users-user-"+user_id+"]");
	var share_button = new_user_search_result.find(".share-dialog-new-users-share-button");
	
	//internal data structure that holds the basic data the server needs to identify the user requesting the share, the 
	//element to be shared, and the search query (for user search)
	var basic_data_to_send = {element_id:GetValue(element_id),user_id:GetValue(user_id),authenticity_token: window._token};
	var data_to_send = basic_data_to_send;
	
	//resets the data to be sent to the server to defaults
	var reset_data_to_send = function(){
		data_to_send = basic_data_to_send;
	};
	
	//adds more data to be sent to the server to the data_to_send object
	var set_data_to_send = function(more_data){
		data_to_send = $.extend(basic_data_to_send,more_data);
	};
	
	//sets callback for the container click event (when this objects container is clicked)
	//callback - function to be called when the event occurs
	var set_container_click_callback = function(callback){
		new_user_search_result.unbind("click");
		new_user_search_result.click(function(){
				callback({element_id:element_id,user_id:user_id},new_user_search_result)
			});
	};
	//causes this object's html object to disappear and be removed from the html page
	var trigger_move = function(){
		new_user_search_result.fadeOut(300, function(){$(this).remove();});
	};
	
	var on_share_click = function(){
		//updates data to send
		set_data_to_send({_method:"POST"});
		
		//makes a request to the server to share the element with the user specified in the search result
		$.ajax({type:"POST", url:share_base_link,data:data_to_send, dataType:"json"}).done(function(response){
			if(response.status === 1){
				//remove the search result
				new_user_search_result.fadeOut(300, function(){$(this).remove();});
				
				//add the new current share to the current share list
				current_users_container.append(response.data.html);
				
				//set up the event handlers for that new current share
				ShareCurrentUserV2(response.data.element.id,response.data.user.id,response.data.prefix,response.data.base_url, response.data.container_to_trigger_id,response.data.trigger_event);
			}else{
				alert(response.msg);
			}	
		}).error(function(){
			alert("Couldn't share!");
		});
	};
	//event handler setup
	var setup_event_handlers = function(){
					share_button.click(on_share_click);
				};				
	
	var setup = function(){
					setup_event_handlers();
				};
	setup();
};

//represents a current element share (user that the element is shared with)
//element_id - integer representing the id of the element (on the server) to be shared
//container_base - represents the base string or prefix of the container names of the html
//objects in the share panel
//share_base_link - url where share request should be made (assume restful type link structure)
//container_id_to_trigger - container that the event with name event_name will be triggered on
//event_name - event name for the remove event (this event is triggered when the current share is removed)
var ShareCurrentUserV2 = function(element_id,user_id,container_base,share_base_link, container_id_to_trigger, event_name){
	
	//Share types (matches share types on the server)
	var share_read_key = "Read";
	var share_read_and_write_key = "Write";
	
	//get the necessary objects within the container
	var current_users_container = $("table[data_id="+container_base+"-"+element_id+"-share-dialog-current-users-results]");
	var current_users_container_status =$("div[data_id="+container_base+"-"+element_id+"-share-dialog-current-users-results-status]");
	var current_element = $("tr[data_id="+container_base+"-"+element_id+"-share-dialog-current-users-user-"+user_id+"]");
	var remove_button = current_element.find(".remove-button")
	var selector = current_element.find(".share-dialog-current-user-access");
	var container_to_trigger =$("#"+container_id_to_trigger);
	
	//callback that is called when the current share is removed (the sharing permission is removed)
	var on_remove_click_callback = undefined;
	
	//sets the status message in the status container
	//msg - string representing the status
	var set_status = function(msg){
		current_users_container_status.html(msg);
	};
	
	//clears the status message in the status container
	//timeout - integer representing how long to wait before clearing the status (in milliseconds)
	var clear_status = function(timeout){
		setTimeout(function(){
			current_users_container_status.html("");
		},timeout);
	};
	
	//sets the on remove (when the sharing permission is removed) callback
	//callback - function to be called when the event occurs
	var set_on_remove_click_callback = function(callback){
		on_remove_click_callback = callback;
	};
	
	//causes this object's html object to disappear and be removed from the html page
	var trigger_remove = function(){
		current_element.fadeOut(300, function(){$(this).remove();});
		if(on_remove_click_callback !== undefined){
			on_remove_click_callback(response,current_element);
		}
	};
	
	//changes the permission type (read/write) of the current share permission
	var on_share_change = function(){
		set_status("Updating...");
		//make request to the server to change the permission type (read/write)
		$.ajax({type:"POST",url:share_base_link,data:{element_id:GetValue(element_id),user_id:GetValue(user_id),_method:"PUT",authenticity_token: window._token, access_level:selector.find("option:selected").text()},dataType:"json"}).done(function(response){
			if(response.status === 1){
				set_status("Update complete.");
			}else{
				alert("Failed to update permissions!");
			}
			clear_status(0);
		}).error(function(){
		});
	};	
	
	//removes the current share (revokes the permission)
	var on_remove_click = function(){
		$.ajax({type:"POST", url:share_base_link,data:{element_id:GetValue(element_id),user_id:GetValue(user_id),_method:"DELETE",authenticity_token: window._token},dataType:"json"}).done(function(response){
			if(response.status === 1){
				current_element.fadeOut(300, function(){$(this).remove();});
				container_to_trigger.trigger(event_name);
				if(on_remove_click_callback !== undefined){
					on_remove_click_callback(response,current_element);
				}
			}else{
				alert(response.error);
			}
		}).error(function(){
			alert("Could not remove user!");
		});
	};
	
	//event handler setup
	var setup_event_handlers = function(){
		remove_button.click(on_remove_click);
		selector.change(on_share_change);
	};	
	
	var setup = function(){
		setup_event_handlers();
	};
	setup();
};				