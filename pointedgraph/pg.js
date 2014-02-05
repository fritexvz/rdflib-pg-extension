


///////////////////////////////////////////////////////////////////////////////////////////////
// pg.js, part of rdflib-pg-extension.js made by Stample
// see https://github.com/stample/rdflib.js
///////////////////////////////////////////////////////////////////////////////////////////////

$rdf.PG = {
    createNewStore: function(fetcherTimeout) {
        var store = new $rdf.IndexedFormula();
        // this makes "store.fetcher" variable available
        $rdf.fetcher(store, fetcherTimeout, true);
        return store;
    }
}

$rdf.PG.Utils = {

    /**
     * Just a little helper method to verify preconditions and fail fast.
     * See http://en.wikipedia.org/wiki/Precondition
     * See http://en.wikipedia.org/wiki/Fail-fast
     * @param condition
     * @param message
     */
    checkArgument: function(condition, message) {
        if (!condition) {
            throw Error('IllegalArgumentException: ' + (message || 'No description'));
        }
    },

    /**
     * remove hash from URL - this gets the document location
     * @param url
     * @returns {*}
     */
    fragmentless: function(url) {
        return url.split('#')[0];
    },

    isFragmentless: function(url) {
        return url.indexOf('#') == -1;
    },

    isFragmentlessSymbol: function(node) {
        return this.isSymbolNode(node) && this.isFragmentless(this.symbolNodeToUrl(node));
    },


    getTermType: function(node) {
        if ( node && node.termType ) {
            return node.termType
        } else {
            throw new Error("Can't get termtype on this object. Probably not an RDFlib node: "+node);
        }
    },


    isLiteralNode: function(node) {
        return this.getTermType(node) == 'literal';
    },
    isSymbolNode: function(node) {
        return this.getTermType(node) == 'symbol';
    },
    isBlankNode: function(node) {
        return this.getTermType(node) == 'bnode';
    },

    literalNodeToValue: function(node) {
        this.checkArgument(this.isLiteralNode(node), "Node is not a literal node:"+node);
        return node.value;
    },
    symbolNodeToUrl: function(node) {
        this.checkArgument(this.isSymbolNode(node), "Node is not a symbol node:"+node);
        return node.uri;
    },





    /**
     * Get the nodes for a given relation symbol
     * @param pg
     * @param relSym
     * @returns => List[Nodes]
     */
    getNodes: function(pg, relSym) {
        return _.chain( pg.rels(relSym) )
            .map(function(pg) {
                return pg.pointer;
            }).value();
    },

    getLiteralNodes: function(pg, relSym) {
        return _.chain(pgUtils.getNodes(pg,relSym))
            .filter($rdf.PG.Utils.isLiteralNode)
            .value();
    },
    getSymbolNodes: function(pg, relSym) {
        return _.chain(pgUtils.getNodes(pg,relSym))
            .filter($rdf.PG.Utils.isSymbolNode)
            .value();
    },
    getBlankNodes: function(pg, relSym) {
        return _.chain(pgUtils.getNodes(pg,relSym))
            .filter($rdf.PG.Utils.isBlankNode)
            .value();
    },


    /**
     *
     * @param pgList
     * @returns {*}
     */
    getLiteralValues: function(pgList) {
        var rels = (slice.call(arguments, 1));
        var res =  _.chain(pgList)
            .map(function (pg) {
                return pg.getLiteral(rels);
            })
            .flatten()
            .value();
        return res;
    }

}


$rdf.PG.Filters = {
    isLiteralPointer: function(pg) {
        return pg.isLiteralPointer();
    },
    isBlankNodePointer: function(pg) {
        return pg.isBlankNodePointer();
    },
    isSymbolPointer: function(pg) {
        return pg.isSymbolPointer();
    }
}

$rdf.PG.Transformers = {
    literalPointerToValue: function(pg) {
        return $rdf.PG.Utils.literalNodeToValue(pg.pointer);
    },
    symbolPointerToValue: function(pg) {
        return $rdf.PG.Utils.symbolNodeToUrl(pg.pointer);
    }
}

