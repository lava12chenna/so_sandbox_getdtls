const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
var arr_hdr;
var arr_itm;
var hide_flg;
app.listen(8021);
/*app.set('view Engine','ejs');
app.set('views','view');*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'CSS')));
app.use(express.static(path.join(__dirname, 'data')));


app.use((req, res, next) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, APIKey');
  next();
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/get/salesorder', (req, res, next) => {
   arr_hdr = {};
   arr_itm = {};

  function readfile(file) {
    return new Promise((resolve)=>{

        if (!fs.existsSync(file)){
         console.log('no file found');
         hide_flg = '';
         resolve();
        } else {
      fs.readFile(file, (err, fileContent) => {
        if (err) {
          console.log('1'+err);
     //     reject(err);
        } else {      
              try {
              var data =  JSON.parse(fileContent);
               hide_flg = 'X';
                 }
             catch(e) {
              console.log('2'+e);
              data = {};
              hide_flg = '';
            }
            resolve(data);
      }
                             
      });
    }
    })
  } 
  
  var promises = [ readfile(path.join(__dirname, 'data', 'so.json')),
                 readfile(path.join(__dirname, 'data', 'soitem.json')) ];

  Promise.all(promises).then(result=>{ 
    try {
    console.log('Sales order'+result[0].SalesOrder)
    result[1].forEach(element => {
    console.log('Sales order item'+element.SalesOrderItem)
                                });
    
  } catch(e) {
    console.log(e);
  }
      console.log('flag'+hide_flg);
      res.render('salesorder', { 
        hdr: result[0],
        itm: result[1],
        hide_flg : hide_flg
      });
  })

  /*var so_json = require(path.join(__dirname, 'data', 'so123.json'));
         console.log(so_json);

  // Send a POST request
axios({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  } 
  response.write(JSON.stringify(anObject));
    response.send(anObject);
  res.json({"foo": "bar"});
});*/

});

app.post('/get/salesorder', (req, res, next) => {

  // axios call 
  /*async function so() {
  
  const [header, item] = await Promise.all([
  
    axios({ url: "https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder('" + req.body.so_no + "')", 
    method : 'get', headers : {
    apikey: ''
  
                            }
     }),
   
  ])
  }*/

  function get_so_hdr() {
    return axios({
      url: "https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder('" + req.body.so_no + "')",
      method: 'get', headers: {
        apikey: ''
      }
    })

  }

  function get_so_itm() {

    return axios({
      url: "https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder('" + req.body.so_no + "')/to_Item",
      method: 'get', headers: {
        apikey: ''
      }
    })
  }



  axios.all([get_so_hdr(), get_so_itm()])
    .then(axios.spread(function (hdr, itm) {
      fs.writeFileSync(path.join(__dirname, 'data', 'so.json'), JSON.stringify(hdr.data.d), (err) => {
        console.log('3'+err);
      });
      fs.writeFileSync(path.join(__dirname, 'data', 'soitem.json'), JSON.stringify(itm.data.d.results), (err) => {
        console.log('4'+err);
      });
      res.redirect('/get/salesorder');    
 
    }))

    .catch((err) => {
      console.log('5' + err);
   try{
      fs.unlinkSync(path.join(__dirname, 'data', 'so.json'));
      fs.unlinkSync(path.join(__dirname, 'data', 'soitem.json'));
      }

      catch{
        console.log('file delete error');
        res.redirect('/get/salesorder');
      }   
      res.redirect('/get/salesorder'); 

    })
  


});
/*
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var data = null;

var xhr = new XMLHttpRequest();
xhr.withCredentials = false;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === this.DONE) {
    console.log(this.responseText);
  }
});

//setting request method
//API endpoint for API sandbox 
xhr.open("GET", "https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder('1')");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("Accept", "application/json");
xhr.setRequestHeader("APIKey", "");
xhr.send(data);
*/


app.use('/', (req, res, next) => {
  res.send('<h1 style="color:blue; position:absolute; top:30%; left:30%; height:400px; width:700px;"> Welcome to the Page for Sales order details! </h1>');

});









