"use strict";
const {
        default: makeWASocket,
        DisconnectReason,
        useMultiFileAuthState,
        makeInMemoryStore,
        downloadContentFromMessage
} = require("@adiwajshing/baileys")
const figlet = require("figlet");
const fs = require("fs");
const moment = require('moment')
const chalk = require('chalk')
const logg = require('pino')
const clui = require('clui')
const { Spinner } = clui
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif2')
const { serialize } = require("./lib/myfunc");
const { color, mylog, infolog } = require("./lib/color");
const afk = require("./lib/afk");
const time = moment(new Date()).format('HH:mm:ss DD/MM/YYYY')
let setting = JSON.parse(fs.readFileSync('./config.json'));
let _afk = JSON.parse(fs.readFileSync('./database/afk.json'));

function title() {
      console.clear()
      console.log(chalk.bold.green(figlet.textSync('WaBot MD', {
         font: 'Standard',
         horizontalLayout: 'default',
         verticalLayout: 'default',
         width: 80,
         whitespaceBreak: false
      })))
      console.log(chalk.yellow(`\n                        ${chalk.yellow('[ Created By Riy ]')}\n\n${chalk.red('Hinata Bot')} : ${chalk.white('WhatsApp Bot Multi Device')}\n${chalk.red('Follow Insta Dev')} : ${chalk.white('@riycoders')}\n${chalk.red('Message Me On WhatsApp')} : ${chalk.white('6281575886399')}\n${chalk.red('Donate')} : ${chalk.white('081575886399 ( Dana/Gopay )')}\n`))
}

/**
* Uncache if there is file change;
* @param {string} module Module name or path;
* @param {function} cb <optional> ;
*/
function nocache(module, cb = () => { }) {
        console.log(`Module ${module} sedang diperhatikan terhadap perubahan`)
        fs.watchFile(require.resolve(module), async () => {
          await uncache(require.resolve(module))
          cb(module)
        })
}
/**
* Uncache a module
* @param {string} module Module name or path;
*/
function uncache(module = '.') {
        return new Promise((resolve, reject) => {
          try {
            delete require.cache[require.resolve(module)]
            resolve()
          } catch (e) {
            reject(e)
          }
        })
}

const status = new Spinner(chalk.cyan(` Booting WhatsApp Bot`))
const starting = new Spinner(chalk.cyan(` Preparing After Connect`))
const reconnect = new Spinner(chalk.redBright(` Reconnecting WhatsApp Bot`))

const store = makeInMemoryStore({ logger: logg().child({ level: 'silent', stream: 'store' }) })

async function riyStart() {
const connectToWhatsApp = async () => {
	const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
	const conn = makeWASocket({
            printQRInTerminal: true,
            syncFullHistory: true,
            logger: logg({ level: 'silent' }),
            auth: state,
            // browser: ["Hinata Multi Device", "Safari", "3.0"],
            patchMessageBeforeSending: (message) => {
                const requiresPatch = !!(
                    message.buttonsMessage 
                    || message.templateMessage
                    || message.listMessage
                );
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    };
                }

                return message;
            },
	    getMessage: async key => {
              return {
              }
          }
        })
	title()
        store.bind(conn.ev)

        /* Auto Update */
        require('./message/help')
        require('./lib/myfunc')
        require('./message/msg')
        nocache('./message/help', module => console.log(chalk.greenBright('[ WHATSAPP BOT ]  ') + time + chalk.cyanBright(` "${module}" Telah diupdate!`)))
        nocache('./lib/myfunc', module => console.log(chalk.greenBright('[ WHATSAPP BOT ]  ') + time + chalk.cyanBright(` "${module}" Telah diupdate!`)))
        nocache('./message/msg', module => console.log(chalk.greenBright('[ WHATSAPP BOT ]  ') + time + chalk.cyanBright(` "${module}" Telah diupdate!`)))

        conn.multi = true
        conn.nopref = false
        conn.prefa = 'anjing'
        conn.spam = []
        conn.mode = 'public'
        conn.ev.on('messages.upsert', async m => {
           if (!m.messages) return;
		   var msg = m.messages[0]
		   try { if (msg.message.messageContextInfo) delete msg.message.messageContextInfo } catch { }
		   msg = serialize(conn, msg)
		   msg.isBaileys = msg.key.id.startsWith('BAE5')
           require('./message/msg')(conn, msg, m, setting, store, _afk)
        })

        // To Read Presences
        conn.ev.on('presence.update', async data => {
           // Read Data Presences Afk
           if (data.presences) {
             for (let key in data.presences) {
               if (data.presences[key].lastKnownPresence === "composing" || data.presences[key].lastKnownPresence === "recording") {
                 if (afk.checkAfkUser(key, _afk)) {
                   _afk.splice(afk.getAfkPosition(key, _afk), 1)
                   fs.writeFileSync('./database/afk.json', JSON.stringify(_afk, null, 2))
                   conn.sendMessage(data.id, { text: `@${key.split("@")[0]} berhenti afk, dia sedang ${data.presences[key].lastKnownPresence === "composing" ? "mengetik" : "merekam"}`, mentions: [key] })
                 }
               }
             }
           }
        })
        
        conn.ev.on('connection.update', (update) => {
        if (global.qr !== update.qr) {
        global.qr = update.qr
        }
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? connectToWhatsApp() : console.log('connection logged out...')
        }
        })

        conn.ev.on('creds.update', await saveCreds)

        conn.reply = (from, content, msg) => conn.sendMessage(from, { text: content }, { quoted: msg })

        conn.ws.on('CB:call', async (json) => {
           const callId = json.content[0].attrs['call-id']
           const callFrom = json.content[0].attrs['call-creator']
           conn.rejectCall(callId, callFrom)
           conn.sendMessage(callFrom, { text: `Jangan telepon bot!` })
        })
        
        conn.decodeJid = (jid) => {
           if (!jid) return jid
           if (/:\d+@/gi.test(jid)) {
             let decode = jidDecode(jid) || {}
             return decode.user && decode.server && decode.user + '@' + decode.server || jid
           } else return jid
        }

        conn.ev.on('contacts.update', update => {
           for (let contact of update) {
             let id = conn.decodeJid(contact.id)
             if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
           }
        })
        
        conn.downloadAndSaveMediaMessage = async(msg, type_file, path_file) => {
           if (type_file === 'image') {
             var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
             let buffer = Buffer.from([])
             for await(const chunk of stream) {
               buffer = Buffer.concat([buffer, chunk])
             }
             fs.writeFileSync(path_file, buffer)
             return path_file
           } else if (type_file === 'video') {
             var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
             let buffer = Buffer.from([])
             for await(const chunk of stream) {
               buffer = Buffer.concat([buffer, chunk])
             }
             fs.writeFileSync(path_file, buffer)
             return path_file
           } else if (type_file === 'sticker') {
             var stream = await downloadContentFromMessage(msg.message.stickerMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
             let buffer = Buffer.from([])
             for await(const chunk of stream) {
               buffer = Buffer.concat([buffer, chunk])
             }
             fs.writeFileSync(path_file, buffer)
             return path_file
           } else if (type_file === 'audio') {
             var stream = await downloadContentFromMessage(msg.message.audioMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
             let buffer = Buffer.from([])
             for await(const chunk of stream) {
               buffer = Buffer.concat([buffer, chunk])
             }
             fs.writeFileSync(path_file, buffer)
             return path_file
           }
        }

        /**
        * @param {*} jid
        * @param {*} path
        * @param {*} quoted
        * @param {*} options
        * @returns
        */
        conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
           let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
           let buffer
           if (options && (options.packname || options.author)) {
             buffer = await writeExifImg(buff, options)
           } else {
             buffer = await imageToWebp(buff)
           }
           await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
           .then( response => {
              fs.unlinkSync(buffer)
              return response
           })
        }

        /**
        * @param {*} jid
        * @param {*} path
        * @param {*} quoted
        * @param {*} options
        * @returns
        */
        conn.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
           let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
           let buffer
           if (options && (options.packname || options.author)) {
             buffer = await writeExifVid(buff, options)
           } else {
             buffer = await videoToWebp(buff)
           }
           await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
           .then( response => {
              fs.unlinkSync(buffer)
              return response
           })
        }
        return conn
}

connectToWhatsApp()
.catch(err => console.log(err))
}

riyStart()
