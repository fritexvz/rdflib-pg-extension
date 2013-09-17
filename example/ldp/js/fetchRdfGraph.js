// Graphs.
graphsCache = {};

// Set the proxy for the rdf fetch.
$rdf.Fetcher.crossSiteProxyTemplate = "http://data.fm/proxy?uri={uri}";

// Define templates for ressources.
var templates = function(key, informations) {
    var tpl = {
        "ressource":
            "<tr>" +
                "<td class='filename'><a href='" + informations.uri +"'>" + informations.name + "</a></td>" +
                "<td>" + informations.size + "</td>" +
                "<td>" + informations.type + "</td>" +
                "<td>" + informations.mtime + "</td>" +
                "<td class='options' style='display:none'><a href='#' class='editFile'>" +
                    "<img class='actions' src='images/22/edit.png' title='Edit contents'></a>" +
                "</td>" +
                "<td class='options'><a href='#' class='accessControl'>" +
                    "<img class='actions' src='images/22/acl.png' title='Access Control'></a>" +
                "</td>" +
                "<td class='options'><a href='#'  class='deleteFile'>" +
                    "<img class='actions' src='images/22/delete.png' title='Delete'></a>" +
                "</td>" +
            "</tr>"
    };
    return tpl[key];
};


var dirname = function(path) {
    return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
}

var basename = function (path) {
    if (path.substring(path.length - 1) == '/')
        path = path.substring(0, path.length - 1);

    var a = path.split('/');
    return a[a.length - 1];
}

// Check if the URI is local (http://localhost) or remote.
var remoteUrl = function(uri) {
    return !(uri.slice(0,7) === 'http://'  && uri.slice(7,17) === 'localhost/');
}

// Format from Unix time.
var formatTime = function(mtime) {
    var a = new Date(mtime * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = year+'-'+month+'-'+date+' '+hour+':'+min+':'+sec + " GMT";
    return time;
}

// On document ready, use current Uri to load RDF graph from.
$(document).ready( function() {
    // Bootstrap with remote dirUri.
    var dirUri = 'http://stample.rww.io/';
    if ( basename(window.location.href) !== "test.html" ) {
        dirUri = 'http://stample.rww.io/' + basename(window.location.href) + "/";
    }

    // Load and render.
    loadRdfGraphAndRender(dirUri);
});

// Fetch and create RDF ressource graph.
function loadRdfGraphAndRender (rootUri) {
    var graph, fetch;

    // Define RDF graph.
    graph = graphsCache[rootUri] = new $rdf.IndexedFormula();
    fetch = $rdf.fetcher(graph);

    // Fetch RDF graph and render members.
    fetch.nowOrWhenFetched(rootUri, undefined, function() {
        renderDirectory(rootUri, graph);
    });
}

// Render directory members.
function renderDirectory(rootUri, graph) {
    var onResult, onDone;

    // Empty the tab of lines.
    var $lines = $('.lines');
    if ($lines) $lines.empty();

    // Serialize the RDF graph.
    //var data = new $rdf.Serializer(graph).toN3(graph);
    //console.log(data);

    //Create a SPARQL query to fetch directory informations.
    var sparqlQuery =
        "PREFIX stat:  <http://www.w3.org/ns/posix/stat#> \n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
        "SELECT ?type ?size ?mt \n" +
        "WHERE {\n" +
        "<" + rootUri + "> rdfs:member ?m . \n" +
            "OPTIONAL { ?m stat:size ?size . } \n" +
            "OPTIONAL { ?m a ?type . } \n" +
            "OPTIONAL { ?m stat:mtime ?mt .} \n" +
        "}"

    // Bind the query to the graph.
    var fileQuery = $rdf.SPARQLToQuery(sparqlQuery, false, graph);

    // ...
    onResult = function (result) {
        console.log('OnResult');
        console.log(result);

        // Save ressource informations.
        var informations = {};
        informations.uri = result['?m'].uri;

        // Get the type.
        informations.type = "-";
        if (result['?type'].value) {
            var a = result['?type'].value.split('#');
            informations.type = a[a.length - 1];
        }

        // Get the name from uri.
        informations.name = basename(result['?m'].uri);

        // Get the size.
        informations.size = "-" ;
        if (result['?size'].value) {
            informations.size = result['?size'].value;
        }

        // Get the modification time.
        informations.mtime = "-" ;
        if (result['?mt'].value) {
            informations.mtime = formatTime(result['?mt'].value);
        }

        // if the ressource is a directory.
        if ( informations.type ) {
            if ( informations.type === "Directory") {
                informations.name = informations.name + '/';
                informations.size = "-"
            }
        }

        // Append each member of the directory to tBody.
        var $lines = $('.lines');
        $lines.append(templates("ressource", informations));

        // Bind click event to load its content.
        $lines.find("a[href='" + result['?m'].uri +"']").bind('click', function(e) {
            clickDir(e, result['?m'].uri);
        });

        $lines.find("a[class='editFile']").bind('click', function(e) {
            console.log('To be implemented');
            cloud.edit(informations.uri);
        });

        $lines.find("a[class='accessControl']").bind('click', function(e) {
            console.log('To be implemented');
            wac.edit('/', informations.uri);
        });

        $lines.find("a[class='deleteFile']").bind('click', function(e) {
            console.log('To be implemented');
            cloud.rm(informations.uri);
        });
    };

    // ...
    onDone = function (result) {
        console.log('DONE');
    };

    // Execute the query.
    graph.query(fileQuery, onResult, undefined, onDone);
}

// On click on directory member, change window location.
function clickDir (e,dirUri) {
    var uri1;

    // Cancel default behavior: don't change URL link.
    e.preventDefault();

    // Check if window.location is remote / local.
    if ( remoteUrl(window.location.href) ) {
        uri1 = $rdf.Fetcher.crossSiteProxyTemplate.replace('{uri}', encodeURIComponent(dirUri));
    }
    else {
        uri1 = window.location.href.substring(0, window.location.href.length - basename(window.location.pathname).length) + basename(dirname(dirUri)) + "/" + basename(dirUri)
    }

    // Update browser bar address.
    if ( window.history.pushState && window.history.replaceState ) {
        window.history.pushState(null, null, uri1);

        // When the back button of the browser is used.
        window.onpopstate = function (e) {
            // Change window location.
            window.location = window.location.href;
        };
    }

    // Fetch related RDF graph and render.
    loadRdfGraphAndRender(dirUri);
}
