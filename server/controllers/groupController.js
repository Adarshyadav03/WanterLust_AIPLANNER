const Group = require('../models/Group');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const GroupInvitation = require('../models/GroupInvitation');
const User = require('../models/User');
const mongoose = require('mongoose');
const { getFallbackStatus } = require('../config/db');

const memoryGroups = [
  {
    _id: 'group_1',
    name: 'Goa December Travelers',
    destination: 'Goa',
    groupImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    owner: { _id: '65f8a09b1234567890abcdef', name: 'Rohan Mehta', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
    members: [
      { _id: '65f8a09b1234567890abcdef', name: 'Rohan Mehta', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
      { _id: '65f8a09b1234567890abcde2', name: 'Ananya Roy', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
      { _id: '65f8a09b1234567890abcde3', name: 'Karan Kapoor', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80' },
    ],
    pendingInvites: [],
    inviteCode: 'GOA8X29P',
    inviteEnabled: true,
    privacy: 'private',
    travelDates: '20 Dec - 25 Dec',
    budget: 20000,
    maxMembers: 10,
    description: 'Looking for travelers interested in beaches, food and photography.',
  },
  {
    _id: 'group_2',
    name: 'Manali Snow Expedition',
    destination: 'Manali',
    groupImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    owner: { _id: '65f8a09b1234567890abcde2', name: 'Ananya Roy', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
    members: [
      { _id: '65f8a09b1234567890abcde2', name: 'Ananya Roy', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
    ],
    pendingInvites: [],
    inviteCode: 'MANALI8X2',
    inviteEnabled: true,
    privacy: 'private',
    travelDates: '05 Jan - 10 Jan',
    budget: 22000,
    maxMembers: 8,
    description: 'Chasing snowstorms, Solang skiing, and hot chocolate in Old Manali cafes.',
  },
];

const memoryGroupInvitations = [];

const getSocketIO = () => global.io;
const getOnlineUsersMap = () => global.onlineUsers || new Map();

const getGroups = async (req, res) => {
  if (getFallbackStatus()) {
    return res.json(memoryGroups);
  }

  try {
    const groups = await Group.find()
      .populate('members', 'name avatar email location travelStyle targetDestination')
      .populate('owner', 'name avatar email')
      .populate('pendingInvites', 'name avatar email');
    if (groups.length === 0) return res.json(memoryGroups);
    res.json(groups);
  } catch (error) {
    res.json(memoryGroups);
  }
};

const getGroupById = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const found = memoryGroups.find((g) => g._id === id || g.inviteCode === id);
    return res.json(found || memoryGroups[0]);
  }

  try {
    const group = await Group.findById(id)
      .populate('members', 'name avatar email location travelStyle bio targetDestination')
      .populate('owner', 'name avatar email')
      .populate('pendingInvites', 'name avatar email');
    if (group) return res.json(group);
    res.status(404).json({ message: 'Group not found' });
  } catch (error) {
    const found = memoryGroups.find((g) => g._id === id || g.inviteCode === id);
    res.json(found || memoryGroups[0]);
  }
};

const createGroup = async (req, res) => {
  const { name, destination, travelDates, budget, description, maxMembers, groupImage, privacy } = req.body;

  if (!name || !destination) {
    return res.status(400).json({ message: 'Group name and destination are required' });
  }

  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  const destCode = destination.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  const inviteCode = `${destCode}${randomCode}`;

  const userId = req.user ? req.user._id : '65f8a09b1234567890abcdef';

  const groupData = {
    name,
    destination,
    owner: userId,
    members: [userId],
    pendingInvites: [],
    inviteCode,
    inviteEnabled: true,
    privacy: privacy || 'private',
    travelDates: travelDates || '20 Dec - 25 Dec',
    budget: Number(budget) || 20000,
    maxMembers: Number(maxMembers) || 10,
    groupImage: groupImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: description || 'Group trip planned on WanderLust',
  };

  if (getFallbackStatus()) {
    const newGroup = {
      _id: 'group_' + Date.now(),
      ...groupData,
      owner: { _id: userId, name: req.user?.name || 'Rohan Mehta', avatar: req.user?.avatar || '' },
      members: [{ _id: userId, name: req.user?.name || 'Rohan Mehta', avatar: req.user?.avatar || '' }],
    };
    memoryGroups.unshift(newGroup);
    return res.status(201).json(newGroup);
  }

  try {
    const group = await Group.create(groupData);
    const populated = await Group.findById(group._id)
      .populate('members', 'name avatar email')
      .populate('owner', 'name avatar email');
    res.status(201).json(populated);
  } catch (error) {
    const newGroup = { _id: 'group_' + Date.now(), ...groupData };
    memoryGroups.unshift(newGroup);
    res.status(201).json(newGroup);
  }
};

const inviteBuddyToGroup = async (req, res) => {
  const { groupId, userId: paramUserId } = req.params;
  const { userIds, targetUserId, userId: bodyUserId } = req.body;
  const inviterId = req.user._id;

  let targets = [];
  if (Array.isArray(userIds) && userIds.length > 0) {
    targets = userIds;
  } else if (paramUserId) {
    targets = [paramUserId];
  } else if (targetUserId) {
    targets = [targetUserId];
  } else if (bodyUserId) {
    targets = [bodyUserId];
  }

  if (targets.length === 0) {
    return res.status(400).json({ success: false, message: 'Target user ID(s) required' });
  }

  if (getFallbackStatus()) {
    const group = memoryGroups.find((g) => g._id === groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    targets.forEach((tId) => {
      if (!group.pendingInvites.some((id) => (id._id || id) === tId)) {
        group.pendingInvites.push(tId);
      }
      memoryGroupInvitations.push({
        _id: 'inv_' + Date.now() + '_' + tId,
        group: groupId,
        invitedBy: inviterId,
        invitedUser: tId,
        status: 'pending',
        createdAt: new Date(),
      });

      emitSocketNotification(tId, 'group_invitation', {
        groupId: group._id,
        groupName: group.name,
        invitedBy: { id: inviterId, name: req.user.name, avatar: req.user.avatar },
        message: `${req.user.name} invited you to join ${group.name}`,
      });
    });

    return res.json({ success: true, message: 'Invitations sent successfully', group });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Verify inviter is member or owner
    const isMember = group.members.some((m) => m.toString() === inviterId.toString());
    const isOwner = group.owner.toString() === inviterId.toString();
    if (!isMember && !isOwner) {
      return res.status(403).json({ success: false, message: 'Only group members can invite travel buddies' });
    }

    const createdInvitations = [];

    for (const targetId of targets) {
      // 1. Check if target user is already member
      if (group.members.some((m) => m.toString() === targetId.toString())) continue;

      // 2. Check if target user already has pending invite
      const existingInvite = await GroupInvitation.findOne({
        group: groupId,
        invitedUser: targetId,
        status: 'pending',
      });
      if (existingInvite) continue;

      // 3. Create GroupInvitation record
      const invitation = await GroupInvitation.create({
        group: groupId,
        invitedBy: inviterId,
        invitedUser: targetId,
        status: 'pending',
      });

      createdInvitations.push(invitation);

      if (!group.pendingInvites.includes(targetId)) {
        group.pendingInvites.push(targetId);
      }

      // 4. Create Notification
      const notif = await Notification.create({
        user: targetId,
        sender: inviterId,
        type: 'GROUP_INVITE',
        message: `${req.user.name} invited you to join ${group.name}`,
        referenceId: group._id.toString(),
      });

      // 5. Emit real-time Socket.IO notification
      emitSocketNotification(targetId, 'group_invitation', {
        groupId: group._id,
        groupName: group.name,
        invitedBy: { id: req.user._id, name: req.user.name, avatar: req.user.avatar },
        message: notif.message,
      });

      emitSocketNotification(targetId, 'notification', {
        _id: notif._id,
        sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
        type: 'GROUP_INVITE',
        message: notif.message,
        referenceId: group._id,
        createdAt: notif.createdAt,
      });
    }

    await group.save();

    res.json({
      success: true,
      message: 'Invitations sent successfully',
      invitationsCount: createdInvitations.length,
      group,
    });
  } catch (error) {
    console.error('Invite buddy error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const respondGroupInvite = async (req, res) => {
  const { groupId } = req.params;
  const { action } = req.body;
  const userId = req.user._id;

  if (getFallbackStatus()) {
    const group = memoryGroups.find((g) => g._id === groupId);
    if (group) {
      group.pendingInvites = group.pendingInvites.filter((id) => (id._id || id) !== userId.toString());
      if (action === 'accept') {
        const userObj = { _id: userId, name: req.user.name, avatar: req.user.avatar };
        group.members.push(userObj);

        const io = getSocketIO();
        if (io) {
          io.to(`group:${groupId}`).emit('group_member_joined', {
            groupId,
            user: userObj,
          });
        }
      }
      return res.json({ success: true, message: action === 'accept' ? 'You joined the group' : 'Invitation declined', group });
    }
    return res.status(404).json({ success: false, message: 'Group not found' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const invitation = await GroupInvitation.findOne({
      group: groupId,
      invitedUser: userId,
      status: 'pending',
    });

    if (action === 'accept') {
      if (group.members.length >= group.maxMembers) {
        return res.status(400).json({ success: false, message: 'Group has reached maximum member capacity' });
      }

      if (!group.members.includes(userId)) {
        group.members.push(userId);
      }

      if (invitation) {
        invitation.status = 'accepted';
        await invitation.save();
      }

      try {
        await Notification.create({
          user: group.owner,
          sender: userId,
          type: 'GROUP_INVITE_ACCEPTED',
          message: `${req.user.name} accepted your invitation to join ${group.name}`,
          referenceId: group._id.toString(),
        });
      } catch (e) {
        console.warn('Notif error:', e.message);
      }

      const io = getSocketIO();
      if (io) {
        io.to(`group:${groupId}`).emit('group_member_joined', {
          groupId: group._id.toString(),
          user: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
        });
      }
    } else {
      if (invitation) {
        invitation.status = 'rejected';
        await invitation.save();
      }
    }

    group.pendingInvites = group.pendingInvites.filter((id) => id.toString() !== userId.toString());
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members', 'name avatar email location travelStyle targetDestination')
      .populate('owner', 'name avatar email');

    res.json({
      success: true,
      message: action === 'accept' ? 'You joined the group' : 'Invitation declined',
      group: updatedGroup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGroupByInviteCode = async (req, res) => {
  const { inviteCode } = req.params;

  if (!inviteCode) {
    return res.status(400).json({ success: false, message: 'Invite code is required' });
  }

  if (getFallbackStatus()) {
    const group = memoryGroups.find((g) => g.inviteCode.toUpperCase() === inviteCode.trim().toUpperCase());
    if (group) {
      return res.json({
        success: true,
        group: {
          _id: group._id,
          name: group.name,
          destination: group.destination,
          groupImage: group.groupImage,
          description: group.description,
          travelDates: group.travelDates,
          budget: group.budget,
          memberCount: group.members?.length || 1,
          maxMembers: group.maxMembers,
          inviteCode: group.inviteCode,
          inviteEnabled: group.inviteEnabled !== false,
          owner: group.owner || { name: 'Rohan Mehta', avatar: '' },
        },
      });
    }
    return res.status(404).json({ success: false, message: 'Group invitation link is invalid or expired' });
  }

  try {
    const group = await Group.findOne({ inviteCode: inviteCode.trim().toUpperCase() }).populate('owner', 'name avatar email');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group invitation link is invalid or expired' });
    }

    if (group.inviteEnabled === false) {
      return res.status(400).json({ success: false, message: 'This group invitation link is no longer active.' });
    }

    res.json({
      success: true,
      group: {
        _id: group._id,
        name: group.name,
        destination: group.destination,
        groupImage: group.groupImage,
        description: group.description,
        travelDates: group.travelDates,
        budget: group.budget,
        memberCount: group.members?.length || 0,
        maxMembers: group.maxMembers,
        inviteCode: group.inviteCode,
        inviteEnabled: group.inviteEnabled,
        owner: group.owner ? { name: group.owner.name, avatar: group.owner.avatar } : { name: 'Group Host' },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const joinGroupByCode = async (req, res) => {
  const { inviteCode } = req.params.inviteCode ? req.params : req.body;
  const userId = req.user._id;

  if (!inviteCode) {
    return res.status(400).json({ success: false, message: 'Invite code is required' });
  }

  if (getFallbackStatus()) {
    const group = memoryGroups.find((g) => g.inviteCode.toUpperCase() === inviteCode.trim().toUpperCase());
    if (group) {
      if (group.inviteEnabled === false) {
        return res.status(400).json({ success: false, message: 'This group invitation link is no longer active.' });
      }

      if (!group.members.some((m) => (m._id || m) === userId.toString())) {
        const userObj = { _id: userId, name: req.user.name, avatar: req.user.avatar };
        group.members.push(userObj);

        const io = getSocketIO();
        if (io) {
          io.to(`group:${group._id}`).emit('group_member_joined', {
            groupId: group._id,
            user: userObj,
          });
        }
      }
      return res.json({ success: true, message: 'You joined the group', groupId: group._id, group });
    }
    return res.status(404).json({ success: false, message: 'Invalid invitation code' });
  }

  try {
    const group = await Group.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!group) return res.status(404).json({ success: false, message: 'Invalid invitation code' });

    if (group.inviteEnabled === false) {
      return res.status(400).json({ success: false, message: 'This group invitation link is no longer active.' });
    }

    if (group.members.includes(userId)) {
      return res.json({ success: true, message: 'You are already a member of this group', groupId: group._id, group });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ success: false, message: 'Group has reached maximum member capacity' });
    }

    group.members.push(userId);
    group.pendingInvites = group.pendingInvites.filter((id) => id.toString() !== userId.toString());
    await group.save();

    const updated = await Group.findById(group._id)
      .populate('members', 'name avatar email location travelStyle targetDestination')
      .populate('owner', 'name avatar email');

    const io = getSocketIO();
    if (io) {
      io.to(`group:${group._id.toString()}`).emit('group_member_joined', {
        groupId: group._id.toString(),
        user: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
      });
    }

    res.json({ success: true, message: 'You joined the group', groupId: group._id, group: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateInviteCode = async (req, res) => {
  const { groupId } = req.params;
  const currentUserId = req.user._id;

  if (getFallbackStatus()) {
    const group = memoryGroups.find((g) => g._id === groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    return res.json({
      success: true,
      inviteCode: group.inviteCode || 'MANALI8X2',
      inviteUrl: `${req.protocol}://${req.get('host')}/groups/join/${group.inviteCode || 'MANALI8X2'}`,
    });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    if (!group.inviteCode) {
      const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const destCode = group.destination.replace(/\s+/g, '').substring(0, 4).toUpperCase();
      group.inviteCode = `${destCode}${randomCode}`;
      await group.save();
    }

    res.json({
      success: true,
      inviteCode: group.inviteCode,
      inviteUrl: `${req.protocol}://${req.get('host')}/groups/join/${group.inviteCode}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleInviteLink = async (req, res) => {
  const { groupId } = req.params;

  if (getFallbackStatus()) {
    const group = memoryGroups.find((g) => g._id === groupId);
    if (group) {
      group.inviteEnabled = !group.inviteEnabled;
      return res.json({ success: true, inviteEnabled: group.inviteEnabled });
    }
    return res.status(404).json({ success: false, message: 'Group not found' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    group.inviteEnabled = !group.inviteEnabled;
    await group.save();

    res.json({ success: true, inviteEnabled: group.inviteEnabled });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInvitableBuddies = async (req, res) => {
  const { groupId } = req.params;
  const currentUserId = req.user._id;

  if (getFallbackStatus()) {
    const group = memoryGroups.find((g) => g._id === groupId);
    const memberIds = new Set((group?.members || []).map((m) => (m._id || m).toString()));
    const pendingIds = new Set((group?.pendingInvites || []).map((p) => (p._id || p).toString()));

    const invitable = [
      { _id: '65f8a09b1234567890abcde2', name: 'Ananya Roy', location: 'Kolkata', targetDestination: 'Goa', travelStyle: 'Relaxed' },
      { _id: '65f8a09b1234567890abcde3', name: 'Karan Kapoor', location: 'Delhi', targetDestination: 'Rajasthan', travelStyle: 'Heritage' },
      { _id: '65f8a09b1234567890abcde4', name: 'Pooja Hegde', location: 'Bengaluru', targetDestination: 'Kerala', travelStyle: 'Nature' },
    ].filter((b) => !memberIds.has(b._id) && !pendingIds.has(b._id));

    return res.json({ success: true, buddies: invitable });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const memberIds = new Set(group.members.map((m) => m.toString()));

    const connections = await Connection.find({
      $or: [{ requester: currentUserId }, { receiver: currentUserId }],
      status: 'accepted',
    }).populate('requester receiver', 'name email avatar location bio travelStyle targetDestination');

    const allBuddies = connections.map((c) => {
      return c.requester._id.toString() === currentUserId.toString() ? c.receiver : c.requester;
    });

    const pendingInvites = await GroupInvitation.find({
      group: groupId,
      status: 'pending',
    });
    const pendingUserIds = new Set(pendingInvites.map((i) => i.invitedUser.toString()));

    const invitableBuddies = allBuddies.filter((b) => {
      if (!b) return false;
      const bId = b._id.toString();
      return !memberIds.has(bId) && !pendingUserIds.has(bId);
    });

    res.json({ success: true, buddies: invitableBuddies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyGroupInvitations = async (req, res) => {
  const currentUserId = req.user._id;

  if (getFallbackStatus()) {
    const myInvites = memoryGroupInvitations.filter(
      (inv) => inv.invitedUser.toString() === currentUserId.toString() && inv.status === 'pending'
    );
    return res.json({ success: true, invitations: myInvites });
  }

  try {
    const invitations = await GroupInvitation.find({
      invitedUser: currentUserId,
      status: 'pending',
    })
      .populate('group', 'name destination groupImage travelDates budget inviteCode')
      .populate('invitedBy', 'name avatar email');

    res.json({ success: true, invitations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGroupMembers = async (req, res) => {
  const { groupId } = req.params;

  if (getFallbackStatus()) {
    const group = memoryGroups.find((g) => g._id === groupId);
    return res.json({ success: true, members: group?.members || [] });
  }

  try {
    const group = await Group.findById(groupId).populate(
      'members',
      'name avatar email location travelStyle bio targetDestination'
    );
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, members: group.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const emitSocketNotification = (targetUserId, event, data) => {
  const io = getSocketIO();
  const onlineUsers = getOnlineUsersMap();
  if (io && targetUserId) {
    const socketId = onlineUsers.get(targetUserId.toString());
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  inviteBuddyToGroup,
  respondGroupInvite,
  joinGroupByCode,
  joinGroup: joinGroupByCode,
  getGroupByInviteCode,
  generateInviteCode,
  toggleInviteLink,
  getInvitableBuddies,
  getMyGroupInvitations,
  getGroupMembers,
  memoryGroups,
  memoryGroupInvitations,
};
