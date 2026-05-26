(function() {
    var bgUrls = [
        'https://t.alcy.cc/mp',
        'https://t.alcy.cc/moemp',
        'https://api.r10086.com/樱道随机图片api接口.php?图片系列=动漫综合2,动漫综合1竖屏系列1&参数=json'
    ];
    var maxRetries = 1;
    var currentIndex = 0;
    var currentRetry = 0;
    var bgEl = document.getElementById('bgImage');

    function tryLoadBg(url, isJson) {
        var img = new Image();
        img.onload = function() {
            bgEl.style.backgroundImage = 'url(' + url + ')';
            bgEl.classList.add('loaded');
        };
        img.onerror = function() {
            currentRetry++;
            if (currentRetry <= maxRetries) {
                tryLoadBg(url, isJson);
            } else {
                currentIndex++;
                currentRetry = 0;
                tryNext();
            }
        };
        if (isJson) {
            fetch(url)
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    var imgUrl = data.url || data.img || data.image || data.data;
                    if (imgUrl) {
                        var img2 = new Image();
                        img2.onload = function() {
                            bgEl.style.backgroundImage = 'url(' + imgUrl + ')';
                            bgEl.classList.add('loaded');
                        };
                        img2.onerror = function() {
                            currentRetry++;
                            if (currentRetry <= maxRetries) {
                                tryLoadBg(url, isJson);
                            } else {
                                currentIndex++;
                                currentRetry = 0;
                                tryNext();
                            }
                        };
                        img2.src = imgUrl;
                    } else {
                        currentRetry++;
                        if (currentRetry <= maxRetries) {
                            tryLoadBg(url, isJson);
                        } else {
                            currentIndex++;
                            currentRetry = 0;
                            tryNext();
                        }
                    }
                })
                .catch(function() {
                    currentRetry++;
                    if (currentRetry <= maxRetries) {
                        tryLoadBg(url, isJson);
                    } else {
                        currentIndex++;
                        currentRetry = 0;
                        tryNext();
                    }
                });
        } else {
            img.src = url;
        }
    }

    function tryNext() {
        if (currentIndex >= bgUrls.length) return;
        var url = bgUrls[currentIndex];
        var isJson = url.indexOf('参数=json') > -1;
        currentRetry = 0;
        tryLoadBg(url, isJson);
    }

    tryNext();
})();
