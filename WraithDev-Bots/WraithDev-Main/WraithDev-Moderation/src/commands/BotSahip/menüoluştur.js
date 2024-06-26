const { ButtonStyle, EmbedBuilder, ButtonBuilder, ActionRowBuilder,  StringSelectMenuBuilder } = require("discord.js");
const Custom = require("../../../../src/schemas/menü");
const allah = require("../../../../../../config.json");
const { wraithsdevRed, wraithsdevTik, wraithsdevStar } = require("../../../../src/configs/emojis.json")
const emojiler = require("../../../../src/configs/emojis.json")
const moment = require("moment");
require("moment-duration-format");

module.exports = {
    conf: {
      aliases: ["menü-oluştur"],
      name: "menü-oluştur",
      help: "menü-oluştur",
      category: "sahip",
      owner: true,
    },
   
      run: async (client) => {

      let Database = await Custom.find({})
      if(Database && Database.length >= 1) {
        for (let index = 0; index < Database.length; index++) {
            client.on("interactionCreate", async (interaction) => { 
                let menu = interaction.customId
                const member = await client.guilds.cache.get(allah.GuildID).members.fetch(interaction.member.user.id)
                if (!member) return;
                let Data = Database[index]
               if(Data.Secret == menu) {
                let customMap = new Map()
                Data.Roles.forEach(r => customMap.set(r, r))
                  let roles = Data.Roles
                  var role = []
                  for (let index = 0; index < interaction.values.length; index++) {
                    let ids = interaction.values[index]
                    let den = customMap.get(ids)
                    role.push(den)
                  }
                  if (interaction.values[0] === "rolsil") {
                    await member.roles.remove(roles)
                  } else {
                    if (!interaction.values.length) {
                        await member.roles.remove(roles).catch(err => {})
                      } else {
                        await member.roles.remove(roles).catch(err => {})
                        await member.roles.add(role).catch(err => {})
                      }
                  }
                  interaction.reply({ content: "Rolleriniz güncellendi.", ephemeral: true })
               }
            })
            
        }
      }
  },

   /**
   * @param {Client} client 
   * @param {Message} message 
   * @param {Array<String>} args 
   */
    run: async (client, message, args) => {
    let Data = await Custom.find({})
    let comp;
    let defa = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("ekle")
        .setLabel("Ekleme & Düzenleme")
        .setEmoji("841029419573444618")
        .setStyle(ButtonStyle.Success)
    )
    if(Data && Data.length >= 1) {
        
        let listele = []
        Data.forEach(async (x) => {
            listele.push({label: x.Name, description: `${moment(x.Date)} ${message.guild.members.cache.get(x.Author) ? `- ${message.guild.members.cache.get(x.Author).user.tag}` : ""}`, value: x.Name})
        })
        comp = [defa, new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId("sil")
            .setPlaceholder("Aşağıdan silmek istediğiniz menüyü seçin!")
            .addOptions(
                listele
            ),
               
        ),new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId("kur")
            .setPlaceholder("Aşağıdan oluşturmak istediğiniz menüyü seçin!")
            .addOptions(
                listele
            ),
               
        )]
    } else {
        comp = [defa]
    }

    message.channel.send({embeds: [new EmbedBuilder().setDescription(`**Merhaba!** ${message.member.user.tag} (${message.member}),
${message.guild.name} sunucusuna ait olan rol seçim menüsü listesi aşağıda mevcut ekleme, düzenleme ve kaldırma işlemini buradan yapabilirsiniz. :tada: :tada: :tada: 
**Kullanım Koşulları!**
\` ❯ \` Sunucuda bir rol seçim menüsü oluşturmak istiyorsan aşağıda ki düğme yardımıyla ekleyebilirsin.
\` ❯ \` Ekleme işlemleri bittikten sonra anlık olarak kurulum işlemini tekrar bu panel üzerinden yapabilirsin.
\` ❯ \` Düzenleme işlemi yaparken tekrardan aşağıda ki düğmeye basarak, düzenlenmesini istediğiniz rol seçim menüsü ismini girerek tekrardan ayarlarını güncelleyebilirsiniz.`)], components: comp}).then(async (msg) => {
                    const filter = i => i.user.id == message.member.id 
                    const collector = msg.createMessageComponentCollector({ filter: filter,  errors: ["time"], time: 120000 })
                    collector.on("collect", async (i) => {
                        if(i.customId == "sil") {
                            await Custom.deleteOne({Name: i.values})
                            i.reply({content: `${wraithsdevTik} Başarıyla **${i.values}** isimli rol seçim menüsü silindi.`, ephemeral: true})
                            msg.delete().catch(err => {})
                            message.react(wraithsdevTik)
                        }
                        if(i.customId == "kur") {
                            let kurulcak = await Custom.findOne({Name: i.values})
                            if(kurulcak) {
                                let Opt = []

                                kurulcak.Roles.forEach(r => {
                                   Opt.push({label: message.guild.roles.cache.get(r) ? message.guild.roles.cache.get(r).name : "@Rol Bulunamadı!", 
                                   value: r},{ label: "Rol İstemiyorum", value: "rolsil" }) 
                                })

                                let listMenu = new ActionRowBuilder().addComponents(
                                    new StringSelectMenuBuilder()
                                    .setCustomId(kurulcak.Secret)
                                    .setPlaceholder(`${kurulcak.Name}`)
                                    .setOptions(Opt)
                                )
                                message.channel.send({content: `${kurulcak.Text}`, components: [listMenu]}).then(async (oluşturuldu) => {
                                    var filter = i => i.customId == kurulcak.Secret
                                    let collector = oluşturuldu.createMessageComponentCollector({filter: filter})
                                    collector.on('collect', async (i) => {
                                        const member = await client.guilds.cache.get(allah.GuildID).members.fetch(i.user.id)
                                        if (!member) return;
                                        let Data = await Custom.findOne({Secret: kurulcak.Secret})
                                        let customMap = new Map()
                                        Data.Roles.forEach(r => customMap.set(r, r))
                                          let roles = Data.Roles
                                          var role = []
                                          for (let index = 0; index < i.values.length; index++) {
                                            let ids = i.values[index]
                                            let den = customMap.get(ids)
                                            role.push(den)
                                          }
                                          if (i.values[0] === "rolsil") {
                                            await member.roles.remove(roles)
                                          } else {
                                            if (!i.values.length) {
                                                await member.roles.remove(roles).catch(err => {})
                                              } else {
                                                await member.roles.remove(roles).catch(err => {})
                                                await member.roles.add(role).catch(err => {})
                                              }
                                          }
                                          i.reply({ content: "Rolleriniz güncellendi.", ephemeral: true })
                                    })
                                })
                                i.reply({content: `${wraithsdevTik} Başarıyla **${kurulcak.Name}** isimli rol seçim menüsü kuruldu.`, ephemeral: true})
                                msg.delete().catch(err => {})
                                message.react(wraithsdevTik)
                            }
                        }
                        if(i.customId == "ekle") {
                            msg.delete().catch(err => {})
                            message.channel.send({content: `:tada: **${message.guild.name}**
Yeni bir rol seçim menüsü oluşturuluyor...`, embeds: [new EmbedBuilder().setDescription(`
Rol Seçim Menüsü: \` Ayarlanmadı! \`
Açıklama: \` Ayarlanmadı! \`
Roller: \` Ayarlanmadı! \`
Yeni oluşturulmakta olan rol seçim menünüze bir isim belirleyin.`)]}).then(async (isimbelirleme) => {
    let rolSeçim = {
        Name: String,
        Roles: Array,
        Text: String,
        Date: Date.now(),
        Secret: secretOluştur(10),
        Author: message.member.id,
    }
    var filt = m => m.author.id == message.member.id
    let collector = isimbelirleme.channel.createMessageCollector({filter: filt, time: 60000, max: 1, errors: ["time"]})
    collector.on("collect", async (m) => {
        let mesaj = m.content
        if(mesaj == "iptal" || mesaj == "ıptal") {
            return isimbelirleme.edit({content: null, embeds: [new EmbedBuilder().setDescription(`${wraithsdevRed} Başarıyla rol seçim menü oluşturma aracı iptal edildi.`)]}).then(x => {
                setTimeout(() => {
                    isimbelirleme.delete().catch(err => {})
                }, 15000);
            })
        }
        rolSeçim.Name = mesaj
        message.channel.send({content: `:tada: **${message.guild.name}**
Yeni bir rol seçim menüsü oluşturuluyor...`, embeds: [new EmbedBuilder().setDescription(`
Rol Seçim Menüsü: \`${rolSeçim.Name}\`
Açıklama: \` Ayarlanmadı! \`
Roller: \` Ayarlanmadı! \`
Yeni oluşturulmakta olan rol seçim menünüze bir açıklama belirtin. Örn: \`Aşağıda ki rollerden istediğiniz rolü alabilirsiniz!\``)]})
.then(async (açıklamabelirleme) => { 
    var filt = m => m.author.id == message.member.id
    let collector = açıklamabelirleme.channel.createMessageCollector({filter: filt, time: 60000, max: 1, errors: ["time"]})
    collector.on("collect", async (m) => {
        let mesaj = m.content
        if(mesaj == "iptal" || mesaj == "ıptal") {
            return açıklamabelirleme.edit({content: null, embeds: [new EmbedBuilder().setDescription(`${wraithsdevRed} Başarıyla rol seçim menü oluşturma aracı iptal edildi.`)]}).then(x => {
                setTimeout(() => {
                    açıklamabelirleme.delete().catch(err => {})
                }, 15000);
            })
        }
        rolSeçim.Text = m.content
        açıklamabelirleme.delete().catch(err => {})
        message.channel.send({content: `:tada: **${message.guild.name}**
Yeni bir rol seçim menüsü oluşturuluyor...`, embeds: [new EmbedBuilder().setDescription(`
Rol Seçim Menüsü: \`${rolSeçim.Name}\`
Açıklama: \`${rolSeçim.Text}\`
Roller: \` Ayarlanmadı! \`
Yeni oluşturulmakta olan rol seçim menünüzde listelenecek rolleri belirtin.`).setFooter({ text:`En az 3 tane, en fazla 25 tane rol ekleyebilirsiniz.`})]}).then(async (rolbelirleme) => {
    var filt = m => m.author.id == message.member.id
    let collector = msg.channel.createMessageCollector({filter: filt, time: 60000, max: 1, errors: ["time"]})
    collector.on("collect", async (m) => {
        let mesaj = m.content
        if(mesaj == "iptal" || mesaj == "ıptal") {
           return rolbelirleme.edit({content: null, embeds: [new EmbedBuilder().setDescription(`${wraithsdevRed} Başarıyla rol seçim menü oluşturma aracı iptal edildi.`)]}).then(x => {
                setTimeout(() => {
                    rolbelirleme.delete().catch(err => {})
                }, 15000);
            })
        }
        rolbelirleme.delete().catch(err => {})
        let rolPushing = []
        if(m.mentions.roles.size >= 1) {
          rolPushing = m.mentions.roles.map(role => role.id)
        } else {
          let argss = m.content.split(" ");
          argss = argss.splice(0)
          let rolVerAbime = argss.filter(role => message.guild.roles.cache.some(role2 => role == role2.id))
          rolPushing.push(...rolVerAbime)
        }
        rolSeçim.Roles = rolPushing
        message.channel.send({embeds: [new EmbedBuilder().setDescription(`
Rol Seçim Menüsü: \`${rolSeçim.Name}\`
Açıklama: \`${rolSeçim.Text}\`
Roller: ${rolSeçim.Roles.map(x => message.guild.roles.cache.get(x)).join(", ")}

${wraithsdevTik} Başarıyla **${rolSeçim.Name}** isimli rol seçim menüsü \`${moment(Date.now()).format("LLL")}\` tarihinde oluşturuldu.`)]}).then(async (oluşturuldu) => {
    message.react(wraithsdevTik).catch(err => {})
    let secretKodu = secretOluştur(10)
    await Custom.updateOne({Name: rolSeçim.Name}, { $set: { "Text": rolSeçim.Text, "Roles": rolSeçim.Roles, "Date": Date.now(), Secret: secretKodu, "Author": message.member.id,  }}, {upsert: true})
    
})
    })
})
    })
})
        isimbelirleme.delete().catch(err => {})


    })

})

                        }
                    })

    })
  
    }
};



function secretOluştur(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }