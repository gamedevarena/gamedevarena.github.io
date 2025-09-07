// livereload.js - Client-side script for live reload functionality
(function() {
  'use strict';
  
  // Create WebSocket connection to server
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  function connect() {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = function() {
      console.log('[LiveReload] Connected to server');
    };
    
    ws.onmessage = function(event) {
      if (event.data === 'reload') {
        console.log('[LiveReload] Reloading page...');
        window.location.reload();
      }
    };
    
    ws.onclose = function() {
      console.log('[LiveReload] Connection closed. Attempting to reconnect in 1s...');
      setTimeout(connect, 1000);
    };
    
    ws.onerror = function(error) {
      console.log('[LiveReload] WebSocket error:', error);
    };
  }
  
  // Start connection when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connect);
  } else {
    connect();
  }
})();