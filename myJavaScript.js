console.log("HELLOOO!");

var jsonData = "";
var activeWords = [];

async function loadFile(file) {
    data = await fetch(file);

    jsonData = JSON.parse(await data.text());
    
    for (var x = 0; x < jsonData.length; x++) {
        var jsonObject = jsonData[x];
        for (var y = 0; y < jsonObject.location.length; y++) {
            jsonObjectLoc = jsonObject.location[y];
            if (!activeWords.includes(jsonObject.firstname + " " + jsonObject.lastname) && !activeWords.includes(jsonObject.lastname + ", " + jsonObject.firstname)) {
                activeWords.push(jsonObject.firstname + " " + jsonObject.lastname);
                activeWords.push(jsonObject.lastname + ", " + jsonObject.firstname);
            }
            if (!activeWords.includes(jsonObject.specialty)) {
                activeWords.push(jsonObject.specialty);
            }
            if (!activeWords.includes(jsonObjectLoc.city)) {
                activeWords.push(jsonObjectLoc.city);
            }
            if (!activeWords.includes(jsonObjectLoc.zip)) {
                activeWords.push(jsonObjectLoc.zip);
            }
        }
    }
}

loadFile('mock_data.json');

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentSelection;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentSelection = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                triggerSearch(document.getElementById("search"));
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        if (currentSelection != null) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
              /*If the arrow DOWN key is pressed,
              increase the currentSelection variable:*/
              currentSelection++;
              /*and and make the current item more visible:*/
              addActive(x);
            } else if (e.keyCode == 38) { //up
              /*If the arrow UP key is pressed,
              decrease the currentSelection variable:*/
              currentSelection--;
              /*and and make the current item more visible:*/
              addActive(x);
            } else if (e.keyCode == 13) {
              /*If the ENTER key is pressed, prevent the form from being submitted,*/
              e.preventDefault();
              triggerSearch(document.getElementById("search"));
              if (currentSelection > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentSelection].click();
              }
            }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentSelection >= x.length) currentSelection = 0;
      if (currentSelection < 0) currentSelection = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentSelection].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            closeAllLists();
        }
    });
  }

function searchbar() {
    var node = document.getElementById("search");
    node.addEventListener("keydown", function(event) { 
        if (event.key === "Enter") {
            triggerSearch(node);
        } 
        else if (event.keyCode != 38 || event.keyCode != 40){
            /*initiate the autocomplete function*/
            autocomplete(document.getElementById("search"), activeWords);
        }
    }); 
}
    
function triggerSearch(nodeVal){
    // clear search results table
    document.getElementById("search-results-section").innerHTML = "";
    var header = document.getElementById("search-header");
    var divide = document.getElementById("line-break");
    var numDocs = document.getElementById("num-found");
    // if header exists, remove it
    if (header != null && divide !=null && numDocs != null) {
        header.parentNode.removeChild(header);
        divide.parentNode.removeChild(divide);
        numDocs.parentNode.removeChild(numDocs);
    }
    
    event.preventDefault();

    var sortedJson = jsonData.sort(function(obj1, obj2) {
        return obj1.firstname < obj2.firstname ? -1 : 1;
    });

    var jsonString = JSON.stringify(sortedJson);
    console.log(jsonString);

    // for every json object, check if search input is equal to any physicians first name, last name, first + last, last + first or specialty
    for (var x = 0; x < sortedJson.length; x++) {
        var jsonObject = sortedJson[x];
        if (nodeVal.value.toUpperCase() === jsonObject.specialty.toUpperCase()
            || nodeVal.value.toUpperCase() === jsonObject.firstname.toUpperCase()
            || nodeVal.value.toUpperCase() === jsonObject.lastname.toUpperCase() 
            || nodeVal.value.toUpperCase() === jsonObject.firstname.toUpperCase() + " " + jsonObject.lastname.toUpperCase() 
            || nodeVal.value.toUpperCase() === jsonObject.lastname.toUpperCase() + ", " + jsonObject.firstname.toUpperCase()) {
            
            // get the physicians first location listed
            jsonObjectLoc = jsonObject.location[0];
            var info = '<div class="physician-listing"><div id="physician-results-' + x + '"><div><h3>' + jsonObject.firstname + ' ' + jsonObject.lastname + ', ' +  jsonObject.title + '</h3><br><h5>' + jsonObject.specialty + '</h5></div><div class="location" id="right-side"><p>' + 
            jsonObjectLoc.address1 + '<br>' + jsonObjectLoc.address2 + '<br>' + jsonObjectLoc.city + ', ' + jsonObjectLoc.state + ' ' + jsonObjectLoc.zip + '</p><br><p><strong>Phone: </strong>' + jsonObjectLoc.phone + 
            '<br><strong>Fax: </strong>' + jsonObjectLoc.fax + '</p></div></div><div class="buttons"><button id="buttons" onclick="launchWindows(\'https://chsli.org\', \'https://mercymedicalcenter.chsli.org/\');">SCHED Login</button></div></div>';
            
            document.getElementById("search-results-section").insertAdjacentHTML('beforeend', info);

            // if the physician has more that one location listed, loop through to add to table
            if (jsonObject.location.length > 1) {
                if (document.getElementById("physician-results-" + x) != null) {
                    for (var y = 1; y < jsonObject.location.length; y++) {
                        var info = '<div class="location" id="right-side"><p>' + jsonObject.location[y].address1 + '<br>' + jsonObject.location[y].address2 + '<br>' + 
                        jsonObject.location[y].city + ', ' + jsonObject.location[y].state + ' ' + jsonObject.location[y].zip + '</p><br><p><strong>Phone: </strong>' + 
                        jsonObject.location[y].phone + '<br><strong>Fax: </strong>' + jsonObject.location[y].fax + '</p></div>';
                                    
                        document.getElementById("physician-results-" + x).insertAdjacentHTML('beforeend', info);
                    }
                }
            }
        }

        // for each json object location, check if search input is equal to any physician location zip code or city
        for (var y = 0; y < jsonObject.location.length; y++) {
            if (nodeVal.value.toUpperCase() === jsonObject.location[y].city.toUpperCase() || nodeVal.value === jsonObject.location[y].zip) {
                // if the physician is already listed add the location to the physicians row in table
                if (document.getElementById("physician-results-" + x) != null) {
                    var info = '<div class="location" id="right-side"><p>' + jsonObject.location[y].address1 + '<br>' + jsonObject.location[y].address2 + '<br>' + 
                    jsonObject.location[y].city + ', ' + jsonObject.location[y].state + ' ' + jsonObject.location[y].zip + '</p><br><p><strong>Phone: </strong>' + 
                    jsonObject.location[y].phone + '<br><strong>Fax: </strong>' + jsonObject.location[y].fax + '</p></div>';
                                
                    document.getElementById("physician-results-" + x).insertAdjacentHTML('beforeend', info);
                }
                // otherwise, list the physician and the location
                else {
                    var info = '<div class="physician-listing"><div id="physician-results-' + x + '"><div><h3>' + jsonObject.firstname + ' ' + jsonObject.lastname + ', ' +  jsonObject.title + '</h3><br><h5>' + jsonObject.specialty + '</h5></div><div class="location" id="right-side"><p>' + 
                    jsonObject.location[y].address1 + '<br>' + jsonObject.location[y].address2 + '<br>' + jsonObject.location[y].city + ', ' + jsonObject.location[y].state + ' ' + jsonObject.location[y].zip + '</p><br><p><strong>Phone: </strong>' + jsonObject.location[y].phone + 
                    '<br><strong>Fax: </strong>' + jsonObject.location[y].fax + '</p></div></div><div class="buttons"><button id="buttons" onclick="launchWindows(\'https://chsli.org\', \'https://mercymedicalcenter.chsli.org/\');">SCHED Login</button></div></div>';
                            
                    document.getElementById("search-results-section").insertAdjacentHTML('beforeend', info);
                }
            }
        }
    }
    var numFound = document.getElementById("search-results-section").getElementsByClassName("physician-listing").length;
    if (numFound === 0) {
        document.getElementById("search-results-section").insertAdjacentHTML('beforeend', '<p id="no-results">Your search returned no results.</p>');
    }
    else {
        // add header
        var searchResultsHeader = '<p id="search-header">Search Results:</p><p id="num-found">' + numFound + ' Doctor(s) Found</p>';
        var lineBreak ='<hr id="line-break">';

        document.getElementById("search-results").insertAdjacentHTML('afterbegin', searchResultsHeader + lineBreak);
    }
}

function launchWindows(url1, url2) {
    window.open(url1);
    window.open(url2);
} 