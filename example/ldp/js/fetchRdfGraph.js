// Graphs.
graphsCache = {};

// Set the proxy for the rdf fetch.
$rdf.Fetcher.crossSiteProxyTemplate = "http://data.fm/proxy?uri={uri}";

function clickDir (e, rootUri) {
    console.log(rootUri);

    // Cancel default behavior: don't change URL link.
    e.preventDefault();

    // Define RDF graph.
    var graph = graphsCache[rootUri] = new $rdf.IndexedFormula();
    //console.log(graph);
    var fetch = $rdf.fetcher(graph);

    // Fetch RDF graph.
    fetch.nowOrWhenFetched(rootUri, undefined, function() {
        // Render / Display.
        renderDirectory(rootUri, graph);
    });
}

function renderDirectory(rootUri, graph) {
    var onResult, onDone;

    // Serialize the RDF graph.
    var data = new $rdf.Serializer(graph).toN3(graph);
    console.log(data);

    //Create a SPARQL query to fetch directory informations.
    //*
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
    //*/
    console.log(sparqlQuery);

    // Bind the query to the graph.
    var fileQuery = $rdf.SPARQLToQuery(sparqlQuery, false, graph);

    // ...
    onResult = function (result) {
        console.log('OnResult');
        console.log(result);
        console.log(result['?m'].uri);
        // Change window location.
        console.log(window.location);
        window.location = result['?m'].uri;
    };

    // ...
    onDone = function () {
        console.log('DONE');
    };


    // Execute the query.
    graph.query(fileQuery, onResult, undefined, onDone);

}