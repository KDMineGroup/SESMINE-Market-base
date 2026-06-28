/* ═══════════════════════════════════════════════════════════════════════════
   SESMine Platform — Auth Engine v5.0
   Full RBAC, session management, audit logging, hub access control
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

window.SESAuth = (() => {

  /* ══════════════════════════════════════════════
     CONSTANTS
  ══════════════════════════════════════════════ */
  const KEYS = {
    USERS:        'sesmine_users_v5',
    CURRENT_USER: 'sesmine_current_user_v5',
    SESSIONS:     'sesmine_sessions_v5',
    ADMIN:        'sesmine_admin_v5',
    ADMIN_SESSION:'sesmine_admin_session_v5',
    AUDIT_LOG:    'sesmine_audit_log_v5',
    HUB_REQUESTS: 'sesmine_hub_requests_v5',
    LOCKOUTS:     'sesmine_lockouts_v5',
    SETTINGS:     'sesmine_settings_v5'
  };

  const SYSTEM_CONFIG = {
    version:     '5.0.0',
    environment: 'production',
    hubs:        ['economics','engineering','procurement','safety','sustainability','innovation'],
    auth: {
      maxLoginAttempts:  5,
      lockoutDuration:   15 * 60 * 1000,
      sessionDuration:   24 * 60 * 60 * 1000,
      adminSessionDuration: 8 * 60 * 60 * 1000,
      passwordMinLength: 8
    }
  };

  const ROLE_PERMISSIONS = {
    super_admin: {
      label:    'Super Admin',
      color:    '#D4AF37',
      bgColor:  'rgba(212,175,55,0.1)',
      hubs:     ['all'],
      canApprove: true, canDelete: true, canManageRoles: true,
      canAccessAdmin: true, canViewAnalytics: true, canExport: true
    },
    admin: {
      label:    'Administrator',
      color:    '#F97316',
      bgColor:  'rgba(249,115,22,0.1)',
      hubs:     ['all'],
      canApprove: true, canDelete: true, canManageRoles: false,
      canAccessAdmin: true, canViewAnalytics: true, canExport: true
    },
    engineer: {
      label:    'Engineer',
      color:    '#00D4FF',
      bgColor:  'rgba(0,212,255,0.1)',
      hubs:     ['economics','engineering','procurement','safety','sustainability','innovation'],
      canApprove: false, canDelete: false, canManageRoles: false,
      canAccessAdmin: false, canViewAnalytics: true, canExport: true
    },
    analyst: {
      label:    'Analyst',
      color:    '#A855F7',
      bgColor:  'rgba(168,85,247,0.1)',
      hubs:     ['economics','engineering','procurement','sustainability'],
      canApprove: false, canDelete: false, canManageRoles: false,
      canAccessAdmin: false, canViewAnalytics: true, canExport: false
    },
    viewer: {
      label:    'Viewer',
      color:    '#60A5FA',
      bgColor:  'rgba(96,165,250,0.1)',
      hubs:     ['economics','safety'],
      canApprove: false, canDelete: false, canManageRoles: false,
      canAccessAdmin: false, canViewAnalytics: false, canExport: false
    }
  };

  /* ══════════════════════════════════════════════
     STORAGE LAYER
  ══════════════════════════════════════════════ */
  const Store = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); return true; }
      catch { return false; }
    },
    clear(prefix) {
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix))
        .forEach(k => localStorage.removeItem(k));
    }
  };

  /* ══════════════════════════════════════════════
     CRYPTO UTILITIES
  ══════════════════════════════════════════════ */
  function generateId(prefix = 'usr') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
  }

  function generateToken() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2,'0')).join('');
  }

  function hashPassword(password) {
    // Production: replace with bcrypt via backend
    let hash = 0;
    const salted = `ses_salt_2026_${password}_mine`;
    for (let i = 0; i < salted.length; i++) {
      hash = ((hash << 5) - hash) + salted.charCodeAt(i);
      hash |= 0;
    }
    return `$ses$${Math.abs(hash).toString(36)}$${btoa(salted.slice(0,8))}`;
  }

  function verifyPassword(plain, hashed) {
    return hashPassword(plain) === hashed;
  }

  function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < 8)                errors.push('At least 8 characters required');
    if (!/[A-Z]/.test(password))            errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(password))            errors.push('At least one lowercase letter');
    if (!/\d/.test(password))               errors.push('At least one number');
    if (!/[^A-Za-z0-9]/.test(password))    errors.push('At least one special character');
    return { valid: errors.length === 0, errors };
  }

  /* ══════════════════════════════════════════════
     SEED DATA
  ══════════════════════════════════════════════ */
  function seedData() {
    // Seed admin
    if (!Store.get(KEYS.ADMIN)) {
      Store.set(KEYS.ADMIN, {
        id:        'admin_root',
        name:      'SESMine Administrator',
        email:     'admin@sesmine.com',
        password:  hashPassword('Admin@2026'),
        role:      'super_admin',
        createdAt: new Date().toISOString()
      });
    }

    // Seed demo users
    if (!Store.get(KEYS.USERS)) {
      const demoUsers = [
        {
          id: generateId('usr'), firstName: 'James', lastName: 'Whitfield',
          email: 'james@riotinto.com', password: hashPassword('Demo@2026'),
          company: 'Rio Tinto', jobTitle: 'Chief Engineer',
          role: 'engineer', plan: 'enterprise',
          hubAccess: ['economics','engineering','procurement','safety','sustainability','innovation'],
          approved: true, status: 'active',
          createdAt: new Date(Date.now() - 30*24*60*60*1000).toISOString()
        },
        {
          id: generateId('usr'), firstName: 'Sarah', lastName: 'Chen',
          email: 'sarah@bhp.com', password: hashPassword('Demo@2026'),
          company: 'BHP', jobTitle: 'Head of Sustainability',
          role: 'analyst', plan: 'professional',
          hubAccess: ['economics','sustainability','safety'],
          approved: true, status: 'active',
          createdAt: new Date(Date.now() - 20*24*60*60*1000).toISOString()
        },
        {
          id: generateId('usr'), firstName: 'Marcus', lastName: "O'Brien",
          email: 'marcus@newmont.com', password: hashPassword('Demo@2026'),
          company: 'Newmont', jobTitle: 'VP Operations',
          role: 'engineer', plan: 'professional',
          hubAccess: ['economics','engineering','procurement'],
          approved: true, status: 'active',
          createdAt: new Date(Date.now() - 15*24*60*60*1000).toISOString()
        },
        {
          id: generateId('usr'), firstName: 'Priya', lastName: 'Nair',
          email: 'priya@fortescue.com', password: hashPassword('Demo@2026'),
          company: 'Fortescue', jobTitle: 'Safety Manager',
          role: 'analyst', plan: 'professional',
          hubAccess: ['safety','sustainability'],
          approved: true, status: 'active',
          createdAt: new Date(Date.now() - 10*24*60*60*1000).toISOString()
        },
        {
          id: generateId('usr'), firstName: 'Tom', lastName: 'Hargreaves',
          email: 'tom@glencore.com', password: hashPassword('Demo@2026'),
          company: 'Glencore', jobTitle: 'Mine Planning Engineer',
          role: 'viewer', plan: 'starter',
          hubAccess: ['economics'],
          approved: false, status: 'pending',
          createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString()
        },
        {
          id: generateId('usr'), firstName: 'Amara', lastName: 'Diallo',
          email: 'amara@angloamerican.com', password: hashPassword('Demo@2026'),
          company: 'Anglo American', jobTitle: 'Innovation Director',
          role: 'engineer', plan: 'enterprise',
          hubAccess: ['innovation','economics','engineering'],
          approved: false, status: 'pending',
          createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString()
        }
      ];
      Store.set(KEYS.USERS, demoUsers);
    }

    // Seed hub requests
    if (!Store.get(KEYS.HUB_REQUESTS)) {
      const users = Store.get(KEYS.USERS, []);
      const reqs = [
        {
          id: generateId('req'), userId: users[1]?.id,
          userEmail: users[1]?.email, userName: 'Sarah Chen',
          company: 'BHP', hub: 'innovation',
          reason: 'Evaluating new technology scouting tools for our digital transformation program.',
          status: 'pending', createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString()
        },
        {
          id: generateId('req'), userId: users[2]?.id,
          userEmail: users[2]?.email, userName: 'Marcus O\'Brien',
          company: 'Newmont', hub: 'safety',
          reason: 'Need access to incident tracking for our new safety initiative.',
          status: 'pending', createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString()
        },
        {
          id: generateId('req'), userId: users[3]?.id,
          userEmail: users[3]?.email, userName: 'Priya Nair',
          company: 'Fortescue', hub: 'engineering',
          reason: 'Blast design tools required for upcoming expansion project.',
          status: 'approved', createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString()
        }
      ];
      Store.set(KEYS.HUB_REQUESTS, reqs);
    }

    // Seed audit log
    if (!Store.get(KEYS.AUDIT_LOG)) {
      Store.set(KEYS.AUDIT_LOG, [
        { action:'ADMIN_LOGIN',      userId:'admin_root', timestamp: new Date(Date.now()-1*60*60*1000).toISOString(), details:{ email:'admin@sesmine.com' } },
        { action:'USER_REGISTERED',  userId:'demo',       timestamp: new Date(Date.now()-2*60*60*1000).toISOString(), details:{ email:'amara@angloamerican.com' } },
        { action:'USER_REGISTERED',  userId:'demo',       timestamp: new Date(Date.now()-3*60*60*1000).toISOString(), details:{ email:'tom@glencore.com' } },
        { action:'HUB_REQUEST_SUBMITTED', userId:'demo',  timestamp: new Date(Date.now()-4*60*60*1000).toISOString(), details:{ email:'marcus@newmont.com', hub:'safety' } },
        { action:'USER_LOGIN',       userId:'demo',       timestamp: new Date(Date.now()-5*60*60*1000).toISOString(), details:{ email:'james@riotinto.com' } }
      ]);
    }
  }

  /* ══════════════════════════════════════════════
     AUDIT LOGGING
  ══════════════════════════════════════════════ */
  function auditLog(action, userId, details = {}) {
    const log = Store.get(KEYS.AUDIT_LOG, []);
    log.unshift({
      id:        generateId('log'),
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
      ip:        'client'
    });
    // Keep last 500 entries
    Store.set(KEYS.AUDIT_LOG, log.slice(0, 500));
  }

  /* ══════════════════════════════════════════════
     LOCKOUT MANAGEMENT
  ══════════════════════════════════════════════ */
  function getLockout(email) {
    const lockouts = Store.get(KEYS.LOCKOUTS, {});
    const entry = lockouts[email];
    if (!entry) return null;
    if (Date.now() > entry.until) {
      delete lockouts[email];
      Store.set(KEYS.LOCKOUTS, lockouts);
      return null;
    }
    return entry;
  }

  function recordFailedAttempt(email) {
    const lockouts = Store.get(KEYS.LOCKOUTS, {});
    const entry = lockouts[email] || { attempts: 0, until: 0 };
    entry.attempts++;
    entry.lastAttempt = Date.now();
    if (entry.attempts >= SYSTEM_CONFIG.auth.maxLoginAttempts) {
      entry.until = Date.now() + SYSTEM_CONFIG.auth.lockoutDuration;
    }
    lockouts[email] = entry;
    Store.set(KEYS.LOCKOUTS, lockouts);
    return entry;
  }

  function clearLockout(email) {
    const lockouts = Store.get(KEYS.LOCKOUTS, {});
    delete lockouts[email];
    Store.set(KEYS.LOCKOUTS, lockouts);
  }

  /* ══════════════════════════════════════════════
     USER REGISTRATION
  ══════════════════════════════════════════════ */
  function registerUser(data) {
    const users = Store.get(KEYS.USERS, []);

    // Check duplicate
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Validate password
    const pwCheck = validatePasswordStrength(data.password);
    if (!pwCheck.valid) {
      return { success: false, error: pwCheck.errors[0] };
    }

    // Determine role from plan
    const planRoleMap = { starter: 'viewer', professional: 'analyst', enterprise: 'engineer' };
    const role = planRoleMap[data.plan] || 'viewer';
    const defaultHubs = ROLE_PERMISSIONS[role]?.hubs.includes('all')
      ? SYSTEM_CONFIG.hubs
      : (ROLE_PERMISSIONS[role]?.hubs || ['economics']);

    const user = {
      id:          generateId('usr'),
      firstName:   data.firstName?.trim(),
      lastName:    data.lastName?.trim(),
      email:       data.email.toLowerCase().trim(),
      password:    hashPassword(data.password),
      company:     data.company?.trim() || '',
      jobTitle:    data.jobTitle?.trim() || '',
      department:  data.department || '',
      mineType:    data.mineType || '',
      teamSize:    data.teamSize || '',
      country:     data.country || '',
      primaryUse:  data.primaryUse || '',
      role,
      plan:        data.plan || 'starter',
      hubAccess:   defaultHubs,
      approved:    false,
      status:      'pending',
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
      lastLogin:   null,
      loginCount:  0,
      avatar:      null
    };

    users.push(user);
    Store.set(KEYS.USERS, users);
    auditLog('USER_REGISTERED', user.id, { email: user.email, plan: user.plan, company: user.company });

    return { success: true, user };
  }

  /* ══════════════════════════════════════════════
     USER LOGIN
  ══════════════════════════════════════════════ */
  function loginUser(email, password) {
    const normalEmail = email.toLowerCase().trim();

    // Check lockout
    const lockout = getLockout(normalEmail);
    if (lockout) {
      const remaining = Math.ceil((lockout.until - Date.now()) / 60000);
      return { success: false, error: `Account locked. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`, locked: true };
    }

    const users = Store.get(KEYS.USERS, []);
    const user  = users.find(u => u.email === normalEmail);

    if (!user || !verifyPassword(password, user.password)) {
      const entry = recordFailedAttempt(normalEmail);
      const remaining = SYSTEM_CONFIG.auth.maxLoginAttempts - entry.attempts;
      if (remaining <= 0) {
        return { success: false, error: 'Account locked due to too many failed attempts. Try again in 15 minutes.', locked: true };
      }
      return { success: false, error: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, attemptsLeft: remaining };
    }

    if (!user.approved) {
      return { success: false, error: 'Your account is pending admin approval. You will be notified by email once approved.', pending: true };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended. Please contact support@sesmine.com.', suspended: true };
    }

    // Clear lockout, create session
    clearLockout(normalEmail);
    const token = generateToken();
    const session = {
      userId:    user.id,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SYSTEM_CONFIG.auth.sessionDuration,
      userAgent: navigator.userAgent
    };

    const sessions = Store.get(KEYS.SESSIONS, {});
    sessions[token] = session;
    Store.set(KEYS.SESSIONS, sessions);

    // Update user last login
    const idx = users.findIndex(u => u.id === user.id);
    users[idx].lastLogin  = new Date().toISOString();
    users[idx].loginCount = (users[idx].loginCount || 0) + 1;
    Store.set(KEYS.USERS, users);

    // Store current session
    const sessionUser = { ...user, token };
    delete sessionUser.password;
    Store.set(KEYS.CURRENT_USER, sessionUser);

    auditLog('USER_LOGIN', user.id, { email: user.email, plan: user.plan });
    return { success: true, user: sessionUser, token };
  }

  /* ══════════════════════════════════════════════
     ADMIN LOGIN
  ══════════════════════════════════════════════ */
  function loginAdmin(email, password) {
    const admin = Store.get(KEYS.ADMIN);
    if (!admin) return { success: false, error: 'Admin account not configured.' };

    const normalEmail = email.toLowerCase().trim();
    const lockoutKey  = `admin_${normalEmail}`;
    const lockout     = getLockout(lockoutKey);

    if (lockout) {
      const remaining = Math.ceil((lockout.until - Date.now()) / 60000);
      return { success: false, error: `Admin account locked. Try again in ${remaining} minutes.`, locked: true };
    }

    if (admin.email.toLowerCase() !== normalEmail || !verifyPassword(password, admin.password)) {
      const entry = recordFailedAttempt(lockoutKey);
      const remaining = SYSTEM_CONFIG.auth.maxLoginAttempts - entry.attempts;
      if (remaining <= 0) {
        return { success: false, error: 'Admin account locked due to too many failed attempts.', locked: true };
      }
      return { success: false, error: `Invalid admin credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` };
    }

    clearLockout(lockoutKey);
    const token = generateToken();
    const session = {
      ...admin,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SYSTEM_CONFIG.auth.adminSessionDuration
    };
    delete session.password;
    Store.set(KEYS.ADMIN_SESSION, session);

    auditLog('ADMIN_LOGIN', admin.id, { email: admin.email });
    return { success: true, admin: session };
  }

  /* ══════════════════════════════════════════════
     AUTH GUARDS
  ══════════════════════════════════════════════ */
  function checkAuth(redirectTo = '../auth/login.html') {
    const user = Store.get(KEYS.CURRENT_USER);
    if (!user) { window.location.href = redirectTo; return null; }

    const sessions = Store.get(KEYS.SESSIONS, {});
    const session  = sessions[user.token];
    if (!session || Date.now() > session.expiresAt) {
      logout(false);
      window.location.href = redirectTo;
      return null;
    }
    return user;
  }

  function checkAdminAuth(redirectTo = '../auth/admin-login.html') {
    const session = Store.get(KEYS.ADMIN_SESSION);
    if (!session) { window.location.href = redirectTo; return null; }
    if (Date.now() > session.expiresAt) {
      Store.remove(KEYS.ADMIN_SESSION);
      window.location.href = redirectTo;
      return null;
    }
    return session;
  }

  function checkHubAccess(hubId) {
    const user = Store.get(KEYS.CURRENT_USER);
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role];
    if (!perms) return false;
    if (perms.hubs.includes('all')) return true;
    return (user.hubAccess || []).includes(hubId);
  }

  /* ══════════════════════════════════════════════
     LOGOUT
  ══════════════════════════════════════════════ */
  function logout(isAdmin = false) {
    if (isAdmin) {
      const session = Store.get(KEYS.ADMIN_SESSION);
      if (session) auditLog('ADMIN_LOGOUT', session.id, { email: session.email });
      Store.remove(KEYS.ADMIN_SESSION);
      window.location.href = '../auth/admin-login.html';
    } else {
      const user = Store.get(KEYS.CURRENT_USER);
      if (user) {
        auditLog('USER_LOGOUT', user.id, { email: user.email });
        const sessions = Store.get(KEYS.SESSIONS, {});
        delete sessions[user.token];
        Store.set(KEYS.SESSIONS, sessions);
      }
      Store.remove(KEYS.CURRENT_USER);
      window.location.href = '../auth/login.html';
    }
  }

  /* ══════════════════════════════════════════════
     USER MANAGEMENT
  ══════════════════════════════════════════════ */
  function getAllUsers()       { return Store.get(KEYS.USERS, []); }
  function getUserById(id)    { return getAllUsers().find(u => u.id === id) || null; }
  function getUserByEmail(em) { return getAllUsers().find(u => u.email === em.toLowerCase()) || null; }

  function updateUser(id, updates) {
    const users = getAllUsers();
    const idx   = users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false, error: 'User not found.' };

    // Email uniqueness check
    if (updates.email && updates.email !== users[idx].email) {
      const exists = users.find(u => u.email === updates.email.toLowerCase() && u.id !== id);
      if (exists) return { success: false, error: 'Email already in use.' };
    }

    users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
    Store.set(KEYS.USERS, users);
    auditLog('USER_UPDATED', id, { email: users[idx].email, changes: Object.keys(updates) });

    // Update current session if self
    const current = Store.get(KEYS.CURRENT_USER);
    if (current && current.id === id) {
      const updated = { ...current, ...updates };
      delete updated.password;
      Store.set(KEYS.CURRENT_USER, updated);
    }
    return { success: true, user: users[idx] };
  }

  function approveUser(id) {
    const result = updateUser(id, { approved: true, status: 'active', approvedAt: new Date().toISOString() });
    if (result.success) auditLog('USER_APPROVED', id, { email: result.user.email });
    return result;
  }

  function suspendUser(id) {
    const result = updateUser(id, { status: 'suspended' });
    if (result.success) auditLog('USER_SUSPENDED', id, { email: result.user.email });
    return result;
  }

  function deleteUser(id) {
    const users = getAllUsers();
    const user  = users.find(u => u.id === id);
    if (!user) return { success: false, error: 'User not found.' };
    Store.set(KEYS.USERS, users.filter(u => u.id !== id));
    auditLog('USER_DELETED', id, { email: user.email });
    return { success: true };
  }

  function updateUserRole(id, newRole) {
    if (!ROLE_PERMISSIONS[newRole]) return { success: false, error: 'Invalid role.' };
    const result = updateUser(id, { role: newRole });
    if (result.success) auditLog('USER_ROLE_CHANGED', id, { newRole });
    return result;
  }

  function updateUserHubAccess(id, hubs) {
    const result = updateUser(id, { hubAccess: hubs });
    if (result.success) auditLog('USER_HUB_ACCESS_CHANGED', id, { hubs });
    return result;
  }

  /* ══════════════════════════════════════════════
     HUB REQUESTS
  ══════════════════════════════════════════════ */
  function submitHubRequest(userId, hubId, reason) {
    const user = getUserById(userId);
    if (!user) return { success: false, error: 'User not found.' };

    const requests = Store.get(KEYS.HUB_REQUESTS, []);
    const existing = requests.find(r => r.userId === userId && r.hub === hubId && r.status === 'pending');
    if (existing) return { success: false, error: 'A pending request for this hub already exists.' };

    const req = {
      id:        generateId('req'),
      userId,
      userEmail: user.email,
      userName:  `${user.firstName} ${user.lastName}`,
      company:   user.company,
      hub:       hubId,
      reason:    reason || 'Access required for work purposes.',
      status:    'pending',
      createdAt: new Date().toISOString()
    };
    requests.unshift(req);
    Store.set(KEYS.HUB_REQUESTS, requests);
    auditLog('HUB_REQUEST_SUBMITTED', userId, { hub: hubId, email: user.email });
    return { success: true, request: req };
  }

  function getHubRequests(status = null) {
    const all = Store.get(KEYS.HUB_REQUESTS, []);
    return status ? all.filter(r => r.status === status) : all;
  }

  function approveHubRequest(requestId) {
    const requests = Store.get(KEYS.HUB_REQUESTS, []);
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) return { success: false, error: 'Request not found.' };

    const req = requests[idx];
    req.status     = 'approved';
    req.approvedAt = new Date().toISOString();
    Store.set(KEYS.HUB_REQUESTS, requests);

    // Grant hub access
    const user = getUserById(req.userId);
    if (user) {
      const hubs = [...new Set([...(user.hubAccess || []), req.hub])];
      updateUserHubAccess(req.userId, hubs);
    }
    auditLog('HUB_REQUEST_APPROVED', req.userId, { hub: req.hub, email: req.userEmail });
    return { success: true };
  }

  function rejectHubRequest(requestId, reason = '') {
    const requests = Store.get(KEYS.HUB_REQUESTS, []);
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) return { success: false, error: 'Request not found.' };

    requests[idx].status     = 'rejected';
    requests[idx].rejectedAt = new Date().toISOString();
    requests[idx].rejectReason = reason;
    Store.set(KEYS.HUB_REQUESTS, requests);
    auditLog('HUB_REQUEST_REJECTED', requests[idx].userId, { hub: requests[idx].hub });
    return { success: true };
  }

  /* ══════════════════════════════════════════════
     DASHBOARD STATS
  ══════════════════════════════════════════════ */
  function getDashboardStats() {
    const users    = getAllUsers();
    const requests = Store.get(KEYS.HUB_REQUESTS, []);
    const now      = Date.now();
    const day      = 24*60*60*1000;
    const week     = 7*day;
    const month    = 30*day;

    const byRole = {};
    users.forEach(u => { byRole[u.role] = (byRole[u.role] || 0) + 1; });

    return {
      users: {
        total:    users.length,
        active:   users.filter(u => u.approved && u.status === 'active').length,
        pending:  users.filter(u => !u.approved).length,
        suspended:users.filter(u => u.status === 'suspended').length,
        newToday: users.filter(u => now - new Date(u.createdAt).getTime() < day).length,
        newWeek:  users.filter(u => now - new Date(u.createdAt).getTime() < week).length,
        newMonth: users.filter(u => now - new Date(u.createdAt).getTime() < month).length
      },
      requests: {
        total:    requests.length,
        pending:  requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length
      },
      byRole,
      auditLog: Store.get(KEYS.AUDIT_LOG, []).length
    };
  }

  /* ══════════════════════════════════════════════
     UI HELPERS
  ══════════════════════════════════════════════ */
  function getRoleInfo(role) {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
  }

  function getRoleBadge(role) {
    const info = getRoleInfo(role);
    return `<span style="
      display:inline-flex;align-items:center;gap:4px;
      padding:3px 9px;border-radius:9999px;
      font-size:0.68rem;font-weight:700;
      background:${info.bgColor};
      border:1px solid ${info.color}33;
      color:${info.color};
    ">${info.label}</span>`;
  }

  function getStatusBadge(status) {
    const map = {
      active:    { bg:'rgba(34,197,94,0.1)',  border:'rgba(34,197,94,0.2)',  color:'#4ADE80', label:'Active',    dot:'#22C55E' },
      pending:   { bg:'rgba(249,115,22,0.08)',border:'rgba(249,115,22,0.2)', color:'#FDB07A', label:'Pending',   dot:'#F97316' },
      suspended: { bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.2)',  color:'#FCA5A5', label:'Suspended', dot:'#EF4444' }
    };
    const s = map[status] || map.pending;
    return `<span style="
      display:inline-flex;align-items:center;gap:5px;
      padding:3px 9px;border-radius:9999px;
      font-size:0.68rem;font-weight    ;700;
      background:${s.bg};
      border:1px solid ${s.border};
      color:${s.color};
    ">
      <span style="width:5px;height:5px;border-radius:50%;background:${s.dot};flex-shrink:0;"></span>
      ${s.label}
    </span>`;
  }

  function renderUserAvatar(user, size = 36) {
    const initials = `${(user.firstName||'?')[0]}${(user.lastName||'?')[0]}`.toUpperCase();
    const colors   = ['#2563EB','#7C3AED','#DC2626','#D97706','#059669','#0891B2','#9333EA','#DB2777'];
    const color    = colors[(user.firstName?.charCodeAt(0) || 0) % colors.length];
    if (user.avatar) {
      return `<img src="${user.avatar}" alt="${initials}"
        style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;
               border:2px solid rgba(0,212,255,0.2);flex-shrink:0;" />`;
    }
    return `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(size*0.35)}px;font-weight:800;
      color:#fff;flex-shrink:0;letter-spacing:-0.02em;
      border:2px solid rgba(255,255,255,0.1);
    ">${initials}</div>`;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7)   return `${days}d ago`;
    return d.toLocaleDateString('en-AU', { day:'2-digit', month:'short', year:'numeric' });
  }

  /* ══════════════════════════════════════════════
     HUB PAGE PROTECTION
  ══════════════════════════════════════════════ */
  function protectHubPage(hubId) {
    const user = checkAuth();
    if (!user) return null;
    if (!checkHubAccess(hubId)) {
      window.location.href = `../hub-preview.html?hub=${hubId}`;
      return null;
    }
    return user;
  }

  /* ══════════════════════════════════════════════
     INITIALISE
  ══════════════════════════════════════════════ */
  seedData();

  /* ══════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════ */
  return {
    // Constants
    KEYS, SYSTEM_CONFIG, ROLE_PERMISSIONS,

    // Storage
    Store,

    // Crypto
    hashPassword, verifyPassword, validatePasswordStrength, generateId, generateToken,

    // Auth
    registerUser, loginUser, loginAdmin,
    checkAuth, checkAdminAuth, checkHubAccess,
    logout, protectHubPage,

    // Users
    getAllUsers, getUserById, getUserByEmail,
    updateUser, approveUser, suspendUser, deleteUser,
    updateUserRole, updateUserHubAccess,

    // Hub requests
    submitHubRequest, getHubRequests, approveHubRequest, rejectHubRequest,

    // Stats
    getDashboardStats,

    // UI helpers
    getRoleInfo, getRoleBadge, getStatusBadge,
    renderUserAvatar, formatDate,

    // Config passthrough
    SYSTEM_CONFIG
  };

})();

