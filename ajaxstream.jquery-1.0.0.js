/*
 * AjaxStream JQuery JavaScript Library v1.0.0
 * 
 * Requires JQuery 1.11.2 or higher
 * 
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Shane Tindle
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
 
 /*
  * Parameters and usage
  * 
  * Basic:
  * $.ajaxStream(parameters);
  * 
  * Options:
  * 	url: String
  * 	data: Object - complex or simple JavaScript serializable object
  * 	dataType: String - "json", "html", "xml", "script", "file"
  * 	files: Array - input elements in an array with type "file"
  * 	timeout: Number - (-1) for unlimited or a positive integer greater than 0
  * 	success: Function - 2xx status code
  * 	error: Function - status code other than 2xx
  * 	complete: Function - runs after success or error regardless of outcome
  * 
  */
 
(function($) {
	// js GUID
	function _s() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
	
	function _g(n) {
		var _r = "";
		
		if (typeof n != "number")
			n = 5;
		
		for (var i = 0; i < n.length; i++)
			_r += _s() + "_";
			
        	return _r;
    	}
	
	// unique ids
	var _i = {
		o: _g(), // <form/>
		r: _g(), // <iframe/>
		i: _g() // <input type="file"/>
	};
	
	// form builder
	function makeForm(p) {
		// id unique to the page
		var i = "streamfile_" + _g(2) + new Date().getTime();
		var f = {
			o: _i.o + i
		};
		
		// return object
		return $("<form/>")
			.attr("method", "POST")
			.attr("name", f.o)
			.attr("id", f.o)
			.attr("enctype", "multipart/form-data")
			.css({ 
				position: "absolute", 
				top: "-1200px", 
				left: "-1200px" 
			})
			.appendTo("body");
	}
	
	// frame builder
	function makeFrame() {
		// id unique to the page
		var i = "streamfile_" + _g(2) + new Date().getTime();
		var f = {
			r: _i.r + i
		};
		
		// return object
		return $("<iframe/>")
			.attr("id", f.r)
			.attr("name", f.r)
			.css({
				position: "absolute",
				top: -9999,
				left: -9999
			})
			.attr("src", "about:blank")
			.appendTo("body");
	}
	
	// input builder
	function makeInput(n, v) {
		return $("<input/>")
			.attr("name", n)
			.val(v);
	}
	
	// response handler
	function response(timeout, done, xhtml, frame, form, p) {
		var status;
	
		try {
			if (frame[0].contentWindow) {
	                	xhtml.responseText =
	                    	frame.contents().find("body").length > 0 ?
	                    	(
	                        	frame.contents().find("body").find("pre").length > 0 ?
	                        	frame.contents().find("body").find("pre").html() :
	                        	frame.contents().find("body").html()
	                    	) :
	                    	(
	                        	frame[0].contentWindow.document.body ?
	                        	(
	                            		frame[0].contentWindow.document.body.getElementByName("pre") ?
	                            		frame[0].contentWindow.document.body.getElementByName("pre").innerHTML :
	                            		frame[0].contentWindow.document.body.innerHTML
	                        	) :
	                        	frame[0].contentWindow.document.body.innerHTML
	                    	);
	                	xhtml.responseXML = frame[0].contentWindow.document.XMLDocument ? frame[0].contentWindow.document.XMLDocument : frame[0].contentWindow.document;
            		}
		} catch (e) {
			// handle the error...
			if (p.debug) 
				console.log("contentWindow not appended: " + e);
		}
		
		try {
			if (frame[0].contentDocument) {
                		xhtml.responseText = frame[0].contentDocument.document.body ? frame[0].contentDocument.document.body.innerHTML : null;
                		xhtml.responseXML = frame[0].contentDocument.document.XMLDocument ? frame[0].contentDocument.document.XMLDocument : frame[0].contentDocument.document;
            		}
		} catch (e) {
			// handle the error...
			if (p.debug) 
				console.log("contentWindow not appended: " + e);
		}
		
		if (xhtml || timeout === "timeout") {
            		done = true;
			
            		try {
                		status = timeout !== "timeout" ? "success" : "error";

                		if (status !== "error") {
					p.dataType = p.dataType.toLowerCase();
					if (p.dataType !== "file") {
						var data = p.dataType === "xml" ? xhtml.responseXML : xhtml.responseText;
						
						if (p.dataType === "script") 
							$.globalEval(data);
							
						if (p.dataType === "json") 
							data = $.parseJSON(data);
					} else {
						if (typeof p.success === typeof Function) 
							p.success(null, status);
					}
					
					if (p.global) 
						$.event.trigger("ajaxSuccess", [xhtml]);
                		} else {
                    			// handle the error...
                    			if (p.debug) 
						console.log("Executing ajaxError");
                    
                    			if (typeof p.error === typeof Function) 
						p.error(xhtml, status, "ajax failure on ie");
						
                    			if (p.global) 
						$.event.trigger("ajaxError", [xhtml]);
                		}
                		//if (param.global) $.event.trigger("ajaxComplete", [xhtml]);
            		} catch (e) {
                		// handle the error...
                		if (p.debug) console.log("unexpected error: " + e);
                		try {
                			// retry code
                    			if (typeof p.error === typeof Function) 
						p.error(xhtml, status, "ajax failure on ie");
                		} catch (ee) { 
					/* nothing left to do */ 
					throw ee;
				}
            		}

            		// request complete
            		if (p.global) 
				$.event.trigger("ajaxComplete", [xhtml]);

            		// handle the global ajax counter
            		if (p.global && ! --$.active) 
				$.event.trigger("ajaxStop");

            		// process it
            		if (typeof p.complete === typeof Function) 
				p.complete(xhtml, status);
				
            		frame.unbind();
			
            		try {
                		frame.remove();
            		} catch (e) {
                		// handle the error...
                		if (p.debug) 
					console.log("failed to remove frame");
            		}
            
            		try {
                		form.remove();
            		} catch (e) {
                		// handle the error...
                		if (p.debug) 
					console.log("failed to remove form");
            		}
			delete xhtml;
            		//xhtml = null;
        	}
	}
	
	function real(p) {
		var d = new FormData();
		var url = typeof p.url === "string" ? p.url : "";
		
		// extract files from tag
		if (p.files instanceof Array && p.files.length > 0) {
			try {
				var name;
				var obj;
				for (var i = 0; i < p.files.length; i++) {
					obj = $(p.files[i]);
					name = obj.attr("name");
					if (name === "") 
						name = "file";
					$.each(obj[0].files, function(ii, file) {
						d.append(name, file);
					});
				}
			} catch (e) {
				// error in extracting files
				if (p.debug) 
					console.log("failed to add extracted files");
			}
		}
		
		// server is responsible for decoding json string name
		// only allow POST
		
		$.each(p.data, function(name, obj) {
			d.append(name, JSON.stringify(p.data));
		});
		
		// send data
		$.ajax({
			url: url,
			data: d,
			dataType: p.dataType,
			cache: false,
			contentType: false,
			processData: false,
			async: true,
			type: "POST",
			success: function(data, textStatus) {
				if (typeof p.success === typeof Function)
					p.success(data, textStatus);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if (typeof p.error === typeof Function) 
					p.error(jqXHR, textStatus, errorThrown);
			},
			complete: function(jqXHR, textStatus) {
				if (typeof p.complete === typeof Function) 
					p.complete(jqXHR, textStatus);
			}
		});
	}
	
	function fake(p) {
		var p = $.extend({},
			$.ajaxSettings,
			p);
		
		var processForm = makeForm(p),
			processIFrame = makeFrame(),
			processId = "streamfile_" + _g(2) + new Date().getTime();
			
		if (p.files instanceof Array && p.files.length > 0) {
			try {
				var c = 0;
				var origobj;
				var clone;
				for (var i = 0; i < p.files.length; i++) {
					origobj = $(p.files[i]);
					clone = origobj.clone();
					origobj.attr("id", _i.i + processId + c++);
					origobj.before(clone);
					origobj.appendTo(processForm);
				}
			} catch (e) {
				// error in extracting files
				if (p.debug) 
					console.log("failed to add extracted files");
			}
		}
		
		// server is responsible for decoding json string name
		// only allow POST
		
		$.each(p.data, function(name, obj) {
			processForm.append(makeInput(name, JSON.stringify(obj)));
		});
		
		// look for new requests
		if (p.global && !$.active++) 
			$.event.trigger("ajaxStart");
		
		var done = false;
		
		// build request
		var xhtml = {};
		if (p.global) 
			$.event.trigger("ajaxSend", [xhtml]);

		if (p.timeout > 0) 
			setTimeout(function () { 
				if (!done) 
					response("timeout", done, xhtml, processIFrame, processForm, p); 
			}, p.timeout);
		
		try {
			processForm.attr("action", p.url);
			processForm.attr("method", "POST");
			processForm.attr("target", processIFrame.attr("id"));
			
			if (p.debug) 
				console.log(processIFrame.attr("id"));
				
			processForm.attr("encoding", "multipart/form-data");
			processForm.attr("enctype", "multipart/form-data");
			processForm.submit();
			
		} catch (e) {
			// handle the error...
			if (p.debug)
				console.log("error in submitting");
		}
		
		processIFrame.load(function () { 
			done = true; 
			response("success", done, xhtml, processIFrame, processForm, p); 
		});
	}
	
	function main(p) {
		var p = $.extend({}, {
			url: "", // URL to submit data to
			data: {}, // object to encode - first layer keys will be part of multipart form
			dataType: "json", // server response expected
			files: [], // files to send to the server (must be array of valid <input/>)
			timeout: -1, // max request time
			success: function(data, textStatus) {}, // success promise
			error: function (jqXHR, textStatus, errorThrown) {}, // error promise
			complete: function (jqXHR, textStatus) {} // completion promise
		}, p);
		
		var isReal = false;
		
		try {
			// is new FormData supported?
			var t = new FormData();
			isReal = true;
		} catch (e) {
			isReal = false;
		}
		
		if (p.dataType === "file") {
			// this is a download request
			fake(p);
			return;
		}
		
		if (isReal) {
			real(p);
		} else {
			fake(p);
		}
		
		return;
	}
	
	$.ajaxStream = main;
})($);
