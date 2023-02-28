const moment = require("moment-timezone");
const fs = require("fs");

moment.tz.setDefault("Asia/Jakarta").locale("id");

let setting = JSON.parse(fs.readFileSync('./config.json'))
const { getBalance, cekGLimit } = require("../lib/limit")

const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)

function toCommas(x) {
	x = x.toString()
	var pattern = /(-?\d+)(\d{3})/;
     while (pattern.test(x))
	   x = x.replace(pattern, "$1.$2");
	return x;
}

exports.allmenu = (sender, prefix, pushname, isOwner, balance, glimit, gcount, ucapanWaktu) => {
	return `  _${ucapanWaktu} *${pushname !== undefined ? pushname : 'Kak'}*_

╭─❒ 「 ${setting.botName} 」
│○ Library : *Baileys-MD*.
│○ Prefix : ( ${prefix} )
│○ Tanggal Server : ${moment.tz('Asia/Jakarta').format('DD/MM/YY')}
│○ Waktu Server : ${moment.tz('Asia/Jakarta').format('HH:mm:ss')} WIB
╰❒

╭─❒ 「 Info User 」
│○ Status : ${isOwner ? 'Owner' : 'Daily'}
│○ Limit Game : ${isOwner ? 'Infinity' : cekGLimit(sender, gcount, glimit)}
│○ Balance : $${toCommas(getBalance(sender, balance))}
╰❒
${readmore}
╭─❒ 「 Others 」
│○ ${prefix}menu
│○ ${prefix}myprofile
╰❒

╭─❒ 「 Converter/Tools 」
│○ ${prefix}sticker
│○ ${prefix}toimg
│○ ${prefix}tovid
│○ ${prefix}nulis
╰❒

╭─❒ 「 Games 」
│○ ${prefix}tictactoe
│○ ${prefix}delttc
│○ ${prefix}kuis
│○ ${prefix}family100
│○ ${prefix}nyerah
│○ ${prefix}casino
│○ ${prefix}delcasino
│○ ${prefix}suit
╰❒

╭─❒ 「 Payment & Bank 」
│○ ${prefix}topbalance
│○ ${prefix}buyglimit
│○ ${prefix}transfer
│○ ${prefix}limit
│○ ${prefix}balance
╰❒

╭─❒ 「 Group 」
│○ ${prefix}group
│○ ${prefix}kick
│○ ${prefix}tagall
│○ ${prefix}hidetag
╰❒

╭─❒ 「 Owner 」
│> evalcode
│x evalcode-2
│$ executor
│○ ${prefix}exif
│○ ${prefix}self
│○ ${prefix}public
│○ ${prefix}resetlimit
╰❒

╭─❒ 「 Thanks To 」
│○ YogGazz
│○ Arthur
│○ Dani
│○ X-Code Team
╰❒`
}

