# RDFLib.js Pointed Graph extension

This is a repository with a PointedGraph extension of RDFLib.js.
RDFLib.js is not always easy to deal with, not really documented... 
This library will try to make your life easier with RDFLib.

It is in active development and will provide soon different ways to edit RDF graphs.

## What is a Pointed Graph?

- A pointed graph is a pointer in a named graph.
- A named graph is an http resource/document which contains an RDF graph (a list of RDF triples)
- A pointer is a particular node in this graph.

This API permits to easily navigate through RDFLib graphs in an RDFLib store.
Inspired by what is done in banana-rdf (https://github.com/w3c/banana-rdf) but for the browser.



## Dependencies:
- Q (https://github.com/kriskowal/q)
- Underscore (https://github.com/jashkenas/underscore)
- Recommended: JQuery (TODO to document)
- Optional: RxJs (rx.js+js.async.js) (https://github.com/Reactive-Extensions/RxJS) (TODO to document)

## Exemple

We will show how from a `foaf:Person` url, we can print the friend names of this person.

### Fetching the person

```javascript
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");

   
$rdf.Fetcher.fetcherWithPromiseCrossSiteProxyTemplate = "http://data.fm/proxy?uri=";

var fetcherTimeout = 3000;
var store = $rdf.PG.createNewStore(fetcherTimeout);

// You can use an URL with or without a fragment, it will give you different
// pointer graphs with the same underlying document/namedGraph.
var henryFoafProfileUrl = "http://bblfish.net/people/henry/card#me";

// You can fetch it, it returns a Q promise of pointed graph.
// The pointer will be Henry's foaf:Person subject
store.fetcher.fetch(henryFoafProfileUrl)
        .then(function(henryPg) {
            printPersonFriendNames(henryPg);
        })
        .fail(function(fetchError) {
            console.warn("Can't fetch the pointed graph at",henryFoafProfileUrl,fetchError);
        });
```

### With JumpAsync

```javascript
function printPersonFriendNames(personPg) {
    // get the list of pointed graphs that points to henry's friend in the local document
    var localFriendPgs = personPg.rel( FOAF("knows") );
    _.each(localFriendPgs, function(localFriendPg) {
        printFriendName(localFriendPg);
    });
}

function printFriendName(localFriendPg) {
    // Generally, each foaf profile is described in separate http resources / rdf graphs.
    // So you can't get much data by staying in the local graph,
    // you have to jump to the remote graph that is hosted at your friend's foaf profile URL.
    // For that you can use jumpAsync: this will fetch the remote URL
    // and return a promise of pointed graph. The PG pointer will be the same node
    // (the friend url symbol) but the underlying document will be changed
    localFriendPg.jumpAsync()
            .then(function(remoteFriendPg) {
                // Finally we can print the name of all Henry's friends
                var friendName = remoteFriendPg.relFirst(FOAF("name")).pointer.toString();;
                $("#friendList").append("<li>"+friendName+"</li>")
            }).fail(function (jumpError) {
                console.warn("Error during jump from ",localFriendPg.printSummary(),jumpError);
            });
}
```

### With RxJs Observable

If you are using RxJs it's even simpler to get a stream of friends: you'll receive the friends pointed graphs as the requests come back:

```javascript
function printFriendName(personPg) {
    personPg.jumpRelObservable( FOAF("knows") )
            .flatMap(function(remoteFriendPg) {
                return Rx.Observable.fromArray( remoteFriendPg.rel(FOAF("name")) );
            })
            .subscribe(function(remoteFriendPgName) {
                var friendName = remoteFriendPgName.pointer.toString();
                $("#friendList").append("<li>"+friendName+"</li>")
            });
    }
```

But you'll have to understand some functional operators on streams like the flatMap operator to be able to use it efficiently.
You will find help in the Functional Reactive Programming course on coursera


### Try it

These working exemples can be found here.
https://github.com/stample/rdflib.js/tree/master/pointedgraph/exemples
Just make sure the CORS proxy is online (data.fm proxy is not always available :s)




## RequireJS:

There's an exemple using RequireJS here:
https://github.com/stample/rdflib.js/blob/master/pointedgraph/exemples/getFriendsRequire.html



## Download

You can find versioned releases in the /releases folder.

We recommend using our rdflib.js version because it may include pull requests
that have not yet been merged to the official rdflib.js master.


## Install
 
 Run `make` to generate the dist directory
 This is like the original RDFLib Makefile but it generates an additional rdflib-pg-extension.js


## Licence: 
 
 MIT
