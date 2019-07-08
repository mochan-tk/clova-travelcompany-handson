'use strict';

const uuid = require('uuid/v4');
const cache = require('memory-cache');

const line_pay = require('line-pay');
const pay = new line_pay({
    channelId: process.env.LINEPAY_CHANNEL_ID,
    channelSecret: process.env.LINEPAY_CHANNEL_SECRET,
    //hostname: process.env.LINE_PAY_HOSTNAME,
    isSandbox: true
})


module.exports = ( req, res ) => {
    console.log(req.query.userid);
    let options = {
        productName: 'ハワイ３泊５日間の旅',
        amount: 1,
        currency: 'JPY',
        orderId: uuid(),
        confirmUrl: process.env.BASE_URL + '/linepay/confirm'
    }

    pay.reserve(options).then((response) => {
        let reservation = options;
        reservation.transactionId = response.info.transactionId;
        reservation.userid = req.query.userid;

        console.log(`Reservation was made. Detail is following.`);
        console.log(reservation);

        // Save order information
        cache.put(reservation.transactionId, reservation);

        res.redirect(response.info.paymentUrl.web);
    })  
};