import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "./index";
import { NotificationService } from "./lib/notifications";
import { FileStorageService } from "./lib/file-storage";

// Create Express app
const app = createServer();

// Create HTTP server
const server = createHttpServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? "https://fusion-starter-1758821892.netlify.app" 
      : ["http://localhost:8080", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

// Initialize services
const notificationService = new NotificationService(io);
FileStorageService.initialize();

// Make services available to the app
app.locals.notificationService = notificationService;

// Override the notification service in the app
app.set('notificationService', notificationService);

export { server };
