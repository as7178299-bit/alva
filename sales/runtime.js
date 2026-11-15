/* Tiny runtime: renders the page template with state, patches the DOM with morphdom. */
(function () {
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return ESC[c]; }); }
  function get(scope, path) {
    if (path === 'true') return true; if (path === 'false') return false;
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  var HOLE = /\{\{\s*([\w.]+)\s*\}\}/g;
  function interp(str, scope) { return str.replace(HOLE, function (_, p) { var v = get(scope, p); return v == null ? '' : v; }); }
  var VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/;
  var EVENTS = { onclick: 'click', onmousemove: 'mousemove', onmouseenter: 'mouseenter', onmouseleave: 'mouseleave' };

  function Runtime(tpl, logic, root) {
    this.tpl = tpl; this.logic = logic; this.root = root; this.handlers = []; this.queued = false;
  }
  Runtime.prototype.renderNodes = function (nodes, scope, out) {
    for (var i = 0; i < nodes.length; i++) this.renderNode(nodes[i], scope, out);
  };
  Runtime.prototype.renderNode = function (n, scope, out) {
    if (n.nodeType === 3) { out.push(esc(interp(n.nodeValue, scope))); return; }
    if (n.nodeType !== 1) return;
    var tag = n.tagName.toLowerCase();
    if (tag === 'sc-if') {
      var m = /\{\{\s*([\w.]+)\s*\}\}/.exec(n.getAttribute('value') || '');
      if (m && get(scope, m[1])) this.renderNodes(n.childNodes, scope, out);
      return;
    }
    if (tag === 'sc-for') {
      var lm = /\{\{\s*([\w.]+)\s*\}\}/.exec(n.getAttribute('list') || '');
      var list = lm ? get(scope, lm[1]) : null; var as = n.getAttribute('as') || 'item';
      if (list) for (var j = 0; j < list.length; j++) {
        var s = Object.create(scope); s[as] = list[j]; this.renderNodes(n.childNodes, s, out);
      }
      return;
    }
    out.push('<' + tag);
    var attrs = n.attributes;
    for (var k = 0; k < attrs.length; k++) {
      var a = attrs[k], name = a.name;
      if (name.indexOf('hint-') === 0) continue;
      if (EVENTS[name]) {
        var hm = /\{\{\s*([\w.]+)\s*\}\}/.exec(a.value); var fn = hm && get(scope, hm[1]);
        if (typeof fn === 'function') { var id = this.handlers.push({ type: EVENTS[name], fn: fn }) - 1; out.push(' data-on-' + EVENTS[name] + '="' + id + '"'); }
        continue;
      }
      out.push(' ' + name + '="' + esc(interp(a.value, scope)) + '"');
    }
    out.push('>');
    if (VOID.test(tag)) return;
    var kids = tag === 'template' ? n.content.childNodes : n.childNodes;
    this.renderNodes(kids, scope, out);
    out.push('</' + tag + '>');
  };
  Runtime.prototype.render = function () {
    this.queued = false; this.handlers = [];
    var vals = this.logic.renderVals(); var out = [];
    this.renderNodes(this.tpl.content.childNodes, vals, out);
    var next = document.createElement('div'); next.id = this.root.id; next.innerHTML = out.join('');
    morphdom(this.root, next, {
      getNodeKey: function (el) { return el.getAttribute ? (el.getAttribute('key') || el.id) : null; },
      onBeforeElUpdated: function (from, to) { return !from.isEqualNode(to); }
    });
    var self = this;
    var els = this.root.querySelectorAll('[data-on-click],[data-on-mousemove],[data-on-mouseenter],[data-on-mouseleave]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; el._h = el._h || {};
      ['click', 'mousemove', 'mouseenter', 'mouseleave'].forEach(function (t) {
        var idx = el.getAttribute('data-on-' + t);
        if (idx == null) return;
        el._h[t] = self.handlers[+idx].fn;
        if (!el['_b' + t]) { el['_b' + t] = true; el.addEventListener(t, function (e) { var f = this._h && this._h[t]; if (f) f(e); }); }
      });
    }
  };
  Runtime.prototype.schedule = function () {
    if (this.queued) return; this.queued = true; var self = this;
    (window.queueMicrotask || setTimeout)(function () { self.render(); });
  };

  window.DCLogic = function () { this.state = {}; };
  window.DCLogic.prototype.setState = function (patch) {
    var p = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = Object.assign({}, this.state, p); if (this._rt) this._rt.schedule();
  };
  window.mountPage = function (Cls) {
    var logic = new Cls(); logic.state = logic.state || {};
    var rt = new Runtime(document.getElementById('page-tpl'), logic, document.getElementById('app'));
    logic._rt = rt; rt.render();
    if (logic.componentDidMount) logic.componentDidMount();
  };
})();
