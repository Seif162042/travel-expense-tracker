/**
 * Trip Participants Tests
 * Tests for the many-to-many relationship functionality
 * 
 * Save this as: backend/tests/tripParticipants.test.js
 * 
 * Run with: npm test
 */

import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/db.js';

describe('Trip Participants API (Many-to-Many Relationship)', () => {
  let ownerToken;
  let memberToken;
  let ownerId;
  let memberId;
  let tripId;

  // Setup test users and trip before all tests
  beforeAll(async () => {
    // Clean up any existing test data
    await pool.query("DELETE FROM users WHERE email LIKE '%test-participant%'");

    // Create owner user
    const ownerRes = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Trip Owner',
        email: 'owner-test-participant@example.com',
        password: 'password123'
      });
    
    ownerToken = ownerRes.body.token;
    ownerId = ownerRes.body.user.id;

    // Create member user
    const memberRes = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Trip Member',
        email: 'member-test-participant@example.com',
        password: 'password123'
      });
    
    memberToken = memberRes.body.token;
    memberId = memberRes.body.user.id;

    // Create a trip
    const tripRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Test Trip for Participants',
        destination: 'Paris',
        start_date: '2025-06-01',
        end_date: '2025-06-10',
        budget: 2000
      });
    
    tripId = tripRes.body.id;
  });

  // Clean up after all tests
  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email LIKE '%test-participant%'");
    await pool.end();
  });

  describe('POST /api/trips/:tripId/participants', () => {
    it('should add a participant to a trip', async () => {
      const response = await request(app)
        .post(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          user_email: 'member-test-participant@example.com',
          role: 'editor'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('editor');
      expect(response.body.data.trip_id).toBe(tripId);
      expect(response.body.data.user_id).toBe(memberId);
    });

    it('should reject adding participant with invalid role', async () => {
      await request(app)
        .post(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          user_email: 'member-test-participant@example.com',
          role: 'invalid_role'
        })
        .expect(400);
    });

    it('should reject duplicate participant', async () => {
      await request(app)
        .post(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          user_email: 'member-test-participant@example.com',
          role: 'member'
        })
        .expect(400);
    });

    it('should reject non-owner adding participants', async () => {
      await request(app)
        .post(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          user_email: 'another@example.com',
          role: 'member'
        })
        .expect(403);
    });

    it('should reject adding non-existent user', async () => {
      await request(app)
        .post(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          user_email: 'nonexistent@example.com',
          role: 'member'
        })
        .expect(404);
    });
  });

  describe('GET /api/trips/:tripId/participants', () => {
    it('should get all participants for a trip', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Should include user info
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('email');
      expect(response.body.data[0]).toHaveProperty('role');
    });

    it('should allow participants to view other participants', async () => {
      await request(app)
        .get(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);
    });

    it('should reject non-participants', async () => {
      // Create another user
      const nonParticipantRes = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Non Participant',
          email: 'non-participant-test@example.com',
          password: 'password123'
        });

      await request(app)
        .get(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${nonParticipantRes.body.token}`)
        .expect(403);
    });
  });

  describe('GET /api/user/participating-trips', () => {
    it('should get all trips user participates in', async () => {
      const response = await request(app)
        .get('/api/user/participating-trips')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should include the trip we added the user to
      const foundTrip = response.body.data.find(t => t.id === tripId);
      expect(foundTrip).toBeDefined();
      expect(foundTrip.role).toBe('editor');
    });

    it('should include role information for each trip', async () => {
      const response = await request(app)
        .get('/api/user/participating-trips')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('role');
      expect(response.body.data[0]).toHaveProperty('joined_at');
    });
  });

  describe('DELETE /api/trips/:tripId/participants/:userId', () => {
    it('should allow owner to remove participant', async () => {
      // First add a new participant to remove
      const newUserRes = await request(app)
        .post('/api/users/register')
        .send({
          name: 'To Remove',
          email: 'toremove-test@example.com',
          password: 'password123'
        });

      await request(app)
        .post(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          user_email: 'toremove-test@example.com',
          role: 'viewer'
        });

      // Now remove them
      await request(app)
        .delete(`/api/trips/${tripId}/participants/${newUserRes.body.user.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
    });

    it('should allow user to remove themselves', async () => {
      // Member removes themselves
      await request(app)
        .delete(`/api/trips/${tripId}/participants/${memberId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);
    });

    it('should not allow removing last owner', async () => {
      await request(app)
        .delete(`/api/trips/${tripId}/participants/${ownerId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/trips/:tripId/participants/:userId', () => {
    beforeEach(async () => {
      // Re-add member for update tests
      await request(app)
        .post(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          user_email: 'member-test-participant@example.com',
          role: 'member'
        });
    });

    it('should allow owner to update participant role', async () => {
      const response = await request(app)
        .patch(`/api/trips/${tripId}/participants/${memberId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          role: 'editor'
        })
        .expect(200);

      expect(response.body.data.role).toBe('editor');
    });

    it('should reject non-owner updating roles', async () => {
      await request(app)
        .patch(`/api/trips/${tripId}/participants/${memberId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          role: 'owner'
        })
        .expect(403);
    });
  });

  // Test Many-to-Many relationship queries
  describe('Many-to-Many Relationship Verification', () => {
    it('should demonstrate one user in multiple trips', async () => {
      // Create another trip
      const trip2Res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Second Trip',
          destination: 'London',
          start_date: '2025-07-01',
          end_date: '2025-07-10',
          budget: 3000
        });

      // Add member to second trip
      await request(app)
        .post(`/api/trips/${trip2Res.body.id}/participants`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          user_email: 'member-test-participant@example.com',
          role: 'member'
        });

      // Member should now be in 2 trips
      const response = await request(app)
        .get('/api/user/participating-trips')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should demonstrate one trip with multiple users', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/participants`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      // Should have at least owner and member
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
