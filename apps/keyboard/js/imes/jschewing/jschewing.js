/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

(function() {

  var debugging = true;
  var debug = function(str) {
    if (!debugging)
      return;

    if (window.dump)
      window.dump('JSZhuyin: ' + str + '\n');
    if (console && console.log) {
      console.log('JSZhuyin: ' + str);
      if (arguments.length > 1)
        console.log.apply(this, arguments);
    }
  };

  /* for non-Mozilla browsers */
  if (!KeyEvent) {
    var KeyEvent = {
      DOM_VK_BACK_SPACE: 0x8,
      DOM_VK_RETURN: 0xd
    };
  }

  var chewing = null;
  var load_plugin = function load_plugin() {
    var body = document.getElementsByTagName('body')[0];
    chewing = document.createElement('embed');
    chewing.type = 'application/x-chewing-ime';
    chewing.width = '0';
    chewing.height = '0';
    body.appendChild(chewing);
  };

  var unload_plugin = function unload_plugin() {
    var body = document.getElementsByTagName('body')[0];
    body.removeChild(chewing);
    chewing = null;
  };

  var IMEngine = function ime() {
    var settings;

    this.init = function ime_init(options) {
      debug('Init.');
      settings = options;
      load_plugin();
    };

    /* ==== uninit ==== */

    this.uninit = function ime_uninit() {
      debug('Uninit.');
      unload_plugin();
    };

    /* ==== interaction functions ==== */

    this.click = function ime_click(code) {
      if (code <= 0) {
        debug('Ignoring keyCode <= 0.');
        return;
      }
      debug('Click keyCode: ' + code);
      if (code == KeyEvent.DOM_VK_RETURN) {
        chewing.handleEnter();
        var commitStr = chewing.commitString();
        if (commitStr) {
          settings.sendPendingSymbols('');
          settings.sendString(commitStr);
        }
        return;
      }
      chewing.handleDefault(code);
      var zhuyinStr = chewing.zhuyinString();
      var bufferStr = chewing.bufferString();
      settings.sendPendingSymbols((bufferStr || '') +
                                  (zhuyinStr || ''));

      var candidates = chewing.candidatesList();
      for (var cand in candidates) {
        debug('cand: ' + cand);
      }
      settings.sendCandidates(candidates);
    };

    this.select = function ime_select(text, type) {
      debug('Select text ' + text);
    };
  };

  var jschewing = new IMEngine();

  // Expose JSChewing as an AMD module
  if (typeof define === 'function' && define.amd)
    define('jschewing', [], function() { return jschewing; });

  // Expose to the Gaia keyboard
  if (typeof InputMethods !== 'undefined')
    InputMethods.jschewing = jschewing;

})();
