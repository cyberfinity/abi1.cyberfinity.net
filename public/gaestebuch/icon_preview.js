// Extra behaviour for Guestbook.
// Hides / unhides advanced controls
// Copyright 2006 James Nash.

// check for DOM capability
if( document.getElementById ){
	
	// wait for page to finish loading...
	window.onload = function(){

		// the icon selection list in the parent window
		iconSelector = window.opener.document.getElementById('gb-icon');

		if( window.location.search.indexOf('popup=1') != -1 ){
			// this is running in a pop-up window!
	
			var inputs = document.getElementsByTagName('input');
	
			for( var i = 0; i < inputs.length; ++i ){
				if( inputs[i].type.indexOf('image') != -1 ){
					// it's an icon preview button
					// add behaviour for changing icon selection in parent
					inputs[i].onclick = function(){
						// change icon selector
						iconSelector.value = this.value;
						// blink selector
						if( window.opener.blinkIconSelector ){
							window.opener.blinkIconSelector();
						}
						// close popup
						window.close();
						return false;
					}
				}
			}

		}// end if popup

	}// end onload function

}// end DOM is supporteds