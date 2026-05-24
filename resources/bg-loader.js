(function() {
    var bgUrls = [
        'https://t.alcy.cc/mp',
        'https://t.alcy.cc/moemp',
        'https://api.r10086.com/樱道随机图片api接口.php?图片系列=动漫综合2,动漫综合1竖屏系列1&参数=json'
    ];
    var currentIndex = 0;
    var bgEl = document.getElementById('bgImage');

    function tryLoadBg(url, isJson) {
        var img = new Image();
        img.onload = function() {
            bgEl.style.backgroundImage = 'url(' + url + ')';
            bgEl.classList.add('loaded');
        };
        img.onerror = function() {
            currentIndex++;
            tryNext();
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
                            currentIndex++;
                            tryNext();
                        };
                        img2.src = imgUrl;
                    } else {
                        currentIndex++;
                        tryNext();
                    }
                })
                .catch(function() {
                    currentIndex++;
                    tryNext();
                });
        } else {
            img.src = url;
        }
    }

    function tryNext() {
        if (currentIndex >= bgUrls.length) return;
        var url = bgUrls[currentIndex];
        var isJson = url.indexOf('参数=json') > -1;
        tryLoadBg(url, isJson);
    }

    tryNext();
})();
