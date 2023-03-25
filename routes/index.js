var express = require('express');
var fetch = require("node-fetch");
var router = express.Router();


router.get('/token', function(req, res, next) {
  try{
    const inputBody = {
      client_id: "2601f408-027d-4dc5-a538-f995bf4ee17d",
      client_secret: "a353ed73-c3cf-4c97-8135-13f4a1976cc1",
      grant_type: "client_credentials"
    };
    const headers = {
    'Content-Type':'application/json',
    'Accept':'*/*'
    };
    fetch('https://openapiuat.airtel.africa/auth/oauth2/token', {
      method: 'POST',
      body: JSON.stringify(inputBody),
      headers: headers
    }).then(function(res) {
      return res.json();
    })
    .then(function(body) {
      console.log(body);
      var token = body
      return res.status(200).send(token);
    }).catch(err => console.log(err))
  }
  catch(err){
    console.log(err);
  }
});

const getToken = (tokenget) => {
  var token = [];
  const inputbody = {
    client_id: "2601f408-027d-4dc5-a538-f995bf4ee17d",
    client_secret: "a353ed73-c3cf-4c97-8135-13f4a1976cc1",
    grant_type: "client_credentials"
  };

  const header = {
  'Content-Type':'application/json',
  'Accept':'*/*'
  };

  fetch('https://openapiuat.airtel.africa/auth/oauth2/token', {
    method: 'POST',
    body: JSON.stringify(inputbody),
    headers: header
  })
  .then(function(res) {
    return res.json();
  })
  .then(function(body) {
    // console.log(body.access_token);
    tokenget(body.access_token)
  }).catch(err => console.log(err));
}


router.get('/transaction/apiAirtel', function(req, res, next) {
  try{
    const msisdn = req.query.msisdn;
    const amount = req.query.amount;
    var tokens;
    getToken(token => {
      tokens = token
    })
    const inputBody = {
      reference: "Testing transaction",
      subscriber: {
        country: "MG",
        currency: "MGA",
        msisdn: msisdn
      },
      transaction: {
        amount: amount,
        country: "MG",
        currency: "MGA",
        id: "random-unique-id"
      }
    };
    const headers = {
      'Content-Type':'application/json',
      'Accept':'*/*',
      'X-Country':'MG',
      'X-Currency':'MGA',
      'Authorization': `Bearer ${tokens}`
    }

    fetch('https://openapiuat.airtel.africa/merchant/v1/payments/',
    {
      method: 'POST',
      body: JSON.stringify(inputBody),
      headers: headers
    })
    .then(function(res) {
        return res.json();
    }).then(function(body) {
      return res.status(200).send(body);
    });
  }
  catch(err){
    console.log(err);
  }
});
module.exports = router;
