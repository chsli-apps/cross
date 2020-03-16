console.log("HELLOOO!");

var jsonData = "";
var autoCompleteWords = [];

function loadJSON(callback) {
    var xmlObj = new XMLHttpRequest();
    xmlObj.overrideMimeType("application/json");
    xmlObj.open('GET', 'mock_data2.json');
    xmlObj.onreadystatechange = function () {
      if (xmlObj.readyState == 4 && xmlObj.status == "200") {
        callback(xmlObj.responseText);
      }
    };
    xmlObj.send(null);
  }
  
function init() {
    loadJSON( function(response) {
        jsonData = JSON.parse(response);
        document.getElementById("last-updated-data").insertAdjacentText('afterbegin', 'Data Last Updated: ' + jsonData[0].runDateTime);
        var providerData = jsonData[0].providerData; // -> uncomment when mock data is updated to include providerData identifier
        for (var x = 0; x < providerData.length; x++) { // change to providerInfo when updated
            var jsonObject = providerData[x];   // change to providerInfo when updated
            for (var y = 0; y < jsonObject.location.length; y++) {
                jsonObjectLoc = jsonObject.location[y];
                if (!autoCompleteWords.includes("name && " + jsonObject.firstname + " " + jsonObject.lastname) && !autoCompleteWords.includes("name && " + jsonObject.lastname + ", " + jsonObject.firstname)) {
                    autoCompleteWords.push("name && " + jsonObject.firstname + " " + jsonObject.lastname);
                    autoCompleteWords.push("name && " + jsonObject.lastname + ", " + jsonObject.firstname);
                }
                var specialList = jsonObject.specialty.split(", ");
                for (var z = 0; z < specialList.length; z++){
                    if (!autoCompleteWords.includes("specialty && " + specialList[z])) {
                        autoCompleteWords.push("specialty && " + specialList[z]);
                    }
                }
                if (!autoCompleteWords.includes("location && " + jsonObjectLoc.city)) {
                    autoCompleteWords.push("location && " + jsonObjectLoc.city);
                }
                if (!autoCompleteWords.includes("location && " + jsonObjectLoc.zip)) {
                    autoCompleteWords.push("location && " + jsonObjectLoc.zip);
                }
            }
        }
    });
}

init();

function autocomplete(inp, arr) {
    // the autocomplete function takes two arguments, the text field element and an array of possible autocompleted values
    var currentSelection;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentSelection = -1;
        // create a DIV element that will contain the items (values)
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);

        if (this.value.length >= 3){
            for (i = 0; i < arr.length; i++) {
                // check if the item starts with the same letter as the search bar value
                var ampLocation = arr[i].indexOf("&&");
                var removeBeg = arr[i].substr(ampLocation + 3, arr[i].length);
                if (removeBeg.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                    b = document.createElement("DIV");
                    b.setAttribute("id", "list-item");
                    // make the matching letters bold
                    b.innerHTML = "<strong>" + removeBeg.substr(0, val.length) + "</strong>";
                    b.innerHTML += removeBeg.substr(val.length);
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    b.addEventListener("click", function(e) {
                        // insert the value to autocomplete list
                        var inputData = this.getElementsByTagName("input")[0].value;
                        var ampLoc = inputData.indexOf("&&");
                        var removeBegin = inputData.substr(ampLoc + 3, inputData.length);
                        inp.value = removeBegin;
                        aa = document.getElementById("hidden-info");
                        aa.innerHTML = "<input type='hidden' id='myInput' value='" + this.getElementsByTagName("input")[0].value + "'>";
                        triggerSearch(document.getElementById("search"));
    
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            }
        }
    });

    inp.addEventListener("keydown", function(e) {
        if (currentSelection != null) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                // if the arrow DOWN key is pressed, increase the currentSelection variable
                currentSelection++;
                addActive(x);
            }
            else if (e.keyCode == 38) { //up
              // if the arrow UP key is pressed, decrease the currentSelection variable
              currentSelection--;
              addActive(x);
            }
            else if (e.keyCode == 13) {
                // if the ENTER key is pressed, prevent the form from being submitted
                e.preventDefault();
                if (currentSelection > -1) {
                    // simulate a click on the "active" item
                    if (x) x[currentSelection].click();
                }
            }
        }
    });

    function addActive(x) {
        // a function to classify an item as "active"
        if (!x) return false;
        removeActive(x);
        if (currentSelection >= x.length) currentSelection = 0;
        if (currentSelection < 0) currentSelection = (x.length - 1);
        // add class "autocomplete-active":
        x[currentSelection].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        // a function to remove the "active" class from all autocomplete items:
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
            x[i].parentNode.removeChild(x[i]);
            }
        }
    }
}

function searchbar() {
    var node = document.getElementById("search");
    node.addEventListener("keydown", function(event) { 
        if (event.keyCode != 38 || event.keyCode != 40) {
            // initiate the autocomplete function
            autocomplete(document.getElementById("search"), autoCompleteWords);
        }
    }); 
}
    
function triggerSearch(nodeVal){
    // clear search results section
    document.getElementById("note-for-user").innerHTML = "";
    document.getElementById("search-results-section").innerHTML = "";
    var header = document.getElementById("search-header");
    var divide = document.getElementById("line-break");
    var numDocs = document.getElementById("num-found");
    var a = document.getElementById("myInput");
    // if header exists, remove it
    if (header != null && divide !=null && numDocs != null) {
        header.parentNode.removeChild(header);
        divide.parentNode.removeChild(divide);
        numDocs.parentNode.removeChild(numDocs);
    }
    
    event.preventDefault();

    var sortedJson = jsonData[0].providerData.sort(function(obj1, obj2) {
        return obj1.firstname < obj2.firstname ? -1 : 1;
    });

    if (a != null) {
        var nodeValue = nodeVal.value;
        var ampLoc = a.value.indexOf("&&");
        var searchByKey = a.value.substr(0, ampLoc - 1);
        // search based on the search key code
        if (searchByKey === "specialty") {
            searchBySpecialty(sortedJson, nodeValue);
        } 
        else if (searchByKey === "name") {
            searchByName(sortedJson, nodeValue);
        }
        else if (searchByKey === "location") {
            searchByLocation(sortedJson, nodeValue);
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

function searchByName(sortedData, nodeVal) {
    var success = false;
    for (var x = 0; x < sortedData.length; x++) {
        var jsonObject = sortedData[x];
        if (nodeVal.toUpperCase() === jsonObject.firstname.toUpperCase()
            || nodeVal.toUpperCase() === jsonObject.lastname.toUpperCase() 
            || nodeVal.toUpperCase() === jsonObject.firstname.toUpperCase() + " " + jsonObject.lastname.toUpperCase() 
            || nodeVal.toUpperCase() === jsonObject.lastname.toUpperCase() + ", " + jsonObject.firstname.toUpperCase()) {
            
                success = true;
            // get the physicians first location listed
            jsonObjectLoc = jsonObject.location[0];
            var info = '<div class="physician-listing"><div id="physician-results-' + x + '"><section id="top-header"><div id="name-specialty"><div class="buttons"><button id="buttons" onclick="launchWindows(\'https://chsli.org\', \'https://mercymedicalcenter.chsli.org/\');">SCHED Login</button></div><h3>' + jsonObject.firstname + ' ' + jsonObject.lastname + ', ' +  jsonObject.title + '</h3><br><h5>' + jsonObject.specialty + '</h5></div></section></div><div class="location" id="right-side"><p>' + 
            jsonObjectLoc.address1 + '<br>' + jsonObjectLoc.address2 + '<br>' + jsonObjectLoc.city + ', ' + jsonObjectLoc.state + ' ' + jsonObjectLoc.zip + '</p><br><p><strong>Phone: </strong>' + jsonObjectLoc.phone + 
            '<br><strong>Fax: </strong>' + jsonObjectLoc.fax + '</p></div></div></div>';
            
            document.getElementById("search-results-section").insertAdjacentHTML('beforeend', info);

            // if the physician has more that one location listed, loop through to add
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
    }
    return success;
}

function searchByLocation(sortedData, nodeVal) {
    var success = false;
    for (var x = 0; x < sortedData.length; x++) {
        var jsonObject = sortedData[x];
        // for each json object location, check if search input is equal to any physician location zip code or city
        for (var y = 0; y < jsonObject.location.length; y++) {
            if (nodeVal.toUpperCase() === jsonObject.location[y].city.toUpperCase() || nodeVal === jsonObject.location[y].zip) {
                success = true;
                // if the physician is already listed add the location to the physicians row in table
                if (document.getElementById("physician-results-" + x) != null) {
                    var info = '<div class="location" id="right-side"><p>' + jsonObject.location[y].address1 + '<br>' + jsonObject.location[y].address2 + '<br>' + 
                    jsonObject.location[y].city + ', ' + jsonObject.location[y].state + ' ' + jsonObject.location[y].zip + '</p><br><p><strong>Phone: </strong>' + 
                    jsonObject.location[y].phone + '<br><strong>Fax: </strong>' + jsonObject.location[y].fax + '</p></div>';
                                
                    document.getElementById("physician-results-" + x).insertAdjacentHTML('beforeend', info);
                }
                // otherwise, list the physician and the location
                else {
                    var info = '<div class="physician-listing"><div id="physician-results-' + x + '"><section id="top-header"><div id="name-specialty"><div class="buttons"><button id="buttons" onclick="launchWindows(\'https://www.chsli.org\', \'https://www.mercymedicalcenter.chsli.org/\');">SCHED Login</button></div><h3>' + jsonObject.firstname + ' ' + jsonObject.lastname + ', ' +  jsonObject.title + '</h3><br><h5>' + jsonObject.specialty + '</h5></div></section></div><div class="location" id="right-side"><p>' + 
                    jsonObject.location[y].address1 + '<br>' + jsonObject.location[y].address2 + '<br>' + jsonObject.location[y].city + ', ' + jsonObject.location[y].state + ' ' + jsonObject.location[y].zip + '</p><br><p><strong>Phone: </strong>' + jsonObject.location[y].phone + 
                    '<br><strong>Fax: </strong>' + jsonObject.location[y].fax + '</p></div></div></div>';
                            
                    document.getElementById("search-results-section").insertAdjacentHTML('beforeend', info);
                }
            }
        }
    }
    return success;
}

function searchBySpecialty(sortedData, nodeVal) {
    var success = false;
    // for every json object, check if search input is equal specialty
    for (var x = 0; x < sortedData.length; x++) {        
        var jsonObject = sortedData[x];
        var specialtyList = jsonObject.specialty.split(", ");

        specialtyList = specialtyList.map(function (item) {
            return item.toUpperCase();
        });

        if (specialtyList.includes(nodeVal.toUpperCase())) {
            success = true;
            jsonObjectLoc = jsonObject.location[0];
            var info = '<div class="physician-listing"><div id="physician-results-' + x + '"><section id="top-header"><div id="name-specialty"><div class="buttons"><button id="buttons" onclick="launchWindows(\'https://www.chsli.org\', \'https://www.mercymedicalcenter.chsli.org/\');">SCHED Login</button></div><h3>' + jsonObject.firstname + ' ' + jsonObject.lastname + ', ' +  jsonObject.title + '</h3><br><h5>' + jsonObject.specialty + '</h5></div></section><div class="location" id="right-side"><p>' + 
            jsonObjectLoc.address1 + '<br>' + jsonObjectLoc.address2 + '<br>' + jsonObjectLoc.city + ', ' + jsonObjectLoc.state + ' ' + jsonObjectLoc.zip + '</p><br><p><strong>Phone: </strong>' + jsonObjectLoc.phone + 
            '<br><strong>Fax: </strong>' + jsonObjectLoc.fax + '</p></div></div></div>';
            
            document.getElementById("search-results-section").insertAdjacentHTML('beforeend', info);

            // if the physician has more that one location listed, loop through to add
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
    }
    return success;
}

function launchWindows(url1, url2) {
    window.open(url1, "_new");
    window.open(url2, "_new1");
} 
