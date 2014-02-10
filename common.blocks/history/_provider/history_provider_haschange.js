/**
 * Modificator for BEM-block history which provides history API support
 * through hashchange fallback.
 */
modules.define('history', ['inherit', 'jquery', 'uri'], function(provide, inherit, $, Uri, Base) {

if ((window.history && 'pushState' in window.history) || !window.onhashchange) {
    provide(Base);
    return;
}

provide(inherit(Base, {
    
    _onHashChange: function() {
        this.state = this.normalizeState(undefined, document.title, this._removeHashbang(window.location.href));

        this.trigger('statechange', { state: this.state, nativeApi: false });
    },
    
    bindEvents: function() {
        $(window).on('hashchange', this._onHashChange);
        
        return this;
    },
    
    unbindEvents: function() {
        $(window).off('hashchange', this._onHashChange);

        return this;
    },
    
    syncState: function() {
        this.state = this.normalizeState(undefined, document.title, this._removeHashbang(window.location.href));
        return this;
    },
    
    /**
     * Generates hashbang from url.
     * ../search?p=1 => ..#!/search?p=1.
     *
     * @param {String} url
     * @returns {String}
     * @private
     */
    _generateHashbang: function(url) {
        var uri = Uri.parse(url),
            path = uri.pathParts();
        
        return ('!/' + path[path.length - 1] + uri.query());
    },
    
    _resetUrl: function() {
        var uri = Uri.parse(window.location.href);
        
        if (!uri.anchor()) {
            window.location.hash = this._generateHashbang(window.location.href);
        }
        return this;
    },
    
    changeState: function(method, state) {
        var uri = Uri.parse(state.url);
        
        if ((uri.host() && uri.host() !== window.location.hostname) ||
            (uri.port() && uri.port() !== window.location.port) ||
            (uri.protocol() && uri.protocol() !== window.location.protocol.replace(':', ''))) {

            throw new Error('SECURITY_ERR: DOM Exception 18');
        } else {
            this.state = state;
            window.location.hash = this._generateHashbang(state.url);
        }
    }
    
}));

});
