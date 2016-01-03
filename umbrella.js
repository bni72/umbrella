// Umbrella JS
// -----------
// Covers your basic javascript needs

// Small, lightweight jQuery alternative
// @author Francisco Presencia Fandos http://francisco.io/
// @inspiration http://youmightnotneedjquery.com/

// INIT
// It should make sure that there's at least one element in nodes
var u = function(parameter, context) {

  // Make sure that we are always working with the u object
  // This is only so we can avoid selector = new u("whatever");
  // and use u("whatever").bla();
  // Reference: http://stackoverflow.com/q/24019863
  if (!(this instanceof u)) {    // !() http://stackoverflow.com/q/8875878
    return new u(parameter, context);
  }


  // Check if it's a selector or an object
  if (typeof parameter == "string") {

    // Store the nodes
    parameter = this.select(parameter, context);
  }

  // If we're referring a specific node as in click(){ u(this) }
  // or the select() returned only one node
  if (parameter && parameter.nodeName) {

    // Store the node as an array
    parameter = [parameter];
  }

  // Make anything an array
  if (!Array.isArray(parameter)) {
    parameter = this.slice(parameter);
  }
  
  this.nodes = parameter;

  return this;
};






// Force it to be an array AND also it clones them
// Store all the nodes as an array
// http://toddmotto.com/a-comprehensive-dive-into-nodelists-arrays-converting-nodelists-and-understanding-the-dom/
u.prototype.slice = function(pseudo){
  return pseudo ? Array.prototype.slice.call(pseudo, 0) : [];
};

// Normalize the arguments to a string of comma separated elements
// Allow for several class names like "a b c" and several parameters
// toString() is to flatten the array: http://stackoverflow.com/q/22920305
u.prototype.args = function(args){
  return this.slice(args).toString().split(/[\s,]+/);
};

// Make the nodes unique
u.prototype.unique = function(){
  
  return u(this.nodes.reduce(function(clean, node){
    return (node && clean.indexOf(node) === -1) ? clean.concat(node) : clean;
  }, []));
};


// This also made the code faster
// Read "Initializing instance variables" in https://developers.google.com/speed/articles/optimizing-javascript
// Default selector

// Default value
u.prototype.nodes = [];

// Options
u.options = {};

/**
 * .addClass(name1, name2, ...)
 * 
 * Add a class to the matched nodes
 * Possible polyfill: https://github.com/eligrey/classList.js
 * @return this Umbrella object
 */
u.prototype.addClass = function(){
  
  // Normalize the arguments to a simple array
  var args = this.args(arguments);
  
  // Loop through all the nodes
  return this.each(function(el){
    
    // Loop and add each of the classes
    args.forEach(function(name){
      if (name) el.classList.add(name);
    });
  });
};

/**
 * .adjacent(position, text)
 * 
 * Add text in the specified position. It is used by other functions
 */
u.prototype.adjacent = function(position, text) {
  
  // Loop through all the nodes
  return this.each(function(node) {
    
    // http://stackoverflow.com/a/23589438
    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Element.insertAdjacentHTML
    node.insertAdjacentHTML(position, text);
    });
  };

/**
 * .after(html)
 * 
 * Add child after all of the current nodes
 * @param String html to be inserted
 * @return this Umbrella object
 */
u.prototype.after = function(text) {
  
  return this.adjacent('afterend', text);
};

/**
 * .ajax(success, error, before)
 * 
 * Create a POST request for whenever the matched form submits
 * @param function success called function when the post is okay
 * @param function error called function when the post was NOT okay
 * @param function before called function before sending the request
 */
u.prototype.ajax = function(success, error, before) {
  
  // Loop through all the nodes
  this.on("submit", function(e) {
    
    // Stop the browser from sending the request
    e.preventDefault();
    
    // Post the actual data
    ajax(
      u(this).attr("action"),
      u(this).serialize(),
      success,
      error,
      before
    );
  });
  
  return this;
};

/**
 * .append(html)
 * 
 * Add child the last thing inside each node
 * @param String html to be inserted
 * @return this Umbrella object
 */
u.prototype.append = function(html) {
  
  return this.adjacent('beforeend', html);
};

/**
 * .attr(name, value)
 *
 * Retrieve or set the data for an attribute of the first matched node
 * @param String name the attribute to search
 * @param String value optional atribute to set
 * @return this|String
 */
// ATTR
// Return the fist node attribute
u.prototype.attr = function(name, value) {
  
  if (value !== undefined){
    var nm = name;
    name = {};
    name[nm] = value;
  }
  
  if (typeof name === 'object') {
    return this.each(function(node){
      for(var key in name) {
        if (name[key] !== null){
          node.setAttribute(key, name[key]);
        } else {
          node.removeAttribute(key);
        }
      }
    });
  }
  
  return this.nodes.length ? this.first().getAttribute(name) : "";
};

/**
 * .before(html)
 * 
 * Add child before all of the current nodes
 * @param String html to be inserted
 * @return this Umbrella object
 */
u.prototype.before = function(html) {
  
  this.adjacent('beforebegin', html);
  
  return this;
  };

/**
 * .children()
 * 
 * Travel the matched elements one node down
 * @return this Umbrella object
 */
u.prototype.children = function(selector) {
  
  var self = this;
  
  return this.join(function(node){
    return self.slice(node.children);
  }).filter(selector);
};


/**
 * .click(callback)
 * 
 * Alternative name for .on('click', callback)
 * @param function callback function called when the event triggers
 * @return this Umbrella object
 */
u.prototype.click = function(callback) {
  
  // Loop through all the nodes
  this.on('click', callback);
  
  return this;
};


/**
 * .closest()
 * 
 * Find a node that matches the passed selector
 * @return this Umbrella object
 */
u.prototype.closest = function(selector) {
  
  return this.join(function(node) {
    
    // Keep going up and up on the tree
    // First element is also checked
    do {
      if (u(node).is(selector)) {
        return node;
      }
    } while (node = node.parentNode)
    
  }).unique();
};

/**
 * .each()
 * Loops through every node from the current call
 * it accepts a callback that will be executed on each node
 * The context for 'this' within the callback is the html node
 * The callback has two parameters, the node and the index
 */
u.prototype.each = function(callback) {
  
  // Loop through all the nodes
  this.nodes.forEach(function(node, i){
    
    // Perform the callback for this node
    // By doing callback.call we allow "this" to be the context for
    // the callback (see http://stackoverflow.com/q/4065353 precisely)
    callback.call(node, node, i);
  });
  
  return this;
};

// .filter(selector)
// Delete all of the nodes that don't pass the selector
u.prototype.filter = function(selector){
  
  // Just a native filtering function for ultra-speed
  return u(this.nodes.filter(function(node){
    
    // Accept a function to filter the nodes
    if (typeof selector === 'function') {
      return selector(node);
    }
    
    // Make it compatible with some other browsers
    node.matches = node.matches || node.msMatchesSelector || node.webkitMatchesSelector;
    
    // Check if it's the same element (or any element if no selector was passed)
    return node.matches(selector || "*");
  }));
};
/**
 * Find all the nodes children of the current ones matched by a selector
 */
u.prototype.find = function(selector) {
  
  return this.join(function(node){
    return u(selector || "*", node).nodes;
  });
};

/**
 * Get the first of the nodes
 * @return htmlnode the first html node in the matched nodes
 */
u.prototype.first = function() {
  
  if (this.nodes.length > 0) {
    return this.nodes[0];
    }
  };

/**
* ajax(url, data, success, error, before);
* 
* Perform a POST request to the given url
* @param String url the place to send the request
* @param String data the ready to send string of data
* @param function success optional callback if everything goes right
* @param function error optional callback if anything goes south
* @param function before optional previous callback
*/
function ajax(url, data, success, error, before) {
  
  // Make them truly optional
  var nf = function(){};
  success = success || nf;
  error = error || nf;
  before = before || nf;
  
  // Load the callback before anything happens
  before();
  
  // Add the umbrella parameter
  data = data + "&umbrella=true";
  
  // Create and send the actual request
  var request = new XMLHttpRequest();
  
  // Create a request of type POST to the URL and ASYNC
  request.open('POST', url, true);
  
  request.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
  
  request.send(data);
  
  // When the request is sent
  request.onload = function() {
    
    var status = this.status;
    
    // Error
    if (status < 200 || status >= 400) {
      error(status);
      
      return false;
    }
    
    var rawresponse = this.response;
    
    // Check if valid json
    if (!isJson(rawresponse)) {
      console.log("Response isn't json");
      success(rawresponse);
      return false;
    }
    
    // The response is right
    success(JSON.parse(rawresponse));
  };
  
  return request;
}

/**
 * isJson(json)
 * 
 * Check wether the passed string is valid json or not
 * @param String json the string to check
 * @return boolean true if the string is json
 */
function isJson(jsonString){
  try {
    var o = JSON.parse(jsonString);
    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns 'null', and typeof null === "object", 
    // so we must check for that, too.
    if (o && typeof o === "object" && o !== null) {
      return o;
    }
  } catch (e) {}

  return false;
}

/**
 * .hasClass(name)
 * 
 * Find out whether the matched elements have a class or not
 * @param String name the class name we want to find
 * @return boolean wether the nodes have the class or not
 */
u.prototype.hasClass = function() {
  
  // Default value
  var doesItContain = false;
  var names = this.args(arguments);
  
  // Loop through all of the matched elements
  this.each(function(){
    
    var elemHasClass = true;
    
    // Check for multiple classes
    names.forEach(function(value){
      
      // This check is needed to avoid setting it to false
      if (!this.classList.contains(value))
        
        // Store the value
        elemHasClass = false;
    }, this);
    
    if (elemHasClass) doesItContain = true;
  });
  
  return doesItContain;
};

/**
 * .html(text)
 * 
 * Set or retrieve the html from the matched node(s)
 * @param text optional some text to set as html
 * @return this|html Umbrella object
 */
u.prototype.html = function(text) {
  
  // Get the text from the first node
  if (text === undefined) return this.first().innerHTML || "";
  
  
  // If we're attempting to set some text  
  // Loop through all the nodes
  return this.each(function() {
    
    // Set the inner html to the node
    this.innerHTML = text;
  });
};

// .is(selector)
// Check whether any of the nodes is of the type of the selector passed
u.prototype.is = function(selector){
  
  // Just an idea for the future
  return this.filter(selector).nodes.length > 0;
};
/**
 * Merge all of the nodes that the callback returns
 */
u.prototype.join = function(callback) {
  
  return u(this.nodes.reduce(function(newNodes, node, i){
    
    return newNodes.concat(callback(node, i));
  }, [])).unique();
};

/**
 * .on(event, callback)
 * 
 * Attach the callback to the event listener for each node
 * @param String event(s) the type of event ('click', 'submit', etc)
 * @param function callback function called when the event triggers
 * @return this Umbrella object
 */
u.prototype.on = function(events, callback) {
  
  // Separate the events
  var evts = events.split(' ');
  
  // Loop through each event
  for (var i=0; i < evts.length; i++) {
  
    // Loop through all the nodes
    this.each(function() {
      
      // Add each event listener to each node
      this.addEventListener(evts[i], callback);
      });
    }
  
  return this;
  };

/**
 * .parent()
 * 
 * Travel the matched elements one node up
 * @return this Umbrella object
 */
u.prototype.parent = function() {
  
  return this.join(function(node){
    return node.parentNode;
  });
};

/**
 * .prepend(html)
 * 
 * Add child the first thing inside each node
 * @param String html to be inserted
 * @return this Umbrella object
 */
u.prototype.prepend = function(html) {
  
  this.adjacent('afterbegin', html);
  
  return this;
  };

/**
 * .remove()
 * 
 * Delete the matched nodes from the html tree
 */
u.prototype.remove = function() {
  
  // Loop through all the nodes
  this.each(function(node) {
    
    // Perform the removal
    node.parentNode.removeChild(node);
    });
  };

/**
 * .removeClass(name)
 *
 * Removes a class from all of the matched nodes
 * @param String name the class name we want to remove
 * @return this Umbrella object
 */
u.prototype.removeClass = function(name) {
  
  // Loop through all the nodes
  this.each(function() {
    
    // Remove the class from the node
    this.classList.remove(name.split(" "));
    });
  
  return this;
  };



// Select the adecuate part from the context
u.prototype.select = function(parameter, context) {
  
  // querySelector is the only one that accepts documentFragment
  return context ? this.select.byCss(parameter, context)
    
    // If we're matching a class
    : /^\.[\w\-]+$/.test(parameter) ? this.select.byClass(parameter.substring(1))
    
    // If we're matching a tag
    : /^\w+$/.test(parameter) ? this.select.byTag(parameter)
    
      // If we match an id
    : /^\#[\w\-]+$/.test(parameter) ? this.select.byId(parameter.substring(1))
    
    // A full css selector
    : this.select.byCss(parameter);
};

// The tag nodes
u.prototype.select.byTag = document.getElementsByTagName.bind(document);

// Find some html nodes using an Id
u.prototype.select.byId = document.getElementById.bind(document);

// Find some html nodes using a Class
u.prototype.select.byClass = document.getElementsByClassName.bind(document);

// Select some elements using a css Selector
u.prototype.select.byCss = function(parameter, context) {

  return (context || document).querySelectorAll(parameter);
};
/**
 * .serialize()
 * 
 * Convert al html form elements into a string
 * The <input> and <button> without type will be parsed as default
 * NOTE: select-multiple for <select> is disabled on purpose
 * Source: http://stackoverflow.com/q/11661187
 * @return String the string to be sent through a Post or Get
 */
u.prototype.serialize = function() {
  
  // Store the class in a variable for manipulation
  var form = this.first();
  
  // Variables to store the work
  var i, query = "";
  
  // Encode the values https://gist.github.com/brettz9/7147458
  function en(str) {
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
  }
  
  for (i = 0; i < form.elements.length; i++) {
    
    // Store ELEMENT
    var el = form.elements[i];
    
    // Make sure the element has name
    if (el.name === "") {
      continue;
    }
    
    
    switch (el.type) {
      // Don't add files
      case 'file':
        break;
      
      // Don't add checkbox or radio if they are not checked
      case 'checkbox':
      case 'radio':
        if (!el.checked)
          break;
      
      // All other cases
      default:
        query += "&" + en(el.name) + "=" + en(el.value);
    }
  }
  
  // Join the query and return it
  return query;
};

/**
 * u.setOptions(where, options);
 *
 * Define some options for the plugins of Umbrella JS
 * @param String where the name of the plugin
 * @param Object options the object's options
 * Example:
 * 
 *   u.setOptions('track', { url: "/trackb/" });
 *
 * Note: do NOT attempt to access u.options straight away
 */
u.setOptions = function(where, options){
  
  // Default options for each plugin is empty object
  u.options[where] = u.options[where] || {};
  
  // Loop through the outside functions
  for(var key in options) {
    
    // Set each of them
    u.options[where][key] = options[key];
    }
  };
