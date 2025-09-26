import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "./index";
import { socketOrigins } from "./lib/config";
import { NotificationService } from "./lib/notifications";
import { FileStorageService } from "./lib/file-storage";

// Create Express app
const app = createServer();

// Create HTTP server
const server = createHttpServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: socketOrigins,
    methods: ["GET", "POST"],
  },
});

// Initialize services
const notificationService = new NotificationService(io);
FileStorageService.initialize();

// Make services available to the app
app.locals.notificationService = notificationService;

// Override the notification service in the app
app.set('notificationService', notificationService);

export { server };
