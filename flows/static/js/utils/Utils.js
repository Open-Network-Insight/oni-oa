

var Utils = {
	showTooltip: function(htmlString, x, y){		
		$("#tooltip").html(htmlString);

		$("#tooltip").css("top", y + 10 + "px");
		$("#tooltip").css("left", x + 10 + "px");
		$("#tooltip").css("visibility", "visible");

	},

	hideTooltip: function(){	
		$("#tooltip").html("");
		$("#tooltip").css("visibility", "hidden");
	},
};

module.exports = Utils;