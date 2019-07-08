'use strict';

const jsonData = require('../data.json');

module.exports = ( req, res ) => {
  let planId = req.query.id;
  let plan = jsonData.overseas.filter(p => p.id == planId)[0];
  if (!plan) {
    plan = jsonData.domestic.filter(p => p.id == planId)[0];
  }
  res.json({plan});
};
