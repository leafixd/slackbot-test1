const net = require("net");
const { sendToSlack } = require("./slack");
require("dotenv").config();

// 고정 길이 설정 (dataType 4, equipmentId 8, radio 4, extra 20, userName 8, requestDate 20)
const FIXED_LENGTH = 64;

const server = net.createServer((socket) => {
  let buffer = Buffer.alloc(0);

  socket.on("data", (data) => {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length >= FIXED_LENGTH) {
      const messageBuffer = buffer.slice(0, FIXED_LENGTH);
      buffer = buffer.slice(FIXED_LENGTH);
      console.log("messageBuffer", messageBuffer);

      // 각 필드 파싱
      const dataType = messageBuffer.slice(0, 4).toString().trim();
      const equipmentId = messageBuffer.slice(4, 12).toString().trim();
      const radio = messageBuffer.slice(12, 16).toString().trim();
      const extra = messageBuffer.slice(16, 36).toString().trim();
      const userName = messageBuffer.slice(36, 44).toString().trim();
      const requestDate = messageBuffer.slice(44, 64).toString().trim();

      // 로그 출력
      console.log("[TCP 수신] 원본 메시지:", messageBuffer.toString());
      console.log("[TCP 수신 파싱]");
      console.log("  dataType:", dataType);
      console.log("  equipmentId:", equipmentId);
      console.log("  radio:", radio);
      console.log("  extra:", extra);
      console.log("  userName:", userName);
      console.log("  requestDate:", requestDate);

      // radio 값에 따라 요청 종류 구분
      let requestType = "";
      switch (radio) {
        case "1":
          requestType = "Status 요청";
          break;
        case "2":
          requestType = "Transaction 요청";
          break;
        case "3":
          requestType = "EOD 요청";
          break;
        case "4":
          requestType = "Audit Register 요청";
          break;
        case "5":
          requestType = "Parameter Version 요청";
          break;
        case "6":
          requestType = "SW Version 요청";
          break;
        case "7":
          requestType = "Configuration 요청";
          break;
        case "8":
          requestType = "Log 요청";
          break;
        default:
          requestType = `알 수 없는 요청 (radio: ${radio})`;
      }

      const slackMsg = `[${requestType}]
장비ID: ${equipmentId}
요청자: ${userName}
요청일시: ${requestDate}
추가정보: ${extra}`;

      if (dataType === "0001") {
        sendToSlack({
          sender: userName,
          content: slackMsg,
          sendTime: requestDate,
        });
      }
    }
  });

  socket.on("end", () => {
    console.log("클라이언트 연결 종료");
  });

  socket.on("error", (err) => {
    console.error("소켓 에러:", err);
  });
});

const PORT = process.env.TCP_PORT || 9000;
server.listen(PORT, () => {
  console.log(`TCP 서버가 포트 ${PORT}에서 대기 중입니다.`);
});
