// Extra behaviour for Guestbook.
// Hides / unhides advanced controls
// Copyright 2006 James Nash.

// helper function for blinking the icon drop-down list
var blinker;
var blinkToggle;
var j;
var iconListControl
var iconListColor;


function toggleIconListColor(){
	if( blinkToggle ){
		iconListControl.style.color = '#f00';
	}
	else{
		iconListControl.style.color = iconListColor;
	}
	blinkToggle ^= true;
	if( ++j >= 12 ){
		window.clearInterval( blinker );
	}
}

// blink element briefly to get user's attention
function blinkIconSelector(){
	if( blinker ){
		// stop any ongoing blinking
		window.clearInterval( blinker );
	}	
	blinkToggle = true;
	j = 0;
	blinker = window.setInterval('toggleIconListColor()', 100 );
}



// check for DOM capability
if( document.getElementById ){
	// for icon preview popup:
	var previewWindow;
	
	// wait for page to finish loading...
	window.onload = function(){

		// check for input form
		var form;
		if( form = document.getElementById('gb-entry-form') ){
			// form exists...

	// ================ ICON RADIO BUTTONS =========================================
	
			// add functionality to icon radio buttons
			var iconListRadio = document.getElementById('gb-icon-type-builtin');
			iconListControl = document.getElementById('gb-icon');
			var iconGravatarRadio = document.getElementById('gb-icon-type-gravatar');
			var iconGravatarControl = document.getElementById('gb-grav-email');

			iconListColor = iconListControl.style.color;

			// init to current state
			var iconRadioState = true; // true = icon, false = gravatar
			if( iconListRadio.checked ){
				// using builtin icons
				iconGravatarControl.disabled = true;
			}
			else{
				// using gravatars
				iconListControl.disabled = true;
				iconGravatarControl.disabled = false;
				iconRadioState = false;
			}

			iconListRadio.onclick = function(){
				// if selecting icon list, disable gravatar input
				iconListControl.disabled = false;
				iconGravatarControl.disabled = true;
				iconRadioState = true;
			};

			iconGravatarRadio.onclick = function(){
				// if selecting gravatar, disable icon list input
				iconListControl.disabled = true;
				iconGravatarControl.disabled = false;
				iconRadioState = false;
			};
			


	// ================ SHOW / HIDE ADVANCED CONTROLS ===============================


			// find advanced controls to show / hide
			var advancedControls = new Array();
			var basicControls = new Array();
			var formDds = form.getElementsByTagName('dd');
			for( var i = 0; i < formDds.length; ++i ){
				if( formDds[i].className.indexOf('advanced') != -1 ){
					advancedControls.push( formDds[i] );
				}
				if( formDds[i].className.indexOf('basic') != -1 ){
					basicControls.push( formDds[i] );
				}
			}

			
			// get pointers to root dt and dd for icon stuff
			var iconRootDt = document.getElementById('gb-icon-root-label');
			var iconRootDd = document.getElementById('gb-icon-root-controls');

			// make fake dt and dd and add them to list
			var iconFakeDt = document.createElement("dt");
			iconFakeDt.style.display = 'none';
			var iconFakeDd = document.createElement("dd");
			iconFakeDd.style.display = 'none';

			var formDl = iconRootDt.parentNode;
			formDl.insertBefore( iconFakeDt, iconRootDt ); // rootDt -> fakeDt, rootDt
			formDl.insertBefore( iconFakeDd, iconRootDt ); // fakeDt, rootDt -> fakeDt, fakeDd, rootDt
			

			// get pointers to icon selection list controls and label
			var iconListDd = iconListControl.parentNode;
			var iconListLabel = iconListDd.getElementsByTagName('label')[0];

			// ditto for gravatars
			var iconGravatarDd = iconGravatarControl.parentNode;
			var iconGravatarLabel = iconGravatarDd.getElementsByTagName('label')[0];


			// takes label and controls from inner list adds them
			// to outter list
			function promoteIconControls( label, dd ){
				iconFakeDt.appendChild( label );

				// insert fake dd as placeholder
				var ddParent = dd.parentNode;
				ddParent.insertBefore( iconFakeDd, dd );

				// move dd to where iconFakeDd was
				formDl.insertBefore( dd, iconRootDt );

				// add separator
				dd.className += " sep-after";

				// make promoted label visible
				iconFakeDt.style.display = 'block';
				// hide remaining advanced icon controls
				iconRootDt.style.display = "none";
				iconRootDd.style.display = "none";
			}

			// move previously promoted control back to its origin
			function demoteIconControls( dd ){
				// remove the " sep-after" bit from class
				dd.className = dd.className.substr( 0, (dd.className.length - 10) );
				
				// move icon dd back to inner list
				var ddParent = iconFakeDd.parentNode;
				ddParent.insertBefore( dd, iconFakeDd );

				// move fake dd back to outter list
				formDl.insertBefore( iconFakeDd, iconRootDt );

				// put label back into inner dd
				dd.insertBefore( iconFakeDt.firstChild, dd.firstChild );

				// hide fake dt
				iconFakeDt.style.display = 'none';
				// show advanced icon controls
				iconRootDt.style.display = "block";
				iconRootDd.style.display = "block";
			}
			
			
			function showAdvControls(){
				// show advanced controls!

				// demote the currently promoted icon control
				if( iconRadioState ){
					// builtin icons were promoted
					demoteIconControls( iconListDd );
				}
				else{
					// gravatars were promoted
					demoteIconControls( iconGravatarDd );
				}

				// remove the " sep-after" bit from class on basic controls
				for( var i = 0; i < basicControls.length; ++i ){
					basicControls[i].className = basicControls[i].className.substr( 0, (basicControls[i].className.length - 10) );
				}
				// hide other controls
				for( var i = 0; i < advancedControls.length; ++i ){
					advancedControls[i].style.display = 'block';
				}
			}

			function hideAdvControls(){
				// hide controls!

				// promote the currently promoted icon control
				if( iconRadioState ){
					// builtin icons were demoted
					promoteIconControls( iconListLabel, iconListDd );
				}
				else{
					// gravatars were demoted
					promoteIconControls( iconGravatarLabel, iconGravatarDd );
				}

				// hide other controls
				for( var i = 0; i < advancedControls.length; ++i ){
					advancedControls[i].style.display = 'none';
				}
				// add sep-after class to remaining basic controls
				for( var i = 0; i < basicControls.length; ++i ){
					basicControls[i].className += ' sep-after';
				}
			}



			// Generate button to toggle advanced controls on and off
			var advState = true;
			var advStateField = document.getElementById("gb-advanced");
			var advToggle = document.createElement("input");
			advToggle.type = "button";
			advToggle.value = "Extras verstecken";

			// initialise
			if( advStateField.value == 0 ){
				// disable advanced controls
				advState = false;
				hideAdvControls();
				advToggle.value = "Extras einblenden";
			}
			
			advToggle.onclick = function(){
				// figure out new state
				advState ^= true;
				if( advState ){
					showAdvControls();
					advStateField.value = 1;
					this.value = "Extras verstecken";
				}
				else{
					hideAdvControls();
					advStateField.value = 0;
					this.value = "Extras einblenden"
				}
			}

			// add toggle button to page
			document.getElementById('gb-submit-button').parentNode.appendChild( advToggle );


	// ================ COMMENT FONT PREVIEW ===============================

			// get comment box
			var commentBox = document.getElementById('gb-comment');
			var fontNormal = document.getElementById('gb-font-normal');
			var fontFixed = document.getElementById('gb-font-fixed');

			fontNormal.onclick = function(){
				// remove " monospace" from class
				commentBox.className = commentBox.className.substr( 0, commentBox.className.length - 10 );
			};

			fontFixed.onclick = function(){
				// add " monospace" from class
				commentBox.className += " monospace";
			};

			// init current state
			// (assumes that HTML does not include monospace class!)
			if( fontFixed.checked ){
				// fixed fonts selected
				commentBox.className += " monospace";
			}


	// ================ ICON PREVIEW BUTTON ===============================

			var previewButton = document.getElementById('gb-icon-preview');
			previewButton.onclick = function(){
				if( previewWindow && !previewWindow.closed ){
					// if the window is already open, just bring it to the foreground
					previewWindow.focus();
				}
				else{
					// open icon preview in popup
					previewWindow = window.open('./icons.php?popup=1','IconPreview','width=360,height=500,location=no,menubar=no,resizable=yes,scrollbars=yes,toolbar=no,status=yes');
				}
				// prevent form submission
				return false;
			}


		}// end jazzing up the form
	}// end onload function

	window.onunload = function(){
		if( previewWindow && !previewWindow.closed ){
			// if a preview popup was made close it when we leave the page
			previewWindow.close();
		}
	}// end onunload function
}// end DOM is supported