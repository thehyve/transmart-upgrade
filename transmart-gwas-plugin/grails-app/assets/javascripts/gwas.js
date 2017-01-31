var REGION_DELIMITER = "^";

console.log("defining gwas.js");

//This function will kick off the webservice that generates the QQ plot.
function gwasLoadQQPlot(analysisID) {
	jQuery('#qqplot_results_' + analysisID).empty().addClass('ajaxloading');
	jQuery
			.ajax({
				"url" : gwasGetQQPlotURL,
				bDestroy : true,
				bServerSide : true,
				data : {
					analysisId : analysisID,
					pvalueCutoff : jQuery(
							'#analysis_results_table_' + analysisID + '_cutoff')
							.val(),
					search : jQuery(
							'#analysis_results_table_' + analysisID + '_search')
							.val()
				},
				"success" : function(json) {
					jQuery('#analysis_holder_' + analysisID).unmask();
					jQuery('#qqplot_results_' + analysisID).prepend(
							"<img src='" + json.imageURL + "' />").removeClass(
							'ajaxloading');
					jQuery('#qqplot_export_' + analysisID).attr('href',
							json.imageURL);
				},
				"error" : function(xhr) {
					jQuery('#qqplot_results_' + analysisID).append(
							xhr.responseText).removeClass('ajaxloading');
					jQuery('#analysis_holder_' + analysisID).unmask();
				},
				"dataType" : "json"
			});
}

//added by hari
//This  function loads Manhattan Plot
function gwasLoadManhattanPlot(analysisID) {
	jQuery('#manhattanplot_results_' + analysisID).empty().addClass('ajaxloading');
	jQuery
			.ajax({
				"url" : gwasGetManhattanPlotUrl,
				bDestroy : true,
				bServerSide : true,
				data : {
					analysisId : analysisID,
					pvalueCutoff : jQuery(
							'#analysis_results_table_' + analysisID + '_cutoff')
							.val(),
					search : jQuery(
							'#analysis_results_table_' + analysisID + '_search')
							.val()
				},
				"success" : function(json) {
					jQuery('#analysis_holder_' + analysisID).unmask();
					jQuery('#manhattanplot_results_' + analysisID).prepend(
							"<img src='" + json.imageURL + "' style='width:800px; height:500px;' />").removeClass(
							'ajaxloading');
					jQuery('#manhattanplot_export_' + analysisID).attr('href',
							json.imageURL);
				},
				"error" : function(xhr) {
					jQuery('#manhattanplot_results_' + analysisID).append(
							xhr.responseText).removeClass('ajaxloading');
					jQuery('#analysis_holder_' + analysisID).unmask();
				},
				"dataType" : "json"
			});
}

// This function will load the analysis data into a GRAILS template.
function gwasLoadAnalysisResultsGrid(analysisID, paramMap) {
	paramMap.analysisId = analysisID
	jQuery('#analysis_results_table_' + analysisID + '_wrapper').empty()
			.addClass('ajaxloading');
	jQuery.ajax({
		"url" : gwasGetAnalysisDataURL,
		bDestroy : true,
		bServerSide : true,
		data : paramMap,
		"success" : function(jqXHR) {
			jQuery('#analysis_holder_' + analysisID).unmask();
			jQuery('#analysis_results_table_' + analysisID + '_wrapper').html(
					jqXHR).removeClass('ajaxloading');
		},
		"error" : function(jqXHR, error, e) {
			jQuery('#analysis_results_table_' + analysisID + '_wrapper').html(
					jqXHR).removeClass('ajaxloading');
			jQuery('#analysis_holder_' + analysisID).unmask();
		},
		"dataType" : "html"
	});
}

//This function will load all filtered analysis data into a GRAILS template.
function gwasLoadTableResultsGrid(paramMap) {
	jQuery('#table-results-div').empty().addClass('ajaxloading');
	jQuery
			.ajax({
				"url" : gwasGetTableDataURL,
				bDestroy : true,
				bServerSide : true,
				data : paramMap,
				"success" : function(jqXHR) {
					jQuery('#table-results-div').html(jqXHR).removeClass(
							'ajaxloading');
				},
				"dataType" : "html"
			});
}

var plotOptionsDialog;

function gwasStartPlotter() {
	var selectedboxes = jQuery(".analysischeckbox:checked");
	if (selectedboxes.length == 0) {
		alert("No analyses are selected! Please select analyses to plot.");
	} else {
		var analysisIds = "";
		analysisIds += jQuery(selectedboxes[0]).attr('name');
		for ( var i = 1; i < selectedboxes.length; i++) {
			analysisIds += "," + jQuery(selectedboxes[i]).attr('name');
		}

		var snpSource = jQuery('#plotSnpSource').val();
		var geneSource = jQuery('#plotGeneSource').val();
		var pvalueCutoff = jQuery('#plotPvalueCutoff').val();

		window.location = gwasWebStartURL + "?analysisIds=" + analysisIds
				+ "&snpSource=" + snpSource
				+ "&geneSource=GRCh37&pvalueCutoff=" + pvalueCutoff;
		jQuery('#divPlotOptions').dialog("destroy");
	}
}

function gwasOpenPlotOptions() {
	var selectedboxes = jQuery(".analysischeckbox:checked");
	if (selectedboxes.length == 0) {
		alert("No analyses are selected! Please select analyses to plot.");
	} else {
		plotOptionsDialog && plotOptionsDialog.dialog("destroy");
		plotOptionsDialog = jQuery('#divPlotOptions').dialog({
			modal : false,
			height : 250,
			width : 400,
			title : "Manhattan Plot Options",
			show : 'fade',
			hide : 'fade',
			resizable : false,
			buttons : {
				"Plot" : gwasStartPlotter
			}
		});
	}
}

//After the user clicks select on the popup we need to add the search terms to the filter.
function gwasApplyPopupFiltersStudy()
{
	//Loop through all the selected items.
	jQuery("#multiselectbox :selected").each(function(i, selected){
	
		//Add each item to the search parameters object.
		var searchParam={id:selected.value,
		        display:'Study',
		        keyword:selected.text,
		        category:'STUDY_ID'};
		
		gwasAddSearchTerm(searchParam);
		
	})
	
	//This destroys our popup window.
	jQuery(this).dialog("destroy")
}

function gwasApplyPopupFiltersAnalyses()
{
	//Loop through all the selected items.
	jQuery("#multiselectbox :selected").each(function(i, selected){
	
		//Add each item to the search parameters object.
		var searchParam={id:selected.value,
		        display:'Analyses',
		        keyword:selected.text,
		        category:'ANALYSIS_ID'};
		
		gwasAddSearchTerm(searchParam);
		
	})
	
	//This destroys our popup window.
	jQuery(this).dialog("destroy")
}

function gwasApplyPopupFiltersRegions() {
	//Pick out the useful fields and generate search terms

	var range = null;
	var basePairs = null;
	var version = null;
	var searchString = "";
	var text = "";
	var pValue = jQuery('#pValue').val();
	if (jQuery('[name=\'regionFilter\'][value=\'gene\']:checked').size() > 0) {
		jQuery("#filterGeneId :selected").each(
				function(i, selected) {
					var geneId = selected.value

					var geneName = selected.text;
					range = jQuery('#filterGeneRange').val();
					basePairs = jQuery('#filterGeneBasePairs').val();
					basePairs = basePairs.replace(",", "");

					if (basePairs == null || basePairs == "") {
						basePairs = 0;
					}

					use = jQuery('#filterGeneUse').val();
					searchString = "GENE" + REGION_DELIMITER + geneId

					text = "HG" + use + " " + geneName + " "
							+ gwasGetRangeSymbol(range) + " " + basePairs;

					searchString += REGION_DELIMITER + range + REGION_DELIMITER
							+ basePairs + REGION_DELIMITER + use;

					var searchParam = {
						id : searchString,
						display : 'Region',
						keyword : searchString,
						category : 'REGION',
						text : text
					};

					gwasAddSearchTerm(searchParam, true);
				});
		//This destroys our popup window.
		gwasUpdateSearch();
		jQuery(this).dialog("destroy");
	} else if (jQuery('[name=\'regionFilter\'][value=\'chromosome\']:checked')
			.size() > 0) {
		range = jQuery('#filterChromosomeRange').val();
		basePairs = jQuery('#filterChromosomeBasePairs').val();
		if (basePairs == null || basePairs == "") {
			basePairs = 0;
		}
		basePairs = basePairs.replace(",", "");
		var whitespace = " ";
		// Issue with following couldn't be recognized as number.
		//if ((basePairs.match(/^[0-9]+\.[0-9]+$/) ||basePairs.match(/^[0-9]$/) || basePairs.match(/^\.[0-9]+$/)) && (basePairs.indexOf(whitespace) < 0)) {
		if ((basePairs.match(/^-{0,1}\d*\.{0,1}\d+$/))
				&& (basePairs.indexOf(whitespace) < 0)) {
			use = jQuery('#filterChromosomeUse').val();
			var chromNum = jQuery('#filterChromosomeNumber').val();
			var pos = jQuery('#filterChromosomePosition').val();
			if (pos == null || pos == "") {
				pos = 0;
			}

			searchString += "CHROMOSOME" + REGION_DELIMITER + chromNum
					+ REGION_DELIMITER + use + REGION_DELIMITER + pos;

			if (pos != 0 && range != 0) {
				text = "HG" + use + " chromosome " + chromNum + " position "
						+ pos + " " + gwasGetRangeSymbol(range) + " " + basePairs;
			} else {
				text = "HG" + use + " chromosome " + chromNum;
			}

			searchString += REGION_DELIMITER + range + REGION_DELIMITER
					+ basePairs + REGION_DELIMITER + use;

			var searchParam = {
				id : searchString,
				display : 'Region',
				keyword : searchString,
				category : 'REGION',
				text : text
			};

			gwasAddSearchTerm(searchParam);

			//This destroys our popup window.
			jQuery(this).dialog("destroy");
		} else {
			alert("Please enter numeric basepair value");
		}
	} else {
		alert("Please enter numeric basepair value");
	}
	var whitespace = " "
	if (pValue != "") {
		if ((pValue.match(/^[0-9]+\.[0-9]+$/) || pValue.match(/^[0-9]$/) || pValue
				.match(/^\.[0-9]+$/))
				&& (pValue.indexOf(whitespace) < 0)) {
			var searchParam = {
				id : 'PVALUE' + REGION_DELIMITER + pValue,
				display : 'PVALUE',
				keyword : 'PVALUE' + REGION_DELIMITER + pValue,
				category : 'PVALUE',
				text : pValue
			};
			gwasAddSearchTerm(searchParam);
			jQuery(this).dialog("destroy");
		}
		//This destroys our popup window.
		else {
			alert("Please enter numeric P-value")
		}
		;
	}

}

function gwasApplyPopupFiltersEqtlTranscriptGene() {
	jQuery("#filterEqtlTranscriptGeneId :selected").each(function(i, selected) {
		var geneId = selected.value
		var geneName = selected.text;

		var searchParam = {
			id : geneName,
			display : 'Transcript Gene',
			keyword : geneName,
			category : 'TRANSCRIPTGENE',
			text : geneName
		};

		gwasAddSearchTerm(searchParam, true);

	});
	var searchParamEQTL = {
		id : 'EQTL',
		display : 'Data Types',
		keyword : 'eQTL',
		category : 'DATA_TYPE'
	};

	gwasAddSearchTerm(searchParamEQTL, true);

	jQuery(this).dialog("destroy");
	gwasUpdateSearch();
}

function gwasApplyPopupFiltersDataTypes()
{
	//Loop through all the selected items.
	jQuery("#multiselectbox :selected").each(function(i, selected){
	
		//Add each item to the search parameters object.
		var searchParam={id:selected.value,
		        display:'Data Types',
		        keyword:selected.text,
		        category:'DATA_TYPE'};
		
		gwasAddSearchTerm(searchParam);
		
	})
	
	//This destroys our popup window.
	jQuery(this).dialog("destroy")
}

function gwasGetRangeSymbol(string) {

	if (string == 'both') {
		return "+/-";
	} else if (string == 'plus') {
		return "+";
	} else if (string == 'minus') {
		return "-";
	}
}


//jQuery(document).ready(function() {
//
//    console.log('GWAS Plugin Present');
//
//    popupWindowPropertiesMap['Region of Interest'] = {
//	'URLToUse' : regionBrowseWindow,
//	'filteringFunction' : gwasApplyPopupFiltersRegions,
//	'dialogHeight' : 450,
//	'dialogWidth' : 900
//    }
//    popupWindowPropertiesMap Transcript Gene'] = {
//	'URLToUse' : eqtlTranscriptGeneWindow,
//	'filteringFunction' : gwasApplyPopupFiltersEqtlTranscriptGene
//    }
//});

// Adding rwg.js script
////////////////////////////////////////////////////////////////////
//Globals
//Delimiter we're expecting between search fields
var SEARCH_DELIMITER = ";"

//Store the current search terms in an array in format ("category display|category:term") where category display is the display term i.e. Gene, Disease, etc.
var currentCategories = new Array();
var currentSearchTerms = new Array(); 

//Store the nodes that were selected before a new node was selected, so that we can compare to the nodes that are selected after.  Selecting
//one node in the tree can cause lots of changes in other parts of the tree (copies of this node change, children/parents change, 
//parents of parents, children of parents of parent, etc.)
var nodesBeforeSelect = new Array();

//By default, allow the onSelect event to trigger for the tree nodes;  However, we don't want select events that are triggered from inside the onSelect
//event to cause the onSelectEvent code to keep triggering itself.  So change this to false before any call to select() within the onSelect (the event
//will still fire but is stopped immediately); and set this flag back to true at the end of the event so it can be triggered again.  
var allowOnSelectEvent = true;

//store probe Ids for each analysis that has been loaded
var analysisProbeIds = new Array();

var openAnalyses = new Array(); //store the IDs of the analyses that are open

var dataCategoryNames = ['GENE', 'PATHWAY', 'GENELIST', 'GENESIG', 'REGION', 'TRANSCRIPTGENE', 'PVALUE'];

//create an ajaxmanager named rwgAJAXManager
//this will handle all ajax calls on this page and prevent too many 
//requests from hitting the server at once
var gwasAJAXManager = jQuery.manageAjax.create('gwasAJAXManager', {
	queue: true, 			//(true|false|'clear') the queue-type specifies the queue-behaviour.
	maxRequests: 5, 		//(number (1)) limits the number of simultaneous request in the queue. queue-option must be true or 'clear'.
	cacheResponse: false 	//(true|false): caches the response data of successful response
});

var cohortBGColors = new Array(
		/*
		"#F5A9E1",  // light pink
		"#00FFFF",  // light blue
		"#FE9A2E",  // light orange
		"#BDBDBD",  // light grey
		"#2EFE2E",  // light green
		"#FF00FF",   // pink
		"#F3F781"  // light yellow
	*/
		
		/* Pastel */
		"#FFFFD9", //light yellow
		"#80B1D3", //light blue
		"#B3DE69", //moss green
		"#D9D9D9", //grey
		"#BC80BD", //lavender
		"#91d4c5"  //teal

		
		/*Light yellow to green, sequential 
		"#FFFFE5",
		"#F7FCB9",
		"#D9F0A3",
		"#ADDD8E",
		"#78C679",
		"#41AB5D",
		"#238443",
		"#006837"
		*/
		
);


////////////////////////////////////////////////////////////////////
//Not in the July 2012 Release
////////////////////////////////////////////////////////////////////
/*function gwasUpdateAnalysisCount(checkedState)	{	
	var currentCount = jQuery("#analysisCount").val();
	if (checkedState)	{
		currentCount++;
	} else	{
		currentCount--;
	}
	jQuery("#analysisCount").val(currentCount);
	var newLabel = currentCount + " Analyses Selected";
	if (currentCount == 0)	{
		newLabel = "No Analysis Selected";
	} else if (currentCount == 1)	{
		newLabel = "1 Analysis Selected";
	}
	jQuery("#analysisCountLabel").html(newLabel);
	return false;
}
*/
////////////////////////////////////////////////////////////////////
function gwasShowDetailDialog(dataURL, dialogTitle, dialogHeight)	{
	//var height = 'auto';
	var wHeight = jQuery(window).height();
	var height =wHeight *0.8;
	if (typeof dialogHeight == 'number')	{
		height = dialogHeight;
	}	
	//dialogTitle += ' --Esc key to close--'; -- removed this to provide more space in title bar
	var dialogDetail = document.getElementById(dialogTitle);
	if (dialogDetail == null)	{
		jQuery('<div id="' + dialogTitle + '"></div>')
			.load(dataURL)
			.dialog({
				autoOpen: false,
				title: dialogTitle,
				height: height,
				width: 550,
				position: "top"
			})
			.dialog('open');
	} else	{
		jQuery(dialogDetail).dialog('isOpen') ? jQuery(dialogDetail).dialog('close') : jQuery(dialogDetail).dialog('open');		
	}
	return false;
}

//Open and close the analysis for a given trial
function gwasToggleDetailDiv(trialNumber, dataURL)	{
 var imgExpand = "#imgExpand_"  + trialNumber;
 var trialDetail = "#" + trialNumber + "_detail";

 // If data attribute is undefined then this is the first time opening the div, load the analysis...
 if (typeof jQuery(trialDetail).attr('data') == 'undefined')	{
     var src = jQuery(imgExpand).attr('src').replace('../images/down_arrow_small2.png', '../images/ajax-loader-flat.gif');
     jQuery(imgExpand).attr('src',src);
     jQuery.ajax({
         url:dataURL,
         success: function(response) {
             jQuery(imgExpand).attr('src', jQuery(imgExpand).attr('src').replace('../images/ajax-loader-flat.gif', '../images/up_arrow_small2.png'));
             jQuery(trialDetail).addClass("gtb1");
             jQuery(trialDetail).html(response);
             jQuery(trialDetail).addClass("analysesopen");
             jQuery(trialDetail).attr('data', true);// Add an attribute that we will use as a flag so we don't need to load the data multiple times
         },
         error: function(xhr) {
             console.log('Error!  Status = ' + xhr.status + xhr.statusText);
         }
     });
 } else	{
     var src = jQuery(imgExpand).attr('src').replace('../images/up_arrow_small2.png', '../images/down_arrow_small2.png');
     if (jQuery(trialDetail).attr('data') == "true")	{
         jQuery(trialDetail).attr('data',false);
         jQuery(trialDetail).removeClass("analysesopen");
     } else	{
         src = jQuery(imgExpand).attr('src').replace('../images/down_arrow_small2.png', '../images/up_arrow_small2.png');
         jQuery(trialDetail).attr('data',true);
         jQuery(trialDetail).addClass("analysesopen");
     }
     jQuery(imgExpand).attr('src',src);
     jQuery(trialDetail).toggle();
 }
 return false;
}

//Method to add the toggle button to show/hide the search filters
function gwasAddToggleButton()	{
	jQuery("#toggle-btn").button({
		text: false
		}).click(function() {
			gwasToggleFilters();
			jQuery("#main").css('left') == "0px" ? gwasSwitchImage('toggle-icon-left', 'toggle-icon-right') : gwasSwitchImage('toggle-icon-right', 'toggle-icon-left');
		}
	).addClass('toggle-icon-left');
	return false;
}

//Add and remove the right/left image for the toggle button
function gwasSwitchImage(imgToRemove, imgToAdd)	{
	jQuery("#toggle-btn").removeClass(imgToRemove);
	jQuery("#toggle-btn").addClass(imgToAdd);
}

//Method to show/hide the search/filters 
function gwasToggleFilters()	{
	if (jQuery("#main").css('left') == "0px"){		
		jQuery("#search-categories").attr('style', 'visibility:visible; display:inline');
		jQuery("#search-ac").attr('style', 'visibility:visible; display:inline');
		jQuery("#search-div").attr('style', 'visibility:visible; display:inline');
		jQuery("#active-search-div").attr('style', 'visibility:visible; display:inline');
		jQuery("#title-search-div").attr('style', 'visibility:visible; display:inline');
		jQuery("#title-filter").attr('style', 'visibility:visible; display:inline');
		jQuery("#side-scroll").attr('style', 'visibility:visible; display:inline');
		jQuery("#main").css('left', 300);
		jQuery("#toggle-btn").css('left', 0);
		jQuery("#toggle-btn").css('height;', 20);
		jQuery("#main").css('padding-left', 0);	
		jQuery("#menu_bar").css('margin-left', -1);
		jQuery("#toggle-btn").css('height', 20);	
	} else	{
		jQuery("#search-categories").attr('style', 'visibility:hidden; display:none');
		jQuery("#search-ac").attr('style', 'visibility:hidden; display:none');
		jQuery("#search-div").attr('style', 'visibility:hidden; display:none');
		jQuery("#active-search-div").attr('style', 'visibility:hidden; display:none');
		jQuery("#title-search-div").attr('style', 'visibility:hidden; display:none');
		jQuery("#title-filter").attr('style', 'visibility:hidden; display:none');
		jQuery("#side-scroll").attr('style', 'visibility:hidden; display:none');
		jQuery("#main").css('left', 0);	
		jQuery("#toggle-btn").css('left', 0);	
		jQuery("#toggle-btn").css('height', '100%');	
		jQuery("#main").css('padding-left', 20);	
		jQuery("#menu_bar").css('margin-left', -21);	
	}	   
}

//Method to add the categories for the select box
function gwasAddSelectCategories()	{
	jQuery("#search-categories").append(jQuery("<option></option>").attr("value", "ALL").text("All"));
	jQuery.getJSON(gwasGetCategoriesURL, function(json) {
		for (var i=0; i<json.length; i++)	{
			var category = json[i].category;
			var catText = gwasConvertCategory(category);
			jQuery("#search-categories").append(jQuery("<option></option>").attr("value", category).text(catText));
		}
 });
}

//Helper method to only capitalize the first letter of each word
function gwasConvertCategory(valueToConvert)	{
	var convertedValue = valueToConvert.toLowerCase();
	return convertedValue.slice(0,1).toUpperCase() + convertedValue.slice(1);
}

//Method to add the autocomplete for the search keywords
function gwasAddSearchAutoComplete()	{
	jQuery("#search-ac").autocomplete({
		source: gwasSourceURL,
		minLength:2,
		select: function(event, ui) { 
			if (ui.item.categoryId == 'DATA_TYPE') {
				searchParam={id:ui.item.label, display: 'Data Types', keyword:ui.item.label,category:ui.item.categoryId};
			}
			else {
				searchParam={id:ui.item.id,display:ui.item.category,keyword:ui.item.label,category:ui.item.categoryId};
			}
			gwasAddSearchTerm(searchParam);
			return false;
		}
	}).data("uiAutocomplete")._renderItem = function( ul, item ) {
		return jQuery('<li></li>')		
		  .data("item.uiAutocomplete", item )
		  .append('<a><span class="category-' + item.category.toLowerCase() + '">' + item.category + '&gt;</span>&nbsp;<b>' + item.label + '</b>&nbsp;' + item.synonyms + '</a>')
		  .appendTo(ul);
	};	
		
	// Add an onchange event to the select so we can set the category in the URL for the autocomplete
	var categorySelect = document.getElementById("search-categories"); 
	categorySelect.onchange=function()	{
		jQuery('#search-ac').autocomplete('option', 'source', gwasSourceURL + "?category=" + this.options[this.selectedIndex].value);
	};
		
	// Capture the enter key on the slider and fire off the search event on the autocomplete
	jQuery("#search-categories").keypress(function(event)	{
		if (event.which == 13)	{
			jQuery("#search-ac").autocomplete('search');
		}
	});
 jQuery("#search-ac").keypress(function(event)	{
     if (event.which == 13)	{
         var content = gwasSanitizeText(jQuery('#search-ac').val());
         gwasAddSearchTerm({id:content,display:'Text',keyword:content,category:'text'});
         jQuery('#search-ac').val('');
     }
 });
	return false;
}

function gwasSanitizeText(text) {
 return (text.replace(/"/g, ''))
}



function gwasShowIEWarningMsg(){
	
	if (jQuery.browser.msie && jQuery.browser.version.substr(0,1)<9) {

	    var msg = "<div id='IEwarningBox'>Your browser is not supported. Please use the latest version of Chrome. <br /><br />";
	    msg = msg + "<a href='#' id='IEwarningOverlayLink'>More info</a> | <a href='#' onclick=\"javascript:jQuery('#IEwarningBox').slideUp('fast');\">Close</a> </div>";

	    var overlayMsg = "<div style='padding:20px'><p>TranSMART uses certain web technologies that are not fully supported by older browsers. ";
	    overlayMsg = overlayMsg + "Google Chrome is the preferred browser within to use with tranSMART. </p>";

	    jQuery('#results-div').before(msg);

	    jQuery("#IEwarningOverlayLink").colorbox({html:overlayMsg, width:"50%", height:"300px", opacity:"0.75"});
	}
	
}


	
//Method to load the search results in the search results panel and facet counts into tree
//This occurs whenever a user add/removes a search term
function gwasShowSearchResults(tabToShow)	{

	// clear stored probe Ids for each analysis
	analysisProbeIds = new Array();  
	
	// clear stored analysis results
	jQuery('body').removeData();
	
	jQuery('#results-div').empty();
	jQuery('#table-results-div').empty();
	
	jQuery('#analysisViewHelp').hide();
	jQuery('#tableViewHelp').hide();
	jQuery('#' + tabToShow + 'ViewHelp').show();
	
	// work out which tab is open and needs updating, if we don't have a specific one
	if (tabToShow == null) {
		if (jQuery('#analysisViewTab.ui-state-active').size() > 0) {
			tabToShow = 'analysis'
		}
		else {
			tabToShow = 'table'
		}
	}
	
    console.log('gwas gwasShowSearchResults tab'+tabToShow);
	// call method which retrieves facet counts and search results
	gwasShowFacetResults(tabToShow);
	
	//all analyses will be closed when doing a new search, so clear this array
	openAnalyses = [];

}

//update a node's count (not including children)
function gwasUpdateNodeIndividualFacetCount(node, count) {
	// only add facet counts if not a category 
	if (!node.data.isCategory)   {
		// if count is passed in as -1, reset the facet count to the initial facet count
		if (count > -1)  {
	        node.data.facetCount = count;
	    }
	    else  {
	    	node.data.facetCount = node.data.initialFacetCount
	    }
	    node.data.title = node.data.termName + " (" + node.data.facetCount + ")";	
	}
	else  {
	    node.data.facetCount = -1;
	    node.data.title = node.data.termName;	
	}
}


//Method to clear the facet results in the search tree
function gwasClearFacetResults()	{
    console.log('gwasClearFacetResults: getTree')
	jQuery("#gwas-filter-div").dynatree();
	var tree = jQuery("#gwas-filter-div").dynatree("getTree");
	
	// clear counts from tree
	tree.visit(  function(node) {
		           if (!node.data.isCategory)  {
		        	   gwasUpdateNodeIndividualFacetCount(node, -1);   		        	    
		           }
		           
	             }
              , false
            );
		
	 // redraw entire tree after counts updated
	 tree.redraw();
}


//Method to load the facet results in the search tree and populate search results panel
function gwasShowFacetResults(tabToShow)	{
	
    console.log('gwas showFacetResults');
	var savedSearchTermsArray;
	var savedSearchTerms;
	
	if (currentSearchTerms.toString() == '')
		{
			savedSearchTermsArray = new Array();
			savedSearchTerms = '';
		
		}
	else
		{
		savedSearchTerms = currentSearchTerms.join(",,,");
		savedSearchTermsArray = savedSearchTerms.split(",,,");
		}


	
	// Generate list of categories/terms to send to facet search
	// create a string to send into the facet search, in form Cat1:Term1,Term2&Cat2:Term3,Term4,Term5&...

	var facetSearch = new Array();   // will be an array of strings "Cat1:Term1|Term2", "Cat2:Term3", ...   
	var categories = new Array();    // will be an array of categories "Cat1","Cat2"
	var terms = new Array();         // will be an array of strings "Term1|Term2", "Term3"

	// first, loop through each term and add categories and terms to respective arrays 		
 for (var i=0; i<savedSearchTermsArray.length; i++)	{
		var fields = savedSearchTermsArray[i].split(SEARCH_DELIMITER);
		// search terms are in format <Category Display>|<Category>:<Search term display>:<Search term id>
		var termId = fields[2]; 
		var categoryFields = fields[0].split("|");
		var category = categoryFields[1].replace(" ", "_");   // replace any spaces with underscores (these will then match the SOLR field names) 
		
		var categoryIndex = categories.indexOf(category);

		// if category not in array yet, add category and term to their respective array, else just append term to proper spot in its array
		if (categoryIndex == -1)  {
		    categories.push(category);
		    terms.push(termId);
		}
		else  {
		    terms[categoryIndex] = terms[categoryIndex] + "|" + termId; 			
		}
	}
 
    console.log('gwasShowFacetResults: getTree')
	jQuery("#gwas-filter-div").dynatree();
	var tree = jQuery("#gwas-filter-div").dynatree("getTree");

	// create an array of the categories that come from the tree
	var treeCategories = new Array();
	tree.visit(  function(node) {
     if (node.data.isCategory)  {
  	   var categoryName = node.data.categoryName.split("|");
  	   var cat = categoryName[1].replace(/ /g, "_");
  	   
  	   treeCategories.push(cat);        	    
     }
   }
   , false
 );

 // now construct the facetSearch array by concatenating the values from the cats and terms array
 for (var i=0; i<categories.length; i++)	{
 	var queryType = "";
 	
 	// determine if category is part of the tree; differentiate these types of query categories
 	// from others
 	if (treeCategories.indexOf(categories[i])>-1) {
 		queryType = "fq";
 	}
 	else  {
 		queryType = "q";
 	}
 	facetSearch.push(queryType + "=" + categories[i] + SEARCH_DELIMITER + terms[i]);
 }

 // now add all tree categories that aren't being searched on to the string
 for (var i=0; i<treeCategories.length; i++)  {
 	if (categories.indexOf(treeCategories[i])==-1)  {
 		queryType = "ff";
     	facetSearch.push(queryType + "=" + treeCategories[i]);
 	}
 }    
 
 //display loading message. Note: because the contents of the 'results-div' is replaced,
 //there is no need to 'unmask' the loading message
	jQuery("#results-div").mask("Loading..."); 
 
 // add study id to list of fields to facet (so we can get count for show search results)
 facetSearch.push("ff=STUDY_ID");
 
 var queryString = facetSearch.join("&");
 
 //Show significant results is disabled
	//queryString = queryString + "&showSignificantResults=" + document.getElementById('cbShowSignificantResults').checked
 
	//Only do one of these depending on the highlighted tab. If the table results div is hidden, do the tree view
 if (tabToShow == "analysis") {
 	jQuery.ajax({
			url:gwasFacetResultsURL,
			data:queryString,
			success: function(response) {
				

					var facetCounts = response['facetCounts'];
					var html = response['html'];
					
					// set html for results panel
					//document.getElementById('results-div').innerHTML = html;
					
					jQuery('#results-div').html(html);

					// assign counts that were returned in json object to the tree
					tree.visit(  function(node) {
						           if (!node.data.isCategory && node.data.id)  {
						        	   var id = node.data.id.toString();
						        	   var catFields = node.data.categoryName.split("|")
						        	   var cat = catFields[1].replace(" ","_");
						        	   //var catArray = response[cat];
						        	   var catArray = facetCounts[cat];
						        	   var count = catArray[id];
						        	   
						        	   // no count returned for this node means it isn't in solr index because no records exist
						        	   if (!count)  {
						        		   count = 0;
						        	   }
						        	   
						        	   gwasUpdateNodeIndividualFacetCount(node, count);   
						           }
					             }
				                 , false
				               );
										
					 // redraw entire tree after counts updated
					 tree.redraw();
				//}

			},
			error: function(xhr) {

		// this is a bit bogus - but the problem is that the Jquery request is returning the HTML for the display
                // an uncomfortable mix of data and rendering - so rather then send an error as a JSON status return
                // it is being signaled by a 500 error status and a Grails-generated error page.
                // but if the error page contains the string 'solrConnection' (which is most likely the case)
                // then the probablity is high that SOLR is not running on the server.

		var html = xhr['responseText'];
                var userMessage = "Unknown server error - data loading failed"
                if (html.indexOf("solrConnection") > -1) {
                    userMessage = "Server error - cannot connect to SOLR on the tranSMART server - is it running?"
                }
                userMessage = 'Error!  Status = ' + xhr.status + "; " + userMessage
                alert(userMessage)
                console.log(userMessage);
                jQuery('#results-div').html(userMessage)
            }
    });
 }
 else {
	   	jQuery.ajax({
			url:gwasFacetTableResultsURL,
			data:queryString,
			success: function(response) {
				jQuery('#table-results-div').html(response);
				gwasLoadTableResultsGrid({'max': 100, 'offset':0, 'cutoff': 0, 'search': "", 'sortField': "", "order": "asc"});
			},
			error: function(xhr) {
				console.log('Error!  Status = ' + xhr.status + xhr.statusText);
			}
	   	});
 }
}

//Add the search term to the array and show it in the panel.
function gwasAddSearchTerm(searchTerm, noUpdate)	{
	var category = searchTerm.display == undefined ? "TEXT" : searchTerm.display;
	
	category = category + "|" + (searchTerm.category == undefined ? "TEXT" : searchTerm.category);
	
	var text = (searchTerm.text == undefined ? (searchTerm.keyword == undefined ? searchTerm : searchTerm.keyword) : searchTerm.text);
	var id = searchTerm.id == undefined ? -1 : searchTerm.id;
	var key = category + SEARCH_DELIMITER + text + SEARCH_DELIMITER + id;
	var index, value;
	pval=[]
	if (currentSearchTerms.indexOf(key) < 0)	{
		currentSearchTerms.push(key);
		for (index = 0; index < currentSearchTerms.length; ++index) {
			value = currentSearchTerms[index];
			if (value.substring(0, 7) === "PVALUE|" ) {
				pval.push(value);
				if (pval.length >1) {
					currentSearchTerms.splice(currentSearchTerms.indexOf(pval[0]),1);
					pval.shift();
				}
			}
		}
		if (currentCategories.indexOf(category) < 0)	{
			currentCategories.push(category);
		}
	} 
	
	// clear the search text box
	jQuery("#search-ac").val("");
	
	// create flag to track if tree was updated
	var treeUpdated = false
	
	// find all nodes in tree with this key, and select them
    console.log('gwasAddSearchTerm: getTree')
	jQuery("#gwas-filter-div").dynatree();
	var tree = jQuery("#gwas-filter-div").dynatree("getTree");
	tree.visit(  function selectNode(node) {
		             if (node.data.key == key)  {
		            	 node.select(true);
		            	 node.makeVisible();
		            	 treeUpdated = true;
		             }
	             }
			   , false);

	// only refresh results if the tree was not updated (the onSelect also fires these event, so don't want to do 2x)
	if (!treeUpdated && !noUpdate) {
	    gwasShowSearchTemplate();
	    console.log('gwasAddSearchTerm calling gwasShowSearchResults');
	    gwasShowSearchResults();
	}
}

function gwasUpdateSearch() {
    gwasShowSearchTemplate();
    console.log('gwasUpdateSearch calling gwasShowSearchResults');
    gwasShowSearchResults();
}

//Remove the search term that the user has clicked.
function gwasRemoveSearchTerm(ctrl,isPvalue)	{
	if(!isPvalue) {
		var currentSearchTermID = ctrl.id.replace(/\%20/g, " ").replace(/\%44/g, ",");
	}
	else {
		var currentSearchTermID = isPvalue.replace(/\%20/g, " ").replace(/\%44/g, ",");
	}
	var idx = currentSearchTerms.indexOf(currentSearchTermID);
	if (idx > -1)	{
		currentSearchTerms.splice(idx, 1);
		
		// check if there are any remaining terms for this category; remove category from list if none
		var fields = currentSearchTermID.split(SEARCH_DELIMITER);
		var category = fields[0];
		gwasClearCategoryIfNoTerms(category);

	}
	
	// Call back to the server to clear the search filter (session scope)
	jQuery.ajax({
		type:"POST",
		url:gwasNewSearchURL
	});

	// create flag to track if tree was updated
	var treeUpdated = false

	// find all nodes in tree with this key and deSelect
    console.log('gwasRemoveSearchTerm: getTree')
	jQuery("#gwas-filter-div").dynatree();
	var tree = jQuery("#gwas-filter-div").dynatree("getTree");

	tree.visit(  function deselectNode(node) {
                 if (node.data.key == currentSearchTermID)  {
    	                node.select(false);
	            	    treeUpdated = true;
                 }
              }
              , false);
	
	// only refresh results if the tree was not updated (the onSelect also fires these event, so don't want to do 2x)
	if (!treeUpdated) {
	    gwasShowSearchTemplate();
	    console.log('gwasRemoveSearchTerm calling gwasShowSearchResults');
	    gwasShowSearchResults();
	}
}

//Add the search term to the array that the user has added to filter tree.
function gwasAddFilterTreeSearchTerm(searchTerm)	{
	var category = searchTerm.display == undefined ? "TEXT" : searchTerm.display;
	var text = searchTerm.keyword == undefined ? searchTerm : searchTerm.keyword;
	var id = searchTerm.id == undefined ? -1 : searchTerm.id;
	var key = category + SEARCH_DELIMITER + text + SEARCH_DELIMITER + id;
	if (currentSearchTerms.indexOf(key) < 0)	{
		currentSearchTerms.push(key);
		if (currentCategories.indexOf(category) < 0)	{
			currentCategories.push(category);
		}
	}

}



//export the current analysis data to a csv file
function gwasExportLinePlotData(analysisId, exportType)
{
	
	jQuery('#lineplotExportOpts_'+analysisId).hide(); //hide the menu box
	
	var url='';
	
	switch(exportType)
	{
	case 'data':
	//Export the data for the heatmap
	    
	    var probesList = jQuery('body').data("activeLineplot:" + analysisId); //get the stored probe
	    
		url=gwasGetHeatmapDataForExportURL+'?id='+analysisId +'&probesList=' +probesList	
		
		gwasDownloadURL(url);
		
	break;

	case 'image':
		
		
		//data should be the same for both lineplot and boxplot
		var data = jQuery('body').data("LineplotData:" + analysisId);

		//redraw the plot with the legend so that it appears in the exported image
		gwasDrawLinePlot('lineplotAnalysis_'+analysisId, data, analysisId, true);

		var svgID=  "#lineplotAnalysis_"+analysisId;
		
		gwasExportCanvas(svgID);		
		
		gwasDrawLinePlot('lineplotAnalysis_'+analysisId, data, analysisId, false);
		
		break;
	default:
		console.log('Error - invalid Export option');
	}
	
}


//export the current analysis data to a csv file
function gwasExportBoxPlotData(analysisId, exportType)
{
	var url='';
	
	switch(exportType)
	{
	case 'data':
	//Export the data for the heatmap
	    
	    var probesList = jQuery('body').data("activeBoxplot:" + analysisId); //get the stored probe
	    
	    var page = jQuery('body').data("currentPage:" + analysisId); //current page is stored
	    
	    jQuery('#boxplotExportOpts_'+analysisId).hide(); //hide the menu box
	    		
		url=gwasGetHeatmapDataForExportURL+'?id='+analysisId +'&probesList=' +probesList	
		
		gwasDownloadURL(url);
		
	break;

	case 'image':
		
		jQuery('#boxplotExportOpts_'+analysisId).hide(); //hide the menu box
		
		var data = jQuery('body').data("BoxplotData:" + analysisId);
		
		gwasDrawBoxPlot('boxplotAnalysis_'+analysisId, data, analysisId, true);
		
		var svgID=  "#boxplotAnalysis_"+analysisId;
		
		gwasExportCanvas(svgID);		

		gwasDrawBoxPlot('boxplotAnalysis_'+analysisId, data, analysisId, false);
		
		break;
	default:
		console.log('Error - invalid Export option');
	}
	
}


function gwasExportCanvas(svgID){
	
	var svgData = jQuery(svgID).html();
	
	//Fix for Firefox: remove "<a xlink...>" and "</a>"
	//These tags are only generated in FF, and canvg does not like them
	if(svgData.indexOf("<a xlink")>-1){
		svgData = svgData.replace(/(<a xlink(.*?)>|<\/a>)/g, "");
	}
	
	canvg('canvas', svgData, { ignoreMouse: true, ignoreAnimation: true }) ;
	
	var imageData =  document.getElementById('canvas').toDataURL();
	imageData = imageData.substr(imageData.indexOf(',') + 1).toString(); //remove header info
	
 var dataInput = document.createElement("input") ; 
 dataInput.setAttribute("name", 'imgData') ;
 dataInput.setAttribute("value", imageData);
	
 var myForm = document.createElement("form"); //create form to post to server
 myForm.method = 'post';
 myForm.action = exportAsImage;
 myForm.appendChild(dataInput);
  
 document.getElementById('hiddenItems').appendChild(myForm) ;
 myForm.submit() ;
 
}





//export the current analysis data to a csv file
function gwasExportHeatmapData(analysisId, exportType)
{
	
	
	var url='';
	
 jQuery('#heatmapExportOpts_'+analysisId).hide(); //hide the menu box

 jQuery("#analysis_holder_" + analysisId).mask();
	
	switch(exportType)
	{
	case 'currentPage':
	//Export all probes on the current page
		    
		
		//TODO: Those code is duplicated and should be moved to a seperate function
	    // make sure we are getting number of probes per page for current element
	    var probesPerPageElement = document.getElementById("probesPerPage_" + analysisId);
		var numberOfProbesPerPage = probesPerPageElement.options[probesPerPageElement.selectedIndex].value;
	    
	    var probesList = "";
	    var maxProbeLength = 0;
	    var analysisIndex = gwasGetAnalysisIndex(analysisId);
	    
	    var page = jQuery('body').data("currentPage:" + analysisId); //current page is stored
	    
	    
	    // index of probes list is the rankings starting at 1
	    // check that index is less than the maximum for the probe list, and less than max per the current page
		for (var i =0; i < analysisProbeIds[analysisIndex].probeIds.length; i++)  {
			if (i > 0)  {
				probesList = probesList + "|";
			}
			probesList = probesList + analysisProbeIds[analysisIndex].probeIds[i];
			
		}
		
		
		url=gwasGetHeatmapDataForExportURL+'?id='+analysisId +'&probesList=' +probesList	
		
	break;
	/* Removed option	
	case 'allPages':
		url=gwasGetHeatmapDataForExportURL+'?id='+analysisId +'&probesList=' +'allPages';
		break;
	*/
	case 'allProbes':
	//Export all probes (ignore search on gene/pathway)
		
		url=gwasGetHeatmapDataForExportURL+'?id='+analysisId +'&probesList=' +'allProbes';
		break;
	
	case 'image':
		
		var svgID=  "#analysisDiv_"+analysisId;
		var divID = "analysisDiv_" + analysisId;
		
		//redraw the heatmap with the legend
		gwasDrawHeatmap(divID, jQuery('body').data(analysisId), analysisId, true);
		
		gwasExportCanvas(svgID);	
		
		//redraw the heatmap without the legend
		gwasDrawHeatmap(divID, jQuery('body').data(analysisId), analysisId, false);
		
		break;
		
	default:
		console.log('Error - invalid Export option');
	}
	

	gwasDownloadURL(url);
	

 jQuery("#analysis_holder_" + analysisId).unmask();

}

//this function is used to download a file without opening a new browser window
var gwasDownloadURL = function(url)
{
 var iframe;
 iframe = document.getElementById("hiddenDownloader");
 if (iframe === null)
 {
     iframe = document.createElement('iframe');  
     iframe.id = "hiddenDownloader";
     iframe.style.visibility = 'hidden';
     document.body.appendChild(iframe);
 }
 iframe.src = url;   

 
}

function gwasAnalysisMenuEvent(id){
	
	var analysisID = id.substring(id.indexOf('_')+1,id.length);
	var btnID = id.substring(0,id.indexOf('_'));
	
	switch(btnID){
	
	case 'btnLineplotExport':
		jQuery('#lineplotExportOpts_'+analysisID).toggle();
		jQuery('#lineplotControls_'+analysisID).hide();
		
		break;
	
	case 'btnLineplotControls':
		jQuery('#lineplotControls_'+analysisID).toggle();
		jQuery('#lineplotExportOpts_'+analysisID).hide();
		break;
	
	case 'btnBoxplotExport':
		jQuery('#boxplotExportOpts_'+analysisID).toggle();
		jQuery('#boxplotControls_'+analysisID).hide();
		break;
	
	case 'btnBoxplotControls':
		jQuery('#boxplotControls_'+analysisID).toggle();
		jQuery('#boxplotExportOpts_'+analysisID).hide();
		break;
	
	case 'btnHeatmapExport':
		jQuery('#heatmapExportOpts_'+analysisID).toggle();
		jQuery('#heatmapControls_'+analysisID).hide();
		
		break;
	
	case 'btnHeatmapControls':
		jQuery('#heatmapControls_'+analysisID).toggle();
		jQuery('#heatmapExportOpts_'+analysisID).hide();
		break;
	
	case 'btnResultsExport':
		jQuery('#resultsExportOpts_'+analysisID).toggle();
		break;		
		
	default:
		
		console.log("Invalid option: " +id);	
	}
	
}




//Remove the category from current categories list if there are no terms left that belong to it
function gwasClearCategoryIfNoTerms(category)  {
	
	var found = false;
	for (var j=0; j<currentSearchTerms.length; j++)	{
		var fields2 = currentSearchTerms[j].split(SEARCH_DELIMITER);
		var category2 = fields2[0];
		
		if (category == category2)  {
			found = true; 
			break;
		}
	}
	
	if (!found)  {
		currentCategories.splice(currentCategories.indexOf(category), 1);
	}
}


//Remove the search term that the user has de-selected from filter tree.
function gwasRemoveFilterTreeSearchTerm(termID)	{
	var idx = currentSearchTerms.indexOf(termID);
	if (idx > -1)	{
		currentSearchTerms.splice(idx, 1);

		// check if there are any remaining terms for this category; remove category from list if none
		var fields = termID.split(SEARCH_DELIMITER);
		var category = fields[0];
		gwasClearCategoryIfNoTerms(category);
	}
	
}

function gwasUpdateHeatmap(analysisID){
	
	var divID = "analysisDiv_" + analysisID;
	gwasDrawHeatmap(divID, jQuery('body').data(analysisID), analysisID);
	
}


//set the heatmap controls
function gwasSetHeatmapControls(analysisID){
	
	//sets the slider used to resize the heatmap
	var sliderID="#heatmapSlider_" +analysisID;
	jQuery(sliderID).width('75');
	jQuery(sliderID).slider({
		min:8,
		max:25,
		value:15,
		step: 1,
	 	stop: function(event, ui) {  
	 		gwasUpdateHeatmap(analysisID);	 		
	}
	});
	
	
	//sets the slider used to resize the heatmap
	var colorSliderID="#heatmapColorSlider_" +analysisID;
	jQuery(colorSliderID).width('75');
	jQuery(colorSliderID).slider({
		range: true,
		min:-100,
		max:100,
		values: [ -100, 100 ],
	 	slide: function(event, ui) {  

	 		//prevent the min from being greater than 0, and the max less than 0
/*	 		if(ui.values[1] < 0.01 || ui.values[0] > -0.01){
             return false;// do not allow change
         }
*/	 		
	 	},
	 	stop: function(event, ui) {  
	 		gwasUpdateHeatmap(analysisID);	 		
	}
	});
	
	var heatmapControlsDiv = "#heatmapControls_" +analysisID;
	jQuery('.heatmapControls_holder').mouseenter(function(){
	//    clearTimeout(jQuery(this).data('timeoutId'));
	    jQuery('body').data('heatmapControlsID', '');
	     
	 //   jQuery(this).find(".tooltip").fadeIn("slow");
	}).mouseleave(function(){
	 //	    var timeoutId = setTimeout(function(){
	 //   	jQuery(heatmapControlsDiv).fadeOut("fast");
	//    }, 800);
	    //set the timeoutId, allowing us to clear this trigger if the mouse comes back over
	//    jQuery(this).data('timeoutId', timeoutId); 
	    jQuery('body').data('heatmapControlsID', analysisID);
	});
	
	 

	
	
}

function gwasSetVisTabs(analysisID){
	var tabID = "#visTabs_" + analysisID;
	jQuery(tabID).tabs();	
	jQuery(tabID).bind( "tabsshow", function(event, ui) {
	    if (ui.panel.id == "boxplot_" + analysisID) {
	    	gwasShowBoxOrLinePlotVisualization(ui.panel, analysisID, true);
	    } else if (ui.panel.id == "lineplot_" + analysisID)	{
	    	gwasShowBoxOrLinePlotVisualization(ui.panel, analysisID, false);
	    }
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Box or Line Plot Visualization Methods
//Show, Load Data and Draw
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function gwasShowBoxOrLinePlotVisualization(panel, analysisID, isBoxplot)	{
	var analysisIndex = gwasGetAnalysisIndex(analysisID);
	var probeIds = analysisProbeIds[analysisIndex].probeIds;
	var selectList = analysisProbeIds[analysisIndex].selectList;

	var typeString = '';
	if (isBoxplot) {
		typeString = 'Box';
	}  
	else  {		
		typeString = 'Line';
	}
	
	// retrieve the active probe for the current analysis 
	var activeProbe = gwasGetActiveProbe(analysisID);
	
	// if the currently displayed plot is not the active probe then redraw
	var redraw = false;
	
	var currentProbe = jQuery('body').data("active" + typeString + "plot:" + analysisID);
	
	if (currentProbe != activeProbe)  {
		redraw = true;
	}

	// if we're not showing a plot for the active probe, then reload
	if(redraw) { 
		jQuery("#analysis_holder_" + analysisID).mask("Loading...");
	
		if (isBoxplot)  {			
			gwasLoadBoxPlotData(analysisID, activeProbe);

		}
		else  {
			loadLinePlotData(analysisID, activeProbe);			
		}
	}
	
}


//Method to add the probes for the Line plot
function gwasSetLineplotProbes(analysisID, probeID)	{
	gwasSetProbesDropdown(analysisID, probeID, "#probeSelectionLineplot_" + analysisID);	
}


function gwasGetActiveProbe(analysisId){
	
	// retreive the active probe for the current analysis, first retrieve from global data
	var probeId = jQuery('body').data("activeAnalysisProbe:" + analysisId);
	
	// if not defined yet, set to the first one for the current page showing for the analysis
	if (probeId == undefined)  {
		var analysisIndex = gwasGetAnalysisIndex(analysisId);
		probeId = analysisProbeIds[analysisIndex].probeIds[0];		
	}
	 
	return probeId;
	
}

function gwasSetActiveProbe(analysisId, probeId){
	//store the currently active probe for the analysis; i.e the last one drawn for the box or line plot
	jQuery('body').data("activeAnalysisProbe:" + analysisId, probeId); 
	
}




function gwasGetGeneforDisplay(analysisID, probeID){

	var analysisIndex = gwasGetAnalysisIndex(analysisID);
	var probeIds = analysisProbeIds[analysisIndex].probeIds ;

	var maxProbeIndex = analysisProbeIds[analysisIndex].maxProbeIndex;
	 var probeDisplay = "";
 for (var i=0; i<maxProbeIndex; i++)  {
 	if (probeIds[i] == probeID) {
 		probeDisplay = analysisProbeIds[analysisIndex].selectList[i];
 		return probeDisplay;
 	}
 }
	 return false;
}


//Load the line plot data
function gwasLoadLinePlotData(analysisID, probeID)	{
	
	if (probeID === undefined)	{
		// We are called from the user switching probes, throw up the mask and get the probeID
		jQuery("#analysis_holder_" + analysisID).mask(); //hide the loading screen
		probeID = jQuery("#probeSelectionLineplot_" + analysisID).find('option:selected').attr('id');
		
	}
	
	// retrieve the corresponding display value for the probe Id 
 var analysisIndex = gwasGetAnalysisIndex(analysisID);
 var probeIds = analysisProbeIds[analysisIndex].probeIds ;
 var maxProbeIndex = analysisProbeIds[analysisIndex].maxProbeIndex; 

	
	gwasAJAXManager.add({
		url:gwasGetLinePlotDataURL,									
		data: {id: analysisID, probeID: probeID},
		timeout:60000,
		success: function(response) {
			
			//store the response
			jQuery('body').data("LineplotData:" + analysisID, response); //store the response
			
			gwasSetActiveProbe(analysisID, probeID);
			jQuery('#analysis_holder_' +analysisID).unmask(); //hide the loading msg, unblock the div 
			gwasDrawLinePlot('lineplotAnalysis_'+analysisID, response, analysisID);
			jQuery('#lineplotAnalysis_'+analysisID).show();
			jQuery('#lineplot_'+analysisID).show();

	//		jQuery('#lineplotLegend_'+analysisID).prepend("<p class='legend_probe'>Line plot for "+probeDisplay +"</p>"); //add the probe ID to the legend
			
			jQuery('#lineplotLegend_'+analysisID).show();

			jQuery('body').data("LineplotData:" + analysisID, response); //store the response
			
			jQuery('body').data("activeLineplot:" + analysisID, probeID); //store the analysis ID and probe ID of this lineplot;
																		 //used to determine if the lineplot has already been drawn
			gwasSetLineplotProbes(analysisID, probeID);
			jQuery("#analysis_holder_" + analysisID).unmask(); 
			
			
		},
		error: function(xhr) {
			console.log('Error!  Status = ' + xhr.status + xhr.statusText);
		}
	});
}

//Draw the line plot
function gwasDrawLinePlot(divId, linePlotJSON, analysisID, forExport)	{
	
	
	var cohortArray = new Array();   // array of cohort ids
	var cohortDesc = new Array();    // array of cohort descriptions
	var cohortDisplayStyles = new Array();    // array of cohort display styles
	
	var gene_id = parseInt(linePlotJSON['gene_id']);   // gene_id will be null if this is a protein since first char is alpha for proteins

	// loop through and get the cohort ids and description into arrays in the order they should be displayed
	for (var key in linePlotJSON)  {
		// the "order" of the json objects starts with 1, so subtract 1 so it doesn't leave gap at start of array
		var arrayIndex = linePlotJSON[key]['order'] - 1;
		cohortArray[arrayIndex] = key;
		cohortDesc[arrayIndex] = linePlotJSON[key]['desc'];
		cohortDisplayStyles[arrayIndex] = linePlotJSON[key]['order'] % cohortBGColors.length;		
		
	}
	
	var statMapping = cohortArray.map(function(i)	{
		var data = linePlotJSON[i]['data'];
		
		// retrieve mean and standard error- round to 4 decimal places
		var mean = data['mean'];
		var stdError = data['stdError'];
		var min = mean - stdError;
		var max = mean + stdError;
		var desc = linePlotJSON[i]['desc'].replace(/_/g, ', ');
		var sampleCount = linePlotJSON[i]['sampleCount'];

		var meanFormatted = parseFloat(mean);
		meanFormatted = meanFormatted.toFixed(4);
		
		var stdErrorFormatted = parseFloat(stdError);
		stdErrorFormatted = stdErrorFormatted.toFixed(4);
		
		var cohortDisplayStyle = linePlotJSON[i]['order'] % cohortBGColors.length; 
		
		return {
			id:i,
			desc:desc,
			sampleCount:sampleCount,
			mean:mean,
			stdError:stdError,			
			meanFormatted:meanFormatted,
			stdErrorFormatted:stdErrorFormatted,			
			min:min,
			max:max,
			cohortDisplayStyle:cohortDisplayStyle
		};		
	});

	
	
	
	//if the user is setting the range manually:
	if(jQuery('#lineplotRangeRadio_Manual_'+analysisID).is(':checked')){
		
		var yMin = parseFloat(jQuery('#lineplotRangeMin_'+analysisID).val());
		var yMax = parseFloat(jQuery('#lineplotRangeMax_'+analysisID).val());

		
	}else{
		
		var yMin = statMapping[0].min;
		var yMax = statMapping[0].max;
		for (var idx=1; idx < statMapping.length; idx++)	{	
			yMin = statMapping[idx].min < yMin ? statMapping[idx].min : yMin;
			yMax = statMapping[idx].max > yMax ? statMapping[idx].max : yMax;
		}
		
		// Put in a rough switch so things can scale on the y axis somewhat dynamically
		if (yMax-yMin < 2)	{
			// round down to next 0.1
			yMin = Math.floor((yMin-0.1) * 10) / 10;

			// round up to next 0.1
			// and add another 0.01 to ensure that the highest tenths line gets included
			yMax = Math.ceil((yMax+0.1) * 10) / 10  + 0.01;
		} else	{
			yMin = Math.floor(yMin);
			yMax = Math.ceil(yMax);
		}		
			
		
		//set the manual value textboxes with the current yMin and yMax
		jQuery('#lineplotRangeMin_'+analysisID).val(gwasRoundNumber(yMin,2));
		jQuery('#lineplotRangeMax_'+analysisID).val(gwasRoundNumber(yMax,2));
		
	}

		
	var w = cohortArray.length * 150;//generate the width dynamically using the cohort count
	h = 300,
	margin = 55,
	widthErrorBarBottomAndTopLines = 6,
	radiusDot = 3,
	h_legend=0;//used to draw the legend for export

	
	if(forExport){
		h_legend=35+ 30 * (cohortArray.length); //h_legend is the extra space required for the legend 
	}
	
	
	var x = pv.Scale.ordinal(statMapping, function(e){return e.id}).splitBanded(0, w, 1/2);
	var y = pv.Scale.linear(yMin, yMax).range(0, h)			
	
	var numCohorts = cohortArray.length;
	
	// need to add a blank entry at the beginning of the arrays for use by gwasDrawCohortLegend
	cohortArray = [''].concat(cohortArray);
	cohortDesc = [''].concat(cohortDesc);
	cohortDisplayStyles = [''].concat(cohortDisplayStyles);
	
	if(forExport){
		cohortDesc=gwasHighlightCohortDescriptions(cohortDesc, true);
	}
	
	
	var vis = new pv.Panel().canvas(document.getElementById(divId)) 	
	.width(w)
	.height(h+h_legend)
	.margin(margin);
	
	/* Add the y-axis rules */
	vis.add(pv.Rule)
	.data(y.ticks())
	.strokeStyle("#ccc")
	.bottom(y)
	.anchor("left").add(pv.Label)
	.font("14px sans-serif")
	.text(y.tickFormat);

	vis.add(pv.Label)
	.data(statMapping)
	.left(function(d){return x(d.id)})
	.bottom(-20)
	.textAlign("center")
	.font("14px sans-serif")
	.events("all")
	.title(function(d){return d.desc})	
	.text(function(d){return d.id + "(n=" + d.sampleCount + ")"});
	
	/* Add the log2 label */
	vis.add(pv.Label)
	.left(-40)
	.bottom(h/2)
	.textAlign("center")
	.textAngle(-Math.PI / 2)
	.font("14px sans-serif")
 .text("log2 intensity");
	
	if (gene_id)  {
		/* Add the title with link to gene info*/
		vis.add(pv.Label)
		.font("bold 16px sans-serif")
		.textStyle("#065B96")
	    .left(w/2)
	    .bottom(300)
	    .textAlign("center")
	  
		    /*Add link in title to gene info */
	    .cursor("pointer")
	    .event("mouseover", function(){ self.status = "Gene Information"})
	    .event("mouseout", function(){ self.status = ""})
	    .event("click", function(d) {self.location = "javascript:gwasShowGeneInfo('"+gene_id +"');"})
		.events("all")
	    .title("View gene information")
	    .text(gwasGetGeneforDisplay(analysisID, gwasGetActiveProbe(analysisID)));
	}
	else  {
		/* Add the title without link to gene info*/
		vis.add(pv.Label)
		.font("bold 16px sans-serif")
		.textStyle("#065B96")
	    .left(w/2)
	    .bottom(300)
	    .textAlign("center")
	    .text(gwasGetGeneforDisplay(analysisID, gwasGetActiveProbe(analysisID)));		
	}
	// create line
 var line = 	vis.add(pv.Line)
 .data(statMapping)
	.strokeStyle("#000000")
 .bottom(function(d){return y(d.mean)})
	.left(function(d){return x(d.id)});
 
 // add dots at each point in line
 line.add(pv.Dot)
   .radius(radiusDot)
	  .strokeStyle("#000000")
   .fillStyle("#000000")
   .title(function(d){return d.meanFormatted + " +/- " + d.stdErrorFormatted});

 // Add error bars
 // vertical line
 line.add(pv.Rule)
   .left(function(d){return x(d.id)})
   .bottom(function(d) {return y(d.mean - Math.abs(d.stdError))})
   .top(function(d) {return y(yMax) - y(d.mean + Math.abs(d.stdError)) + h_legend}); 
 

 // bottom horizontal line
 line.add(pv.Rule)
   .left(function(d){return x(d.id) - widthErrorBarBottomAndTopLines/2} )
   .bottom(function(d) { return y(d.mean - d.stdError)})
   .width(widthErrorBarBottomAndTopLines);
 // top horizontal line
 line.add(pv.Rule)
   .left(function(d){return x(d.id) - widthErrorBarBottomAndTopLines/2} )
   .bottom(function(d) { return y(d.mean + d.stdError)})
   .width(widthErrorBarBottomAndTopLines);
 
	/*add legend if export */
	if(forExport){
			
	    /*		Legend	     */
	    var legend = vis.add(pv.Bar)
	    	.data(statMapping)
	    	.height(25)
	    	.top(function(){return (this.index * 30)-20 })
	    	.antialias(false)
	    	.left(-30)
	    	.strokeStyle("#000")
	    	.lineWidth(1)
	    	.width(30)
	    	.fillStyle(function (d) {return cohortBGColors[d.cohortDisplayStyle]});

	    legend.anchor("center").add(pv.Label)
 	.textStyle("#000")
 	.font("12px  sans-serif")
 	.text(function(d){return d.id} );
	    
	    vis.add(pv.Label)
	    	.data(statMapping)
	    .top(function(){return this.index * 30})
	    .antialias(false)
	    .left(5)
 	.textStyle("#000")
 	.font("12px  sans-serif")
 //	.text(function(d){return d.desc});   	
 	.text(function(){return cohortDesc[this.index+1].replace(/_/g, ', ')});
	}

	

	vis.root.render();
	

	/////////////////////////////////////////////////////////////////////////////////////////////////////////		
	jQuery("#lineplotLegend_" + analysisID).html(gwasDrawCohortLegend(numCohorts, cohortArray, cohortDesc, cohortDisplayStyles));
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Box Plot Visualization Methods
//Show, Load Data and Draw
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function gwasOpenBoxPlotFromHeatmap(analysisID, probe){
	  var divID = "analysisDiv_" + analysisID;

	  jQuery('#visTabs_' +analysisID).tabs('select', 'boxplot_'+analysisID); // switch to boxplot tab
		
	  var currentBoxplot = jQuery('body').data("activeBoxplot:" + analysisID);
	  
	  if(currentBoxplot != probe){
		  jQuery("#analysis_holder_" + analysisID).mask("Loading...");	
		  gwasLoadBoxPlotData(analysisID, probe);		  
	  }
}

//Method set the probes in a select list for current page
function gwasSetProbesDropdown(analysisID, selectedProbeID, divId)	{
	var analysisIndex = gwasGetAnalysisIndex(analysisID);
	var probeIds = analysisProbeIds[analysisIndex].probeIds;
	var selectList = analysisProbeIds[analysisIndex].selectList;

	jQuery(divId).empty();
	for (var i=0; i<probeIds.length; i++) {
		
		if (probeIds[i] == selectedProbeID)	{
			jQuery(divId).append(jQuery("<option id></option>").attr("", "selected").attr("id", probeIds[i]).attr("value", selectList[i]).text(selectList[i]));
		} else	{
			jQuery(divId).append(jQuery("<option></option>").attr("id", probeIds[i]).attr("value", selectList[i]).text(selectList[i]));
		}
	}	
}


//Method to add the probes for the box plot
function gwasSetBoxplotProbes(analysisID, selectedProbeID)	{
	gwasSetProbesDropdown(analysisID, selectedProbeID, "#probeSelection_" + analysisID);
}

//Load the box plot data
function gwasLoadBoxPlotData(analysisID, probeID)	{	
	jQuery('#boxplotEmpty_' +analysisID).hide(); //hide the message that tells the user to select a probe first
	
	if (probeID === undefined)	{
		// We are called from the user switching probes, throw up the mask and get the probeID
		jQuery("#analysis_holder_" + analysisID).mask(); //hide the loading screen
		probeID = jQuery("#probeSelection_" + analysisID).find('option:selected').attr('id');
		
	}
	
	// retrieve the corresponding display value for the probe Id 
	
	/*
 var analysisIndex = gwasGetAnalysisIndex(analysisID);
 var probeDisplay = ""
 var probeIds = analysisProbeIds[analysisIndex].probeIds ;
 var maxProbeIndex = analysisProbeIds[analysisIndex].maxProbeIndex; 
 for (var i=0; i<maxProbeIndex; i++)  {
 	if (probeIds[i] == probeID) {
 		probeDisplay = analysisProbeIds[analysisIndex].selectList[i];
 		break;
 	}
 }
     
     */
	gwasAJAXManager.add({
		url:gwasGetBoxPlotDataURL,
		data: {id: analysisID, probeID: probeID},
		timeout:60000,
		success: function(response) {
			gwasSetActiveProbe(analysisID, probeID);
			gwasDrawBoxPlot('boxplotAnalysis_'+analysisID, response, analysisID);
			jQuery('#boxplotLegend_'+analysisID).show();
			jQuery('#boxplotAnalysis_'+analysisID).show();	
			
			jQuery('body').data("BoxplotData:" + analysisID, response); //store the response
			
			jQuery('body').data("activeBoxplot:" + analysisID, probeID); //store the analysis ID and probe ID of this boxplot;
																		 //used to determine if the boxplot has already been drawn
		
			gwasSetBoxplotProbes(analysisID, probeID);
			jQuery("#analysis_holder_" + analysisID).unmask(); 
			
		},
		error: function(xhr) {
			console.log('Error!  Status = ' + xhr.status + xhr.statusText);
		}
	});
}

function gwasChangeRangeRadioBtn(graph, analysisID){
	
	var radioID = '#' +graph +'RangeRadio_Manual_' +analysisID;
	var rangeMinID = '#' +graph +'RangeMin_' +analysisID;
	var rangeMaxID = '#' +graph +'RangeMax_' +analysisID;
	
	if(jQuery(radioID).is(':checked')){
		
		jQuery(rangeMinID).removeAttr('disabled');
		jQuery(rangeMaxID).removeAttr('disabled');
		
	}else{
		
		jQuery(rangeMinID).attr('disabled',true);
		jQuery(rangeMaxID).attr('disabled',true);		
		

		
		if(graph == 'boxplot'){
			
			//redrew the boxplot to set it back to default range
			gwasUpdateBoxPlot(analysisID)
			
		}else if(graph == 'lineplot') {
			
			gwasUpdateLineplot(analysisID);
			
		}
	}
}


function gwasUpdateLineplot(analysisID){
	
	//data should be the same for both lineplot and boxplot
	var data = jQuery('body').data("LineplotData:" + analysisID);
	
	if(data == ''){
		console.log("Error: Could not find data");
	}else
		{
			gwasDrawLinePlot('lineplotAnalysis_'+analysisID, data, analysisID);
		}
}

//collapse all of the open analyses
function gwasCollapseAllAnalyses(){
		
	//while (openAnalyses.length>0){
	for (var v = 0; v < openAnalyses.length; v++) {
		//each time gwasShowVisualization is called, the current analysis is removed from openAnalyses
		gwasShowVisualization(openAnalyses[v], false);
	}
}

function gwasCollapseAllStudies() {
	gwasCollapseAllAnalyses();
	//For each open study, gwasToggleDetailDiv
	var openstudyelements = jQuery(".analysesopen");
	for (var i = 0; i < openstudyelements.length; i++) {
		var studyelement = openstudyelements[i];
		var studyId = jQuery(studyelement).attr('name');
		var divId = jQuery(studyelement).attr('id');
		if (divId.indexOf("detail")!=-1)
			gwasToggleDetailDiv(studyId, ''); //No URL needed when collapsing
	}
}

function gwasExpandAllStudies() {
	//For each closed study, gwasToggleDetailDiv
	var closedstudyelements = jQuery(".detailexpand").not(".analysesopen");
	for (var i = 0; i < closedstudyelements.length; i++) {
		var studyelement = jQuery(closedstudyelements[i]);
		var studyId = studyelement.attr('name');
		var key = new Date().getTime(); //Key to prevent AJAX caching
		var divId = jQuery(studyelement).attr('id');
		if (divId.indexOf("detail")!=-1)
			gwasToggleDetailDiv(studyId, getStudyAnalysesUrl + "?id=" + studyId + "&trialNumber=" + studyId + "&unqKey=" + key);
	}
}

function gwasUpdateBoxPlot(analysisID){
	
	var data = jQuery('body').data("BoxplotData:" + analysisID);
	
	if(data == ''){
		console.log("Error: Could not find data");
	}else
		{
			gwasDrawBoxPlot('boxplotAnalysis_'+analysisID, data, analysisID);
		}
}

//Helper function to provide the rank for the percentile calculation in the box plot
function gwasGetRank(P, N)	{
	return Math.round(P/100 * N + 0.5);			// Use P/100 * N + 0.5 as denoted here: http://en.wikipedia.org/wiki/Percentile
}

//Draw the box plot
function gwasDrawBoxPlot(divId, boxPlotJSON, analysisID, forExport)	{
	// boxPlotJSON should be a map of cohortID:[desc:cohort description, order:display order for the cohort, data:sorted log2 intensities]
	
	
	var cohortArray = new Array();   // array of cohort ids
	var cohortDesc = new Array();    // array of cohort descriptions
	var cohortDisplayStyles = new Array();    // array of cohort display styles (i.e. number from 0..4)

	var gene_id = parseInt(boxPlotJSON['gene_id']);   // gene_id will be null if this is a protein since first char is alpha for proteins
	
	// loop through and get the cohort ids and description into arrays in the order they should be displayed
	for (var key in boxPlotJSON)  {
		// the "order" of the json objects starts with 1, so subtract 1 so it doesn't leave gap at start of array
		var arrayIndex = boxPlotJSON[key]['order'] - 1;
		cohortArray[arrayIndex] = key;
		cohortDesc[arrayIndex] = boxPlotJSON[key]['desc'];
		cohortDisplayStyles[arrayIndex] = boxPlotJSON[key]['order'] % cohortBGColors.length;		
	}
	
	// Map the all four quartiles to the key (e.g. C1)
	var statMapping = cohortArray.map(function(i)	{
		var data = boxPlotJSON[i]['data'];
		var cohortDisplayStyle = boxPlotJSON[i]['order'] % cohortBGColors.length;		
		var desc = boxPlotJSON[i]['desc'].replace(/_/g, ', ');
		var sampleCount = boxPlotJSON[i]['sampleCount'];
		
		return {
			id:i,
			cohortDisplayStyle:cohortDisplayStyle,
			desc:desc,
			sampleCount:sampleCount,
			min:data[gwasGetRank(5, data.length)-1],
			max:data[gwasGetRank(95, data.length)-1],			
			median:data[gwasGetRank(50, data.length)-1],
			lq:data[gwasGetRank(25, data.length)-1],
			uq:data[gwasGetRank(75, data.length)-1]
		};		
	});
	
	
	//if the user is setting the range manually:
	if(jQuery('#boxplotRangeRadio_Manual_'+analysisID).is(':checked')){
		
		var yMin = parseFloat(jQuery('#boxplotRangeMin_'+analysisID).val());
		var yMax = parseFloat(jQuery('#boxplotRangeMax_'+analysisID).val());

		
	}else{
		//auto set range otherwise
		var yMin = statMapping[0].min;
		var yMax = statMapping[0].max;
		for (var idx=1; idx < statMapping.length; idx++)	{	
			yMin = statMapping[idx].min < yMin ? statMapping[idx].min : yMin;
			yMax = statMapping[idx].max > yMax ? statMapping[idx].max : yMax;
		}
		
		// Put in a rough switch so things can scale on the y axis somewhat dynamically
		if (yMax-yMin < 2)	{
			// round down to next 0.1
			yMin = Math.floor((yMin-0.2) * 10) / 10 ;
			
			// round up to next 0.1
			// and add another 0.01 to ensure that the highest tenths line gets included
			yMax = Math.ceil((yMax+0.2) * 10) / 10 + 0.01;
		} else	{
			yMin = Math.floor(yMin);
			yMax = Math.ceil(yMax);
		}
		
		//set the manual value textboxes with the current yMin and yMax
		jQuery('#boxplotRangeMin_'+analysisID).val(gwasRoundNumber(yMin,2));
		jQuery('#boxplotRangeMax_'+analysisID).val(gwasRoundNumber(yMax,2));
		
	}
	
	var title = gwasGetGeneforDisplay(analysisID, gwasGetActiveProbe(analysisID));
	
	var w = cohortArray.length * 140;//generate the width dynamically using the cohort count	
	var  h = 300,  
		x = pv.Scale.ordinal(statMapping, function(e){return e.id}).splitBanded(0, w, 1/2),
		y = pv.Scale.linear(yMin, yMax).range(0, h-15),
		s = x.range().band / 2;
	
	
	var numCohorts = cohortArray.length;
	
	// need to add a blank entry at the beginning of the arrays for use by gwasDrawCohortLegend
	cohortArray = [''].concat(cohortArray);
	cohortDesc = [''].concat(cohortDesc);
	cohortDisplayStyles = [''].concat(cohortDisplayStyles);
	
	if(forExport){
		h=320 + 30 * (cohortArray.length);
		cohortDesc=gwasHighlightCohortDescriptions(cohortDesc, true);
	}

		var vis = new pv.Panel().canvas(document.getElementById(divId)) 	
		.width(w)
		.height(h)
		.margin(55);

		if (gene_id)  {
			/* Add the title with link to gene info*/
			vis.add(pv.Label)
			.font("bold 16px sans-serif")
		    .left(w/2)
		    .bottom(300)
		    .textStyle("#065B96")
		    .textAlign("center")
	    	/*Add link in title to gene info */
		    .cursor("pointer")
		    .event("mouseover", function(){ self.status = "Gene Information"})
		    .event("mouseout", function(){ self.status = ""})
		    .event("click", function(d) {self.location = "javascript:gwasShowGeneInfo('"+gene_id +"');"})
			.events("all")   
			.title("View gene information")
			.text(title);
		}
		else {
			/* Add the title without link to gene info*/
			vis.add(pv.Label)
			.font("bold 16px sans-serif")
		    .left(w/2)
		    .bottom(300)
		    .textStyle("#065B96")
		    .textAlign("center")
			.text(title);
			
		}
	
		/* Add the y-axis rules */
		vis.add(pv.Rule)
		.data(y.ticks())
		.strokeStyle("#ccc")
		.bottom(y)
		.anchor("left").add(pv.Label)
		.font("14px sans-serif")
		.text(y.tickFormat);	
		
		/* Add the log2 label */
		vis.add(pv.Label)
		.left(-40)
		.bottom(300/2) //300 is the height of the boxplot
		.textAlign("center")
		.textAngle(-Math.PI / 2)
		.font("14px sans-serif")
	    .text("log2 intensity");

		/* Add a panel for each data point */
		var points = vis.add(pv.Panel)
		.def("showValues", false)
		.data(statMapping)
		.left(function(d){return x(d.id)})
		.width(s * 2)
		.events("all");

		/* Add the experiment id label */
		vis.add(pv.Label)
		.data(statMapping)
		.left(function(d){return x(d.id) + s})
		.bottom(-20)
		.textAlign("center")
		.font("14px sans-serif")
		.events("all")
		.title(function(d){return d.desc})
		.text(function(d){return d.id + "(n=" + d.sampleCount + ")"});
		
		/*add legend if export */
		if(forExport){
				
		    /*		Legend	     */
		    var legend = vis.add(pv.Bar)
		    	.data(statMapping)
		    	.height(25)
		    	.top(function(){return (this.index * 30)-20 })
		    	.antialias(false)
		    	.left(-30)
		    	.strokeStyle("#000")
		    	.lineWidth(1)
		    	.width(30)
		    	.fillStyle(function (d) {return cohortBGColors[d.cohortDisplayStyle]});

		    legend.anchor("center").add(pv.Label)
	    	.textStyle("#000")
	    	.font("12px  sans-serif")
	    	.text(function(d){return d.id} );
		    
		    vis.add(pv.Label)
		    	.data(statMapping)
		    .top(function(){return this.index * 30})
		    .antialias(false)
		    .left(5)
	    	.textStyle("#000")
	    	.font("12px  sans-serif")
	    //	.text(function(d){return d.desc});   	
	    	.text(function(){return cohortDesc[this.index+1].replace(/_/g, ', ')});
		}
		
		

		/* Add the range line */
		points.add(pv.Rule)
		.left(s)
		.bottom(function(d){return y(d.min)})
		.height(function(d){return y(d.max) - y(d.min)});

		/* Add the min and max indicators */
		var minLine = points.add(pv.Rule)
			.data(function(d){return [d.min]})
			.bottom(y)
			.left(s / 2)
			.width(s)
			.anchor("bottom").add(pv.Label)
			.visible(function(){return this.parent.showValues()}) 
			.text(function(d){return d.toFixed(2)});
		
		var maxLine = points.add(pv.Rule)
			.data(function(d){return [d.max]})
			.bottom(y)
			.left(s / 2)
			.width(s)
			.anchor("top").add(pv.Label)
			.visible(function(){return this.parent.showValues()}) 
			.text(function(d){return d.toFixed(2)});

		/* Add the upper/lower quartile ranges */
		var quartileBar = points.add(pv.Bar)
			.fillStyle(function (d) {return cohortBGColors[d.cohortDisplayStyle]})
			.bottom(function(d){return y(d.lq)})
			.height(function(d){return y(d.uq) - y(d.lq)})
			.strokeStyle("black")
			.lineWidth(1)
			.event("mouseover", function() {return this.parent.showValues(true)}) 
			.event("mouseout", function() {return this.parent.showValues(false)})
			.antialias(false);
		
		var lqLabel = quartileBar.add(pv.Label)
			.visible(function(){return this.parent.showValues()})
			.text(function(d){return d.lq.toFixed(2)})
			.textAlign("right")
			.textBaseline("top");
		
		var uqLabel = quartileBar.anchor("top").add(pv.Label)		
			.visible(function(){return this.parent.showValues()})
			.left(-15)
			.text(function(d){return d.uq.toFixed(2)})
			.textMargin(-10);
		
		/* Add the median line */
		points.add(pv.Rule)
		.bottom(function(d){ return y(d.median)})
		.anchor("right").add(pv.Label)
		.visible(function(){return this.parent.showValues()})
		.text(function(d){return d.median.toFixed(2)});

		vis.render();

		/////////////////////////////////////////////////////////////////////////////////////////////////////////		
		jQuery("#boxplotLegend_" + analysisID).html(gwasDrawCohortLegend(numCohorts, cohortArray, cohortDesc, cohortDisplayStyles));
		
}

//Show the heatmap visualization 
function gwasShowVisualization(analysisID, changedPaging)	{	
	
	var analysisHeaderDiv = "#TrialDetail_" + analysisID + "_anchor"
	var divID = "#analysis_results_" + analysisID;
	var divID2 = "analysis_results_" + analysisID;
	var loadingDiv = "#analysis_holder_"+ analysisID;
	var imgExpand = "#imgExpand_"  + analysisID;
	var div = document.getElementById(divID);	
	var hmFlagDiv = divID+"_state";
	var hmFlag = jQuery(hmFlagDiv).val();
	
	// Check the value of the hidden field that is capturing the following "click" states
	// 0: No heatmap loaded, hidden
	// 1: Heatmap loaded, visible
	// 2: Heatmap loaded, hidden
	
	// if the paging has changed, need to reload page
	if (hmFlag != "1")	{				
		var src = jQuery(imgExpand).attr('src').replace('../images/down_arrow_small2.png', '../images/up_arrow_small2.png');
		jQuery(imgExpand).attr('src',src);
		jQuery(analysisHeaderDiv).addClass("active-analysis");
		jQuery(loadingDiv).toggle();
		openAnalyses.push(analysisID); //store this as an open analysis
		
		if (hmFlag == "0")	{

			gwasSetVisTabs(analysisID);
			jQuery(loadingDiv).mask("Loading...");
			gwasLoadAnalysisResultsGrid(analysisID, {'max': 10, 'offset':0, 'cutoff': 0, 'search': "", 'sortField': "", "order": "asc"});
		}
		
		jQuery(hmFlagDiv).val("1");
	} else	{
		var src = jQuery(imgExpand).attr('src').replace('../images/up_arrow_small2.png', '../images/down_arrow_small2.png');
		jQuery(imgExpand).attr('src',src);
		jQuery(loadingDiv).toggle('blind', {}, 'fast');
		jQuery(analysisHeaderDiv).removeClass("active-analysis");	
		jQuery(hmFlagDiv).val("2");
		
		//remove the analysis from the array, while leaving all others
		//openAnalyses = openAnalyses.splice( jQuery.inArray(analysisID, openAnalyses), 1 );
		gwasRemoveByValue(openAnalyses,analysisID);
		
	} 	
	return false;
}

//Make a call to the server to load the heatmap data
function gwasLoadHeatmapData(divID, analysisID, probesPage, probesPerPage)	{
	
	gwasAJAXManager.add({
		url:gwasGetHeatmapDataURL,
		data: {id: analysisID, probesPage: probesPage, probesPerPage:probesPerPage},
		timeout:60000,
		success: function(response) {
			jQuery('body').data(analysisID, response); //store the result set in case the heatmap is updated 
			jQuery('#analysis_holder_' +analysisID).unmask(); //hide the loading msg, unblock the div
			gwasDrawHeatmap(divID, response, analysisID);		
			jQuery('#heatmapLegend_'+analysisID).show();


	        var analysisIndex = gwasGetAnalysisIndex(analysisID);
	        var probesList = analysisProbeIds[analysisIndex].probeIds;
	        var maxProbeIndex = analysisProbeIds[analysisIndex].maxProbeIndex;
			
			if(maxProbeIndex == 1){ //only one probe returned
				gwasLoadBoxPlotData(analysisID, probesList[0]);	//preload boxplot
			}	        
	        
		},
		error: function(xhr) {
			console.log('Error!  Status = ' + xhr.status + xhr.statusText);
		}
	});
}

//displays pop-up of gene with tabs to internal and external sources
function gwasShowGeneInfo(geneID)
{
	var w=window.open('/transmart/details/gene/?rwg=y&altId='+geneID , 'detailsWindow', 'width=900,height=800'); 
	w.focus(); 
}

//Take the heatmap data in the second parameter and show it in the Protovis panel
function gwasDrawHeatmap(divID, heatmapJSON, analysisID, forExport)	{
	
	// set up arrays to be used to populating drop down boxes for line/box plots
	// do this first since we need this for determining max probe string length
	var probesList = new Array() 
	var selectList = new Array()
	var hasFoldChange = false; //true if the data contains fold change values
 var hasTPvalue = false;
 var hasPvalue = false;
 var hasNullValues = false; //checks if there are null in the heatmap; null legend should only be displayed if so
	var maxProbeLength = 0;
	for (var i=0; i<heatmapJSON.length; i++)	{
		probesList.push(heatmapJSON[i].PROBE);
		selectList.push(heatmapJSON[i].GENE + " (" + heatmapJSON[i].PROBE + ")");		
		if (heatmapJSON[i].PROBE.visualLength("10px Verdana, Tahoma, Arial") > maxProbeLength)  {
			//maxProbeLength = heatmapJSON[i].PROBE.length;
			maxProbeLength = heatmapJSON[i].PROBE.visualLength("10px Verdana, Tahoma, Arial");
		}
		if(heatmapJSON[i].FOLD_CHANGE != null){
			hasFoldChange = true;
			}
		if(heatmapJSON[i].TEA_P_VALUE != null){
			hasTPvalue = true;
			}
		if(heatmapJSON[i].PREFERRED_PVALUE != null){
			hasPvalue = true;
			}
		//check if any of the heatmapJSON values are undefined. The legend for null values will
		//only display if 'hasNullValues' is true
		//"key.indexOf(':') > 0" <- this is used to only check the chohorts (ex, 'C1:3432'). Other key values are ignored
		for (var key in (heatmapJSON[i])){
				if(heatmapJSON[i][key] == undefined && key.indexOf(':') > 0){
	    			hasNullValues=true;
			}
		}
		
	}
	
 var analysisIndex = gwasGetAnalysisIndex(analysisID);

 analysisProbeIds[analysisIndex].probeIds = probesList;
 analysisProbeIds[analysisIndex].selectList = selectList;

 // reset the active probe for the other plots to be the first on this page
 gwasSetActiveProbe(analysisID, probesList[0]);
 
	//store the max probe length for this analysis
	jQuery('body').data("maxProbeLength:" + analysisID, maxProbeLength);	    
	
	// First, we need to get the subject IDs that we will use for mapping the color range
	// We also need the two cohort prefixes and when the cohort first subset ends as these will be used for the legend	

	var cellID = "#heatmapSlider_" +analysisID;
	var colorSliderID = "#heatmapColorSlider_" +analysisID;
	
	var cellSize = parseInt(jQuery(cellID).slider( "option", "value" ));
	
	var w_probe = 6 + parseInt(jQuery('body').data("maxProbeLength:" + analysisID));
	
	
	var rangeMax = parseInt(jQuery(colorSliderID).slider( "values", 1 )) /100.0;
	var rangeMin = parseInt(jQuery(colorSliderID).slider( "values", 0 )) / 100.0;
	var rangeMid = (rangeMax + rangeMin)/2;
	
	//set the header font size depending on the cell size
	var headerfont = "12px  sans-serif";
	if(cellSize < 12){
		headerfont = "8px  sans-serif";
	}else if (cellSize>19){
		headerfont = "16px  sans-serif";
	}
	
	var columns = new Array();

	
	// create an array for cohorts, their descriptions, and their switch positions
	var cohorts = new Array();
	var cohortDescriptions = new Array();
	var cohortSwitches = new Array();
	var cohortDisplayStyles = new Array();
		
	var idx = 0;
	
	var firstRowData = heatmapJSON[0];
	for (var key in firstRowData)	{
		// We have two types of values in the first row of the array
		// Metadata values: GENE, PROBE, FOLD_CHANGE, TEA_P_VALUE and the N cohort descriptions 		
		// Normalized values: The data given by the key Cohort:Subject 
		// First, we see if the cohort is cohort:subject unless it is Gene
		var keyArray = key.split(':');
		if (keyArray.length == 1)	{
			// OK, so we have metdata, ignore everything except the cohort info
			
			// add key to appropriate array, depending upon what it starts with
			if (key.indexOf('SWITCH_') == 0)  {
				cohortSwitches[key.slice(7)] = firstRowData[key]
			}
			else if (key.indexOf('DESC_') == 0)  {
				cohortDescriptions[key.slice(5)] = firstRowData[key]
			}
			else if (key.indexOf('COHORT_') == 0)  {
				cohorts[key.slice(7)] = firstRowData[key]
			}

				
		} else	{
			// We have data, save the key (e.g. C19:C0525T0300023) as the column metadata
			columns[idx] = key;			
			idx++;
		}
	}
	
	// The fill variable will have a map of the columns array as the key and a color range as the value 

	fill = pv.dict(columns, function(f) {
		return pv.Scale.linear()	
		.domain(rangeMin,rangeMid,rangeMid,rangeMax) 
	    .range("#4400BE", "#D7D5FF","#ffe2f2", "#D70C00"); 
	});

	
/*	This code is for the "local" heatmap shading option, but is incomplete
	
	var x = pv.dict(columns, function(f) { return pv.mean(heatmapJSON, function(d){return d[f]}) }),
 s = pv.dict(columns, function(f) { return pv.deviation(heatmapJSON, function(d){ return d[f] })}),
fill = pv.dict(columns, function(f) { return pv.Scale.linear()
     .domain(-3 * s[f] + x[f], x[f], x[f], 3 * s[f] + x[f])
     .range("#4400BE", "#D7D5FF","#ffe2f2", "#D70C00")});	
*/	
	
	
	
	// Hardcode the size of the cell and the labels
	var w_sample = 75, w_gene = 75, h_header=6, w_fold_change = 75, w_Tpvalue =75, w_pvalue = 75;			// Label dimensions
	var w = cellSize, h = cellSize;									    							// Cell dimensions
	
	if(!hasFoldChange){
		w_fold_change = 0; //if there is no fold change data, we need no space for it
	}
	
	if(!hasTPvalue){
		w_Tpvalue =0;
	}
	
	if(!hasPvalue){
		w_pvalue=0;
	}
	var numCohorts = cohorts.size()-1;   // there is no cohort at index 0

	
	// need to add a blank entry at the beginning of the arrays for use by gwasDrawCohortLegend
//	cohortArray = [''].concat(cohortArray);
//	cohortDesc = [''].concat(cohortDesc);
//	cohortDisplayStyles = [''].concat(cohortDisplayStyles);
		
	var height;
	if(forExport){
		height = 4*h +h_header + (heatmapJSON.length * h) + (cohorts.size()-1)*35;
		cohortDescriptions=gwasHighlightCohortDescriptions(cohortDescriptions, true);
	}else{
		height = 4*h +h_header + (heatmapJSON.length * h);
	}
	
	var vis = new pv.Panel().canvas(document.getElementById(divID)) 				    					// First panel is the canvas where everything is drawn
 	.width(w_probe + columns.length * w + w_gene + w_fold_change + w_pvalue + w_Tpvalue)				    		// Width of the entire panel									
 	.height(height)			    									// Height of the entire panel 
 	
 vis.add(pv.Panel)
     .data(columns)
 	.left(function()	{
 		return w_probe + this.index * w;
 	})
 	.width(w)
 	.add(pv.Panel)
 	.data(heatmapJSON)
 	.top(function()	{
 		return h + (this.index * h) + h_header;
 	})
 	.height(h)
 	.fillStyle(function(d, f)	{
 		if (d[f] == undefined)	{
 			return "#FFFF00";
 		} else	{
 			return fill[f](d[f]);

 		}
 	})


 	.strokeStyle("#333333")
 	.lineWidth(1)
 	.antialias(false)
 	.title(function(d, f)	{			// title is the tooltip
 		var cohort = f.split(':')[0];    		
 		if (d[f] == undefined){
 			return cohort + ":" + d["PROBE"] + ":" + d["GENE"] + "=" + d[f];
 		} else	{
 			return cohort + ":" + d["PROBE"] + ":" + d["GENE"] + "=" + d[f].toFixed(2);
 		}    		
 	});

	// create array of cohort widths
	var cohortWidths = new Array();
	for(var i=1; i<=numCohorts; i++) {
		if (i == numCohorts)  {
		    cohortWidths[i] = w * (columns.length - cohortSwitches[i]);			
		}
		else  {
		    cohortWidths[i] = w * (cohortSwitches[i+1] - cohortSwitches[i]);
		}
	}

	var leftPosition = w_probe;
	for(var i=1; i<=numCohorts; i++) {		
		var classIndex;
		
		cohortDisplayStyles[i] = i % cohortBGColors.length;

		var dataColor = cohortBGColors[i % cohortBGColors.length];
		var strokeStyleColor = "#000";
		var textStyleColor = "#000";
		
		/* cohort header */
		var barC = vis.add(pv.Bar)
	    	.data([dataColor])
	    	.height(h)
	    	.top(2)
	    	.antialias(false)
	    	.left(leftPosition)
	    	.strokeStyle(strokeStyleColor)
	    	.title(cohortDescriptions[i].replace(/_/g, ', '))
	    	.lineWidth(1)
	    	.width(cohortWidths[i])
	    	.fillStyle(function(d)	{
	    		          return d;
 	                 }
	    	           );

	    barC.anchor("center").add(pv.Label)
 	.textStyle(textStyleColor)
 	.font(headerfont)
 	.text(cohorts[i] );
	    
	    
	    //only draw the legend if the result is being exported as an image
	    if(forExport){
	    	
		    /*		Legend	     */
		    var legend = vis.add(pv.Bar)
		    	.data([dataColor])
		    	.height(25)
		    	.top(2*h + (heatmapJSON.length * h)+h_header + i*30)
		    	.antialias(false)
		    	.left(0)
		    	.strokeStyle(strokeStyleColor)
		    	.lineWidth(1)
		    	.width(30)
		    	.fillStyle(function(d)	{
		    		          return d;
	    	                 });

		    legend.anchor("center").add(pv.Label)
	    	.textStyle(textStyleColor)
	    	.font(headerfont)
	    	.text(cohorts[i] );
		    
		    vis.add(pv.Label)
		    .top(2*h + (heatmapJSON.length * h)+h_header + i*30 +20)
		    .antialias(false)
		    .left(35)
	    	.textStyle(textStyleColor)
	    	.font("12px  sans-serif")
	    	.text(cohortDescriptions[i].replace(/_/g, ', '));   	
	    	
	    }

	    // determine left position for next cohort
	    leftPosition = leftPosition + cohortWidths[i];
	}	
	
	//only do this if the data contains fold change values
	if(hasFoldChange){
	    // Show the fold change table header
	    vis.add(pv.Label)
	    	.width(w_fold_change)
	    	.top(h_header+11)
			.left(w_probe + columns.length * w + w_gene)
	    	.textAlign("left")
	    	.font("bold 11px sans-serif")
	    	.text("Fold change");
	    
	    
	    // Show the fold change
	    vis.add(pv.Label)
			.data(heatmapJSON)
			.top(function()	{
				return (h + (this.index * h + h / 2) + h_header);
			})
			.width(w_fold_change)
			    	.strokeStyle("#333333")
	    	.lineWidth(1)
	    	.antialias(false)
			.left(w_probe + columns.length * w + w_gene)
			.textAlign("left")
			.textBaseline("middle")
			.text(function(d)	{
				return d.FOLD_CHANGE;
			});
	}
 
	if(hasTPvalue)
	{
	    // Show the tea p value header    
	    vis.add(pv.Label)
			.width(w_Tpvalue)
			.top(h_header+11)
			.left(w_probe + columns.length * w + w_gene + w_fold_change)
			.textAlign("left")
		    .font("bold 11px sans-serif")
			.text("TEA p-value"); 
	    
	    // Show the tea p value
	    vis.add(pv.Label)
			.data(heatmapJSON)
			.top(function()	{
				return (h + (this.index * h + h / 2) + h_header);
			})
			.width(w_pvalue)
			.left(w_probe + columns.length * w + w_gene + w_fold_change)
			.textAlign("left")
			.textBaseline("middle")
			.text(function(d)	{
				if (d.TEA_P_VALUE == 0)  {
					return "< 0.00001"
				}
				else  {
					return d.TEA_P_VALUE;
				}
			});
	}
	
	if(hasPvalue){
		
	    //show the p-value header
	    vis.add(pv.Label)
			.width(w_pvalue)
			.top(h_header+11)
			.left(w_probe + (columns.length * w) + w_gene + w_fold_change +w_Tpvalue)
			.textAlign("left")
		    .font("bold 11px sans-serif")
			.text("p-value"); 
	    
	    // Show the p value
	    vis.add(pv.Label)
			.data(heatmapJSON)
			.top(function()	{
				return (h + (this.index * h + h / 2) + h_header);
			})
			.width(w_pvalue)
			.left(w_probe + (columns.length * w) + w_gene + w_fold_change +w_Tpvalue)
			.textAlign("left")
			.textBaseline("middle")
			
			.text(function(d)	{
				if (d.PREFERRED_PVALUE == 0)  {
					return "< 0.00001"
				}
				else  {
					return d.PREFERRED_PVALUE;
				}
			});
	}
	

 // Show the Gene labels
 vis.add(pv.Label)
 	.data(heatmapJSON)
 	.top(function()	{
 		return (h + (this.index * h + h / 2) + h_header);
		})
		.width(w_gene)
		.left(w_probe + columns.length * w)
		
		//add hyperlink to gene label that opens pop-up
	    .cursor( function(d) {if (parseInt(d.GENE_ID)) {return "pointer"}})
	    .event("mouseover", function(d){ if (parseInt(d.GENE_ID))  {self.status = "Gene Information"}})
	    .event("mouseout", function(d){ self.status = ""})
	    .event("click", function(d) {if (parseInt(d.GENE_ID))  {self.location = "javascript:gwasShowGeneInfo('"+d.GENE_ID +"');"}})

	    .textAlign("left")
		.textBaseline("middle")
		.events("all")
		.title(function(d)	{
			return d.GENELIST;
		})
		.text(function(d)	{
			return d.GENE;
		}); 
 
 // Show the Probe labels
 vis.add(pv.Label)
 	.data(heatmapJSON)
 	.top(function()	{
 		return (h + (this.index * h + h / 2) + h_header);
 	})
 	.width(w_probe)

 	//add link to view boxplot of values
     .cursor("pointer")
	
	    .event("mouseout", function(){ self.status = ""})
	    .event("click", function(d) {self.location = "javascript:gwasOpenBoxPlotFromHeatmap(" +analysisID +", '" +d.PROBE +"');"})

	    .events("all")
 	.textAlign("left")
 	.font("10px Verdana, Tahoma, Arial")
 	.textBaseline("middle")
 	.title("View in boxplot")
 	.text(function(d)	{
 		return d.PROBE;
 	});
 

	vis.add(pv.Bar)
		.data(["#4400BE"])
		.height(15)
		.left(w_probe)
		.width(55)
		.top(2*h + (heatmapJSON.length * h) + h_header)
		.fillStyle(function(d)	{
			return d;
		})
		.anchor("left")
		.add(pv.Label)
		.textStyle("white")
		.text("min: "+Math.round((rangeMin)*100)/100);//Math.round get nearest integer		
	
	vis.add(pv.Bar)
		.data(["#D70C00"])
		.height(15)
		.width(55)
		.left(w_probe + 85)
		.top(2*h + (heatmapJSON.length * h) + h_header)
		.fillStyle(function(d)	{
			return d;
		})
		.anchor("left")
		.add(pv.Label)
		.textStyle("white")
		.text("max: " + Math.round((rangeMax)*100)/100); //Math.round get nearest integer
	
	
	//draw legend for null values only if they exist in the current heatmap
	if(hasNullValues){
		vis.add(pv.Bar)
		.data(["#FFFF00"])
		.height(15)
		.width(55)
		.left(w_probe + 170)
		.top(2*h + (heatmapJSON.length * h) + h_header)
		.fillStyle(function(d)	{
			return d;
		})
		.anchor("left")
		.add(pv.Label)
		.textStyle("black")
		.text("null");	
		
	}
	


	vis.root.render();					// Need root panel for the canvas call to work
	jQuery("#heatmapLegend_" + analysisID).html(gwasDrawCohortLegend(numCohorts, cohorts, cohortDescriptions, cohortDisplayStyles));
}

//Helper function to draw the legend for the cohorts in the visualization panel
function gwasDrawCohortLegend(numCohorts, cohorts, cohortDescriptions, cohortDisplayStyles)	{
	
	cohortDescriptions = gwasHighlightCohortDescriptions(cohortDescriptions);
	
	var pCohortAll = "<table class='cohort_table'>"
	var classIndex = null;
	var pCohort = "";
	for(var i=1; i<=numCohorts; i++) {
		pCohort = "<tr><td style='width:40px'><p class='cohort' style='background-color:" + cohortBGColors[cohortDisplayStyles[i]]  + "'>" +cohorts[i] +"</p></td><td><p class='cohortDesc'>"+cohortDescriptions[i].replace(/_/g, ', ')+'</p></td>';
		pCohortAll = pCohortAll +  pCohort;
	}
	return pCohortAll + "</table>	";
}

//Show diff between each cohort
//returnOnlyDiff: if true, return only the different terms
function gwasHighlightCohortDescriptions(cohortDesc, returnOnlyDiff){
	
	var arySplit = new Array();
	var aryDif = new Array();
	var aryDescNew = new Array();
	
	//1. Split each cohort description into an array of terms
	for (var i=1; i<cohortDesc.length; i++){
		arySplit[i]= cohortDesc[i].split('_');
	}
	
	//2. Loop through the array and compare each term to the term in the same position of the next description
	//	 mark which ones are same and different in aryDif
	for (var i=1; i<arySplit.length-1; i++){
		
			for(var x=0; x < arySplit[i].length; x++){
				
					if(gwasTrim(arySplit[i][x]).toUpperCase() == gwasTrim(arySplit[i+1][x]).toUpperCase()){
						
							if(aryDif[x] != false){
								aryDif[x] = true;
							}
							else{
								aryDif[x] = false;
								}
						}
					else{
						aryDif[x] = false;
					}
				}
		}
	
	//3. Rebuild array, inserting syntax to denote which terms are different
	for (var i=1; i<arySplit.length; i++){
		
		aryDescNew[i]=''; //initilize the first value
		
		for(var x=0; x < arySplit[i].length; x++){

			
				if(aryDif[x] == true){ //the terms are the same
					if(!returnOnlyDiff){
						aryDescNew[i] = aryDescNew[i] + arySplit[i][x];	
					}
				}
				else{	//the terms are different
					if(!returnOnlyDiff){ 
						aryDescNew[i] = aryDescNew[i] +"<span class='highlight'>" +arySplit[i][x] +"</span>";
					}
					else if(returnOnlyDiff){
						aryDescNew[i] = aryDescNew[i] +arySplit[i][x] + ', ';
					}
				}
				
				//check if this is the last term; if not, add an underscore between terms
				if(x+1 < arySplit[i].length && !returnOnlyDiff){
					aryDescNew[i] = aryDescNew[i]+'_';
				}
			}
		
			if(returnOnlyDiff){//remove trailing space and comma
				aryDescNew[i] = aryDescNew[i].slice(0,-2);		
			}
	}
	
	return aryDescNew;

}
//remove whitespace
function gwasTrim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

//convert a string to Title Case
function gwasToTitleCase(str)
{
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function gwasGoToByScroll(id){
	jQuery('#main').animate({scrollTop: jQuery("#"+id).offset().top},'slow');
}

function gwasIsGeneCategory(catId)  {
	if ((catId == 'GENE') || (catId == 'PATHWAY') || (catId == 'GENELIST') || (catId == 'GENESIG')) {
		return true;
	}
	else  {
		return false;
	}
}

function gwasIsDataCategory(catId) {
 if (jQuery.inArray(catId, dataCategoryNames) > -1) {
     return true;
 }
 return false;
}

/* Find the width of a text element */
String.prototype.visualLength = function(fontFamily) 
{ 
 var ruler = document.getElementById("ruler"); 
 ruler.style.font = fontFamily; 
 ruler.innerHTML = this; 
 return ruler.offsetWidth; 
}



//Round number to given decimal place
function gwasRoundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

//Main method to show the current array of search terms
//TODO Convert this entire thing to jQuery instead of HTML string
function gwasShowSearchTemplate()	{
	var searchHTML = '';
	var startATag = '&nbsp;<a id=\"';
	var endATag = '\" class="term-remove" href="#" onclick="gwasRemoveSearchTerm(this);">';
	var imgTag = '<asset:image src="small_cross.png"/>&nbsp;';
	var firstItem = true;

	// iterate through categories array and move all the "gene" categories together at the top 
	var dataCategories = new Array();
 var analysisCategories = new Array();
	
	var geneCategoriesProcessed = false;
	for (var i=0; i<currentCategories.length; i++)	{
		var catFields = currentCategories[i].split("|");
		var catId = catFields[1];
		
		// when we find a "gene" category, add it and the rest of the "gene" categories to the new array
		if (gwasIsGeneCategory(catId)) {
			// first check if we've processed "gene" categories yet
			if (!geneCategoriesProcessed)  {
				
				// add first gene category to new array
				dataCategories.push(currentCategories[i]);

				// look for other "gene" categories, starting at the next index value, and add each to array
				for (var j=i+1; j<currentCategories.length; j++)	{
					var catFields2 = currentCategories[j].split("|");
					var catId2 = catFields2[1];
					if (gwasIsGeneCategory(catId2)) {
						dataCategories.push(currentCategories[j]);
					}				
				}
				// set flag so we don't try to process again
				geneCategoriesProcessed = true;
			}
		}
		else  {    // not a gene category - add depending on category type
		    if (gwasIsDataCategory(catId)) {
			    dataCategories.push(currentCategories[i]);
         }
         else {
             analysisCategories.push(currentCategories[i]);
         }
		}
	}
	
	// replace old array with new array
 //Merge analysisCategories then dataCategories - they are now organized one after the other
 var combinedCategories = new Array();
 jQuery.merge(combinedCategories, analysisCategories);
 jQuery.merge(combinedCategories, dataCategories);
 currentCategories = combinedCategories;

 var firstDataCategoryDrawn = false;

 if (analysisCategories.length > 0) {
     searchHTML += "<div class='filtertypebox analysis'><div class='filtertypetitle'>Analysis filters</div>";
 }
 else if (dataCategories.length > 0) {
     searchHTML += "<div class='filtertypebox data'><div class='filtertypetitle'>Data filters</div>";
 }

	for (var i=0; i<currentCategories.length; i++)	{
		for (var j=0; j<currentSearchTerms.length; j++)	{
			var fields = currentSearchTerms[j].split(SEARCH_DELIMITER);
			if (currentCategories[i] == fields[0]){
				var tagID = currentSearchTerms[j].split(' ').join('%20');			// URL encode the spaces
				var tagID = currentSearchTerms[j].split(',').join('%44');			// And the commas
				
				if (firstItem)	{
					var catFields = fields[0].split("|");
					var catDisplay = catFields[0];
					var catId = catFields[1];

					if (i>0)	{	
						
						var suppressAnd = false;
                     var newCategoryBox = false;
						// if this is a "gene" category, check the previous category and see if it is also one
		                if (gwasIsGeneCategory(catId))  {
							var catFieldsPrevious = currentCategories[i-1].split("|");
							var catIdPrevious = catFieldsPrevious[1];
		                	if (gwasIsGeneCategory(catIdPrevious))  {
		                		suppressAnd = true;	
		                	}
		                }

                     //Suppress the 'and' if this is the first data category type
                     if (gwasIsDataCategory(catId) && !firstDataCategoryDrawn) {
                         searchHTML = searchHTML + "</div><div class='filtertypebox data'><div class='filtertypetitle'>Data filters</div>";
                         firstDataCategoryDrawn = true;
                         suppressAnd = true;
                         newCategoryBox = true;
                     }
						
		                // if previous category is a "gene" category, don't show AND
		                if (!suppressAnd)  {
							searchHTML = searchHTML + "<span class='category_join'>AND<span class='h_line'></span></span>";  			// Need to add a new row and a horizontal line
					    }
		                else if(!newCategoryBox)  {
							searchHTML = searchHTML + "<br/>";  				                	
		                }
					}
					searchHTML = searchHTML +"<span class='category_label'>" +catDisplay + ":</span>&nbsp;<span class=term>"+ fields[1] + startATag + tagID + endATag + imgTag +"</span>";
					firstItem = false;
				} else	{
					searchHTML = searchHTML + "<span class='spacer'> OR </span><span class=term>"+ fields[1] + startATag + tagID + endATag + imgTag +"</span> ";
				}				
			} else	{
				continue;												// Do the categories by row and in order
			}
		}
		firstItem = true;
	}

 searchHTML += '</div>'
	document.getElementById('active-search-div').innerHTML = searchHTML;
	gwasGetSearchKeywordList();
}


//retrieve the current list of search keyword ids
function gwasGetSearchKeywordList()   {

	var keywords = new Array();
	
	for (var j=0; j<currentSearchTerms.length; j++)	{
		var fields = currentSearchTerms[j].split(SEARCH_DELIMITER);
	    var keyword = fields[2];			
		keywords.push(keyword);
	}
	
	return keywords;
}

function gwasOpenSaveSearchDialog()  {

	var keywords = gwasGetSearchKeywordList();

	if (keywords.length>0)  {
		jQuery('#save-modal-content').modal();
	}
	else  {
		alert("No search criteria to save!")
	}
		

	return false;

}

//save a faceted search to the database
function gwasSaveSearch(keywords, name, desc)  {

	var nam1e = jQuery("#searchName").val();
	var desc = jQuery("#searchDescription").val();
	var keywords = gwasGetSearchKeywordList();

	//  had no luck trying to use JSON libraries for creating/parsing JSON string so just save keywords as pipe delimited string 
	if (keywords.length>0)  {
		var criteriaString = keywords.join("|") 
		gwasAJAXManager.add({
			url:gwasSaveSearchURL,
			data: {criteria: criteriaString, name: name, description:desc},
			timeout:60000,
			success: function(response) {
	            alert(response['message']);	
	            
	            // close the dialog if success flag was true
	            if (response['success'])  {
	            	jQuery.modal.close();	            	
	            }
	            
			},
			error: function(xhr) {
				console.log('Error!  Status = ' + xhr.status + xhr.statusText);
			}
		});
	}
	else  {
		alert("No search criteria to save!")
	}
	
}

//delete a faceted search from the database
function gwasDeleteSearch()  {
	
	gwasAJAXManager.add({
		url:gwasDeleteSearchURL,
		data: {name: "testname23"},
		timeout:60000,
		success: function(response) {
         alert(response['message']);	        
		},
		error: function(xhr) {
			console.log('Error!  Status = ' + xhr.status + xhr.statusText);
		}
	});
	
}


function gwasLoadSearch()  {

	
	gwasAJAXManager.add({
		url:gwasLoadSearchURL,
		data: {id: 37},   //37
		timeout:60000,
		success: function(response) {
			gwasClearSearch();
			
			if (response['success'])  {
				var searchTerms = response['searchTerms'] 
				var count = response['count'] 
				
				for (i=0; i<count; i++)  {
					// e.g. "Therapeutic Areas|THERAPEUTIC AREAS:Immunology:1004"
					
					var searchParam={id:searchTerms[i].id,
							         display:searchTerms[i].displayDataCategory,
							         keyword:searchTerms[i].keyword,
							         category:searchTerms[i].dataCategory};
					gwasAddSearchTerm(searchParam);

				}
					
			}
			else  {
				alert('failed');  // show message from server  
			}
		},
		error: function(xhr) {
			console.log('Error!  Status = ' + xhr.status + xhr.statusText);
		}
	});

}

//Clear the tree, results along with emptying the two arrays that store categories and search terms.
function gwasClearSearch()	{
	
	//remove all pending jobs from the ajax queue
	//rwgAJAXManager.clear(true); (this was causing problems, so removing for now)
	
	
	openAnalyses = []; //all analyses will be closed, so clear this array
	
	
	jQuery("#search-ac").val("");
	
	currentSearchTerms = new Array();
	currentCategories = new Array();
	
	// Change the category picker back to ALL and set autocomplete to not have a category (ALL by default)
	document.getElementById("search-categories").selectedIndex = 0;
	jQuery('#search-ac').autocomplete('option', 'source', gwasSourceURL);
		
    console.log('gwasClearSearch: getTree')
	jQuery("#gwas-filter-div").dynatree();
	var tree = jQuery("#gwas-filter-div").dynatree("getTree");
	
	// Make sure the onSelect event doesn't fire for the nodes
	// Otherwise, the main search query is going to fire after each item is deselected, as well as facet query
	allowOnSelectEvent = false;
	tree.visit(function clearNode(node) {
	                                         gwasUpdateNodeIndividualFacetCount(node, -1);
		                                 node.select(false);
	                                    }, 
	                                    false
	           )
	allowOnSelectEvent = true;
	
	gwasShowSearchTemplate();
	    console.log('gwasClearSearch calling gwasShowSearchResults');
	gwasShowSearchResults(); //reload the full search results
	
}

//this function removes or adds to the filter search term array based on whether or not a node in the tree is selected
function gwasSyncNode(node)  {
	var param = new Object();  
	var isCategory = node.data.isCategory;
	
	// don't sync category nodes (they can't be selected)
	if (isCategory) {
		return true
	}

	var categoryName = node.data.categoryName;
	
	var outerNode = node;
	var inSearchTerms = false;
	
	// find all nodes that are copies of this node
	// if this or any of the copies of this node should be in search terms, then mark as being in search terms
	//  (this will prevent a later node in tree from removing from terms if an earlier node indicates it should be 
	//   in terms; this logic could be up for debate  - e.g. maybe it should never be in terms if any of the copies
	//         say it shouldn't be - but making consistent for now, can reverse logic easily if needed )
	node.tree.visit(
			          function gwasCheckCopies (node) {
			        	  if (outerNode.data.key == node.data.key)  {
			        		  // found a key that matches (i.e. is the original one or a copy)
     	        		  // a node will be in search terms if it is selected and its parent is not
			        		  // or if it is selected and its parent is a category
			        		  if (node.isSelected() && (!node.parent.isSelected() || node.parent.data.isCategory))  {
			        			  inSearchTerms = true;  
			        		  }
			        	  }
			          },
			          false
			       )
		
	param.display = categoryName;     // category        	
	param.keyword = node.data.termName;  // term name
	param.id = node.data.id;
	if (inSearchTerms)  {
	    gwasAddFilterTreeSearchTerm(param);
	}
	else {
		// create string that remove fn recognizes as key
		var termID = node.data.key;
		gwasRemoveFilterTreeSearchTerm(termID);
	}
	
}

//subtract node 2 from node 1;  return an array containing list nodes that are in node 1 but not node 2
function gwasSubtractNodes(nodes1, nodes2)  {

    var resultNodes = new Array();

    for (var i = 0; i < nodes1.length; i++) {  // loop thru nodes1
	var n1 = nodes1[i];                
		  
	var found = false;
		  
	for (var j = 0; j < nodes2.length; j++) {  // loop thru nodes2
	    var n2 = nodes2[j];
		      
	    if (n2.data.uniqueTreeId == n1.data.uniqueTreeId)  {  // use uniqueTreeId to determine matches
		found = true;
		break;   // no need to continue with loop since we found match
	    } 
	}
       
	// if we didn't find the node in nodes2, add to result array
	if (!found)  {
     	    resultNodes.push(n1);
	}        		  
    }
    return resultNodes;
}

jQuery.ui.dynatree.nodedatadefaults["icon"] = false;
console.log("about to call jQuery dynatree using gwasTreeURL")

jQuery(function(){
    jQuery("#gwas-filter-div").dynatree({
	initAjax: {  url: gwasTreeURL,
 		data: { mode: "all" } 
 	},
 	checkbox: true,
 	persist: false,
 	selectMode: 3,
 	minExpandLevel: 1,
 	fx:{ height: "toggle", duration: 180 },
 	autoCollapse: true,
     onQuerySelect: function(flag, node) {   // event that is triggered prior to select actually happening on node
     	
     	if (!allowOnSelectEvent)  {
     		return true;
     	} 
     	
     	// before selecting node, save a copy of which nodes were selected
     	// (note that this only gets done when select is called outside of the onSelect event
	// since we're using the global allowOnSelectEvent flag above) 
     	nodesBeforeSelect = node.tree.getSelectedNodes(false);

     },
     onSelect: function(flag, node) {
     	// don't allow this event to be triggered by itself; return immediately if called as a result of the event itself
     	if (!allowOnSelectEvent)  {
     		return true;
     	} 
     	else  {
     		allowOnSelectEvent = false;
     	}
     	
     	// before re-synchronizing tree, make sure any nodes that have same key as this one have been properly
     	// selected and deselected
         
     	var tree = node.tree;        	
         var selectNode = node;   // store the node that was selected so we can reference unambiguously in tree.visit function below 

     	// node is now selected, and any other changes to the tree have already happened (i.e. changes to children, parents,
         //   cousins, second cousins, ...) so retrieve a copy of which nodes are now selected
     	var nodesAfterSelect = node.tree.getSelectedNodes(false);
        
         // retrieve a list of those that are partially selected (e.g. no check box but a child or grandchild .. may be);
         var nodesPartiallySelected = new Array();
     	jQuery(".dynatree-partsel").each(
     			function(){
     		                  var node = jQuery.ui.dynatree.getNode(this);
     		                  
     		                  //  Selected nodes may also appear here - 
     		                  //   make sure only those that are not selected are actually included
     		                  //    in this list; 
     		                  //  And don't add category nodes either
     		                  if (!node.isSelected() && !node.data.isCategory)  {
     		                      nodesPartiallySelected.push(node);
     		                  }
     		              }
     			);
     	
     	
     	
     	// find nodes that are in After but were not in Before (i.e. Added)
     	var nodesAdded = gwasSubtractNodes(nodesAfterSelect, nodesBeforeSelect);

     	for (var i = 0; i < nodesAdded.length; i++) {
     		var n = nodesAdded[i];
     		// process node if it's not a category
     		if (!n.data.isCategory)  {
         		// loop through every node in tree and find copies, make sure all copies are selected        		
 	            n.tree.visit(  function (node) {
   	                              if ((n.data.key == node.data.key) && (n.data.uniqueTreeId != node.data.uniqueTreeId)) {
 	            	            	  node.select(true);
 	            	              } 
 	            	           } 
 	                         , false
 	            		     );
             }
     		
     		
     	}

     	// find nodes that are in Before but were not in After (i.e. Removed)
     	var nodesRemoved = gwasSubtractNodes(nodesBeforeSelect, nodesAfterSelect);
     	
     	// We need to remove partially selected nodes from removed list, since we don't want to call the select(false) method on these;
         //   if we did, then we would trigger all children to then be deselected in copies which isn't right;  instead the state of this
     	//   node will be controlled by actions on the children 
     	var nodesFullyRemoved = gwasSubtractNodes(nodesRemoved, nodesPartiallySelected);
     	
     	for (var i = 0; i < nodesFullyRemoved.length; i++) {
     		var n = nodesFullyRemoved[i];         		

     		// process node if it's not a category
     		if (!n.data.isCategory)  {
         		// loop through every node in tree and find copies, make sure all copies are DEselected
 	            n.tree.visit(  function (node) {
 	            	              if ((n.data.key == node.data.key) && (n.data.uniqueTreeId != node.data.uniqueTreeId)) {
 	            	            	  node.select(false);
 	            	              } 
 	            	           } 
 	                         , false
 	            		     );
             }
     		
     	}
     	
     	// reset flag to true now that we're past part that might trigger the event again	      
 		allowOnSelectEvent = true;

     	// Resynchronize entire tree when something changes
     	// We need to do this because a select may affect other nodes than the one selected,
     	//  but that doesn't trigger the onSelect event
     	// Following call executes the gwasSyncNode function on all nodes in tree, except for root
     	node.tree.visit(gwasSyncNode, false); 
     	gwasShowSearchTemplate();
	 console.log('gwas ... calling gwasShowSearchResults');
     	gwasShowSearchResults();        	
     },
     onClick: function(node, event) {
     	// if the user clicked outside the node, but in the tree, don't select/unselect the node
     	// or if the node has a zero count and is not selected, don't allow it to be selected (but allow it to be expanded)       	
         if( (node.getEventTargetType(event) == null) ||             	 
        		(node.data.facetCount == 0 && !node.isSelected() && !(node.getEventTargetType(event) == 'expander'))
           )
         {
             return false;// Prevent default processing
         }
         
         //New code to generate popup because the categories don't have children.
         generateBrowseWindow(node.data.title)
         
         return true;
     },
     onActivate: function(node){
	    	if(!node.data.isCategory){
	    		if(!node.isSelected()){
	    			node.select(true);
	    		}
	    		else{
	    			node.select(false);
	    		}
	    	
	    	}
	    	
	    	node.deactivate();
 	},
 	onCustomRender: function(node) {
 		// if not a category and count is zero, apply the custom class to node
 		if (!node.data.isCategory && node.data.facetCount == 0)  {
 			node.data.addClass = "zero-selected";
 		}
 		else
 	    {
 			node.data.addClass = null;
 	    }
 	},
 	classNames: {connector: "dynatree-no-connector"}
 });
});

//find the analysis in the array with the given id
function gwasGetAnalysisIndex(id)  {
	for (var i = 0; i < analysisProbeIds.length; i++)  {
		if (analysisProbeIds[i].analysisId == id)  {
			return i;
		}
	}
	
 return -1;  // analysis not found		
}

//remove an element from an array by value, keeping all others in place
function gwasRemoveByValue(arr, val) {
	for(var i=0; i<arr.length; i++) {
		if(arr[i] == val) {
			arr.splice(i, 1);
			break;
		}
	}
}


function gwasGetHeatmapPaginator(divID, analysisId, analysisIndex, maxProbeIndex) {
	probesPerPageElement = document.getElementById("probesPerPage_" + analysisId);
	numberOfProbesPerPage = probesPerPageElement.options[probesPerPageElement.selectedIndex].value;
	
	// get number of extra probes on last page (will be 0 if last page is full)
	var numberProbesLastPage = maxProbeIndex % numberOfProbesPerPage;
	
	// find number of full pages
	var numberOfFullPages = (maxProbeIndex - numberProbesLastPage) / numberOfProbesPerPage;
	
	// find number of pages - equal to number of full pages if none left over after full pages
	var numberOfPages = numberOfFullPages;        	        	
	if (numberProbesLastPage > 0)  {
		numberOfPages = numberOfPages + 1;
	}
	
	//if there is only 1 page, just hide the paging control since it's not needed
	if(numberOfPages==1){
		jQuery("#pagination_" + analysisId).hide();
	}
	else  {
		jQuery("#pagination_" + analysisId).show();
	}
	        	        	
	// the probeIds list and selectList are initially null; will be populated when we load the heat map data
	var analysisObject = {analysisId:analysisId, probeIds:null, selectList:null, maxProbeIndex:maxProbeIndex};
	
	// either replace current object, or add new one if not in array yet
	if (analysisIndex == -1)  {
     analysisProbeIds.push(analysisObject);
 } else
 {	
     analysisProbeIds[analysisIndex] = analysisObject;
 }

	jQuery("#pagination_" + analysisId).paging(numberOfPages, { 
	    perpage:1, 
     format:"[<(qq -) ncnnn (- pp)>]",
     onSelect: function (page) { 
     	

     	jQuery("#analysis_holder_" + analysisId).mask("Loading...");
         var analysisIndex = gwasGetAnalysisIndex(analysisId);

         // make sure we are getting number of probes per page for current element
         var probesPerPageElement = document.getElementById("probesPerPage_" + analysisId);
     	var numberOfProbesPerPage = probesPerPageElement.options[probesPerPageElement.selectedIndex].value;
         
     	gwasLoadHeatmapData(divID, analysisId, page, numberOfProbesPerPage);

     	jQuery('body').data("currentPage:" + analysisId, page);
                                 
     }, 
     onFormat: function(type) {      
   
             switch (type) {      
             case 'block':      
                 	if (!this.active)      
                 		return '<span class="disabled">' + this.value + '</span>';      
                 	else if (this.value != this.page)      
                     return '<em><a href="#' + this.value + '">' + this.value + '</a></em>';      
                 	return '<span class="current">' + this.value + '</span>';      
             case 'left':      
             case 'right':      
   
                     if (!this.active)      
                             return '';      
                     else       
                             return '<em><a href="#' + this.value + '">' + this.value + '</a></em>';      
   
             case 'next':      
   
                     if (this.active) {      
                             return '<a href="#' + this.value + '" class="next">Next &raquo;</a>';      
                     }      
                     return '<span class="disabled">Next &raquo;</span>';      
   
             case 'prev':      
   
                     if (this.active) {      
                             return '<a href="#' + this.value + '" class="prev">&laquo; Previous</a>';      
                     }      
                     return '<span class="disabled">&laquo; Previous</span>';      
   
             case 'first':      
   
                     if (this.active) {      
                             return '<a href="#' + this.value + '" class="first">|&lsaquo;</a>';      
                     }      
                     return '<span class="disabled">|&lsaquo;</span>';      
   
             case 'last':      
   
                     if (this.active) {      
                             return '<a href="#' + this.value + '" class="prev">&rsaquo;|</a>';      
                     }      
                     return '<span class="disabled">&rsaquo;|</span>';      
   
             case 'fill':      
                     if (this.active) {      
                             return "...";      
                     }      
             }      
     }
 }); 	
	
}

//function gwasLoadHeatmapPaginator(divID, analysisId, page) {
//
//	var analysisIndex = gwasGetAnalysisIndex(analysisId);
//		
//	gwasAJAXManager.add({
//		url:gwasGetHeatmapNumberProbesURL,		
//		data: {id: analysisId, page:page},
//		success: function(response) {
//			var maxProbeIndex = response['maxProbeIndex']
//			
//			gwasGetHeatmapPaginator(divID, analysisId, analysisIndex, maxProbeIndex, page);
//	
//		},
//		error: function(xhr) {
//			console.log('Error!  Status = ' + xhr.status + xhr.statusText);
//		}
//	});
//}

function gwasUpdateSelectedAnalyses() {
	var selectedboxes = jQuery(".analysischeckbox:checked");
	if (selectedboxes.length > 0) {
		jQuery('#selectedAnalyses').html("<b>" + selectedboxes.length + "</b> analyses selected");
	}
	else {
		jQuery('#selectedAnalyses').html("&nbsp;");
	}
}

//Globally prevent AJAX from being cached (mostly by IE)
jQuery.ajaxSetup({
	cache: false
});


//Add selected analyses to active filters
function gwasFilterSelectedAnalyses() {
	var selectedboxes = jQuery(".analysischeckbox:checked");
	if (selectedboxes.length == 0) {
		jQuery('#selectedAnalyses').html("<b>" + selectedboxes.length + "</b> analyses selected. Please select analyses to be filtered!");
	}
	jQuery(".analysischeckbox:checked").each(function(i, selected){
	var searchParam={id:selected.name,
		        display:'Analyses',
		        keyword:selected.value,
		        category:'ANALYSIS_ID'};
		gwasAddSearchTerm(searchParam);
		
		
	})
}

function gwasExportAnalysisandMail()
{
	
	var selectedboxes = jQuery(".analysischeckbox:checked");
	if (selectedboxes.length == 0) {
		alert("No analyses are selected! Please select analyses to export.");
	}
	else {
		jQuery('#divTomailIds').dialog("destroy");
		jQuery('#divTomailIds').dialog(
			{
				modal: true,
				height: 250,
				width: 400,
				title: "Enter Email Id",
				show: 'fade',
				hide: 'fade',
				resizable: false,
				buttons: {"Submit" : gwasSendMail}
			});
	}
}


function gwasSendMail()
{
	var selectedboxes = jQuery(".analysischeckbox:checked");
	if (selectedboxes.length == 0) {
		alert("No analyses are selected! Please select analyses to export.");
	}
	else {
		var radioMail= jQuery('#radioMail:checked').val();
		var analysisIds = "";
		analysisIds += jQuery(selectedboxes[0]).attr('name');
		for (var i = 1; i < selectedboxes.length; i++) {
			analysisIds += "," + jQuery(selectedboxes[i]).attr('name');
		}
	
		var toMailId = jQuery('#toEmailID').val();
	
		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		if( !emailReg.test(toMailId) || !toMailId) {
			alert ("Please enter a valid email address!")
			} 
		else {
			var data='';
			if (radioMail == "link") {
				data="analysisIds=" + analysisIds + "&toMailId=" + toMailId + "&isLink=false";
				//window.location = gwasExportAnalysisURL + "?analysisIds=" + analysisIds + "&toMailId=" + toMailId + "&isLink=false" ;
				}
			else {
				data="analysisIds=" + analysisIds + "&toMailId=" + toMailId;
				//window.location = gwasExportAnalysisURL + "?analysisIds=" + analysisIds + "&toMailId=" + toMailId;
				}
			jQuery('#divMailStatus').html('Please wait mail is being sent...');
			jQuery('#divMailStatus').dialog(
					{
						modal: true,
						height: 150,
						width: 400,
						title: "Email Status",
						show: 'fade',
						hide: 'fade',
						resizable: false,
						 
					});	

			jQuery.ajax(
					{
					// The link we are accessing.
					url:gwasExportAnalysisURL,
					data:data,
					// The type of request.
					type: "post",
					// The type of data that is getting returned.
					dataType: "json",
					error: function(){
					jQuery('#divMailStatus').html('<message>Mail sending failed!!!</message>');
						jQuery('#divMailStatus').dialog(
								{
									modal: true,
									height: 150,
									width: 400,
									title: "Email Status",
									show: 'fade',
									hide: 'fade',
									resizable: false,			 
								});	 
					},
					beforeSend: function(){
					},
					complete: function(){
						
					},
					success: function( data ){
					if(data.status=='success')
						{
						jQuery('#divTomailIds').dialog("destroy");	
						jQuery('#divMailStatus').html('<message>Mail sent successfully!!!</message>');
						jQuery('#divMailStatus').dialog(
								{
									modal: true,
									height: 150,
									width: 400,
									title: "Email Status",
									show: 'fade',
									hide: 'fade',
									resizable: false,			 
								});	
						}
					}

			});
		}
		
	}
}

//Remove P-value from active filters if P-value selected from inside the analysis results window
function gwasRemovePvalue(analysisId){
	var pvalue=jQuery('#analysis_results_table_' + analysisId + '_cutoff').val();
	for (index = 0; index < currentSearchTerms.length; ++index) {
		value = currentSearchTerms[index];
		if (value.substring(0, 7) === "PVALUE|" ) {
		alert("P-value cutoff will be removed from Active filters. Please enter the P-value cutoff again");
		gwasRemoveSearchTerm(this,value);
		}
	}
}


