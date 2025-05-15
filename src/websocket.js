const { Client } = require("@stomp/stompjs");
const SockJS = require("sockjs-client");
const { sendToSlack } = require("./slack");
require("dotenv").config();

// 웹소켓 URL 확인
console.log("웹소켓 URL:", process.env.SPRING_WS_URL);

const client = new Client({
  webSocketFactory: () => {
    return new SockJS(process.env.SPRING_WS_URL);
  },
  debug: function (str) {
    console.log("STOMP: " + str);
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

client.onConnect = function (frame) {
  console.log("웹소켓 연결 성공");

  client.subscribe("/topic/chat", function (message) {
    try {
      const content = JSON.parse(message.body);

      // Slack으로 메시지 전송
      sendToSlack({
        ...content,
        sendTime: new Date(content.sendTime).toLocaleString(),
      });
    } catch (error) {
      console.error("메시지 처리 중 오류 발생:", error);
    }
  });
};

client.onStompError = function (frame) {
  console.error("STOMP 오류 발생:", frame.headers["message"]);
};

function connect() {
  try {
    client.activate();
  } catch (error) {
    console.error("웹소켓 연결 실패:", error);
    setTimeout(connect, 5000);
  }
}

module.exports = { connect };
