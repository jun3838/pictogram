// commit 1
// commit 2
// chart object
function Chart(){
	this.name = 'Untitled Chart';
	this.color = '#FFFFFF';
	this.items = [
		{name: 'item1', shape: 'triangle', color: '#FF0000', quantity: 1, html: null },
		{name: 'item2', shape: 'circle', color: '#0000FF', quantity: 1, html: null },
	]
	this.html = {};
}

// adding function to prototype
Chart.prototype = {
	constructor: Chart,
	init: function(){

		var chart = this;

		// create a container
		var container = document.createElement('div');
		container.className += ' container';
		container.id = charts.length + 1;
		container.style.width = '400px';

		// chart title
		var title = document.createElement('input');
		title.className += ' charttitle';
		title.value = chart.name;
		container.appendChild(title);

		// container.style.height = '200px';
		container.style.left = (window.innerWidth/2 - (parseInt(container.style.width)/2) ) + 'px';
		container.style.top = '10%';//(window.innerHeight/2 - (parseInt(container.style.height)/2) ) + 'px';
		Util.getDom('#editor').appendChild(container);

		var labels = [];
		for(var i=0;i<chart.items.length;i++){
			// create a item row
			var row = document.createElement('div');
			row.className += ' row';
			container.appendChild(row);

			// create a label div that hold item's name
			var label = document.createElement('input');
			label.className += ' label';
			label.value = chart.items[i].name;
			row.appendChild(label);

			// event for label
			label.addEventListener('mousemove', function(e){e.stopPropagation()}, false);
			label.addEventListener('mousedown', Editor.editLabel, false);

			// create a quantity div that hold item's quantity
			var quantity = document.createElement('div');
			quantity.className += ' quantity';
			row.appendChild(quantity);

			// event for quantity mousedown
			quantity.addEventListener('mousedown', Editor.editQuantity, false);

			// add default shape quantity
			for(var j=0;j<chart.items[i].quantity;j++){
				var shape = document.createElement('div');

				shape.className = (chart.items[i].shape+' item');

				if(chart.items[i].shape=='square' || chart.items[i].shape == 'circle'){
					shape.style.width = window.getComputedStyle(quantity, null).getPropertyValue('height');
					shape.style.height = window.getComputedStyle(quantity, null).getPropertyValue('height');
					shape.style.backgroundColor = chart.items[i].color;
				}
				else{
					shape.style.borderBottom = window.getComputedStyle(quantity, null).getPropertyValue('height') + ' solid '+chart.items[i].color;
					shape.style.borderLeft = parseInt(window.getComputedStyle(quantity, null).getPropertyValue('height')) / 2 + 'px solid transparent';
					shape.style.borderRight = parseInt(window.getComputedStyle(quantity, null).getPropertyValue('height')) / 2 + 'px solid transparent';
				}

				quantity.appendChild(shape);
			}

			if(i<chart.items.length-1){
				// create separator line
				var separator = document.createElement('div');
				separator.className += ' separator';
				container.appendChild(separator);
			}
		}

		// add resize handler
		var tl, tr, bl, br;
		tl = document.createElement('div');
		tr = document.createElement('div');
		bl = document.createElement('div');
		br = document.createElement('div');
		// assign class
		tl.className = 'resizeHandle-tl resizeHandle';
		tr.className = 'resizeHandle-tr resizeHandle';
		bl.className = 'resizeHandle-bl resizeHandle';
		br.className = 'resizeHandle-br resizeHandle';
		// position it
		tl.style.position = 'absolute';
		tl.style.left = '0px';
		tl.style.top = '0px';

		tr.style.position = 'absolute';
		tr.style.right = '0px';
		tr.style.top = '0px';

		bl.style.position = 'absolute';
		bl.style.left = '0px';
		bl.style.bottom = '0px';

		br.style.position = 'absolute';
		br.style.right = '0px';
		br.style.bottom = '0px';

		// add into container
		container.appendChild(tl);
		container.appendChild(tr);
		container.appendChild(bl);
		container.appendChild(br);

		chart.html = container;

		// chart event
		container.addEventListener('mousedown', function(e){
			e.stopPropagation();
			for(var i=0;i<charts.length;i++){
				charts[i].html.classList.remove('selected');
			}
			this.className += ' selected';
			this.style.cursor = 'move';
			Editor.editingChart = chart;
			initDrag(e);
			Editor.showControlPanel();

			// assign chart background color to control panel
			var color = window.getComputedStyle(this, null).getPropertyValue('background-color');
			color = color.replace('rgb(','');
			color = color.replace(')','');
			color = color.split(',');
			color = Util.rgbToHex(parseInt(color[0]), parseInt(color[1]), parseInt(color[2]));
			Util.getDom('#controlpanel .chartcolor').innerHTML = color;
			Util.getDom('#controlpanel .chartcolor').style.backgroundColor = color;
		})

		var allHandler = container.querySelectorAll('.resizeHandle');
		for(var i=0;i<allHandler.length;i++){
			allHandler[i].addEventListener('mousedown', initResize, false);
			allHandler[i].addEventListener('mouseup', stopResize, false);
		}
	},
}

// resize and drag and move function
function initDrag(e){
	mouseOffsetX = e.clientX - Editor.editingChart.html.offsetLeft;
	mouseOffsetY = e.clientY - Editor.editingChart.html.offsetTop;
	document.addEventListener('mousemove', doDrag, false);
	document.addEventListener('mouseup', stopDrag, false);
}

function stopDrag(){
	document.removeEventListener('mousemove', doDrag, false);
	document.removeEventListener('mouseup', stopDrag, false);
	Editor.editingChart.html.style.cursor = 'default';
}

function doDrag(e){
	e.preventDefault();
	var targetElement = Editor.editingChart.html;
	var newLeft = e.clientX - mouseOffsetX;
	var newTop = e.clientY - mouseOffsetY;

	// set boundaries so that chart remain in editor
	// set top left boundary
	newLeft = (newLeft<0)?0:newLeft;
	newTop = (newTop<0)?0:newTop;

	// set bottom right boudary
	newLeft = (newLeft+targetElement.clientWidth>=window.innerWidth)?(window.innerWidth - targetElement.clientWidth):newLeft;
	newTop = (newTop+targetElement.clientHeight>=window.innerHeight)?(window.innerHeight - targetElement.clientHeight):newTop;

	targetElement.style.left = newLeft + 'px';
	targetElement.style.top = newTop + 'px';
}

function initResize(e){
	e.stopPropagation();
	startX = e.clientX;
	startY = e.clientY;
	whichHandler = this.className.split(' ')[0].split('-')[1];
	var targetElement = Util.getDom('.container.selected');
	initialWidth = parseInt(targetElement.clientWidth);
	initialHeight = parseInt(targetElement.clientHeight);
	document.addEventListener('mousemove', doResize, false);
	document.addEventListener('mouseup', stopResize, false);
}

function stopResize(){
	document.removeEventListener('mousemove', doResize, false);
	document.removeEventListener('mouseup', stopResize, false);
}

function doResize(e){
	e.preventDefault();
	var targetElement = Editor.editingChart.html;
	var newWidth, newHeight;
	var minWidth = 250;
	var minHeight = Editor.editingChart.items.length*40;
	switch(whichHandler){
		case 'tl':
			newWidth = (initialWidth - e.clientX + startX);
			newHeight = (initialHeight - e.clientY + startY);
			if(newWidth > minWidth)
				targetElement.style.left = e.clientX + 'px';
			if(newHeight > minHeight)
				targetElement.style.top = e.clientY + 'px';
			break;
		case 'tr':
			newWidth = (initialWidth + e.clientX - startX);
			newHeight = (initialHeight - e.clientY + startY);
			if(newHeight > minHeight)
				targetElement.style.top = e.clientY + 'px';
			break;
		case 'bl':
			newWidth = (initialWidth - e.clientX + startX);
			newHeight = (initialHeight + e.clientY - startY);
			if(newWidth > minWidth)
				targetElement.style.left = e.clientX + 'px';
			break;
		case 'br':
			newWidth = (initialWidth + e.clientX - startX);
			newHeight = (initialHeight + e.clientY - startY);
			break;
	}

	// set minimum height and width for chart
	newWidth = (newWidth<minWidth)?minWidth:newWidth;
	newHeight = (newHeight<minHeight)?minHeight:newHeight;

	// assign new width and height to chart
	targetElement.style.width = newWidth + 'px';
	targetElement.style.height = newHeight + 'px';

	for(var i=0;i<Editor.editingChart.items.length;i++){

		// change row size according to user resize
		var rows = targetElement.querySelectorAll('.row');
		var rowPadding = parseInt(window.getComputedStyle(rows[i], null).getPropertyValue('padding-top')) * 2
		var newRowHeight = (newHeight / Editor.editingChart.items.length) - rowPadding;
		rows[i].style.height = newRowHeight + 'px';

		// control font size so that it fit in chart
		var fontSize = newHeight * 0.1;
		rows[i].querySelector('.label').style.fontSize = fontSize + 'px';
		rows[i].querySelector('.label').style.lineHeight = fontSize + 'px';

		// change quantity shape to fit
		for(var j=0;j<rows[i].querySelectorAll('.item').length;j++){
			var items = rows[i].querySelectorAll('.item');
			if(items[j].classList.contains('triangle')){
				items[j].style.borderBottomWidth = newRowHeight + 'px';
				items[j].style.borderLeftWidth = newRowHeight/2 + 'px';
				items[j].style.borderRightWidth = newRowHeight/2 + 'px';
			}
			else{
				items[j].style.height = newRowHeight + 'px';
				items[j].style.width = newRowHeight + 'px';
			}
		}
	}
}

// main init function
function init(){
	// initialize color picker
	var canvas = Util.getDom('#colorpicker');
	// get canvas context
	var ctx = canvas.getContext('2d');

	var img = new Image();
	img.src = 'color.jpg	';
	img.onload = function(){
		ctx.drawImage(img, 0, 0);
	}

	// canvas event
	canvas.addEventListener('mousedown', function(e){
		Editor.enableColorSelect = true;
		Editor.changeColor(e);
	}, false);
	canvas.addEventListener('mouseup', function(){
		Editor.enableColorSelect = false;
		Editor.hideColorPicker();
		Editor.saveChart();
	}, false);
	canvas.addEventListener('mousemove', function(e){
		e.preventDefault();
		Editor.changeColor(e);
	}, false);


	// bind new chart button action
	Util.getDom('#btnNewChart').addEventListener('click', function(){
		var chart = new Chart();
		chart.init();
		charts.push(chart);
	}, false)

	// bind default editor mouse down action
	Util.getDom('#editor').addEventListener('mousedown', function(e){
		e.stopPropagation();
		// unselect all chart
		for(var i=0;i<charts.length;i++){
			charts[i].html.classList.remove('selected');
		}
		// Editor.editingChart = null;

		// unselect all quantity
		for(var i=0;i<document.querySelectorAll('.quantity').length;i++){
			document.querySelectorAll('.quantity')[i].classList.remove('editing');
		}
		// Editor.editingElement = null;

		// hide control panel
		Util.getDom('#controlpanel').style.display = 'none';

		// save chart
		Editor.saveChart();

	}, false)

	Util.getDom('body').addEventListener('mousemove', function(e){ e.preventDefault() }, false);

	// bind color selection action
	Util.getDom('#controlpanel .iconcolor').addEventListener('mousedown', Editor.showColorPicker, false);
	Util.getDom('#controlpanel .chartcolor').addEventListener('mousedown', Editor.showColorPicker, false);

	// bind selection change action
	Util.getDom('#controlpanel select').addEventListener('change', Editor.changeShape, false);

	// bind quantity adjustment button
	Util.getDom('#btnPlus').addEventListener('mousedown', Editor.changeQuantity, false);
	Util.getDom('#btnMinus').addEventListener('mousedown', Editor.changeQuantity, false);

	// bind quantity adjustment for row
	// bind quantity adjustment button
	Util.getDom('#btnPlusRow').addEventListener('mousedown', Editor.changeRow, false);
	Util.getDom('#btnMinusRow').addEventListener('mousedown', Editor.changeRow, false);
}

// Utilities object
var Util = {
	rgbToHex: function(r, g, b){
		return '#'+Util.convertToHex(r)+Util.convertToHex(g)+Util.convertToHex(b);
	},
	convertToHex: function (color){
		// convert color string into hexadecimal string
		var hex = color.toString(16);
		return ((hex.length == 1)?"0"+hex:hex).toUpperCase();
	},
	getDom: function(selector){
		return document.querySelector(selector);
	}
}


// Editor object
var Editor = {
	editQuantity: function(e){
		var allQuantity = document.querySelectorAll('.quantity');
		for(var i=0;i<allQuantity.length;i++){
			allQuantity[i].classList.remove('editing');
		}
		this.className += ' editing';
		// show control panel for editing quantity
		Util.getDom('#quantityCP').style.display = 'block';

		// show color code for selected item
		if(this.querySelector('.item').classList.contains('triangle')){
			Util.getDom('#quantityCP .iconcolor').style.backgroundColor = this.querySelector('.item').style.borderBottomColor;
			var color = this.querySelector('.item').style.borderBottomColor+'';
		}
		else{
			Util.getDom('#quantityCP .iconcolor').style.backgroundColor = this.querySelector('.item').style.backgroundColor;
			var color = this.querySelector('.item').style.backgroundColor+'';
		}

		color = color.replace('rgb(','');
		color = color.replace(')','');
		color = color.split(',');
		Util.getDom('#quantityCP .iconcolor').innerHTML = Util.rgbToHex(parseInt(color[0]), parseInt(color[1]), parseInt(color[2]));

		// assign selected shape to control panel shape selection option
		Util.getDom('#controlpanel select').value = this.querySelector('.item').classList[0];

		// assign editing element for easy accessible
		Editor.editingElement = this;
	},
	editLabel: function(){
		var allQuantity = document.querySelectorAll('.quantity');
		for(var i=0;i<allQuantity.length;i++){
			allQuantity[i].classList.remove('editing');
		}
		// Editor.editingElement = null;
		Util.getDom('#quantityCP').style.display = 'none';
	},
	changeQuantity: function(){
		var item = Editor.editingElement.querySelector('.item');
		var clone = item.cloneNode(true);
		var size = Editor.editingElement.querySelectorAll('.item').length;
		if(this.classList.contains('plus')){ // add quantity
			Editor.editingElement.appendChild(clone);
		}
		else{ // minus quantity
			if(size>1) Editor.editingElement.removeChild(item);
		}
	},
	changeRow: function(){
		var container = Editor.editingChart.html;
		var separator = container.querySelector('.separator');
		var size = Editor.editingChart.html.querySelectorAll('.row').length;
		var row = Editor.editingChart.html.querySelector('.row');
		var item = Editor.editingChart.html.querySelector('.item');
		var cloneItem = item.cloneNode(true);
		var cloneRow = row.cloneNode(true);
		var cloneSeparator = separator.cloneNode(true);
		cloneRow.querySelector('.label').value = 'item'+(size+1);
		cloneRow.querySelector('.quantity').innerHTML = '';
		cloneRow.querySelector('.quantity').classList.remove('editing');
		cloneRow.querySelector('.quantity').appendChild(cloneItem);
		Editor.editingChart.html.appendChild(cloneSeparator);
		Editor.editingChart.html.appendChild(cloneRow);

		// label field event listener
		cloneRow.querySelector('.label').addEventListener('mousemove', function(e){e.stopPropagation()}, false);
		cloneRow.querySelector('.label').addEventListener('mousedown', Editor.editLabel, false);

		// quantity field event listener
		cloneRow.querySelector('.quantity').addEventListener('mousedown', Editor.editQuantity, false);

		Editor.editingChart.items.push(Editor.editingChart.items[0]);
	},
	changeColor: function(e){
		if(Editor.enableColorSelect){
			var canvas = Util.getDom('#colorpicker');
			var ctx = canvas.getContext('2d');
			// get actual bounding rectangle of canvas
			var rect = canvas.getBoundingClientRect();
			// get mouse coordinate on the image
			var mx = e.clientX - rect.left;
			var my = e.clientY - rect.top;

			// get image data from canvas image
			var imgdata = ctx.getImageData(mx, my, 1, 1).data;
			// convert RGB data from image data to hexadecimal number
			var hexColor = Util.rgbToHex(imgdata[0],imgdata[1],imgdata[2]);
			Editor.colorLabelToChange.style.backgroundColor = hexColor;
			Editor.colorLabelToChange.innerHTML = hexColor;
			if(Editor.colorLabelToChange.classList.contains('iconcolor')){
				for(var i=0;i<Editor.editingElement.querySelectorAll('.item').length;i++){
					var shapes = Editor.editingElement.querySelectorAll('.item');
					if(shapes[i].classList.contains('triangle')){
						shapes[i].style.borderBottomColor = hexColor;
					}
					else{
						shapes[i].style.backgroundColor = hexColor;
					}
				}
			}
			else{
				Editor.editingChart.html.style.backgroundColor = hexColor;
			}
		}
	},
	changeShape: function(){
		var shape = this.value;
		var items = Editor.editingElement.querySelectorAll('.item');
		for(var i=0;i<items.length;i++){
			items[i].className = '';
			items[i].className = shape+' item';
			if(shape=='triangle'){
				var size = window.getComputedStyle(Editor.editingElement, null).getPropertyValue('height');
				items[i].style.borderBottom = size + ' solid '+Util.getDom('#controlpanel .iconcolor').innerHTML;
				items[i].style.borderLeft = parseInt(size) / 2 + 'px solid transparent';
				items[i].style.borderRight = parseInt(size) / 2 + 'px solid transparent';
				items[i].style.width = '0px';
				items[i].style.height = '0px';
				items[i].style.backgroundColor = '';
			}
			else{
				var size = window.getComputedStyle(Editor.editingElement, null).getPropertyValue('height');
				items[i].style.width = size;
				items[i].style.height = size;
				items[i].style.backgroundColor = Util.getDom('#controlpanel .iconcolor').innerHTML;
				items[i].style.border = '';
			}
		}

	},
	showControlPanel: function(){
		var cp = Util.getDom('#controlpanel');
		cp.style.display = 'block';
		if(Editor.editingElement == null) Util.getDom('#quantityCP').style.display = 'none';
	},
	showColorPicker: function(){
		Editor.colorLabelToChange = this;
		for(var i=0;i<document.querySelectorAll('.colorselect').length;i++){
			document.querySelectorAll('.colorselect')[i].classList.remove('editing');
		}
		this.className += ' editing';
		Util.getDom('#colorpicker').style.display = 'block';
	},
	hideColorPicker: function(){
		Util.getDom('#colorpicker').style.display = 'none';
		Editor.colorLabelToChange = null;
		for(var i=0;i<document.querySelectorAll('.colorselect').length;i++){
			document.querySelectorAll('.colorselect')[i].classList.remove('editing');
		}
	},
	saveChart: function(){
		// save chart detail
		if(Editor.editingChart!=null){
			var color = Editor.editingChart.html.style.backgroundColor+'';
			color = color.replace('rgb(','');
			color = color.replace(')','');
			color = color.split(',');
			color = Util.rgbToHex(parseInt(color[0]), parseInt(color[1]), parseInt(color[2]));
			Editor.editingChart.color = color;

			// save chart content detail
			for(var i=0;i<Editor.editingChart.items.length;i++){
				var row = Editor.editingChart.html.querySelectorAll('.row')[i];
				var label = row.querySelector('.label');
				var quantity = row.querySelector('.quantity');
				Editor.editingChart.items[i].name = label.value;
				if(quantity.querySelector('.item').classList.contains('triangle')){
					color = quantity.querySelector('.item').style.borderBottomColor+'';
				}
				else{
					color = quantity.querySelector('.item').style.backgroundColor+'';
				}
				color = color.replace('rgb(','');
				color = color.replace(')','');
				color = color.split(',');
				color = Util.rgbToHex(parseInt(color[0]), parseInt(color[1]), parseInt(color[2]));
				Editor.editingChart.name = Editor.editingChart.html.querySelector('.charttitle').value;
				Editor.editingChart.items[i].color = color;
				Editor.editingChart.items[i].quantity = quantity.querySelectorAll('.item').length;
				Editor.editingChart.items[i].shape = quantity.querySelector('.item').classList[0];
			}
		}
	},
	editingElement: null,
	enableColorSelect: false,
	editingChart: null,
	colorLabelToChange: null
}