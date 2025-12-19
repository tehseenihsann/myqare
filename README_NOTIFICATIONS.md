# Free & Secure Notifications with Server-Sent Events (SSE)

This application uses **Server-Sent Events (SSE)** for real-time notifications - a free, secure, and native browser technology that doesn't require any third-party services like Pusher.

## Why SSE Instead of Pusher?

✅ **100% Free** - No subscription fees or usage limits  
✅ **Secure** - Uses standard HTTP/HTTPS with your existing authentication  
✅ **No Third-Party Dependencies** - Everything runs on your infrastructure  
✅ **Native Browser Support** - Works in all modern browsers  
✅ **Simple Implementation** - Easy to understand and maintain  
✅ **Automatic Reconnection** - Built-in reconnection handling  

## How It Works

1. **Client Connection**: The React hook (`useNotifications`) connects to `/api/notifications/stream` using the browser's native `EventSource` API
2. **Server Stream**: Next.js API route maintains a persistent HTTP connection and streams events
3. **Database Storage**: Notifications are stored in PostgreSQL via Prisma
4. **Real-time Broadcast**: When a notification is created, it's immediately sent to connected clients

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────▶│  Next.js API │────────▶│  PostgreSQL │
│  (Browser)  │  SSE    │  Route       │  Prisma │  Database   │
└─────────────┘ Stream  └──────────────┘         └─────────────┘
                             │
                             │ Broadcast
                             ▼
                      ┌──────────────┐
                      │  Connected   │
                      │   Clients    │
                      └──────────────┘
```

## Usage

### Creating Notifications

```typescript
import { createAndBroadcastNotification } from '@/lib/notifications-server';

// Create and broadcast a notification
await createAndBroadcastNotification({
  userId: 'user-id',
  type: 'BOOKING_CREATED',
  title: 'New Booking',
  message: 'You have a new booking request',
  link: '/admin/bookings/123',
});
```

### Using in Components

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(n => (
        <div key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <button onClick={() => markAsRead(n.id)}>Mark as Read</button>
        </div>
      ))}
    </div>
  );
}
```

## API Routes

- `GET /api/notifications/stream` - SSE endpoint for real-time notifications
- `GET /api/admin/notifications` - Get all notifications (with filters)
- `PATCH /api/notifications/[id]/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read

## Security

- ✅ **Authentication Required**: All endpoints require NextAuth session
- ✅ **User Isolation**: Users can only access their own notifications
- ✅ **HTTPS Support**: Works with HTTPS for secure connections
- ✅ **Session Validation**: Server validates user session before streaming

## Limitations

- **One-way Communication**: SSE only sends data from server to client (not bidirectional)
- **Connection Limits**: Each user maintains one persistent connection (browsers typically allow 6 per domain)
- **Not for Chat**: For bidirectional real-time (like chat), consider WebSockets instead

## Performance

SSE is very efficient:
- Low overhead compared to polling
- Automatic reconnection on connection loss
- Efficient for one-way notification streams
- Scales well with connection pooling

## Migration from Pusher

If you were previously using Pusher, this SSE implementation provides:
- Same functionality (real-time notifications)
- Better security (no third-party dependency)
- Lower latency (direct connection)
- No costs

The notification format and API remain similar, making migration straightforward.

