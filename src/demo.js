$(document).ready(function () {
	var grid = $(".container").gridster({
		widget_selector: ".box",
		widget_margins: [10, 10],
		widget_base_dimensions: [100, 60],
		draggable: {
			drag: function (event, ui) {
				// jsPlumb.repaint() is broken in jsPlumb v.1.7.6 but correct for v.1.5.2
				// so we use repaintEverything() instead

				//jsPlumbInstance.repaint(ui.$player.attr("id"));

				jsPlumbInstance.repaintEverything();
			},
			stop: function (event, ui) {
				// jsPlumb.repaint() is broken in jsPlumb v.1.7.6 but correct for v.1.5.2
				// so we use repaintEverything() instead

				//jsPlumbInstance.repaint(ui.$player.attr("id"));

				jsPlumbInstance.repaintEverything();
			}
		},
		on_move_widget_down: function (el) {
	        jsPlumbInstance.repaintEverything();
	    },
	}).data('gridster');

	var jsPlumbInstance = jsPlumb.getInstance();
	jsPlumbInstance.importDefaults({
            Anchors: ["Right", "Left"],
            Connector: ["Flowchart", { stub: 10, midpoint: 0.5, cornerRadius: 30 }],
            EndpointStyle: { fillStyle: "gray", radius: 0.1 },
            PaintStyle: { strokeStyle: "gray", lineWidth: 4 },
            HoverPaintStyle: { strokeStyle: "rgb(255,159,64)", lineWidth: 4 },
            Overlays: [["Arrow", { location: 1, width: 12, length: 10 }]]
        });

	bindHover();

	function addBox () {
		cancelAll();
		unbindHover();
		var container = $(".container");
		container.off("click.newnode");		
		container.css("cursor", "crosshair");
		$('.box').css("cursor", "crosshair");
		var relativeXPosition, relativeYPosition;
        container.mousemove(function (e) {
            var parentOffset = container.parent().offset();
            relativeXPosition = (e.pageX + container.scrollLeft() - parentOffset.left);
            relativeYPosition = (e.pageY + container.scrollTop() - parentOffset.top);
        });
        container.on("click.newnode", function (event) {
            var pos = getCoords(relativeXPosition, relativeYPosition);
            var box = document.createElement('div');
			box.className = "box";
            grid.add_widget(box, 1, 1, pos.col, pos.row);
            $(box).css("cursor", "crosshair");
        });
	};

	function cancelAll () {
		var container = $(".container"),
			boxes = $('.box');
		bindHover();
		container.css("cursor", "default");
		boxes.css("cursor", "default");
		container.off("click.newnode");
		boxes.off("click.connector");
		boxes.removeClass("sourseNode potentialitySourse");
	};	

	function getCoords (posX, posY) {
	    var col = Math.floor(posX / grid.min_widget_width) + 1,
			row = Math.floor(Math.abs(posY - 40) / grid.min_widget_height) + 1;
	    var pos = {
	        col: col,
	        row: row
	    };
	    return pos;
	};

	function addConnector () {
		cancelAll();
		var container = $(".container"),
			boxes = $('.box');
		boxes.off("click.connector");
		container.css("cursor", "crosshair");
        boxes.css("cursor", "crosshair");
        boxes.addClass("potentialitySourse");
        var target,
        	source,
        	numClick = 0;
        boxes.on('click.connector', function (event) {
			numClick += 1;
			if (numClick == 1) {
				source = $(this);
				source.addClass("sourseNode");
			} else if (numClick == 2) {
				target = $(this);
				var c = jsPlumbInstance.connect({
            		source: source,
            		target: target,
            		container: container
        		});
        		numClick = 0;
        		source.removeClass("sourseNode");
			}

        });
	};

	function bindHover () {
		$('.box').hover(
			function (inEvent) {
				var $this = $(this);
				$this.addClass("box_hover");
				jsPlumbInstance.getConnections({source: $this}).forEach(function (conn) {
					conn.setPaintStyle({ strokeStyle: "rgb(255,159,64)", lineWidth: 4 }, false);
				});
				jsPlumbInstance.getConnections({target: $this}).forEach(function (conn) {
					conn.setPaintStyle({ strokeStyle: "rgb(255,159,64)", lineWidth: 4 }, false);
				});
			},
			function (outEvent) {
				var $this = $(this);
				$this.removeClass("box_hover");
				jsPlumbInstance.getConnections({source: $this}).forEach(function (conn) {
					conn.setPaintStyle({ strokeStyle: "gray", lineWidth: 4 }, false);
				});
				jsPlumbInstance.getConnections({target: $this}).forEach(function (conn) {
					conn.setPaintStyle({ strokeStyle: "gray", lineWidth: 4 }, false);
				});
			});
	};

	function unbindHover () {
		$('.box').off("mouseenter mouseleave");
	};

	function deactivateBtn () {
		$(".btn").removeClass("active");
	}

	$('#addBoxBtn').on('click', function () {
		deactivateBtn();
		$(this).addClass("active");
		addBox();
	});

	$('#addConnBtn').on('click', function () {
		deactivateBtn();
		$(this).addClass("active");
		addConnector();
	});

	$('#cancelBoxBtn').on('click', function () {
		deactivateBtn();
		$(this).addClass("active");
		cancelAll();
	});
});