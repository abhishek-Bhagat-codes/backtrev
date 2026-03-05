const { SOSNotification } = require("../models/sosNotification.js");
const { User } = require("../models/user.js");

module.exports = {
  // ------------------------------------
  //  FETCH ALL SOS NOTIFICATIONS (FOR USER)
  // ------------------------------------
  fetchAllSOSNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const sosNotifications = await SOSNotification.find({ userId })
        .sort({ createdAt: -1 })
        .populate('userId', 'fullName');
      
      // Map to add fullName to each notification
      const notificationsWithFullName = sosNotifications.map(notification => {
        const notificationObject = notification.toObject();
        notificationObject.fullName = notification.userId?.fullName || null;
        return notificationObject;
      });

      return res.json({ sosNotifications: notificationsWithFullName });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  FETCH ALL SOS NOTIFICATIONS (ALL USERS - WITH LIMIT)
  // ------------------------------------
  fetchAllSOSNotificationsWithLimit: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10; // Default limit is 10
      const status = req.query.status; // Optional filter by status

      // Build query
      const query = {};
      if (status) {
        query.status = status;
      }

      // Fetch SOS notifications with limit
      const sosNotifications = await SOSNotification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("userId", "fullName email phoneNumber");

      // Map to add fullName to each notification
      const notificationsWithFullName = sosNotifications.map((notification) => {
        const notificationObject = notification.toObject();
        notificationObject.fullName = notification.userId?.fullName || null;
        notificationObject.userEmail = notification.userId?.email || null;
        notificationObject.userPhone = notification.userId?.phoneNumber || null;
        return notificationObject;
      });

      // Get total count for reference
      const totalCount = await SOSNotification.countDocuments(query);

      return res.json({
        sosNotifications: notificationsWithFullName,
        limit: limit,
        total: totalCount,
        returned: notificationsWithFullName.length,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  FETCH SINGLE SOS NOTIFICATION
  // ------------------------------------
  fetchSOSNotification: async (req, res) => {
    try {
      const userId = req.user.id;
      const { sosNotificationId } = req.params;

      const sosNotification = await SOSNotification.findOne({
        _id: sosNotificationId,
        userId
      }).populate('userId', 'fullName');
      
      if (!sosNotification) {
        return res.status(404).json({ message: "SOS notification not found" });
      }

      // Add fullName to notification object
      const notificationObject = sosNotification.toObject();
      notificationObject.fullName = sosNotification.userId?.fullName || null;

      return res.json({ sosNotification: notificationObject });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  UPDATE SOS NOTIFICATION STATUS
  // ------------------------------------
  updateSOSStatus: async (req, res) => {
    try {
      const { sosNotificationId } = req.params;
      const { status } = req.body;

      const validStatuses = ['active', 'acknowledged', 'dispatched'];
      const backendStatus = frontendToBackend[status] || status;

      if (!validStatuses.includes(backendStatus)) {
        return res.status(400).json({ message: 'Invalid status. Use: pending, acknowledged, or resolved' });
      }

      const sosNotification = await SOSNotification.findById(sosNotificationId);
      if (!sosNotification) {
        return res.status(404).json({ message: 'SOS notification not found' });
      }

      const update = { status: backendStatus }; 
      if (backendStatus === 'acknowledged') update.acknowledgedAt = new Date();
      if (backendStatus === 'dispatched') update.resolvedAt = new Date();

      const updated = await SOSNotification.findByIdAndUpdate(sosNotificationId, update, { new: true });

      return res.json({
        message: 'Status updated successfully',
        sosNotification: updated
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};



