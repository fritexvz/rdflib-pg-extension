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
Inspired by what is done in [banana-rdf](https://github.com/w3c/banana-rdf) but for the browser.



## Dependencies:
- [Q](https://github.com/kriskowal/q)
- [Underscore](https://github.com/jashkenas/underscore)
- [JQuery](https://github.com/jquery/jquery) (Recommended) (TODO to document)
- [RxJs](https://github.com/Reactive-Extensions/RxJS) (Optional. rx.js + js.async.js) (TODO to document)

## Exemple

We will show how from a `foaf:Person` url, we can print the friend names of this person.

Some vocab first to explain the variable names:
**localPg**: this is a pointed graph in the same http document: no additional http request is needed to obtain it.
**remotePg**: this is a pointed graph that may (not always) belong to another http document. This means that it is probable that additional http requests have to be made to access this pointed graph.

#### Fetching the person

```javascript
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");

// We don't use the RDFLib original proxy but this one instead
$rdf.Fetcher.fetcherWithPromiseCrossSiteProxyTemplate = "https://www.stample.io/srv/cors?url=";

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

#### With JumpAsync

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

#### With RxJs Observable

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
You will find great help in the Coursera course: [Functional Reactive Programming in Scala](https://www.coursera.org/course/reactive).

This is very powerful, now just imagine I do not want to print the Henry's friend names, but I want to print the name of the friends of the friends of Henry. This is not much complicated to get a stream on that! Just 3 additional lines!

```javascript
function printFriendName(personPg) {
    personPg.jumpRelObservable( FOAF("knows") )
    .flatMap(function(remoteFriendPg) {
        return remoteFriendPg.jumpRelObservable( FOAF("knows") );
    })
    .flatMap(function(remoteFriendFrientPg) {
        return Rx.Observable.fromArray( remoteFriendFrientPg.rel(FOAF("name")) );
    })
    .subscribe(function(remoteFriendFriendPgName) {
        var friendFriendName = remoteFriendFriendPgName.pointer.toString();
        $("#friendList").append("<li>"+friendFriendName+"</li>")
    });
}
```

Of course you'll have to handle duplicate names because you may receive multiple time the same friend name...

#### Other exemples?

Look at the code documentation, there's not much more methods but the it's just a preview of what you'll be able to do.

### Try it

These working exemples can be found [here](https://github.com/stample/rdflib.js/tree/master/pointedgraph/exemples).
Just clone the repo and open the html files in your browser.

There's also an exemple of [using requireJS](https://github.com/stample/rdflib.js/blob/master/pointedgraph/exemples/getFriendsRequire.html
).

## CORS Proxy

Here are some CORS proxy that you can use:

```javascript
$rdf.Fetcher.fetcherWithPromiseCrossSiteProxyTemplate = "https://www.stample.io/srv/cors?url=";
$rdf.Fetcher.fetcherWithPromiseCrossSiteProxyTemplate = "http://data.fm/proxy?uri=";
```
There may not always be online. 
Stample.io proxy (rww-play/Netty/Scala based) is a lot faster than data.fm proxy (PHP).


You can also run your own local proxy thanks to [rww-play](/stample/rww-play)

```javascript
$rdf.Fetcher.fetcherWithPromiseCrossSiteProxyTemplate = "http://localhost:9000/srv/cors?url=";
```

##### What about original RDFLib proxy?

We usually can register a proxy for RDFLib:

```javascript
$rdf.Fetcher.CrossSiteProxyTemplate = "http://data.fm/proxy?uri=";
```

We do not recommend using it. 
Actually the integration of our lib with RDFLib is not perfect and it doesn't work with the regular RDFLib proxy.


## Download

You can find versioned releases in the [releases](https://github.com/stample/rdflib.js/tree/master/releases) folder.

We recommend using our rdflib-stample.js version because it may include pull requests
that have not yet been merged to the official rdflib.js master.


## Install
 
 Run `make` to generate the dist directory
 This is like the original RDFLib Makefile but it generates an additional rdflib-pg-extension.js


## Licence: 
 
 MIT
