const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/idb.js",
    "/js/index.js",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png",
  
  ]
  
  const CACHE_NAME = "static-cache-v1";
  const DATA_CACHE_NAME = "data-cache-v1";
  
  
  self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )
  });
  
  self.addEventListener('activate', function (e) {
    e.waitUntil(
      caches.keys().then(function (keyList) {
        // `keyList` contains all cache names under your username.github.io
        // filter out ones that has this app prefix to create keeplist
        let cacheKeeplist = keyList.filter(function (key) {
          return key.indexOf("static-cache-");
        })
        // add current cache name to keeplist
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log('deleting cache : ' + keyList[i] );
            return caches.delete(keyList[i]);
          }
        }));
      })
    );
  });
  
  
  
  self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then(async cache => {
            try {
                  const response = await fetch(evt.request);
                  if (response.status === 200) {
                      cache.put(evt.request.url, response.clone());
                  }
                  return response;
              } catch (err) {
                  return await cache.match(evt.request);
              }
          })
          .catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(async function() {
        const response = await caches.match(evt.request);
          if (response) {
              return response;
          } else if (evt.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
          }
      })
    );
  });
  