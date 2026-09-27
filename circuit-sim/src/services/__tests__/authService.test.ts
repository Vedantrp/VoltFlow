import { describe, it, expect, beforeEach } from 'vitest';
import { authService, safeStorage } from '../authService';

describe('AuthService & User Data Isolation Tests', () => {
  beforeEach(() => {
    safeStorage.clear();
    authService.signOut();
  });

  it('rejects invalid email formats', async () => {
    await expect(authService.signUp('not-an-email', 'password123', 'password123')).rejects.toThrow(
      'Please enter a valid email address.'
    );
  });

  it('rejects short passwords and mismatched confirmations', async () => {
    await expect(authService.signUp('test@voltflow.io', '123', '123')).rejects.toThrow(
      'Password must be at least 6 characters.'
    );
    await expect(authService.signUp('test@voltflow.io', 'password123', 'mismatch')).rejects.toThrow(
      'Passwords do not match.'
    );
  });

  it('allows sign up, logs in, and rejects duplicate registration', async () => {
    const user = await authService.signUp('alice@voltflow.io', 'securePass123', 'securePass123', 'Alice Dev');
    expect(user.email).toBe('alice@voltflow.io');
    expect(user.displayName).toBe('Alice Dev');

    // Duplicate registration rejected
    await expect(authService.signUp('alice@voltflow.io', 'securePass123', 'securePass123')).rejects.toThrow(
      'An account with this email address already exists'
    );
  });

  it('handles sign in authentication and incorrect passwords', async () => {
    await authService.signUp('bob@voltflow.io', 'passBob123', 'passBob123');
    authService.signOut();

    await expect(authService.signIn('bob@voltflow.io', 'wrongPass')).rejects.toThrow('Incorrect password');
    await expect(authService.signIn('nonexistent@voltflow.io', 'passBob123')).rejects.toThrow('No account found');

    const bob = await authService.signIn('bob@voltflow.io', 'passBob123');
    expect(bob.email).toBe('bob@voltflow.io');
  });

  it('handles Google authentication with session persistence', async () => {
    const googleUser = await authService.signInWithGoogle('carol@google.com', 'Carol Google');
    expect(googleUser.authProvider).toBe('google');
    expect(googleUser.email).toBe('carol@google.com');
    expect(authService.getCurrentUser()?.id).toBe(googleUser.id);
  });

  it('handles Phone OTP authentication with verification and rate limiting', async () => {
    const phone = '+15550199';
    const otpRes = await authService.sendPhoneOtp(phone);
    expect(otpRes.success).toBe(true);

    // Immediate repeat send triggers rate limit cooldown
    await expect(authService.sendPhoneOtp(phone)).rejects.toThrow('Please wait');

    // Invalid OTP rejected
    await expect(authService.verifyPhoneOtp(phone, '000000')).rejects.toThrow('Invalid verification code');

    // Valid demo code (123456 or matching code)
    const phoneUser = await authService.verifyPhoneOtp(phone, '123456');
    expect(phoneUser.phoneNumber).toBe(phone);
    expect(phoneUser.authProvider).toBe('phone');
  });

  it('strictly enforces Multi-Tenant User Isolation: User B cannot access or mutate User A’s projects', async () => {
    // 1. Create User A and save project
    const userA = await authService.signUp('usera@voltflow.io', 'passUserA123', 'passUserA123', 'User A');
    const projectA = authService.saveProject(userA.id, {
      name: 'User A Secret Radar Circuit',
      components: [],
      wires: [],
      code: 'void setup() {} void loop() {}',
    });
    expect(projectA.name).toBe('User A Secret Radar Circuit');

    // Verify User A can list their project
    const userAProjects = authService.getProjects(userA.id);
    expect(userAProjects).toHaveLength(1);
    expect(userAProjects[0].id).toBe(projectA.id);

    // 2. Sign out User A, Sign in User B
    authService.signOut();
    await authService.signUp('userb@voltflow.io', 'passUserB123', 'passUserB123', 'User B');

    // 3. User B attempts unauthorized access to User A's data (IDOR / BOLA attack test)
    expect(() => authService.getProjects(userA.id)).toThrow('Authorization Denied');
    expect(() =>
      authService.saveProject(userA.id, {
        id: projectA.id,
        name: 'Hacked Project',
        components: [],
        wires: [],
        code: '',
      })
    ).toThrow('Authorization Denied');
    expect(() => authService.deleteProject(userA.id, projectA.id)).toThrow('Authorization Denied');
    expect(() => authService.renameProject(userA.id, projectA.id, 'Renamed By Hacker')).toThrow(
      'Authorization Denied'
    );
    expect(() => authService.duplicateProject(userA.id, projectA.id)).toThrow('Authorization Denied');

    // 4. Verify User A's project remains unmodified and intact
    authService.signOut();
    await authService.signIn('usera@voltflow.io', 'passUserA123');
    const userAProjectsAfter = authService.getProjects(userA.id);
    expect(userAProjectsAfter[0].name).toBe('User A Secret Radar Circuit');
  });

  it('enforces Admin Routing RBAC and blocks unauthorized route traversal (/user1, /user2)', async () => {
    // Regular user registration
    const regularUser = await authService.signUp('user1@voltflow.io', 'password123', 'password123', 'User 1');
    expect(authService.canAccessUserRoute('user1')).toBe(false); // Can only access own ID or admin
    expect(authService.canAccessUserRoute(regularUser.id)).toBe(true);
    expect(() => authService.getAllUsersForAdmin()).toThrow('Admin privileges required');

    authService.signOut();
    const adminUser = await authService.signUp('admin@voltflow.io', 'adminPass123', 'adminPass123', 'System Admin');
    expect(adminUser.role).toBe('admin');

    expect(authService.canAccessUserRoute('user1')).toBe(true);
    expect(authService.canAccessUserRoute('user2')).toBe(true);

    const allUsers = authService.getAllUsersForAdmin();
    expect(allUsers.length).toBeGreaterThanOrEqual(2);
  });

  it('prevents an already signed-in user from signing up again under another account without signing out', async () => {
    await authService.signUp('active@voltflow.io', 'password123', 'password123', 'Active User');
    expect(authService.getCurrentUser()?.email).toBe('active@voltflow.io');

    // Attempting to sign up again while logged in should be blocked
    await expect(
      authService.signUp('newuser@voltflow.io', 'password123', 'password123', 'New User')
    ).rejects.toThrow('You are already signed in as Active User');

    // After signing out, sign up succeeds
    authService.signOut();
    const newUser = await authService.signUp('newuser@voltflow.io', 'password123', 'password123', 'New User');
    expect(newUser.email).toBe('newuser@voltflow.io');
  });

  it('updates existing project when saving with the same name or ID instead of creating duplicates', async () => {
    const user = await authService.signUp('dedup@voltflow.io', 'password123', 'password123', 'Dedup User');
    
    // Save initial project
    const p1 = authService.saveProject(user.id, {
      name: 'Arduino Uno LED Blink',
      components: [{ id: 'uno-1', type: 'arduino-uno', name: 'Uno', x: 0, y: 0, rotation: 0, props: {} }],
      wires: [],
      code: '// initial code',
    });
    expect(p1.name).toBe('Arduino Uno LED Blink');

    let projects = authService.getProjects(user.id);
    expect(projects).toHaveLength(1);

    // Save again with same name but without passing project.id
    const p2 = authService.saveProject(user.id, {
      name: 'Arduino Uno LED Blink',
      components: [{ id: 'uno-1', type: 'arduino-uno', name: 'Uno', x: 10, y: 10, rotation: 0, props: {} }],
      wires: [],
      code: '// updated code',
    });

    // Should update existing project instead of creating a new duplicate card
    expect(p2.id).toBe(p1.id);
    projects = authService.getProjects(user.id);
    expect(projects).toHaveLength(1);
    expect(projects[0].code).toBe('// updated code');

    // Save project with a new distinct name
    const p3 = authService.saveProject(user.id, {
      name: '555 Timer Oscillation',
      components: [],
      wires: [],
      code: '',
    });
    projects = authService.getProjects(user.id);
    expect(projects).toHaveLength(2);
    expect(p3.id).not.toBe(p1.id);
  });
});
