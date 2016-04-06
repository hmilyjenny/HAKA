const serverConfig = {
    port: process.env.PORT || 8080,
    secretKEY: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluaXN0cmF0b3IiLCJ1c2VyaWQiOiJjaW03djRydXgwMDAwam5mYXhzeGp6NDZnIiwiaWF0IjoxNDU4OTE5ODYwLCJleHAiOjE0NTg5MjA0NjB9.J4n7U46wm65nxEO8PCvO07WlvMcQVjgm7I9ZS7SSI-c",
    expireInTime: "7d",
    tmpfileUploadUrl: "./upload_tmp_files/",
    fileUploadUrl: "./upload_files/",
    fileChunkSize: 20
};
export default serverConfig;