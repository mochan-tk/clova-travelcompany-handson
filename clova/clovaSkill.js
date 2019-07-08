'use strict';
const clova = require('@line/clova-cek-sdk-nodejs');
const line = require('@line/bot-sdk');
const jsonData = require('../data.json');

// LINE BOTの設定
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};
const base_url = process.env.BASE_URL;

const client = new line.Client(config);

module.exports = clova.Client
  .configureSkill()

  //起動時
  .onLaunchRequest(async responseHelper => {
    console.log('onLaunchRequest');
    
    const speech = [
        clova.SpeechBuilder.createSpeechUrl('https://clova-soundlib.line-scdn.net/clova_behavior_door_knock.mp3'),
        clova.SpeechBuilder.createSpeechUrl('https://clova-soundlib.line-scdn.net/clova_behavior_door_open.mp3'),
        clova.SpeechBuilder.createSpeechText('こんにちは！トラベルカンパニーへようこそ。あなたに合った旅行プランをお探しします。行き先は国内ですか？海外ですか？')
      ];
    
    responseHelper.setSpeechList(speech);
    responseHelper.setReprompt(getRepromptMsg(clova.SpeechBuilder.createSpeechText('行き先は国内ですか？海外ですか？')));
  
  })

  //ユーザーからの発話が来たら反応する箇所
  .onIntentRequest(async responseHelper => {
    const intent = responseHelper.getIntentName();
    console.log('Intent:' + intent);
    switch (intent) {
      // ヘルプ
      case 'Clova.GuideIntent':
        const helpSpeech = [
          clova.SpeechBuilder.createSpeechText('スキルの説明をします。あなたに合った、旅行プランをご提供いたします。お気に召しましたら、お申し込みできます。'),
          clova.SpeechBuilder.createSpeechText('行き先は国内ですか？海外ですか？')];
        responseHelper.setSpeechList(helpSpeech);
        responseHelper.setReprompt(getRepromptMsg(clova.SpeechBuilder.createSpeechText('行き先は国内ですか？海外ですか？')));
        break;
      
      case 'TravelPlaceIntent':
        const slots = responseHelper.getSlots();
        const place = slots.place;
        
        const placeSpeech = [];
        console.log(slots.place);
        
        // ユーザID取得
        const { userId } = responseHelper.getUser();

        // 国内か海外の選択
        let type;
        if (place === '海外') {
          type = 'overseas';
        } else if (place === '国内') {
          type = 'domestic';
        } else {
          placeSpeech.push(clova.SpeechBuilder.createSpeechText('聞き取れませんでした。もう一度お願いします。行き先は国内ですか？海外ですか？'));
          responseHelper.setSpeechList(placeSpeech);
          return;
        }

        // オススメのプランをBOTへ送信
        await sendLineBot(userId, jsonData[type])
          .then(() => {
            if (place === '海外') {
              placeSpeech.push(clova.SpeechBuilder.createSpeechText('海外のおすすめプランをボットに送信しました。ご確認ください。'));
            } else {
              placeSpeech.push(clova.SpeechBuilder.createSpeechText('国内のおすすめプランをボットに送信しました。ご確認ください。'));
            }
          })
          .catch((err) => {
            console.log(err);
            placeSpeech.push(clova.SpeechBuilder.createSpeechText('botを連携させてください。'));
          });
        
        placeSpeech.push(clova.SpeechBuilder.createSpeechText('また、ご利用くださいませ。'));
        placeSpeech.push(clova.SpeechBuilder.createSpeechUrl('https://clova-soundlib.line-scdn.net/clova_behavior_door_close.mp3'));
        responseHelper.setSpeechList(placeSpeech);
        responseHelper.endSession();
        break;
        
      default:
        responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText('行き先は国内ですか？海外ですか？'));
        responseHelper.setReprompt(getRepromptMsg(clova.SpeechBuilder.createSpeechText('行き先は国内ですか？海外ですか？')));
        break;
    }
  })

  //終了時
  .onSessionEndedRequest(async responseHelper => {
    console.log('onSessionEndedRequest');
  })
  .handle();
  


// オススメのプランをBOTへ送信
async function sendLineBot(userId, jsonData) {
    await client.pushMessage(userId, [
      {
        'type': 'flex',
        'altText': 'プランを送信しました。',
        'contents': {
          'type': 'carousel',
          'contents': await getPlanCarousel(jsonData)
        }
      }
    ]);
}


const getPlanJson = (jsonData) => {
  // jsonデータからプランを取得
  // LIFFで申込情報入力
  const informationLiff = process.env.INFO_LIFF_URI;
  // LIFFでツアー詳細
  const tourLiff = process.env.TOUR_LIFF_URI + '?tour=' + jsonData.id;
  return {
    'type': 'bubble',
    'header': {
      'type': 'box',
      'layout': 'vertical',
      'contents': [
        {
          'type': 'text',
          'text': jsonData.tour
        }
      ]
    },
    'hero': {
      'type': 'image',
      'url': base_url + jsonData.tourImageUrl,
      'size': 'full',
      'aspectRatio': '20:13',
      'aspectMode': 'cover'
    },
    'body': {
      'type': 'box',
      'layout': 'vertical',
      'contents': [
        {
          'type': 'text',
          'text': jsonData.price
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
          'style': 'secondary',
          'action': {
            'type': 'uri',
            'label': '日程の詳細',
            'uri': tourLiff
          }
        },
        {
          'type': 'button',
          'style': 'primary',
          'action': {
            'type': 'uri',
            'label': '申込情報入力',
            'uri': informationLiff
          }
        }
      ]
    },
    'styles': {
      'header': {
        'backgroundColor': '#00ffff'
      },
      'hero': {
        'separator': true,
        'separatorColor': '#000000'
      },
      'footer': {
        'separator': true,
        'separatorColor': '#000000'
      }
    }
  };
};

const getPlanCarousel = async(jsonData) => {
  const planJsons = [];
  const randomAry = await funcRandom(jsonData);
  for (let i = 0; i < 3; i++) {
    planJsons.push(getPlanJson(jsonData[randomAry[i]]));
  }
  return planJsons;
};

// ランダム
async function funcRandom(data){
  let arr = [];
  for (let i=0; i<data.length; i++) {
    arr[i] = i;
  }
  let a = arr.length;
 
  // ランダムアルゴリズム
  while (a) {
      let j = Math.floor( Math.random() * a );
      let t = arr[--a];
      arr[a] = arr[j];
      arr[j] = t;
  }
   
  // ランダムされた配列の要素を順番に表示する
  await arr.forEach( function( value ) {} );
  return arr;
}


// リプロント
function getRepromptMsg(speechInfo){
  const speechObject = {
    type: 'SimpleSpeech',
    values: speechInfo,
  };
  return speechObject;
}