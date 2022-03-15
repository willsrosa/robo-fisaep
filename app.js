const { Client, MessageMedia,LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors')
const { Buttons, List } = require('whatsapp-web.js');

const socketIO = require('socket.io');
const qrcode = require('qrcode');
const https = require('https');
const http = require('http');

const fs = require('fs');
const { phoneNumberFormatter } = require('./helpers/formatter');
const axios = require('axios');
const port = 2096;


  var privateKey = fs.readFileSync('selfsigned.key', 'utf8');
  var certificate = fs.readFileSync('selfsigned.crt', 'utf8');
  var credentials = { key: privateKey, cert: certificate };

const app = express();
 const server = https.createServer(credentials, app);
//const server = http.createServer(app);

const io = socketIO(server);
io.set('origins', '*:*');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors())
app.options('*', cors());
app.get('/', (req, res) => {
  res.sendFile('index-multiple-device.html', {
    root: __dirname
  });
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

client.initialize();

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.toDataURL(qr, (err, url) => {
    io.emit('qr', { src: url });
    io.emit('message', { text: 'QR Code received, scan please!' });
  });
});

client.on('authenticated', () => {
  io.emit('authenticated');
  io.emit('message', { ext: 'Whatsapp is authenticated!' });
});

client.on('auth_failure', msg => {
    console.error('BOT-ZDG Falha na autenticação', msg);
    io.emit('message', { text: 'Auth failure, restarting...' });
});

client.on('ready', () => {
  io.emit('ready');
  io.emit('message', {text: 'Whatsapp is ready!' });
});

client.on('message', async msg => {
    if (!msg.from.toUpperCase().includes("g.us")) {

        if (msg.type == "list_response") {
          if (msg.body == "Sim") {
            msg.reply('Ok, vamos te passar maiores informações sobre o paciente😃')
            client.sendMessage("120363022690336998@g.us", msg.selectedRowId);
  
            if (msg.selectedRowId.toUpperCase().includes("THAIS ALVES")) {
              client.sendMessage("120363039348257323@g.us", msg.selectedRowId);
            }
  
  
            if (msg.selectedRowId.toUpperCase().includes("BEATRIZ NALIM")) {
              client.sendMessage("120363038291296660@g.us", msg.selectedRowId);
            }
  
            if (msg.selectedRowId.toUpperCase().includes("BIANCA NASCIMENTO")) {
              client.sendMessage("120363039945172091@g.us", msg.selectedRowId);
            }
  
            if (msg.selectedRowId.toUpperCase().includes("THAIS RODRIGUES")) {
              client.sendMessage("120363024013484590@g.us", msg.selectedRowId);
            }
  
            if (msg.selectedRowId.toUpperCase().includes("JULIANA SOUZA")) {
              client.sendMessage("120363040378100634@g.us", msg.selectedRowId);
            }
            if (msg.selectedRowId.toUpperCase().includes("ANNE OLIVEIRA")) {
              client.sendMessage("120363039377213562@g.us", msg.selectedRowId);
            }
            if (msg.selectedRowId.toUpperCase().includes("ANNA BEATRIZ")) {
              client.sendMessage("120363038774243623@g.us", msg.selectedRowId);
            }
            if (msg.selectedRowId.toUpperCase().includes("BENE SOUZA")) {
              client.sendMessage("120363023390637872@g.us", msg.selectedRowId);
            }
            if (msg.selectedRowId.toUpperCase().includes("HAYNE SEJANI")) {
              client.sendMessage("120363023276101126@g.us", msg.selectedRowId);
            }
            if (msg.selectedRowId.toUpperCase().includes("PAMELA SOUZA")) {
              client.sendMessage("120363039562349093@g.us", msg.selectedRowId);
            }
  
          }
          else if (msg.body == "Não") {
            msg.reply('Ok, agradeço pelo retorno, surgindo novo paciente próximo a sua área de atendimento entraremos em contato😃')
          }
        } else {
          msg.reply('Sou uma inteligência artificial, não entendi sua mensagem por favor selecione o botão enviado pelo operador!😃')
        }
      }  
});


app.post('/send-message', (req, res) => {
    const sender = req.body.sender;
    const number = phoneNumberFormatter("55" + req.body.number);
    const message = req.body.message;
    // console.log(message)
    // const client = sessions.find(sess => sess.id == sender).client;
  
    client.sendMessage(number, message).then(response => {
      console.log(response)
      res.status(200).json({
        status: true,
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
  });
  
  server.listen(port, function () {
    console.log('App running on *: ' + port);
  });
  
  
  
  app.post('/send-button', (req, res) => {
  
    const number = phoneNumberFormatter("55" + req.body.number);
    const message = req.body.message;
    const id = req.body.id;
    const button1 = req.body.button1;
    const button2 = req.body.button2;
    const texto = req.body.texto;
    const sender = req.body.sender;
  
    // const client = sessions.find(sess => sess.id == sender).client;
    client.sendMessage(number, new List(' ', 'Clique aqui para selecionar', [{ title: 'Selecione a ação desejada', rows: [{ id: id, title: 'Sim', description: '' }, { title: 'Não' }] }], 'Selecione SIM ou NÃO', ''), { caption: '' }).then(response => {
      res.status(200).json({
        status: true,
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
  });
  


client.on('change_state', state => {
    console.log('BOT-ZDG Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
    io.emit('message', { text: 'Whatsapp is disconnected!' });
});
