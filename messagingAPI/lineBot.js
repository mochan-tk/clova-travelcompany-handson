'use strict';

const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

module.exports = async( req, res ) => {
  Promise
    .all(req.body.events.map(await handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.log('err!!!');
      console.error(err);
      res.status(200).end();
    });
};

// event handler
async function handleEvent(event, session) {
  console.log(event);
  let echo = [];
  if (event.type === 'message') {
    if (event.message.text.substring(0, 4) === 'お支払い') {
      // 申し込み内容確認のflex
      echo = {
        'type': 'flex',
        'altText': '申込内容を送信しました。',
        'contents': {
          'type': 'carousel',
          'contents': [
            {
              'type': 'bubble',
              'header': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                  {
                    'type': 'text',
                    'text': '旅行代金：¥90,000'
                  }
                ]
              },
              'footer': {
                'type': 'box',
                'layout': 'vertical',
                'spacing': 'sm',
                'contents': [
                  {
                    'type': 'button',
                    'style': 'primary',
                    'action': {
                      'type': 'uri',
                      'label': 'お支払い',
                      'uri': process.env.LINEPAY_LIFF_URI + '?userid=' + event.source.userId
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    } else {
      echo = { 'type': 'text', 'text': '申し訳ありませんが、お返事できません。' }; 
    }
  } else if (event.type === 'follow') {
    echo = { 'type': 'text', 'text': 'トラベルプランを起動してください。あなたに合ったプランを提案します。' }
    
  } else if(event.type === 'postback'){
    // 埋め込みデータ取得
    const data = event.postback.data.split('-');
    if (data[0] === 'result') {
      if (data[1] === 'yes') {
        echo = [
          { 'type': 'text', 'text': 'ありがとうございました。次回から使えるクーポンを差し上げます。ご利用ありがとうございました。' },
          {
            'type': 'flex',
            'altText': 'クーポンを送りました。',
            'contents': {
              'type': 'bubble',
              'header': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                  {
                    'type': 'text',
                    'text': 'クーポンコード',
                    'size': 'xl',
                    'weight': 'bold'
                  },
                  {
                    'type': 'text',
                    'text': 'XXXXXXXXXXXX',
                    'size': 'xxl',
                    'weight': 'bold'
                  },
                  {
                    'type': 'text',
                    'text': '1,000円引き',
                    'size': 'xl',
                    'weight': 'bold',
                    'color': '#ff0000'
                  },
                  {
                    'type': 'text',
                    'text': '有効期限１年以内'
                  }
                ]
              }
            }
          }
        ];
      } else {
        echo = { 'type': 'text', 'text': '申し訳ありませんでした。改善に努めます。ご利用ありがとうございました。' }; 
      }
    } else {
      echo = { 'type': 'text', 'text': '申し訳ありませんが、お返事できません。' }; 
    }
  } else {
    echo = { 'type': 'text', 'text': '申し訳ありませんが、お返事できません。' }; 
  }

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}
