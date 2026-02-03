const fs = require("fs-extra");

module.exports.config = {
  name: "birthdayAuto",
  version: "1.0.2",
  hasPermssion: 2,
  credits: "ChatGPT & rX Abdullah",
  description: "Auto message 12 days before birthday and on the day",
  commandCategory: "system",
  cooldowns: 5
};

module.exports.run = async function({ api }) {
  const threads = await api.getThreadList(100, null, ["INBOX"]);

  const now = new Date();
  let year = now.getFullYear();
  const birthday = new Date(year, 8, 26);

  if (now > birthday) birthday.setFullYear(year + 1);

  const diffDays = Math.ceil((birthday - now) / (1000 * 60 * 60 * 24));
  const link = "\n🔗 m.me/100071971474157";

  let message = "";

  if (diffDays <= 12 && diffDays >= 1) {
    message = `📢 𝐀𝐥𝐈𝐇𝐒𝐀𝐍 𝐒𝐇𝐎𝐔𝐑𝐎𝐕 এর জন্মদিন আসতে বাকি ${diffDays} দিন!\n🎁 রেডি থাকো উইশ করার জন্য! 🥳${link}`;
  } else if (diffDays === 0) {
    message = `🎉 আজ 𝐀𝐥𝐈𝐇𝐒𝐀𝐍 𝐒𝐇𝐎𝐔𝐑𝐎𝐕 এর জন্মদিন!\n\n📝 উইশ করো এই পোস্টে গিয়ে 👇\n${link}\n\n🎂 Caption:\n"Happy Birthday 𝐀𝐥𝐈𝐇𝐒𝐀𝐍 𝐒𝐇𝐎𝐔𝐑𝐎𝐕 🎉\nStay blessed always 💙"`;
  } else {
    return;
  }

  for (const thread of threads) {
    api.sendMessage(message, thread.threadID);
  }
};
