# 📮 Postman Collection Guide

Complete guide for using the Postman collection with the Node.js Express Microservices API.

## 🚀 Quick Start

### 1️⃣ Import Collection & Environment

**Import the Collection:**
1. Open Postman
2. Click **Import** button
3. Select `postman_collection.json`
4. The collection **🚀 Node.js Microservices API** will appear

**Import the Environment:**
1. Click the environment dropdown (top right)
2. Click **Import**
3. Select `postman_environment.json`
4. Select **🏠 Local Development** environment

### 2️⃣ Start Testing

**Basic Flow:**
```
1. 🔐 Authentication → ✅ Register User
2. 🔐 Authentication → 🔑 Login (token auto-saves!)
3. Try any other endpoints!
```

## 📋 Collection Structure

### 🔐 Authentication (7 requests)
- ✅ **Register User** - Create new account
- 🔑 **Login** - Get access token
- 🔄 **Refresh Token** - Renew access token
- 🚪 **Logout** - End session
- ✉️ **Verify Email** - Confirm email address
- 🔐 **Forgot Password** - Request reset
- 🔑 **Reset Password** - Change password

### 👤 User Management (6 requests)
- 📋 **Get My Profile** - View your profile
- ✏️ **Update Profile** - Edit profile info
- 🔒 **Change Password** - Update password
- 👥 **Get All Users** - List users (admin)
- 🔍 **Get User By ID** - View user details (admin)
- ❌ **Delete User** - Remove user (admin)

### 📧 Notifications (5 requests)
- 📬 **Get My Notifications** - View notifications
- ✅ **Mark as Read** - Mark single notification
- ✅ **Mark All as Read** - Clear all notifications
- 🗑️ **Delete Notification** - Remove notification
- 📤 **Send Email** - Send email (admin)

### 🏥 Health & Status (4 requests)
- 💚 **API Gateway Health** - Check gateway
- 🔐 **Auth Service Health** - Check auth service
- 👤 **User Service Health** - Check user service
- 📧 **Notification Service Health** - Check notification service

## 🔧 Environment Variables

### Pre-configured Variables

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:3000` | API Gateway URL |
| `user_name` | `John Doe` | Test user name |
| `user_email` | `john.doe@example.com` | Test user email |
| `user_password` | `SecurePass123!` | Test user password |

### Auto-saved Variables

These are automatically set by the collection scripts:

| Variable | Set By | Description |
|----------|--------|-------------|
| `access_token` | Login request | JWT access token |
| `refresh_token` | Login request | Refresh token |
| `user_id` | Register/Login | Current user ID |
| `user_role` | Login | User role (user/admin) |

## ✨ Smart Features

### 🤖 Auto Token Management
The collection automatically:
- ✅ Saves access token after login
- ✅ Includes token in protected requests
- ✅ Clears token on logout
- ✅ Warns if token is missing

### 📊 Response Logging
Every request logs:
- ✅ Request URL
- ✅ Response status
- ✅ Response time
- ✅ Important data (user info, IDs, etc.)

### 🎯 Smart Scripts

**Pre-request Script:**
```javascript
// Runs before each request
- Logs request URL
- Checks for authentication token
```

**Test Script:**
```javascript
// Runs after each request
- Saves tokens and user data
- Logs response status and time
- Shows helpful console messages
```

## 🎮 Testing Scenarios

### Scenario 1: New User Registration & Login
```
1. 🔐 Auth → ✅ Register User
   → Check Console for User ID
   
2. 🔐 Auth → 🔑 Login
   → Token auto-saves to environment
   
3. 👤 User → 📋 Get My Profile
   → View your profile data
```

### Scenario 2: Password Management
```
1. 🔐 Auth → 🔑 Login
   
2. 👤 User → 🔒 Change Password
   → Update user_password variable
   
3. 🔐 Auth → 🔑 Login (with new password)
   → Test new credentials
```

### Scenario 3: Admin Operations
```
1. Create admin user in database:
   db.users.updateOne(
     {email: "admin@example.com"}, 
     {$set: {role: "admin"}}
   )
   
2. Login as admin
   
3. 👤 User → 👥 Get All Users
   
4. 👤 User → 🔍 Get User By ID
```

### Scenario 4: Health Checks
```
1. 🏥 Health → 💚 API Gateway Health
2. 🏥 Health → 🔐 Auth Service Health
3. 🏥 Health → 👤 User Service Health
4. 🏥 Health → 📧 Notification Service Health
```

## 🎨 Customization

### Change Test Data

Edit environment variables:
```json
{
  "user_name": "Your Name",
  "user_email": "your.email@example.com",
  "user_password": "YourSecurePassword123!"
}
```

### Add Custom Headers

For all requests:
1. Edit Collection
2. Go to **Variables** or **Authorization** tab
3. Add headers

### Modify Scripts

Each request can have custom scripts:
1. Click on request
2. Go to **Tests** tab
3. Add your custom JavaScript

## 💡 Pro Tips

### 🔍 View Console Logs
1. Open Postman Console (`Ctrl+Alt+C` / `Cmd+Alt+C`)
2. See detailed logs for each request
3. Debug issues easily

### 📦 Run Collection
Run all requests automatically:
1. Click collection name
2. Click **Run** button
3. Select requests to run
4. Click **Start Run**

### 🔄 Duplicate Requests
Create variations:
1. Right-click request
2. Select **Duplicate**
3. Rename and modify

### 📊 Export Collection
Share with team:
1. Click collection **...** menu
2. Select **Export**
3. Choose v2.1 format
4. Share JSON file

## 🐛 Troubleshooting

### ❌ 401 Unauthorized
**Solution:** 
- Run **🔑 Login** request first
- Check Console for token status
- Token should auto-save

### ❌ 404 Not Found
**Solution:**
- Verify services are running: `docker-compose ps`
- Check `base_url` in environment
- Ensure API Gateway is healthy

### ❌ Connection Refused
**Solution:**
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### ❌ Token Expired
**Solution:**
- Use **🔄 Refresh Token** request
- Or login again

## 📚 Additional Resources

- **API Documentation**: http://localhost:3000/api-docs
- **RabbitMQ UI**: http://localhost:15672 (admin/admin123)
- **Quick Start Guide**: [QUICKSTART.md](./QUICKSTART.md)
- **Security Guide**: [SECURITY.md](./SECURITY.md)

## 🎯 Next Steps

1. ✅ Import collection and environment
2. ✅ Start services: `docker-compose up -d`
3. ✅ Register and login
4. ✅ Explore all endpoints
5. ✅ Build your application!

**Happy Testing! 🚀**
