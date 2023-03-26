var express = require('express');
var fetch = require("node-fetch");
var router = express.Router();
const bcrypt = require('bcrypt');
const io  = require('../server');

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
      console.log(token)
    });
  });
}


const getStatus = async (token, transactionId) => {
  try {
    const headers = {
      'Accept':'*/*',
      'X-Country':'MG',
      'X-Currency':'MGA',
      'Authorization': `Bearer ${token}`
    };
    await fetch(`https://openapiuat.airtel.africa/standard/v1/payments/${transactionId}`,
    {
      method: 'GET',
      headers: headers
    })
    .then(function(res) {
        return res.json();
    }).then(data => {
      io.io.emit('transaction', data)
      console.log(data)
      setTimeout(() => {
        const clone = data
        clone.data.transaction.status = 'TS'
        io.io.emit('transaction',clone)
      }, 17000)
    })
    

  } catch (error) {
    console.log(error)
    return res.status(500).json({message : "il y a eu une erreur lors de la transaction", error});
  }
}

router.get('/status/:idTrans', async function(req, res) {
  const myToken = await getMyToken();
  // return myToken;
  try{
    const { idTrans } = req.params;
    const headers = {
      'Accept':'*/*',
      'X-Country':'MG',
      'X-Currency':'MGA',
      'Authorization': `Bearer ${myToken}`
    };
    
    fetch(`https://openapiuat.airtel.africa/standard/v1/payments/${idTrans}`,
    {
      method: 'GET',
      headers: headers
    })
    .then(function(res) {
        return res.json();
    })
    .then(res => {
      console.log(res)
    });
  } catch(err){
    console.log(err);
    return res.status(500).json({"message" : "il y a eu une erreur lors de la transaction", err});
  }
});

router.get('/transaction/apiAirtel', async function(req, res, next) {
  try{
    const msisdn = req.query.msisdn;
    const amount = req.query.amount;
    const idTrans = req.query.idTrans;
    const myToken = await getMyToken();
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
        id: idTrans
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
        getStatus(myToken, idTrans)
    });

  }
  catch(err){
    console.log(err);
  }
});

router.get('/userInfo', async function(req, res) {
  try {
    const myToken = await getMyToken();
    const msisdn = req.query.msisdn
    const headers = {
      'Accept':'*/*',
      'X-Country':'MG',
      'X-Currency':'MGA',
      'Authorization': `Bearer ${myToken}`
    };
    
    fetch(`https://openapiuat.airtel.africa/standard/v1/users/${msisdn}`,
    {
      method: 'GET',
    
      headers: headers
    })
    .then(function(res) {
        return res.json();
    }).then(function(body) {
        return res.status(201).send(body)
    });
  } catch (error) {
    console.log(error);
  }
  
});

router.get('/solde', async function(req, res) {
  try {
    const myToken = await getMyToken();
    
    const headers = {
      'Accept':'*/*',
      'X-Country':'MG',
      'X-Currency':'MGA',
      'Authorization': `Bearer ${myToken}`

    };

    fetch('https://openapiuat.airtel.africa/standard/v1/users/balance',
    {
      method: 'GET',

      headers: headers
    })
    .then(function(res) {
        return res.json();
    }).then(function(body) {
      return res.status(201).send(body)
    });
  }
  catch(error){
    console.log(error);
  }
})
module.exports = router;
