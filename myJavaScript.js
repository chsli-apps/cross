console.log("HELLOOO!");

var headerHeight = document.getElementById("header").clientHeight;
document.getElementById("header-wrapper").style.height = headerHeight;

var jsonData = "";
var autoCompleteWords = [];
var filteredAutoCompleteWords = [];
var providerOnlyData = "";
var providerOnlyAutoComplete = [];

function loadJSON(callback) {
    var xmlObj = new XMLHttpRequest();
    xmlObj.overrideMimeType("application/json");
    xmlObj.open('GET', 'thisisatest.json');
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
        for (var x = 0; x < providerData.length; x++) { // change to providerData when updated
            var jsonObject = providerData[x];   // change to providerInfo when updated
            if (!autoCompleteWords.includes("start " + jsonObject.firstname[0] + " " + jsonObject.lastname[0] + " physicianName && " + jsonObject.firstname + " " + jsonObject.lastname)) {
                autoCompleteWords.push("start " + jsonObject.firstname[0] + " " + jsonObject.lastname[0] + " physicianName && " + jsonObject.firstname + " " + jsonObject.lastname);
                
            }
            for (var y = 0; y < jsonObject.location.length; y++) {
                jsonObjectLoc = jsonObject.location[y];
                if (!autoCompleteWords.includes("start " + jsonObjectLoc.address1[0] + " - practiceName && " + jsonObjectLoc.address1)) {
                    autoCompleteWords.push("start " + jsonObjectLoc.address1[0] + " - practiceName && " + jsonObjectLoc.address1);
                }
                if (jsonObjectLoc.emrLink != "" && jsonObjectLoc.emrDocLink != "") {
                    if (!providerOnlyAutoComplete.includes("start " + jsonObject.firstname[0] + " " + jsonObject.lastname[0] +" physicianName && " + jsonObject.firstname + " " + jsonObject.lastname)) {
                        providerOnlyAutoComplete.push("start " + jsonObject.firstname[0] + " " + jsonObject.lastname[0] + " physicianName && " + jsonObject.firstname + " " + jsonObject.lastname);
                    }
                    if (!providerOnlyAutoComplete.includes("start " + jsonObjectLoc.address1[0] + " - practiceName && " + jsonObjectLoc.address1)) {
                        providerOnlyAutoComplete.push("start " + jsonObjectLoc.address1[0] + " - practiceName && " + jsonObjectLoc.address1);
                    }
                }
            }
        }
    });
}

init();

function autocomplete(inp, arr) {
    // the autocomplete function takes two arguments, the text field element and an array of possible autocompleted values
    var currentSelection;
    if (inp.value == "") {
        closeAllLists();
    }
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

        if (this.value.length == 1) {
            if (document.getElementById("providers-only").checked) {
                arr = filterAutoCompleteWords(this.value, providerOnlyAutoComplete);
            }
            else {
                arr = filterAutoCompleteWords(this.value, autoCompleteWords);
            }
        }

        if (this.value.length >= 3){
            var z = document.createElement("DIV");
            z.setAttribute("id", "list-location");
            z.innerHTML = "<p>Practice:</p>";
            a.appendChild(z);

            var y = document.createElement("DIV");
            y.setAttribute("id", "list-physician");
            y.innerHTML = "<p>Physician:</p>";
            a.appendChild(y);
            for (i = 0; i < arr.length; i++) {
                // check if the item starts with the same letter as the search bar value
                var ampLocation = arr[i].indexOf("&&");
                var removeBeg = arr[i].substr(ampLocation + 3, arr[i].length);
                var splitWords = removeBeg.split(" ");
                var lastWord = splitWords[splitWords.length - 1];
                var searchByKey = arr[i].substring(10, ampLocation-1);
                if (removeBeg.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                    b = document.createElement("DIV");
                    b.setAttribute("id", "list-item");
                    // make the matching letters bold
                    b.innerHTML = "<strong>" + removeBeg.substr(0, val.length) + "</strong>";
                    b.innerHTML += removeBeg.substr(val.length);
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "' id='" + arr[i] + "'>";
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
                    if (searchByKey == "practiceName") {
                        z.appendChild(b);
                    }
                    else if (searchByKey == "physicianName") {
                        y.appendChild(b);
                    }
                }
                if (lastWord != splitWords[0] && document.getElementById("'" + arr[i] + "'") == null) {
                    if (lastWord.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                        b = document.createElement("DIV");
                        b.setAttribute("id", "list-item");
                        // make the matching letters bold
                        b.innerHTML = removeBeg.substring(0, removeBeg.length - lastWord.length) + " " + "<strong>" + lastWord.substr(0, val.length) + "</strong>";
                        b.innerHTML += lastWord.substr(val.length);
                        b.innerHTML += "<input type='hidden' value='" + arr[i] + "' id='" + arr[i] + "'>";
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
                        if (searchByKey == "practiceName") {
                            z.appendChild(b);
                        }
                        else if (searchByKey == "physicianName") {
                            y.appendChild(b);
                        }
                    }
                }
            }
            if (document.getElementById("list-physician").childElementCount
            + document.getElementById("list-location").childElementCount > 6 ) {
                document.getElementById("searchautocomplete-list").style.overflowY = 'scroll';
            }
            if (document.getElementById("list-item") == null) {
                a.removeChild(y);
                z.innerHTML = "<p>No matching search results.</p>";
            }
            else if (document.getElementById("list-location").childElementCount == 1) {
                a.removeChild(z);
            }
            else if (document.getElementById("list-physician").childElementCount == 1) {
                a.removeChild(y);
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
                if (x[currentSelection] == null) {
                    currentSelection = 1;
                }
                if(x[currentSelection] != null) {
                    if (x[currentSelection].id == "list-location" || x[currentSelection].id == "list-physician") {
                        currentSelection++;
                    }
                }
                addActive(x);
            }
            else if (e.keyCode == 38) { //up
              // if the arrow UP key is pressed, decrease the currentSelection variable
              currentSelection--;
              if(x[currentSelection] != null) {
                if (x[currentSelection].id == "list-location" || x[currentSelection].id == "list-physician") {
                    currentSelection--;
                }
              }
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
        x[currentSelection].scrollIntoView(false);
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

function filterAutoCompleteWords(start, autoCompleteArray) {
    filteredAutoCompleteWords = [];
    for (var s = 0; s < autoCompleteArray.length; s++) {
        var firstNameStart = autoCompleteArray[s].charAt(6);
        var lastNameStart = autoCompleteArray[s].charAt(8);
        if (start.toUpperCase() == firstNameStart.toUpperCase() || start.toUpperCase() == lastNameStart.toUpperCase()) {
            filteredAutoCompleteWords.push(autoCompleteArray[s]);
        }
    }
    return filteredAutoCompleteWords;
}

function searchbar() {
    document.getElementById("search").value = "";
    autocomplete(document.getElementById("search"), autoCompleteWords);
}
    
function triggerSearch(nodeVal){

    if (document.getElementById("providers-only").checked) {
        providerOnlyData = JSON.parse(JSON.stringify(jsonData));
        var providerData = providerOnlyData[0].providerData;
        for (var x = 0; x < providerData.length; x++) {
            var jsonObject = providerData[x];
            for (var y = 0; y < jsonObject.location.length; y++) {
                jsonObjectLoc = jsonObject.location[y];
                if (jsonObjectLoc.emrDocLink == "" && jsonObjectLoc.emrLink == "") {
                    jsonObject.location.splice(y, 1);
                    y -= 1;
                }
            }
            if (jsonObject.location.length == 0) {
                providerData.splice(x, 1);
                x -= 1;
            }
        }
    }

    // clear search results section
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

    if (providerOnlyData != "") {
        var sortedJson = providerOnlyData[0].providerData.sort(function(obj1, obj2) {
            return obj1.firstname < obj2.firstname ? -1 : 1;
        });
        providerOnlyData = "";
    }
    else {
        var sortedJson = jsonData[0].providerData.sort(function(obj1, obj2) {
            return obj1.firstname < obj2.firstname ? -1 : 1;
        });
    }

    document.getElementById("header").style.borderBottom = '1px solid #e5e5e5';

    if (a != null) {
        var nodeValue = nodeVal.value;
        var ampLoc = a.value.indexOf("&&");
        var searchByKey = a.value.substring(10, ampLoc-1);
        // search based on the search key code
    
        if (searchByKey === "physicianName") {
            searchByPhysicianName(sortedJson, nodeValue);
        }
        else if (searchByKey === "practiceName") {
            searchByPracticeName(sortedJson, nodeValue);
        }
    }
    
    var numFound = document.getElementById("search-results-section").getElementsByClassName("physician-listing").length;
    if (numFound === 0) {
        document.getElementById("search-results-section").style.textAlign = "center";
        document.getElementById("search-results-section").insertAdjacentHTML('beforeend', '<p id="no-results">Your search returned no results.</p>');
    
    }
    else {
        // add header
        var searchResultsHeader = '<p id="search-header">Search Results:</p><p id="num-found">' + numFound + ' Doctor(s) Found</p>';
        var lineBreak ='<hr id="line-break">';

        document.getElementById("search-results").insertAdjacentHTML('afterbegin', searchResultsHeader + lineBreak);
    }
}

function searchByPhysicianName(sortedData, nodeVal) {
    for (var x = 0; x < sortedData.length; x++) {
        var jsonObject = sortedData[x];
        if (nodeVal.toUpperCase() === jsonObject.firstname.toUpperCase()
            || nodeVal.toUpperCase() === jsonObject.lastname.toUpperCase() 
            || nodeVal.toUpperCase() === jsonObject.firstname.toUpperCase() + " " + jsonObject.lastname.toUpperCase() 
            || nodeVal.toUpperCase() === jsonObject.lastname.toUpperCase() + ", " + jsonObject.firstname.toUpperCase()) {
            
            success = true;
            // get the physicians first location listed
            jsonObjectLoc = jsonObject.location[0];
            if (jsonObjectLoc.emrLink == "" && jsonObjectLoc.emrDocLink == "") {
                var info = '<div class="physician-listing"><div id="physician-results-' + x + '"><section id="top-header"><div id="name-specialty"><h3>' + jsonObject.firstname + ' ' + jsonObject.lastname + ', ' +  jsonObject.title + '</h3><br><h5>' + jsonObject.specialty + '</h5></div></section><div id="locations"><div class="location" id="right-side"><div id="location-info"><p>' + 
                jsonObjectLoc.address1 + '<br>' + jsonObjectLoc.address2 + '<br>' + jsonObjectLoc.city + ', ' + jsonObjectLoc.state + ' ' + jsonObjectLoc.zip + '</p><br><p><strong>Phone: </strong>' + jsonObjectLoc.phone + 
                '<br><strong>Fax: </strong>' + jsonObjectLoc.fax + '</p></div><div id="button-section"><button id="not-avail-button">SCHED Login</button></div></div></div></div></div>';
                
                document.getElementById("search-results-section").insertAdjacentHTML('beforeend', info);
            }
            else {
                var info = '<div class="physician-listing"><div id="physician-results-' + x + '"><section id="top-header"><div id="name-specialty"><h3>' + jsonObject.firstname + ' ' + jsonObject.lastname + ', ' +  jsonObject.title + '</h3><br><h5>' + jsonObject.specialty + '</h5></div></section><div id="locations"><div class="location" id="right-side"><div id="location-info"><p>' + 
                jsonObjectLoc.address1 + '<br>' + jsonObjectLoc.address2 + '<br>' + jsonObjectLoc.city + ', ' + jsonObjectLoc.state + ' ' + jsonObjectLoc.zip + '</p><br><p><strong>Phone: </strong>' + jsonObjectLoc.phone + 
                '<br><strong>Fax: </strong>' + jsonObjectLoc.fax + '</p></div><div id="button-section"><button id="buttons" onclick="launchWindows(\'https://chsli.org\', \'https://mercymedicalcenter.chsli.org/\');">SCHED Login</button></div></div></div></div></div>';
                
                document.getElementById("search-results-section").insertAdjacentHTML('beforeend', info);
            }
            

            // if the physician has more that one location listed, loop through to add
            if (jsonObject.location.length > 1) {
                if (document.getElementById("physician-results-" + x) != null) {
                    for (var y = 1; y < jsonObject.location.length; y++) {
                        var jsonObjectLoc = jsonObject.location[y];
                        if (jsonObjectLoc.emrLink == "" && jsonObjectLoc.emrDocLink == "") {
                            var info = '<div class="location" id="right-side"><div id="location-info"><p>' + jsonObject.location[y].address1 + '<br>' + jsonObject.location[y].address2 + '<br>' + 
                            jsonObject.location[y].city + ', ' + jsonObject.location[y].state + ' ' + jsonObject.location[y].zip + '</p><br><p><strong>Phone: </strong>' + 
                            jsonObject.location[y].phone + '<br><strong>Fax: </strong>' + jsonObject.location[y].fax + '</p></div><div id="button-section"><button id="not-avail-button">SCHED Login</button></div></div>';
                                    
                            document.getElementById("locations").insertAdjacentHTML('beforeend', info);
                        }
                        else {
                            var info = '<div class="location" id="right-side"><div id="location-info"><p>' + jsonObject.location[y].address1 + '<br>' + jsonObject.location[y].address2 + '<br>' + 
                            jsonObject.location[y].city + ', ' + jsonObject.location[y].state + ' ' + jsonObject.location[y].zip + '</p><br><p><strong>Phone: </strong>' + 
                            jsonObject.location[y].phone + '<br><strong>Fax: </strong>' + jsonObject.location[y].fax + '</p></div><div id="button-section"><button id="buttons" onclick="launchWindows(\'https://chsli.org\', \'https://mercymedicalcenter.chsli.org/\');">SCHED Login</button></div></div>';
                                    
                            document.getElementById("locations").insertAdjacentHTML('beforeend', info);
                        }
                    }
                }
            }
        }
    }
}

function searchByPracticeName(sortedData, nodeVal) {
    for (var x = 0; x < sortedData.length; x++) {
        var jsonObject = sortedData[x];
        // for each json object location, check if search input is equal to any physician location zip code or city
        for (var y = 0; y < jsonObject.location.length; y++) {
            jsonObjectLoc = jsonObject.location[y];
            if (nodeVal.toUpperCase() === jsonObjectLoc.address1.toUpperCase()) {
                success = true;
                // if the physician is already listed add the location to the physicians row in table
                if (document.getElementById("physician-results-" + x) != null) {
                    if (jsonObjectLoc.emrLink == "" && jsonObjectLoc.emrDocLink == "") {
                        var info = '<div class="location" id="right-side"><div id="location-info"><p>' + jsonObject.location[y].address1 + '<br>' + jsonObject.location[y].address2 + '<br>' + 
                        jsonObject.location[y].city + ', ' + jsonObject.location[y].state + ' ' + jsonObject.location[y].zip + '</p><br><p><strong>Phone: </strong>' + 
                        jsonObject.location[y].phone + '<br><strong>Fax: </strong>' + jsonObject.location[y].fax + '</p></div><div id="button-section"><button id="not-avail-button">SCHED Login</button></div></div>';
                                
                        document.getElementById("locations").insertAdjacentHTML('beforeend', info);
                    }
                    else {
                        var info = '<div class="location" id="right-side"><div id="location-info"><p>' + jsonObject.location[y].address1 + '<br>' + jsonObject.location[y].address2 + '<br>' + 
                        jsonObject.location[y].city + ', ' + jsonObject.location[y].state + ' ' + jsonObject.location[y].zip + '</p><br><p><strong>Phone: </strong>' + 
                        jsonObject.location[y].phone + '<br><strong>Fax: </strong>' + jsonObject.location[y].fax + '</p></div><div id="button-section"><button id="buttons" onclick="launchWindows(\'https://chsli.org\', \'https://mercymedicalcenter.chsli.org/\');">SCHED Login</button></div></div>';
                                
                        document.getElementById("locations").insertAdjacentHTML('beforeend', info);
                    }
                }
                // otherwise, list the physician and the location
                else {
                    if (jsonObjectLoc.emrLink == "" && jsonObjectLoc.emrDocLink == "") {
                        var info = '<div class="physician-listing"><div id="physician-results-' + x + '"><section id="top-header"><div id="name-specialty"><h3>' + jsonObject.firstname + ' ' + jsonObject.lastname + ', ' +  jsonObject.title + '</h3><br><h5>' + jsonObject.specialty + '</h5></div></section><div id="locations"><div class="location" id="right-side"><div id="location-info"><p>' + 
                        jsonObjectLoc.address1 + '<br>' + jsonObjectLoc.address2 + '<br>' + jsonObjectLoc.city + ', ' + jsonObjectLoc.state + ' ' + jsonObjectLoc.zip + '</p><br><p><strong>Phone: </strong>' + jsonObjectLoc.phone + 
                        '<br><strong>Fax: </strong>' + jsonObjectLoc.fax + '</p></div><div id="button-section"><button id="not-avail-button">SCHED Login</button></div></div></div></div></div>';
                        
                        document.getElementById("search-results-section").insertAdjacentHTML('beforeend', info);
                    }
                    else {
                        var info = '<div class="physician-listing"><div id="physician-results-' + x + '"><section id="top-header"><div id="name-specialty"><h3>' + jsonObject.firstname + ' ' + jsonObject.lastname + ', ' +  jsonObject.title + '</h3><br><h5>' + jsonObject.specialty + '</h5></div></section><div id="locations"><div class="location" id="right-side"><div id="location-info"><p>' + 
                        jsonObjectLoc.address1 + '<br>' + jsonObjectLoc.address2 + '<br>' + jsonObjectLoc.city + ', ' + jsonObjectLoc.state + ' ' + jsonObjectLoc.zip + '</p><br><p><strong>Phone: </strong>' + jsonObjectLoc.phone + 
                        '<br><strong>Fax: </strong>' + jsonObjectLoc.fax + '</p></div><div id="button-section"><button id="buttons" onclick="launchWindows(\'https://chsli.org\', \'https://mercymedicalcenter.chsli.org/\');">SCHED Login</button></div></div></div></div></div>';
                        
                        document.getElementById("search-results-section").insertAdjacentHTML('beforeend', info);
                    }
                }
            }
        }
    }
}

function launchWindows(url1, url2) {
    window.open(url1, "_new");
    window.open(url2, "_new1");
} 
