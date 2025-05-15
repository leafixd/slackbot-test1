const axios = require("axios");
require("dotenv").config();

async function sendToSlack({ sender, content, sendTime }) {
  const slackMessage = `
  💬 ${sender}님의 메시지
  
     ${content}

  - ${sendTime}
  `;
  try {
    await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: process.env.SLACK_CHANNEL_ID,
        text: slackMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Slack 메시지 전송 완료");
  } catch (err) {
    console.error("Slack 메시지 전송 실패:", err.response?.data || err);
  }
}

module.exports = { sendToSlack };
