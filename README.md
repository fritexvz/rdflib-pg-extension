This is a repository with a PointedGraph extension of RDFLib.js.

What is a Pointed Graph?

- A pointed graph is a pointer in a named graph.
- A named graph is an http resource/document which contains an RDF graph (a list of RDF triples)
- A pointer is a particular node in this graph.

This API permits to easily navigate through RDFLib graphs in an RDFLib store.
Inspired by what is done in banana-rdf (https://github.com/w3c/banana-rdf) but for the browser.

DEPENDENCIES:
- Q (https://github.com/kriskowal/q)
- Underscore (https://github.com/jashkenas/underscore)
- Optional: RxJs (rx.js + js.async.js?) (https://github.com/Reactive-Extensions/RxJS) (TODO to document)
- Optional: JQuery (TODO to document)

EXEMPLE USAGE
```javascript
    var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");

    // proxy
    $rdf.Fetcher.fetcherWithPromiseCrossSiteProxyTemplate = "http://localhost:9000/srv/cors?url=";

    var store = new $rdf.IndexedFormula();
    // this makes "store.fetcher" variable available (same as RDFLib)
    $rdf.fetcher(store, fetcherTimeout, true);

    // You can use an URL with or without a fragment, it will give you different pointer graphs with the same underlying document/namedGraph.
    var henryFoafProfileUrl = "http://bblfish.net/people/henry/card#me";

    // You can fetch it, it returns a Q promise (to avoid JS callback hell)
    var pointedGraphPromise = store.fetcher.fetch("http://bblfish.net/people/henry/card#me");

    // You can register code that will be triggered when the pointedGraph is available
    pointedGraphPromise.then(function(henryPg) {

        // You can get the list of pointed graphs that points to henry's friend in the local document
        var localHenryFriendPgs = henryPg.rel(FOAF("knows"));

        _.foreach(localHenryFriendPgs, function(localHenryFriendPg) {

            // Generally, each foaf profile is described in separate http resources / rdf named graphs.
            // So you can't get much data by staying in the local graph, you have to jump to the remote graph
            // that is hosted at your friend's profile URL.
            // For that you use jumpAsync: this will fetch the remote URL and return a promise of pointed graph
            // The PG pointer will be the same node (the friend url symbol) but the underlying document will be changed
            var remoteFriendPgPromise = localHenryFriendPg.jumpAsync();

            remoteFriendPgPromise.then(function(remoteFriendPg) {
                // Finally we can print the name of all Henry's friends
                console.log( remoteFriendPg.relFirst(FOAF("name")) );
            });


        });


    });
```


DOWNLOAD

You can find versioned releases in the /releases folder.

We recommend using our rdflib.js version because it may include pull requests
that have not yet been merged to the official rdflib.js master.


INSTALL
 
 Run `make` to generate the dist directory
 This is like the original RDFLib Makefile but it generates an additional rdflib-pg-extension.js


LICENSE: MIT
