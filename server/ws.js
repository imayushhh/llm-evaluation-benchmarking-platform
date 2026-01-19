import { WebSocketServer } from "ws";

export function initWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws"   
  });

  wss.on("connection", ws => {
  console.log("🟢 WebSocket client connected");

  ws.send(JSON.stringify({
    type: "status",
    msg: "Connection confirmed - Backend"
  }));


    ws.on("close", () => {
      console.log("🔴 WebSocket client disconnected");
    });
  });

  return {
    broadcast(payload) {
      const message = JSON.stringify(payload);

      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    }
  };
  }
