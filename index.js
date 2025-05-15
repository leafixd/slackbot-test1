const dotenv = require("dotenv");
const path = require("path");

// .env 파일의 절대 경로를 지정
const envPath = path.resolve(__dirname, ".env");

// dotenv 설정
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("Error loading .env file:", result.error);
  process.exit(1);
}

const { connect } = require("./src/websocket");
const tcpServer = require("./src/tcp_server"); // TCP 서버 import

connect();
// TCP 서버 실행 (src/tcp_server.js에서 서버가 바로 실행되도록 구현되어 있으면 이 줄은 필요 없음)
