const express = require('express');
const app = express();
const http = require('http');
const meli = require('mercadolibre');
const request = require('request');
const fs = require('file-system');
const util = require('util');
const cors = require('cors');
const axios = require('axios');

const ml_files_path = "src/ml-files";
app.set('port', process.env.PORT || 5000);

// enviroments variables
// process.env.NODE_ENV = 'development';
process.env.NODE_ENV = 'production';
// config variables
const config = require('./settings/config.js');

// const meliObject = new meli.Meli(global.gConfig.client_Id, global.gConfig.secret_key);

app.get('/', (req, res) => {
    console.log("global_config", global.gConfig.redirect_uri);
    res.redirect('/ml-services/');
});

app.get('/ml-services/', function (req,res) {
    res.redirect(`https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${global.gConfig.client_id}&redirect-uri=${global.gConfig.redirect_uri}`);
});

app.get('/oauth2/callback-uri/', (req, res) => {    
    getToken(req.query.code)
    .then(result => {
        fs.writeFile(`${ml_files_path}/token.json`, JSON.stringify(result.data));
        res.redirect('/datos/');
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
                                redirect_uri:`${global.gConfig.redirect_uri}`
                                });            
    } catch (error) {
        console.log(error);
    }
};

const getTokenSaved = () => {
    return fs.readFileSync(`${ml_files_path}/token.json`, "utf-8");
};

const getUserObjSaved = () => {
    return fs.readFileSync(`${ml_files_path}/userData.json`, "utf-8");
};

const getListItems = async() => {
    let userObj = JSON.parse(getUserObjSaved());
    let token = JSON.parse(getTokenSaved());
    return axios.get(`https://api.mercadolibre.com/users/${userObj.id}/items/search?search_type=scan&access_token=${token.access_token}`);
};

const getUserData = async() => {
    let token = JSON.parse(getTokenSaved());
    console.log("token_access", token.access_token);
    return axios.get(`https://api.mercadolibre.com/users/me?access_token=${token.access_token}`);
};

app.get('/datos/', (req, res) => {
    getUserData().then((result) => {                      
                    fs.writeFileSync(`${ml_files_path}/userData.json`,JSON.stringify(result.data));
                    res.redirect('/items/');
                })
                 .catch(error => {
                     console.log(error);
                }).then(() => res.redirect('/'));
});

app.get('/items/', (req, res) => {
    getListItems().then((result) => {
        fs.writeFileSync(`${ml_files_path}/items.json`, JSON.stringify(result.data));
        res.status(200)
           .send(result.data);
        //    .download(`${ml_files_path}/items.json`);           
    })
     .catch(error => {
         console.log(error);
    });
});

app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});