var express = require('express');
var fetch = require("node-fetch");
var router = express.Router();
const bcrypt = require('bcrypt');
const { io } = require('../server');

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

async function getMyToken() {
  return new Promise((resolve, reject) => {
    getToken((token) => {
      resolve(token);
    });
  });
}

const getStatus = (token, transactionId) => {
  try {
    const headers = {
      'Accept':'*/*',
      'X-Country':'MG',
      'X-Currency':'MGA',
      'Authorization': `Bearer ${token}`
    };

    fetch(`https://openapiuat.airtel.africa/standard/v1/payments/${transactionId}`,
    {
      method: 'GET',
      headers: headers
    })
    .then(function(res) {
        return res.json();
    }).then(function(body) {
        io.emit('status', body.data.transaction.status)
        console.log(body);
    });
  } catch (error) {
    
  }
}

router.get('/transaction/apiAirtel', async function(req, res, next) {
  try{
    const date = new Date();
    var testID = date.getTime()
    // const salt = bcrypt.genSaltSync(10);
    // const date = bcrypt.hashSync(new Date().toString(), salt); 
    // return res.send(date);
    const msisdn = req.query.msisdn;
    const amount = req.query.amount;
    const myToken = await getMyToken();
    // return res.send(myToken);
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
        id: testID
      }
    };
    const headers = {
      'Content-Type':'application/json',
      'Accept':'*/*',
      'X-Country':'MG',
      'X-Currency':'MGA',
      'Authorization': `Bearer ${myToken}`
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
      getStatus(myToken, testID)
      return res.status(200).send(body);
    });
  }
  catch(err){
    console.log(err);
  }
});
module.exports = router;
