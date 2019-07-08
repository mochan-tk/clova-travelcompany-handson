# 作成手順

1. git cloneする  
git clone https://github.com/mochan-tk/clova-travelcompany-handson.git

2. npmをインストールする  
npm i


3. ngrokをインストールする  
npm i -g ngrok


4. ngrokを実行する  
ngrok http 3000


5. CEKを設定する(スキル名：トラベルカンパニー)  
・下記ファイルを対話モデルでplaceスロット作成してアップロードする  
./models/slottype_place.tsv  
・下記ファイルを対話モデルでTravelPlaceIntentインテント作成してアップロードする  
./models/intent_TravelPlaceIntent.tsv  
・下記のようにExtensionサーバーのURLを設定  
https://xxx.ngrok.io/clova

6. Messaging APIを設定する  
・Webhook送信  
する  
・Webhook URL  
https://xxx.ngrok.io/linebot  
・自動応答メッセージ  
利用しない

7. LIFFを設定する  
・エンドポイントURLに設定する  
https://xxx.ngrok.io/info.html  
https://xxx.ngrok.io/tour.html  
https://xxx.ngrok.io/linepay/reserve  

8. 「.env」ファイルを設定する   
・「EXTENSION_ID」  
「5」で設定したCEKのExtension ID  
・「CHANNEL_ACCESS_TOKEN」と「CHANNEL_SECRET」  
「6」で生成した「アクセストークン」と「Channel Secret」  
・「BASE_URL」
https://xxx.ngrok.io
・「LINEPAY_CHANNEL_ID」、「LINEPAY_CHANNEL_SECRET」、「LINEPAY_CONFIRM_URL」  
任意、LINE Payのアカウントお持ちなら設定  
・「残りのLIFF_URL」  
「７」で作成したLIFF URL

9. 実行する  
node index.js