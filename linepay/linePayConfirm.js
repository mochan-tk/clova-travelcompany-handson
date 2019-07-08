'use strict';

const cache = require('memory-cache');
const line_pay = require('line-pay');
const line = require('@line/bot-sdk');
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const pay = new line_pay({
    channelId: process.env.LINEPAY_CHANNEL_ID,
    channelSecret: process.env.LINEPAY_CHANNEL_SECRET,
    isSandbox: true
})


module.exports = ( req, res ) => {
    if (!req.query.transactionId){
        throw new Error('Transaction Id not found.');
    }

    // Retrieve the reservation from database.
    let reservation = cache.get(req.query.transactionId);
    if (!reservation){
        throw new Error('Reservation not found.');
    }

    console.log(`Retrieved following reservation.`);
    console.log(reservation);

    let confirmation = {
        transactionId: req.query.transactionId,
        amount: reservation.amount,
        currency: reservation.currency
    }

    console.log(`Going to confirm payment with following options.`);
    console.log(confirmation);

    pay.confirm(confirmation).then(async(response) => {
      const client = new line.Client(config);
      await client.pushMessage(reservation.userid, [
      {
        'type': 'flex',
        'altText': 'お支払いを完了しました。',
        'contents': {
          'type': 'bubble',
          'header': {
            'type': 'box',
            'layout': 'vertical',
            'contents': [
              {
                'type': 'text',
                'text': 'お支払い完了しました。💰',
                'size': 'md',
                'weight': 'bold'
              },
              {
                'type': 'text',
                'text': 'ありがとうございました。🌟',
                'size': 'md',
                'weight': 'bold'
              }
            ]
          }
        }
      },
      {
        'type': 'sticker',
        'packageId' : 11537,
        'stickerId' : 52002734
      },
      {
        'type': 'text',
        'text': '最後に、プラン申込からお支払いまでのお手続きは分かりやすかったですか？',
        'quickReply': {
          'items': [
            {
              'type': 'action',
              'action': {
                 'type':'postback',
                 'label':'はい🎵',
                 'data': 'result-yes',
                 'displayText':'はい🎵'
              }
            },
            {
              'type': 'action',
              'action': {
                 'type':'postback',
                 'label':'いいえ😞',
                 'data': 'result-no',
                 'displayText':'いいえ😞'
              }
            }
          ]
        }
      }
      
    ]);
    });
};