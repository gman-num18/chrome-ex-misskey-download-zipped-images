// アドオンのアクションボタンが押された時、タブを引数として実行
chrome.action.onClicked.addListener(async (tab) => {
    chrome.tabs.sendMessage(
        tab.id,
        {
            name: "getImgUrls" // imgタグのsrcのリストをくれ
        }
    );
    return true;
});

// 抽出したimg srcの配列をメッセージで受け取って処理する
chrome.runtime.onMessage.addListener(
    async (req, opt) => {
        if (req.name === 'resImgUrls') {
            //console.log(`resImgUrls is working. ${req.data}`);
            const mode = req.from;

            const blobArray = await Promise.all(req.data.map(async (url) => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            }));

            // content-scriptにData URIの配列を送り返す
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        name: "resBlobArray",
                        data: blobArray,
                        from: mode
                    }
                );
            });
        }
        return true;
    }
)
