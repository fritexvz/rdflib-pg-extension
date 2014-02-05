# RDFLib.js Pointed Graph extension

This is a repository with a PointedGraph extension of RDFLib.js.

## What is a Pointed Graph?

- A pointed graph is a pointer in a named graph.
- A named graph is an http resource/document which contains an RDF graph (a list of RDF triples)
- A pointer is a particular node in this graph.

This API permits to easily navigate through RDFLib graphs in an RDFLib store.
Inspired by what is done in banana-rdf (https://github.com/w3c/banana-rdf) but for the browser.

## Dependencies:
- Q (https://github.com/kriskowal/q)
- Underscore (https://github.com/jashkenas/underscore)
- Optional: RxJs (rx.js + js.async.js?) (https://github.com/Reactive-Extensions/RxJS) (TODO to document)
- Optional: JQuery (TODO to document)

## Exemple

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

        // Generally, each foaf profile is described in separate http resources / rdf graphs.
        // So you can't get much data by staying in the local graph, 
        // you have to jump to the remote graph that is hosted at your friend's foaf profile URL.
        // For that you can use jumpAsync: this will fetch the remote URL 
        // and return a promise of pointed graph. The PG pointer will be the same node 
        // (the friend url symbol) but the underlying document will be changed
        var remoteFriendPgPromise = localHenryFriendPg.jumpAsync();

        remoteFriendPgPromise.then(function(remoteFriendPg) {
            // Finally we can print the name of all Henry's friends
            var friendName = remoteFriendPg.relFirst(FOAF("name")).pointer.toString();;
            $("#friendList").append("<li>"+friendName+"</li>")
        });


    });


});
```

### With RxJs

If you are using RxJs it's even simpler to get a stream of friends: you'll receive the friends pointed graphs as the requests come back:

```javascript
    pointedGraphPromise.then(function(henryPg) {

        henryPg.jumpRelObservable( FOAF("knows") )
                .map(function(remoteFriendPg) {
                    return remoteFriendPg.relFirst(FOAF("name"));
                })
                .filter(function(maybeRemoteFriendPgName) {
                    return typeof maybeRemoteFriendPgName != 'undefined';
                })
                .subscribe(function(remoteFriendPgName) {
                    var friendName = remoteFriendPgName.pointer.toString();
                    $("#friendList").append("<li>"+friendName+"</li>")
                });

    });
```

These exemples can be found here: https://github.com/stample/rdflib.js/tree/master/pointedgraph/exemples






## RequireJS:

```javascript
require.config({
    paths: {
        "jquery": "lib/jquery-2.1.0.min",
        "underscore":"lib/underscore",
        "q": "lib/q",
        "rdflib": "lib/rdflib/rdflib",
        "rdflib-pg-extension": "lib/rdflib/rdflib-pg-extension",
    },

    shim: {

        "rdflib-pg-extension": {
            "deps": ["rdflib","underscore","q"],
            "exports":"rdflib-pg-extension"
        }

    }
});

require([
    "jquery",
    "underscore",
    "q",
    "rdflib",
    "rdflib-pg-extension",
    ],
    function ($, _, Q, rdflib, rdflibPg) {
        // Do something
    }
);
```



## Download

You can find versioned releases in the /releases folder.

We recommend using our rdflib.js version because it may include pull requests
that have not yet been merged to the official rdflib.js master.


## Install
 
 Run `make` to generate the dist directory
 This is like the original RDFLib Makefile but it generates an additional rdflib-pg-extension.js


## Licence: 
 
 MIT
