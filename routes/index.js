var express = require('express');
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

module.exports = router;
