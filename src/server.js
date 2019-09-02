const express = require('express');
const app = express();
const http = require('http');
const meli = require('mercadolibre');
const request = require('request');
const fs = require('file-system');
const util = require('util');
const cors = require('cors');
const axios = require('axios');
const client_id = 6391018844743905;
const secret_key = 'xSW1AuKdVhB85LcO37UcjOYG9ukASwoy';
app.set('port', process.env.PORT || 5000);

const meliObject = new meli.Meli(client_id, secret_key);

request(`https://auth.mercadolibre.com.ar/authorization?response_type=token&client_id=${client_id}&redirect-uri=http://localhost:5000/oauth2/redirect-uri/`, 
(error, request, body) => {
    bodyOutput = body;
});

app.get('/ml-services/', function (req,res) {
    res.redirect(`https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${client_id}&redirect-uri=http://localhost:5000/oauth2/redirect-uri/`);
});

app.get('/oauth2/callback-uri/', (req, res) => {    
    getToken(req.query.code)
    .then(result => {
        res.status(200).send({
            result: result.data
        });
        fs.writeFile('src/token.json', JSON.stringify(result.data));
    })
    .catch(error => console.log(error));
    
});

const getToken = async(authCode) => {
    try { 
        return axios.post('https://api.mercadolibre.com/oauth/token',{
                                grant_type:'authorization_code',
                                client_id:'6391018844743905',
                                client_secret:'xSW1AuKdVhB85LcO37UcjOYG9ukASwoy',
                                code:authCode,
                                redirect_uri:'http://localhost:5000/oauth2/callback-uri'
                                });            
    } catch (error) {
        console.log(error);
    }
};

const getAuthCode = async() => {
    try {
        return await axios.get('http://localhost:5000/init/');        
    } catch (error) {
        console.log(error);
    }
}; 

const getTokenSaved = () => {
    return fs.readFileSync("src/token.json", "utf-8");
};

const getUserData = async() => {
    let token = JSON.parse(getTokenSaved());
    console.log("token_access", token.access_token);
    try {
        return axios.get(`https://api.mercadolibre.com/users/me?access_token=${token.access_token}`);
    } catch (error) {
        console.log(error);
    }
};

app.get('/datos/', (req, res) => {
    getUserData().then((result) => {
                    res.status(200)
                       .send(result.data);
                })
                 .catch(error => console.log(error));
    // getAuthCode().then(result => {       
    //     res.send(JSON.stringify(res))
    // }).catch((err) => console.log(err));    
    // getUserData()
    //     .then(res => {
    //         result = JSON.stringify(res);
    //     })
    //     .catch(err => console.log(err));
    //     res.status(200).send({
    //         status: result
    //     });
});

app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});