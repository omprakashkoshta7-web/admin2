# Admin Portal - Staff Portal Integration Guide

## ✅ Current Status: PROPERLY WIRED

Admin portal is already properly integrated with the staff backend APIs.

## 🔐 Authentication Flow

### 1. Login Endpoint
```
POST /auth/login
Body: { email, password }
Response: { user, token }
```

**Frontend Implementation:**
- File: `admin-main/admin/src/api/auth.ts`
- Function: `loginAdmin(email, password)`
- Stores: `admin_token` and `admin_user` in localStorage

### 2. Session Management
```
GET /staff/auth/session - Get current session
GET /staff/auth/sessions - Get all active sessions
DELETE /staff/auth/session/:id - Kill specific session
```

**Frontend Implementation:**
- File: `admin-main/admin/src/pages/auth/SessionPage.tsx`
- Functions: `getAdminSession()`, `getAdminSessions()`, `killAdminSession()`

### 3. Profile Management
```
GET /staff/auth/profile - Get profile
PATCH /staff/auth/profile - Update profile
POST /staff/auth/change-password - Change password
POST /staff/auth/deactivate - Deactivate account
```

**Frontend Implementation:**
- File: `admin-main/admin/src/pages/auth/ProfilePage.tsx`

## 📊 Staff Portal Features Available

### 1. Dashboard
- **Endpoint**: `GET /staff/dashboard?role=ops`
- **Frontend**: `admin-main/admin/src/pages/dashboard/DashboardPage.tsx`

### 2. Orders Management
- **Endpoints**:
  - `GET /staff/orders` - Order queue
  - `GET /staff/orders/:id` - Order detail
  - `POST /staff/orders/:id/reassign-vendor` - Reassign vendor
  - `POST /staff/orders/:id/clarification` - Raise clarification
- **Frontend**: `admin-main/admin/src/pages/orders/`

### 3. Support Tickets
- **Endpoints**:
  - `GET /staff/tickets` - Get tickets
  - `GET /staff/tickets/:id` - Ticket detail
  - `POST /staff/tickets/:id/reply` - Reply to ticket
  - `POST /staff/tickets/:id/close` - Close ticket
  - `POST /staff/tickets/:id/escalate` - Escalate ticket
- **Frontend**: `admin-main/admin/src/pages/support/`

### 4. Finance Operations
- **Endpoints**:
  - `GET /staff/refunds` - Get refunds
  - `POST /staff/refunds/:id/approve` - Approve refund
  - `POST /staff/wallet/credit` - Credit wallet
  - `POST /staff/wallet/debit` - Debit wallet
  - `GET /staff/wallet/ledger` - Wallet ledger
- **Frontend**: `admin-main/admin/src/pages/finance/`

### 5. Marketing (Coupons)
- **Endpoints**:
  - `GET /staff/campaigns` - Get campaigns
  - `POST /staff/coupons` - Create coupon
  - `POST /staff/targeting` - Target users
  - `GET /staff/analytics/reports` - Analytics reports
- **Frontend**: `admin-main/admin/src/pages/growth/GrowthPage.tsx`

### 6. RBAC (Role-Based Access Control)
- **Endpoints**:
  - `GET /staff/roles/:userId` - Get user role
  - `GET /staff/permissions/:role` - Get permissions
  - `POST /staff/roles/assign` - Assign role (Admin only)
- **Frontend**: Permission checks in components

### 7. Audit & Logging
- **Endpoints**:
  - `GET /staff/audit/logs` - Audit logs
  - `GET /staff/activity` - Activity logs
  - `GET /staff/performance` - Performance metrics
- **Frontend**: Can be added to reports page

## 🔑 Role-Based Permissions

### SuperAdmin
- Full access to all modules
- Can create/manage staff
- Can assign roles

### Admin
- Orders, Vendors, Customers (full access)
- Finance (read only)
- Reports (read only)

### Marketing Staff
- **Growth Module**: Read + Write ✅
- **Coupons Module**: Read + Write ✅ (Can CREATE coupons)
- **Reports**: Read only
- **Customers**: Read only

### Operations Staff
- Orders, Vendors, Delivery, SLA (full access)

### Support Staff
- Support tickets, Orders (read), Customers (read)

### Finance Staff
- Finance, Refunds, Ledger (full access)
- Reports (read only)

## 🚀 How Marketing Staff Creates Coupons

### Step 1: Admin Creates Marketing Staff
```
1. Login as SuperAdmin/Admin
2. Navigate to /staff
3. Click "Add Staff" button
4. Fill form:
   - Name: "Rahul Kumar"
   - Email: "rahul@speedcopy.com"
   - Phone: "+91 9876543210"
   - Password: "SecurePass123"
   - Team: "Marketing"
   - Role: "Marketing"
5. Submit
```

### Step 2: Marketing Staff Login
```
1. Go to /login
2. Email: rahul@speedcopy.com
3. Password: SecurePass123
4. Login successful
```

### Step 3: Create Coupon
```
1. Navigate to /growth
2. See "Coupons" section
3. Click "Create Coupon"
4. Fill coupon details
5. Submit
6. Backend: POST /staff/coupons
```

## 📝 API Client Configuration

**Base URL**: Set in `.env`
```
VITE_API_BASE_URL=http://localhost:5001/api
```

**Auth Token**: Automatically added to all requests
```javascript
// admin-main/admin/src/api/apiClient.ts
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## ✅ Verification Checklist

- [x] Login endpoint connected (`/auth/login`)
- [x] Session management working (`/staff/auth/session`)
- [x] Profile management working (`/staff/auth/profile`)
- [x] Staff CRUD operations (`/admin/staff`)
- [x] Role-based permissions defined
- [x] Marketing role has coupon create permission
- [x] All staff portal routes available
- [x] Token stored in localStorage
- [x] Auth token sent with all requests
- [x] Logout clears token and user data

## 🔧 Environment Variables

```env
# Admin Portal
VITE_API_BASE_URL=http://localhost:5001/api
VITE_AUTH_MODE=backend
VITE_FIREBASE_API_KEY=your_key (optional)
```

## 📚 Key Files

### Frontend
- `admin-main/admin/src/App.tsx` - Main routing
- `admin-main/admin/src/api/auth.ts` - Auth API
- `admin-main/admin/src/api/admin.ts` - Admin APIs
- `admin-main/admin/src/api/apiClient.ts` - HTTP client
- `admin-main/admin/src/components/AdminLogin.tsx` - Login UI
- `admin-main/admin/src/pages/staff/StaffListPage.tsx` - Staff management

### Backend
- `Backend/services/admin-service/src/routes/staff.routes.js` - Staff routes
- `Backend/services/admin-service/src/controllers/staff.controller.js` - Staff controller
- `Backend/services/admin-service/src/controllers/staff-api.controller.js` - Staff API controller

## 🎯 Conclusion

Admin portal is **FULLY WIRED** with staff backend APIs. All authentication, session management, and role-based access control is properly implemented. Marketing staff can create coupons through the Growth page once their account is created with the Marketing role.
