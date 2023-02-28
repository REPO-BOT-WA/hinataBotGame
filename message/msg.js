"use strict";
const {
	downloadContentFromMessage
} = require("@adiwajshing/baileys")
const Baileys = require("@adiwajshing/baileys")
const { color, bgcolor } = require('../lib/color')
const { getBuffer, fetchJson, getGroupAdmins, cekNumber } = require("../lib/myfunc");
const { webp2mp4File } = require("../lib/convert")
const { addBalance, kurangBalance, getBalance, isGame, gameAdd, givegame, cekGLimit } = require("../lib/limit");
const { getLevelingId, getLevelingLevel, getLevelingXp, addLevelingLevel, addLevelingXp, getUserRank, isGained, addCooldown } = require("../lib/level");
const { isTicTacToe, getPosTic } = require("../lib/tictactoe");
const { addPlayGame, getJawabanGame, isPlayGame, cekWaktuGame, getGamePosi } = require("../lib/game");
const tictac = require("../lib/tictac");
const msgFilter = require("../lib/antispam");
const { writeExif } = require("../lib/exif2");
const afk = require("../lib/afk");

const fs = require ("fs");
const moment = require("moment-timezone");
const util = require("util");
const { exec, spawn } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");

// Exif
const Exif = require("../lib/exif")
const exif = new Exif()

// DB Game
let tictactoe = [];
let kuis = [];
let family100 = [];
let casino = [];

// Akses Eval
const uss = 'hinatabot'
const pass = 'road_to_ramadhan'

// Database
let pendaftar = JSON.parse(fs.readFileSync('./database/user.json'));
let level = JSON.parse(fs.readFileSync('./database/level.json'));
let mess = JSON.parse(fs.readFileSync('./message/response.json'));
let balance = JSON.parse(fs.readFileSync('./database/balance.json'));
let glimit = JSON.parse(fs.readFileSync('./database/glimit.json'));
let modsNumber = JSON.parse(fs.readFileSync('./database/modsNumber.json'));

moment.tz.setDefault("Asia/Jakarta").locale("id");

// Auto Reset Limit
setInterval(function() {
   var jamna = new Date().toLocaleTimeString('en-US', { timeZone: "Asia/Jakarta" });
   var hasilnes = jamna.split(':')[0] < 10 ? '0' + jamna : jamna
   // hasilnes Kalo mau Jam 00 jadi 12:00:00 AM
   if(hasilnes === '12:00:00 AM') {
     glimit.splice('reset')
     fs.writeFileSync('./database/glimit.json', JSON.stringify(glimit))
     console.log("Limit Sudah Di Reset!")
   }
}, 1000);

module.exports = async(conn, msg, m, setting, store, _afk) => {
          try {
                let { ownerNumber, botName, lolkey, xteamkey, gamewaktu, limitCount, packname, author } = setting
                let { allmenu } = require('./help')
                if (msg.mentioned && msg.mentioned.includes('')) { Object.keys(msg.mentioned).forEach((i) => { if (msg.mentioned[i] == '') { msg.mentioned.splice(i, 1) } }) }
                const { type, isQuotedMsg, quotedMsg, now, fromMe, mentioned, isBaileys } = msg
                if (isBaileys) return
                const jam = moment.tz('asia/jakarta').format('HH:mm:ss')
                let dt = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
                const ucapanWaktu = "Selamat "+dt.charAt(0).toUpperCase() + dt.slice(1)
                const content = JSON.stringify(msg.message)
                const from = msg.key.remoteJid
                var chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type === 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type === 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type === 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type === 'buttonsResponseMessage') && quotedMsg.fromMe && msg.message.buttonsResponseMessage.selectedButtonId ? msg.message.buttonsResponseMessage.selectedButtonId : (type === 'templateButtonReplyMessage') && quotedMsg.fromMe && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : (type == 'listResponseMessage') && quotedMsg.fromMe && msg.message.listResponseMessage.singleSelectReply.selectedRowId ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ""
                if (chats == undefined) { chats = '' }
                var dataGroup = (type === 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId : ''
                var dataPrivate = (type === "messageContextInfo") ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
                const isButton = dataGroup.length !== 0 ? dataGroup : dataPrivate
                var dataListG = (type === "listResponseMessage") ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ''
                var dataList = (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
                const isListMessage = dataListG.length !== 0 ? dataListG : dataList
                const toJSON = j => JSON.stringify(j, null,'\t')

                if (conn.multi) {
                  var prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '#'
                } else {
                  if (conn.nopref) {
                     prefix = ''
                  } else {
                     prefix = conn.prefa
                  }
                }

                const args = chats.split(' ')
                const command = chats.toLowerCase().split(' ')[0] || ''
                const q = chats.slice(command.length + 1, chats.length)
                const isCmd = command.startsWith(prefix)
                const isGroup = msg.key.remoteJid.endsWith('@g.us')
                let sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
                const isOwner = ownerNumber.includes(sender)
                const isMods = isOwner ? true : modsNumber.includes(sender) ? true : false
                const pushname = msg.pushName
                const body = chats.startsWith(prefix) ? chats : ''
                const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'
                const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
                const groupName = isGroup ? groupMetadata.subject : ''
                const groupId = isGroup ? groupMetadata.id : ''
                const groupMembers = isGroup ? groupMetadata.participants : ''
                const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
                const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
                const isGroupAdmins = groupAdmins.includes(sender)
                const isUser = pendaftar.includes(sender)
                const isAfkOn = afk.checkAfkUser(sender, _afk)

                const gcounti = setting.gcount
                const gcount = gcounti.user
                
                const mentionByTag = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.mentionedJid : []
                const mentionByReply = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.participant || "" : ""
                const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
                mention != undefined ? mention.push(mentionByReply) : []
                const mentionUser = mention != undefined ? mention.filter(n => n) : []

                function jsonformat(string) {
                   return JSON.stringify(string, null, 2)
                }
                function randomNomor(min, max = null) {
                   if (max !== null) {
                     min = Math.ceil(min);
                     max = Math.floor(max);
                     return Math.floor(Math.random() * (max - min + 1)) + min;
                   } else {
                     return Math.floor(Math.random() * min) + 1
                   }
                }
                function mentions(teks, mems = [], id) {
                   if (id == null || id == undefined || id == false) {
                     let res = conn.sendMessage(from, { text: teks, mentions: mems })
                     return res
                   } else {
                     let res = conn.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg })
                     return res
                   }
                }
                const nebal = (angka) => {
                   return Math.floor(angka)
                }
                function parseMention(text = '') {
                   return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
                }
                const reply = (teks) => {
                   return conn.sendMessage(from, { text: teks, mentions: parseMention(teks) }, { quoted: msg })
                }
                function toCommas(x) {
	           x = x.toString()
	           var pattern = /(-?\d+)(\d{3})/;
                   while (pattern.test(x))
	           x = x.replace(pattern, "$1.$2");
	           return x;
                }

                // Function for Casino
                const isPlayCasino = (from, casino) => {
                   var status = false
                   Object.keys(casino).forEach((i) => {
                     if (casino[i].session == from) {
                       status = true
                     }
                   })
                   return status
                }
                const getCasino = (from, casino) => {
                   var posi = null
                   Object.keys(casino).forEach((i) => {
                     if (casino[i].session == from) {
                       posi = i
                     }
                   })
                   return posi
                }
                const setCasino = (chatId, player1, player2, nominal, _db) => {
                 if (!isPlayCasino(chatId, _db)) {
                   var obj = {
                      status: true,
                      session: chatId,
                      turn: 'Z',
                      Z: player1,
                      Y: player2,
                      nominal: nominal,
                      expired: setTimeout(() => {
                        var teksc = `Waktu casino habis, tidak ada jawaban dari @${player2.split("@")[0]}`
                        conn.sendMessage(chatId, { text: teksc, mentions: [player2+'@s.whatsapp.net'] })
                        _db.splice(getCasino(chatId, _db), 1)
                      }, 30000)
                    }
                    _db.push(obj)
                 }
                }
                const deleteCasino = (from, _db) => {
                   if (isPlayCasino(from, _db)) {
                     _db.splice(getCasino(from, _db), 1)
                     return true
                   } else {
                     return false
                   }
                }
                const sesiCasino = (from, casino) => {
                   return casino[getCasino(from, casino)]
                }

                const isImage = (type == 'imageMessage')
                const isVideo = (type == 'videoMessage')
                const isSticker = (type == 'stickerMessage')
                const isQuotedImage = isQuotedMsg ? (quotedMsg.type === 'imageMessage') ? true : false : false
                const isQuotedAudio = isQuotedMsg ? (quotedMsg.type === 'audioMessage') ? true : false : false
                const isQuotedDocument = isQuotedMsg ? (quotedMsg.type === 'documentMessage') ? true : false : false
                const isQuotedVideo = isQuotedMsg ? (quotedMsg.type === 'videoMessage') ? true : false : false
                const isQuotedSticker = isQuotedMsg ? (quotedMsg.type === 'stickerMessage') ? true : false : false

                // Auto Read & Presence Online
                conn.readMessages([msg.key])
                conn.sendPresenceUpdate('unavailable', from)

                if (conn.mode === 'self') {
                  if (!isOwner && !fromMe) return
                  if (fromMe && isBaileys) return
                }
                
                // Function for Level Role
                const levelRole = getLevelingLevel(sender, level)
                var role = 'Copper V'
                if (levelRole >= 5) {
                  role = 'Copper IV'
                }
                if (levelRole >= 10) {
                  role = 'Copper III'
                }
                if (levelRole >= 15) {
                  role = 'Copper II'
                }
                if (levelRole >= 20) {
                  role = 'Copper I'
                }
                if (levelRole >= 25) {
                  role = 'Silver V'
                }
                if (levelRole >= 30) {
                  role = 'Silver IV'
                }
                if (levelRole >= 35) {
                  role = 'Silver III'
                }
                if (levelRole >= 40) {
                  role = 'Silver II'
                }
                if (levelRole >= 45) {
                  role = 'Silver I'
                }
                if (levelRole >= 50) {
                  role = 'Gold V'
                }
                if (levelRole >= 55) {
                  role = 'Gold IV'
                }
                if (levelRole >= 60) {
                  role = 'Gold III'
                }
                if (levelRole >= 65) {
                  role = 'Gold II'
                }
                if (levelRole >= 70) {
                  role = 'Gold I'
                }
                if (levelRole >= 75) {
                  role = 'Platinum V'
                }
                if (levelRole >= 80) {
                  role = 'Platinum IV'
                }
                if (levelRole >= 85) {
                  role = 'Platinum III'
                }
                if (levelRole >= 90) {
                  role = 'Platinum II'
                }
                if (levelRole >= 95) {
                  role = 'Platinum I'
                }
                if (levelRole >= 100) {
                  role = 'Exterminator'
                }

               // Function Level
               if (isGroup && isUser && !isGained(sender)) {
                addCooldown(sender)
                  var currentLevel = getLevelingLevel(sender, level)
                    var amountXp = Math.floor(Math.random() * (15 - 25 + 1) + 15)
                     var requiredXp = 5 * Math.pow(currentLevel, 2) + 50 * currentLevel + 100
                     addLevelingXp(sender, amountXp, level)
                     if (requiredXp <= getLevelingXp(sender, level)) {
                     addLevelingLevel(sender, 1, level)
                     var userLevel = getLevelingLevel(sender, level)
                     var fetchXp = 5 * Math.pow(userLevel, 2) + 50 * userLevel + 100
                    var teks = `*── 「 LEVEL UP 」 ──*\n\n• *Name :* ${pushname}\n• *XP :* ${getLevelingXp(sender, level)} / ${fetchXp}\n• *Level :* ${currentLevel} -> ${getLevelingLevel(sender, level)} 🆙 \n• *Role :* ${role}`
                   await reply(teks)
                  }
                }
                
                // Function & Response Join Group
                var cekIsCmd = isCmd && args[0].length > 1
                if (cekIsCmd) {
                  var datagc = await conn.groupMetadata("14165203201-1429891386@g.us")
                  var isDetected = datagc.participants.map(datagc => datagc.id).includes(sender)
                  var linkgc = 'https://chat.whatsapp.com/'+await conn.groupInviteCode(datagc.id)
                  if (!isDetected) return reply(`Permintaan kamu di tolak, sepertinya kamu belum join di group bot. Silahkan join terlebih dahulu agar bisa mengakses fitur dari bot ini!\n\n*Link Group :*\n${linkgc}`)
                }

                // Auto Registrasi
                if (isCmd && !isUser) {
                   pendaftar.push(sender)
                   fs.writeFileSync('./database/user.json', JSON.stringify(pendaftar, null, 2))
                }

                // Tictactoe
                if (isTicTacToe(from, tictactoe)) tictac(chats, prefix, tictactoe, from, sender, reply, mentions, addBalance, balance)
    
                // Suit PVP
                require('../lib/suitpvp')(conn, sender, chats, from, msg, isGroup)
    
                // To Read Game Answers
                cekWaktuGame(conn, kuis) // Kuis Game
                if (isPlayGame(from, kuis) && isUser) {
                  if (chats.toLowerCase() == getJawabanGame(from, kuis)) {
                    var htgm = randomNomor(100, 150)
                    addBalance(sender, htgm, balance)
                    reply(`*Selamat Jawaban Kamu Benar 🎉*\n\nJawaban : ${getJawabanGame(from, kuis)}\nHadiah : ${htgm} balance\n\nIngin bermain lagi? ketik *${prefix}kuis*`)
                    kuis.splice(getGamePosi(from, kuis), 1)
                  }
                }
                cekWaktuGame(conn, family100) // Family 100
                if (isPlayGame(from, family100) && isUser) {
                var anjuy = getJawabanGame(from, family100)
                    for (let i of anjuy) {
                    if (chats.toLowerCase().includes(i)) {
                    var htl = randomNomor(150, 200)
                    addBalance(sender, htl, balance)
                    var anug = anjuy.indexOf(i)
                    anjuy.splice(anug, 1)
                    reply(`*Selamat Jawaban Kamu Benar 🎉*\n\nJawaban : ${i}\nHadiah : ${htl} balance`)
                    await reply(`Tersisa ${anjuy.length} jawaban lagi!`)
                    }
                    }
                    if (anjuy.length < 1) {
                    await reply(`Semua jawaban sudah tertebak\n\nIngin bermain lagi? ketik *${prefix}family100*`)
                    family100.splice(getGamePosi(from, family100), 1)
                   }
                }

                // To determine the winner of the Casino
                if (isPlayCasino(from, casino)) {
                   var casinoo = sesiCasino(from, casino)
                   if (sender == `${casinoo.Y}@s.whatsapp.net` && chats.toLowerCase() == 'n') {
                     conn.sendMessage(from, { text: `「 Game Casino Rejected 」\n\n• @${casinoo.Y} Membatalkan Game`, mentions: [casinoo.Y+"@s.whatsapp.net"] }, {quoted: msg })
                     clearTimeout(casinoo.expired)
                     deleteCasino(from, casino)
                   } else if (sender == `${casinoo.Y}@s.whatsapp.net` && chats.toLowerCase() == 'y') {
                     clearTimeout(casinoo.expired)
                     var angka1 = await randomNomor(10, 20)
                     var angka2 = await randomNomor(10, 20)
                     if (angka1 > angka2) {
                       starGame =  `🎰 Casino Game 💰

• @${casinoo.Z} --> ${angka1} 👑
• @${casinoo.Y} --> ${angka2} 🥈

Pemenangnya adalah [ @${casinoo.Z} ]
Mendapatkan: $ ${nebal(casinoo.nominal)}`
                       conn.sendMessage(from, { text: starGame, mentions: [casinoo.Z + "@s.whatsapp.net",  casinoo.Y + "@s.whatsapp.net"]}, {quoted: msg })
                       await addBalance(`${casinoo.Z}@s.whatsapp.net`, nebal(casinoo.nominal), balance)
                       await kurangBalance(`${casinoo.Y}@s.whatsapp.net`, nebal(casinoo.nominal), balance)
                       deleteCasino(from, casino)
                     } else if (angka1 < angka2) {
                       starGame =  `🎰 Casino Game 💰

• @${casinoo.Z} --> ${angka1} 🥈
• @${casinoo.Y} --> ${angka2} 👑

Pemenangnya adalah [ @${casinoo.Y} ]
Mendapatkan: $ ${nebal(casinoo.nominal)}`
                       conn.sendMessage(from, { text: starGame, mentions: [casinoo.Z + "@s.whatsapp.net",  casinoo.Y + "@s.whatsapp.net"] }, {quoted: msg })
                       await addBalance(`${casinoo.Y}@s.whatsapp.net`, nebal(casinoo.nominal), balance)
                       await kurangBalance(`${casinoo.Z}@s.whatsapp.net`, nebal(casinoo.nominal), balance)
                       deleteCasino(from, casino)
                    } else if (angka1 = angka2) {
                      starGame =  `🎰 Casino Game 💰

• @${casinoo.Z} --> ${angka1} 📍
• @${casinoo.Y} --> ${angka2} 📍

Games Draw, Tidak Ada Pemenang`
                      conn.sendMessage(from, { text: starGame, mentions: [casinoo.Z + "@s.whatsapp.net",  casinoo.Y + "@s.whatsapp.net" ]}, { quoted: msg })
                      deleteCasino(from, casino)
                    }
                  }
                }

                  if (afk.checkAfkUser(sender, _afk)) {
                    _afk.splice(afk.getAfkPosition(sender, _afk), 1)
                    fs.writeFileSync('./database/afk.json', JSON.stringify(_afk, null, 2))
                    await mentions(`@${sender.split('@')[0]} telah kembali`, [sender], true)
                  }

                // Function for Anti Spam
                msgFilter.ResetSpam(conn.spam)
                const spampm = () => {
                   console.log(color('~>[SPAM]', 'red'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
                   msgFilter.addSpam(sender, conn.spam)
                   reply(`Kamu terdeteksi spam bot tanpa jeda, lakukan perintah setelah 5 detik`)
                }
                const spamgr = () => {
                   console.log(color('~>[SPAM]', 'red'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(groupName))
                   msgFilter.addSpam(sender, conn.spam)
                   reply(`Kamu terdeteksi spam bot tanpa jeda, lakukan perintah setelah 5 detik`)
                }

                if (isCmd && msgFilter.isFiltered(sender) && !isGroup) return spampm()
                if (isCmd && msgFilter.isFiltered(sender) && isGroup) return spamgr()
                if (isCmd && args[0].length > 1 && !isOwner) msgFilter.addFilter(sender)

                if (chats.startsWith("> ") && isMods) {
                   console.log(color('[EVAL]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`Dari Owner aowkoakwoak`))
                   const ev = (sul) => {
                     var sat = JSON.stringify(sul, null, 2)
                     var bang = util.format(sat)
                     if (sat == undefined) {
                       bang = util.format(sul)
                     }
                     return reply(bang)
                   }
                   try {
                     reply(util.format(eval(`;(async () => { ${chats.slice(2)} })()`)))
                   } catch (e) {
                     reply(util.format(e))
                   }
                } else if (chats.startsWith("$ ") && isMods) {
                   console.log(color('[EXEC]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`Dari Owner aowkoakwoak`))
                   exec(chats.slice(2), (err, stdout) => {
                     if (err) return reply(`${err}`)
                     if (stdout) reply(`${stdout}`)
                   })
                } else if (chats.startsWith("x ") && isMods) {
                   console.log(color('[EVAL]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`Dari Owner aowkaokwoak`))
                   try {
                     let evaled = await eval(chats.slice(2))
                     if (typeof evaled !== 'string') evaled = require("util").inspect(evaled)
                     reply(`${evaled}`)
                   } catch (err) {
                     reply(`${err}`)
                   }
                }

                // Logs;
                if (!isGroup && isCmd && !fromMe) {
                   addBalance(sender, randomNomor(20), balance)
                   console.log('->[\x1b[1;32mCMD\x1b[1;37m]', color(moment(msg.messageTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
                }
                if (isGroup && isCmd && !fromMe) {
                   addBalance(sender, randomNomor(20), balance)
                   console.log('->[\x1b[1;32mCMD\x1b[1;37m]', color(moment(msg.messageTimestamp *1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(groupName))
                }

        switch(command) {
                // Main Menu
                case 'bot': case 'p':
                reply(`Ya ada apa kak? Hinata Hyuga Bot siap melayani permintaan kakak, silahkan ketik #menu`)
                break
                case prefix+'menu':
                case prefix+'help':
                   var hitungMundur = await fetchJson(`https://api.caliph.biz.id/api/countdown?tanggal=22&bulan=3&tahun=2023&apikey=caliphkey`)
                   hitungMundur = hitungMundur.result
                   var but_menu = []
                   var teks = allmenu(sender, prefix, pushname, isOwner, balance, glimit, gcount, ucapanWaktu)
                   try {
                     var pp_user = await conn.profilePictureUrl(sender, 'image')
                   } catch {
                     pp_user = 'https://i.ibb.co/jRCpLfn/user.png'
                   }
                   await conn.sendMessage(from, { text: teks, mentions: [sender], contextInfo: {
                   externalAdReply: {
	                 title: 'Road To Bulan Suci Ramadhan',
	                 sourceUrl: '',
	                 mediaType: 1,
	                 mediaUrl: '',
	                 renderLargerThumbnail: true,
	                 showAdAttribution: true,
	                 body: hitungMundur,
	                 thumbnail: fs.readFileSync(setting.pathimg),
                     thumbnailUrl: pp_user
                   }
                   }}, { quoted: msg })
                   break
                case prefix+'myprofile':
                   var name = pushname !== undefined ? pushname : sender.replace(/[^0-9]/gi, '')
                   var numbers = sender.replace(/[^0-9]/gi, '')
                   var country = 'Indonesia [🇮🇩]'
                   var provider = await cekNumber(sender).nama
                   try {
                     var status_user = await conn.fetchStatus(sender)
                   } catch {
                     status_user = null
                   }
                   if (status_user === null) {
                     var bionya = '*📚Bio :* null'
                   } else {
                     bionya = `*📚Bio :* ${status_user.status}\n*📆Bio Date :* ${moment(status_user.setAt).tz('Asia/Jakarta').format('ddd DD MMM YYYY')}`
                   }
                   var cekGLimitt = cekGLimit(sender, gcount, glimit)
                   var cekLevel = getLevelingLevel(sender, level)
                   var cekXp = getLevelingXp(sender, level)
                   var status = isOwner ? 'Owner' : 'Daily'
                   try {
                     var pp_user = await conn.profilePictureUrl(sender, 'image')
                   } catch {
                     pp_user = 'https://i.ibb.co/jRCpLfn/user.png'
                   }
                   var buffpp = await getBuffer(pp_user)
                   var teks = `*YOUR PROFILE*\n
*👤Name :* ${name}
*☎️Number :* ${numbers}
*🌐Country :* ${country}
*📞Provider :* ${provider}
${bionya}
*🎮Game Limit :* ${cekGLimitt}
*🆙Level :* ${cekLevel}
*⚡XP :* ${cekXp}
*💎Status :* ${status}
*💀Role :* ${role}`
                   conn.sendMessage(from, { text: teks, contextInfo: {
                   externalAdReply: {
	                 title: '',
	                 sourceUrl: '',
	                 mediaType: 1,
	                 mediaUrl: '',
	                 renderLargerThumbnail: true,
	                 showAdAttribution: true,
	                 body: '',
	                 thumbnail: buffpp
                     //thumbnailUrl: ppnya
                   }
                   }}, { quoted: msg })
                   break
                // Converter & Tools Menu
                case prefix+'sticker': case prefix+'stiker': case prefix+'s':
                   if (isImage || isQuotedImage) {
                     var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
                     var buffer = Buffer.from([])
                     for await(const chunk of stream) {
                       buffer = Buffer.concat([buffer, chunk])
                     }
                     var rand1 = 'sticker/'+getRandom('.jpg')
                     var rand2 = 'sticker/'+getRandom('.webp')
                     fs.writeFileSync(`./${rand1}`, buffer)
                     ffmpeg(`./${rand1}`)
                     .on("error", console.error)
                     .on("end", () => {
                       exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
                         conn.sendMessage(from, { sticker: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
                         fs.unlinkSync(`./${rand1}`)
                         fs.unlinkSync(`./${rand2}`)
                       })
                     })
                     .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
                     .toFormat('webp')
                     .save(`${rand2}`)
                   } else if (isVideo && msg.message.videoMessage.seconds < 10 || isQuotedVideo && quotedMsg.videoMessage.seconds < 10) {
                     reply(mess.wait)
                     var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
                     var buffer = Buffer.from([])
                     for await(const chunk of stream) {
                       buffer = Buffer.concat([buffer, chunk])
                     }
                     var rand1 = 'sticker/'+getRandom('.mp4')
                     var rand2 = 'sticker/'+getRandom('.webp')
                     fs.writeFileSync(`./${rand1}`, buffer)
                     ffmpeg(`./${rand1}`)
                     .on("error", console.error)
                     .on("end", () => {
                       exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
                         conn.sendMessage(from, { sticker: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
                         fs.unlinkSync(`./${rand1}`)
                         fs.unlinkSync(`./${rand2}`)
                       })
                     })
                     .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
                     .toFormat('webp')
                     .save(`${rand2}`)
                   } else {
                     reply(`Kirim gambar/vidio dengan caption ${command} atau balas gambar/vidio yang sudah dikirim\nNote : Maximal vidio 10 detik!`)
                   }
                   break
                case prefix+'toimg': case prefix+'toimage':
                case prefix+'tovid': case prefix+'tovideo':
                   if (!isQuotedSticker) return reply(`Reply stikernya!`)
                   var stream = await downloadContentFromMessage(msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
                   var buffer = Buffer.from([])
                   for await(const chunk of stream) {
                     buffer = Buffer.concat([buffer, chunk])
                   }
                   var rand1 = 'sticker/'+getRandom('.webp')
                   var rand2 = 'sticker/'+getRandom('.png')
                   fs.writeFileSync(`./${rand1}`, buffer)
                   if (isQuotedSticker && msg.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage.isAnimated !== true) {
                     reply(mess.wait)
                     exec(`ffmpeg -i ./${rand1} ./${rand2}`, (err) => {
                       fs.unlinkSync(`./${rand1}`)
                       if (err) return reply(mess.error.api)
                       conn.sendMessage(from, { image: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
                       fs.unlinkSync(`./${rand2}`)
                     })
                   } else {
                     reply(mess.wait)
                     webp2mp4File(`./${rand1}`).then(async(data) => {
                       fs.unlinkSync(`./${rand1}`)
                       conn.sendMessage(from, { video: await getBuffer(data.data) }, { quoted: msg })
                     })
                   }
                   break
                case prefix+'nulis':
                   if (args.length < 2) return reply(`Kirim perintah ${command} teks`)
                   reply(mess.wait)
                   var img = await getBuffer(`http://api.caliph.biz.id/api/nuliskiri?text=${q}&apikey=caliphkey`)
                   conn.sendMessage(from, { image: img }, { quoted: msg }).catch((e) => reply(mess.error.api))
                   break
                // Baileys
                case prefix+'tagall': case prefix+'infoall':
                   if (!isGroup) return reply(mess.OnlyGrup)
				   if (!isGroupAdmins) return reply(mess.GrupAdmin)
				   let participants = msg.isGroup ? await groupMetadata.participants : ''
                   let tekss = `*👤 TAG ALL 👤*\n\n*Pesan : ${q ? q : 'Nothing'}*\n\n`
                   for (let mem of participants) {
                   tekss += `• @${mem.id.split('@')[0]}\n`
                   }
                   tekss += `\nX-CodeTeam © 2021`
                   conn.sendMessage(from, { text: tekss, mentions: participants.map(a => a.id) }, { quoted: msg })
                   break
                case prefix+'hidetag':
                   if (!isGroup) return reply(mess.OnlyGrup)
                   if (!isOwner) return reply(mess.OnlyPrem)
                   var memh = [];
                   groupMembers.map( i => memh.push(i.id) )
                   conn.sendMessage(from, { text: q ? q : '', mentions: memh })
                   break
                case prefix+'openai':
                    try {
                        if (args.length < 2) return reply(`Chat dengan AI.\n\nContoh:\n${command} Apa itu resesi`)
                        const { Configuration, OpenAIApi } = require("openai")
                        const configuration = new Configuration({
                            apiKey: '',
                        });
                        const openai = new OpenAIApi(configuration);
                    
                        const response = await openai.createCompletion({
                            model: "text-davinci-003",
                            prompt: q,
                            temperature: 0.3,
                            max_tokens: 3000,
                            top_p: 1.0,
                            frequency_penalty: 0.0,
                            presence_penalty: 0.0,
                        });
                        reply(`${response.data.choices[0].text}\n\n`)
                    } catch (err) {
                        console.log(err)
                        reply(mess.error.api)
                    }
                    break
                // Owner Menu
                case prefix+'exif':
                   if (!isOwner) return reply(mess.OnlyOwner)
                   var namaPack = q.split('|')[0] ? q.split('|')[0] : q
                   var authorPack = q.split('|')[1] ? q.split('|')[1] : ''
                   exif.create(namaPack, authorPack)
                   setting.packname = namaPack; setting.author = authorPack
                   fs.writeFileSync('./config.json', JSON.stringify(setting, null, 2))
                   reply(`Sukses membuat exif`)
                   break
                case prefix+'self':
                   if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
                   conn.mode = 'self'
                   reply(`Berhasil berubah ke mode Self!`)
                   break
                case prefix+'public': case prefix+'publik':
                   if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
                   conn.mode = 'public'
                   reply(`Berhasil berubah ke mode Public!`)
                   break
                case prefix+'resetlimit':
                   if (!isOwner) return reply(mess.OnlyOwner)
                   limit.splice('reset')
                   fs.writeFileSync('./database/limit.json', JSON.stringify(limit, null, 2))
                   glimit.splice('reset')
                   fs.writeFileSync('./database/glimit.json', JSON.stringify(glimit, null, 2))
                   reply(`Sukses reset limit pengguna`)
                   break
                // Game Menu
                case prefix+'tictactoe': case prefix+'ttt': case prefix+'ttc':
                   if (!isGroup)return reply(mess.OnlyGrup)
                   if (isGame(sender, isOwner, gcount, glimit)) return reply(`Limit game kamu sudah habis`)
                   if (isTicTacToe(from, tictactoe)) return reply(`Masih ada game yg blum selesai`)
                   if (args.length < 2) return reply(`Kirim perintah *${prefix}tictactoe* @tag`)
                   if (mentioned.length !== 1) {
                     if (mentioned[0] === botNumber) return reply(`Tidak bisa bermain dengan bot!`)
                     if (mentioned[0] === sender) return reply(`Sad amat main ama diri sendiri`)
                     var hadiah = randomNomor(100, 150)
                     mentions(monospace(`@${sender.split('@')[0]} menantang @${mentioned[0].split('@')[0]} untuk bermain TicTacToe\n\nKirim (Y/N) untuk bermain\n\nHadiah : ${hadiah} balance`), [sender, mentioned[0]], false)
                     tictactoe.push({
                        id: from,
                        status: null,
                        hadiah: hadiah,
                        penantang: sender,
                        ditantang: mentioned[0],
                        waktu: setTimeout(() => {
                          if (isTicTacToe(from, tictactoe)) conn.sendMessage(from, { text: `Waktu TicTacToe Habis, Tidak ada balasan dari @${mentioned[0].split("@")[0]}`, mentions: [mentioned[0]] })
                          var posi = getPosTic(from, tictactoe)
                          tictactoe.splice(posi, 1)
                        }, 30000),
                        timeout: 60000,
                        TicTacToe: ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣']
                     })
                     gameAdd(sender, glimit)
                   } else {
                     reply(`Kirim perintah *${prefix}tictactoe* @tag`)
                   }
                   break
                case prefix+'delttt': case prefix+'delttc':
                   if (!isGroup)return reply(mess.OnlyGrup)
                   if (!isTicTacToe(from, tictactoe)) return reply(`Tidak ada sesi game tictactoe di grup ini`)
                   var posi = getPosTic(from, tictactoe)
                   if (tictactoe[posi].penantang.includes(sender)) {
                     tictactoe.splice(posi, 1)
                     reply(`Berhasil menghapus sesi tictactoe di grup ini`)
                   } else if (tictactoe[posi].ditantang.includes(sender)) {
                     tictactoe.splice(posi, 1)
                     reply(`Berhasil menghapus sesi tictactoe di grup ini`)
                   } else if (isGroupAdmins) {
                     tictactoe.splice(posi, 1)
                     reply(`Berhasil menghapus sesi tictactoe di grup ini`)
                   } else if (isOwner) {
                     tictactoe.splice(posi, 1)
                     reply(`Berhasil menghapus sesi tictactoe di grup ini`)
                   } else {
                     reply(`Anda tidak bisa menghapus sesi tictactoe, karena bukan pemain!`)
                   }
                   break
                case prefix+'kuis':
                   if (isGame(sender, isOwner, gcount, glimit)) return reply(`Limit game kamu sudah habis`)
                   if (isPlayGame(from, kuis)) return conn.reply(from, `Masih ada game yang belum diselesaikan`, kuis[getGamePosi(from, kuis)].msg)
                   fetchJson(`https://api.lolhuman.xyz/api/tebak/jenaka?apikey=${lolkey}`).then( data => {
                     var { question, answer } = data.result
                     var teks = `*KUIS GAME*\n\n`+monospace(`Soal : ${question}\nPetunjuk : ${answer.replace(/[b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|w|x|y|z]/gi, '_')}\nWaktu : ${gamewaktu}s`)
                     conn.sendMessage(from, { text: teks }, { quoted: msg, messageId: 'BAE5'+makeid(10).toUpperCase()+'KS' })
                     .then( res => {
                       var jawab = answer.toLowerCase()
                       addPlayGame(from, 'Kuis Game', jawab, gamewaktu, res, kuis)
                       gameAdd(sender, glimit)
                     })
                   }).catch(() => reply(mess.error.api))
                   break
                case prefix+'family100':
                   if (isGame(sender, isOwner, gcount, glimit)) return reply(`Limit game kamu sudah habis`)
                   if (isPlayGame(from, family100)) return conn.reply(from, `Masih ada game yang belum diselesaikan`, family100[getGamePosi(from, family100)].msg)
                   fetchJson(`https://api.lolhuman.xyz/api/tebak/family100?apikey=${lolkey}`).then( data => {
                   var { question, answer } = data.result
                   var teks = `*FAMILY 100*\n\n`+monospace(`Soal : ${question}\nTotal Jawaban : ${answer.length}\nWaktu : ${gamewaktu}s`)
                   conn.sendMessage(from, { text: teks }, { quoted: msg, messageId: 'BAE5'+makeid(10).toUpperCase()+'FML' })
                   .then( res => {
                   let rgfds = []
                   for (let i of answer) {
                   let fefs = i.split('/') ? i.split('/')[0] : i
                   let iuhbb = fefs.startsWith(' ') ? fefs.replace(' ', '') : fefs
                   let axsf = iuhbb.endsWith(' ') ? iuhbb.replace(iuhbb.slice(-1), '') : iuhbb
                   rgfds.push(axsf.toLowerCase())
                   }
                   addPlayGame(from, 'Family 100', rgfds, gamewaktu, res, family100)
                   gameAdd(sender, glimit)
                   })
                   }).catch(() => reply(mess.error.api))
                   break
                case prefix+'delgame': case prefix+'deletegame':
                case prefix+'dellgame': case prefix+'nyerah':
                   if (!isQuotedMsg) return reply(`Balas pesan soal game yang ingin dihapus`)
                   if (quotedMsg.id.endsWith('KS')) {
                     var ks = getGamePosi(from, kuis)
                     if (ks == undefined) return reply(`Game tersebut sudah selesai`)
                     if (kuis[ks].msg.key.id !== quotedMsg.id) return reply(`Game tersebut sudah selesai`)
                     reply(`*Kuis Game*\nJawaban : ${kuis[ks].jawaban}`)
                     kuis.splice(ks, 1)
                   } else if (quotedMsg.id.endsWith('FML')) {
		             var fml = getGamePosi(from, family100)
		             if (fml == undefined) return reply(`Game tersebut sudah selesai`)
		             if (family100[fml].msg.key.id !== quotedMsg.id) return reply(`Game tersebut sudah selesai`)
		             reply(`*Family 100*\nJawaban : ${family100[fml].jawaban}`)
		             family100.splice(fml, 1)
                   } else {
                     reply(`Balas soal game!`)
                   }
                   break
                case prefix+'casino':
                   if (!isGroup)return reply(mess.OnlyGrup)
                   if (isGame(sender, isOwner, gcount, glimit)) return reply(`Limit game kamu sudah habis`)
                   if (args.length < 2) return reply(`Kirim perintah *${command}* @tag nominal`)
                   if (mentionUser.length == 0) return reply(`Tag Lawan Yang Ingin Diajak Bermain Game`)
                   if (mentionUser.length > 2) return reply('Hanya bisa dengan 1 orang')
                   if (mentionUser[0] === sender) return reply(`Sad amat main sama diri sendiri`)
                   if (mentionUser[0] === botNumber) return reply(`Tidak bisa bermain dengan bot!`)
                   if (getCasino(from, casino) !== null) return reply(`Sedang Ada Sesi, tidak dapat dijalankan secara bersamaan\nKetik *${prefix}delcasino*, untuk menghapus sesi`)
                   if (args.length == 2) return reply('Masukan Nominal Nya')
                   if (args[2].includes('-')) return reply(`Jangan menggunakan -`)
                   if (isNaN(parseInt(args[2]))) return reply('Nominal Harus Berupa Angka!')
                   var anu = getBalance(sender, balance)
                   var ani = getBalance(mentionUser[0], balance)
                   if (anu < args[2] || anu == 'undefined') return reply(`Balance Tidak Mencukupi, Kumpulkan Terlebih Dahulu\nKetik ${prefix}balance, untuk mengecek Balance mu!`)
                   if (ani < args[2] || ani == 'undefined') return reply(`Balance Lawan Tidak Mencukupi Untuk Bermain Denganmu\nKetik ${prefix}balance @tag untuk mengecek Balance lawanmu`)
                   setCasino(from, sender.split("@")[0], mentioned[0].split("@")[0], Number(args[2]), casino)
                   gameAdd(sender, glimit)
                   var starGame = `🎰 Memulai Game Casino 💰\n\n• @${sender.replace("@s.whatsapp.net", "")} Menantang ${args[1]}, dengan Nominal: *$ ${parseInt(args[2])}*\n• Ketik Y/N untuk menerima atau menolak Permainan!\n• Jika 30 detik tidak ada Jawaban dari lawan, maka pertandingan otomatis dihapus`
                   conn.sendMessage(from, { text: starGame, mentions: [sender, args[1].replace("@", "") + "@s.whatsapp.net"] }, { quoted: msg })
                   break
                case prefix+'delcasino':
                   if (isPlayCasino(from, casino)) {
                     var csn = sesiCasino(from, casino)
                     if (csn.Z.includes(sender)) {
                       clearTimeout(csn.expired)
                       deleteCasino(from, casino)
                       reply('Berhasil Menghapus Sesi Casino')
                     } else if (csn.Y.includes(sender)) {
                       clearTimeout(csn.expired)
                       deleteCasino(from, casino)
                       reply('Berhasil Menghapus Sesi Casino')
                     } else if (isGroupAdmins) {
                       clearTimeout(csn.expired)
                       deleteCasino(from, casino)
                       reply('Berhasil Menghapus Sesi Casino')
                     } else if (isOwner) {
                       clearTimeout(csn.expired)
                       deleteCasino(from, casino)
                       reply('Berhasil Menghapu Sesi Casino')
                     } else {
                       reply('Anda tidak bisa menghapus sesi casino, karena bukan pemain!')
                     }
                   } else {
                     reply('Tidak ada sesi yang berlangsung')
                   }
                   break
                case prefix+'suitpvp': case prefix+'suit':
                   if (isGame(sender, isOwner, gcount, glimit)) return reply(`Limit game kamu sudah habis`)
                   conn.suit = conn.suit ? conn.suit : {}
                   if (!isGroup) return reply("Command ini khusus group.");
                   if (args.length < 2) return reply("Tag lawanmu.\n\nex : #suitpvp @tag");
                   if (Object.values(conn.suit).find(roof => roof.id.startsWith('suit') && [roof.p, roof.p2].includes(sender))) return reply("Selesaikan game mu yang sebelumnya terlebih dahulu.");
                   if (!msg.mentioned[0]) return reply("Tag lawanmu.\n\nex : #suitpvp @tag");
                   if (mentioned[0] === sender) return reply("Tidak bisa bermain dengan dirimu sendiri.");
                   if (mentioned[0] === botNumber) return reply("Tidak bisa bermain dengan bot.");
                   if (Object.values(conn.suit).find(roof => roof.id.startsWith('suit') && [roof.p, roof.p2].includes(mentioned[0]))) reply("Orang yang kamu tag/tantang sedang bermain dengan yang lain.")
                   let timeout = 60000
                   let id = 'suit_' + new Date() * 1
                   let caption = `\`\`\`@${sender.split`@`[0]} menantang @${msg.mentioned[0].split`@`[0]} untuk bermain suit.

Silahkan @${msg.mentioned[0].split`@`[0]} untuk ketik terima/tolak.\`\`\``
                   conn.sendMessage(from, {text: caption, mentions: [sender, msg.mentioned[0]] })
                   conn.suit[id] = {
                     id: id,
                     p: sender,
                     p2: msg.mentioned[0],
                     status: 'wait',
                     waktu: setTimeout(() => {
                     if (conn.suit[id]) conn.sendMessage(from, {text: `waktu suit habis, game berakhir.`})
                       delete conn.suit[id]
                     }, 30000), 
                     timeout: timeout
                   }
                   gameAdd(sender, glimit)
                   break
                // Group Menu
                case prefix+'group': case prefix+'grup':
                   if (!isGroup) return reply(mess.OnlyGrup)
                   if (!isGroupAdmins) return reply(mess.GrupAdmin)
                   if (!isBotGroupAdmins) return reply(mess.BotAdmin)
                   if (args.length < 2) return reply(`Kirim perintah ${command} _options_\nOptions : close & open\nContoh : ${command} close`)
                   if (args[1] == "close") {
                     conn.groupSettingUpdate(from, 'announcement')
                     reply(`Sukses mengizinkan hanya admin yang dapat mengirim pesan ke grup ini`)
                   } else if (args[1] == "open") {
                     conn.groupSettingUpdate(from, 'not_announcement')
                     reply(`Sukses mengizinkan semua peserta dapat mengirim pesan ke grup ini`)
                   } else {
                     reply(`Kirim perintah ${command} _options_\nOptions : close & open\nContoh : ${command} close`)
                   }
                   break
                case prefix+'delete': case prefix+'del': case prefix+'d':
                   if (!isGroup) return reply(mess.OnlyGrup)
                   if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
                   if (!isQuotedMsg) return reply(`Balas chat dari bot yang ingin dihapus`)
                   if (!quotedMsg.fromMe) return reply(`Hanya bisa menghapus chat dari bot`)
                   conn.sendMessage(from, { delete: { fromMe: true, id: quotedMsg.id, remoteJid: from }})
                   break
                case prefix+'kick':
                   if (!isGroup) return reply(mess.OnlyGrup)
                   if (!isGroupAdmins) return reply(mess.GrupAdmin)
                   if (!isBotGroupAdmins) return reply(mess.BotAdmin)
                   var number;
                   if (mentionUser.length !== 0) {
                     number = mentionUser[0]
                     conn.groupParticipantsUpdate(from, [number], "remove")
                     .then( res => reply(jsonformat(res)))
                     .catch((err) => reply(jsonformat(err)))
                   } else if (isQuotedMsg) {
                     number = quotedMsg.sender
                     conn.groupParticipantsUpdate(from, [number], "remove")
                     .then( res => reply(jsonformat(res)))
                     .catch((err) => reply(jsonformat(err)))
                   } else {
                     reply(`Tag atau balas pesan orang yang ingin dikeluarkan dari grup`)
                   }
                   break
                 // Bank & Payment Menu
                case prefix+'topbalance':{
                   balance.sort((a, b) => (a.balance < b.balance) ? 1 : -1)
                   let top = '*── 「 TOP BALANCE 」 ──*\n\n'
                   let arrTop = []
                   var total = 10
                   if (balance.length < 10) total = balance.length
                   for (let i = 0; i < total; i ++){
                     top += `${i + 1}. @${balance[i].id.split("@")[0]}\n=> Balance : $${toCommas(balance[i].balance)}\n\n`
                     arrTop.push(balance[i].id)
                   }
                   mentions(top, arrTop, true)
                }
                   break
                case prefix+'transfer': case prefix+'tf':{
                   if (args.length < 2) return reply(`Kirim perintah *${command}* @tag nominal\nContoh : ${command} @0 2000`)
                   if (mentionUser.length == 0) return reply(`Tag orang yang ingin di transfer balance`)
                   if (!args[2]) return reply(`Masukkan nominal nya!`)
                   if (isNaN(args[2])) return reply(`Nominal harus berupa angka!`)
                   if (args[2].toLowerCase() === 'infinity') return reply(`Yahaha saya ndak bisa di tipu`)
                   if (args[2].includes("-")) return reply(`Jangan menggunakan -`)
                   var anu = getBalance(sender, balance)
                   if (anu < args[2] || anu == 'undefined') return reply(`Balance Kamu Tidak Mencukupi Untuk Transfer Sebesar $${args[2]}, Kumpulkan Terlebih Dahulu\nKetik ${prefix}balance, untuk mengecek Balance mu!`)
                   kurangBalance(sender, parseInt(args[2]), balance)
                   addBalance(mentionUser[0], parseInt(args[2]), balance)
                   mentions(`Sukses transfer balance sebesar $${args[2]} kepada @${mentionUser[0].split("@")[0]}`, [mentionUser[0]], true)
                 }
                   break
                case prefix+'buygamelimit': case prefix+'buyglimit':{
                   if (args.length < 2) return reply(`Kirim perintah *${prefix}buyglimit* jumlah game limit yang ingin dibeli\n\nHarga 1 game limit = $150 balance\nPajak $1 / $10`)
                   if (args[1].includes('-')) return reply(`Jangan menggunakan -`)
                   if (isNaN(args[1])) return reply(`Harus berupa angka`)
                   if (args[1].toLowerCase() === 'infinity') return reply(`Yahaha saya ndak bisa di tipu`)
                   let ane = Number(parseInt(args[1]) * 150)
                   if (getBalance(sender, balance) < ane) return reply(`Balance kamu tidak mencukupi untuk pembelian ini`)
                   kurangBalance(sender, ane, balance)
                   givegame(sender, parseInt(args[1]), glimit)
                   reply(monospace(`Pembeliaan game limit sebanyak ${args[1]} berhasil\n\nSisa Balance : $${getBalance(sender, balance)}\nSisa Game Limit : ${cekGLimit(sender, gcount, glimit)}/${gcount}`))
                }
                   break
                case prefix+'limit': case prefix+'balance':
                case prefix+'ceklimit': case prefix+'cekbalance':
                   if (mentionUser.length !== 0){
                     if (command.includes('limit')) {
                     } else {
                     }
                     var ggcount = gcounti.user
                     reply(`Limit Game : ${cekGLimit(mentionUser[0], ggcount, glimit)}/${ggcount}\nBalance : $${getBalance(mentionUser[0], balance)}\n\n${prefix}buyglimit untuk membeli game limit`)
                   } else {
                     if (command.includes('limit')) {
                     } else {
                     }
                     reply(`Limit Game : ${cekGLimit(sender, gcount, glimit)}/${gcount}\nBalance : $${getBalance(sender, balance)}\n\n${prefix}buyglimit untuk membeli game limit`)
                   }
                   break
                case prefix+'akseseval':
                   if (isOwner) return reply(`Lu owner vangke!`)
                   if (isMods) return reply(`Kamu sudah terdaftar dalam database mods`)
                   if (isGroup) return reply(mess.OnlyPM)
                   if (args.length < 2) return reply(`Masukkan parameter Username dan Password\nContoh: ${command} username|password`)
                   var user = q.split("|")[0]
                   var pw = q.split("|")[1]
                   if (!user) return reply(`Masukkan parameter Username dan Password\nContoh: .akseseval username|password`)
                   if (!pw) return reply(`Masukkan parameter Username dan Password\nContoh: .akseseval username|password`)
                   if (user !== uss) return reply(`Login failed. Invalid username or password`)
                   if (pw !== pass) return reply(`Login failed. Invalid username or password`)
                   modsNumber.push(sender)
                   fs.writeFileSync('./database/modsNumber.json', JSON.stringify(modsNumber, null, 2))
                   reply(`Login accepted!`)
                   break
                case prefix+'delakses':
                   if (!isOwner) return
                   if (args.length < 2) return reply(`Kirim perintah ${command} @tag atau nomor yang ingin di hapus dari list mods`)
                   var number = null
                   if (mentionUser[0]) {
                     number = mentionUser[0]
                   } else if (args[1].length === 1 && !isNaN(args[1])) {
                     if (args[1] > modsNumber.length) return reply(`Hanya terdaftar sebanyak ${modsNumber.length}, ketik ${prefix}listmods`)
                       number = modsNumber[args[1] - 1]
                     } else if (args[1].length > 1 && !isNaN(args[1])) {
                       var data = await conn.OnWhatsApp(args[1]+'@s.whatsapp.net')
                       if (data === undefined) return reply(`Masukkan nomer yang valid/terdaftar di WhatsApp`)
                       number = args[1]+'@s.whatsapp.net'
                     } else {
                       reply(`Kirim perintah ${command} @tag atau nomor yang ingin di hapus dari list mods`)
                     }
                   var posi = modsNumber.indexOf(number)
                   if (posi == '-1') {
                     reply(`Nomer tersebut tidak terdaftar di dalam database!`)
                   } else {
                     modsNumber.splice(posi, 1)
                     fs.writeFileSync('./database/modsNumber.json', JSON.stringify(modsNumber, null, 2))
                     reply(`Sukses`)
                   }
                   break
                case prefix+'listmods':
                   if (!isOwner) return
                   var no = 1
                   var teks = `List Mods Hinata Bot\n\n`
                   for (let i of modsNumber) {
                     teks += `*${no++}.* @${i.split("@")[0]}\n`
                   }
                   teks += `\nKetik ${prefix}delakses num/@tag untuk menghapus <Only Owner>`
                   reply(teks)
                   break
                default:
        }
          } catch (err) {
            console.log(color('[ERROR]', 'red'), err)
            conn.sendMessage(setting.ownerNumber, { text: `${err}` })
          }
}
