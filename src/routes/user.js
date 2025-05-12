const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/Auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const allowedFields =
  "firstName lastName email photoUrl about skills age gender";

// 1. Received Requests
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", allowedFields);

    if (connectionRequests.length === 0) {
      throw new Error("No Connection Requests Found!!");
    }

    const data = connectionRequests.map((e) => ({
      requestId: e._id,
      fromUserId: e.fromUserId,
      status: e.status,
    }));

    res.json({ message: "Received Connection Requests", data: data });
  } catch (err) {
    res.send("ERROR: " + err.message);
  }
});

// 2. Connections (Accepted)
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", allowedFields)
      .populate("toUserId", allowedFields);

    if (connections.length === 0) {
      return res.send("No Connections Found!!"); // Added return
    }

    const data = connections.map((e) => {
      const connectedUser =
        e.fromUserId._id.toString() === loggedInUser._id.toString()
          ? e.toUserId
          : e.fromUserId;

      return {
        requestId: e._id,
        ...connectedUser.toObject(),
      };
    });

    res.json({ message: "Your Connections", data: data });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();

    connectionRequest.forEach((key) => {
      hideUsersFromFeed.add(key.fromUserId.toString());
      hideUsersFromFeed.add(key.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(hideUsersFromFeed) },
        },
        {
          _id: { $ne: loggedInUser._id },
        },
      ],
    })
      .select(allowedFields)
      .skip(skip)
      .limit(limit);
    if (users.length === 0) {
      return res.send("No Data Found");
    }

    res.send(users);
  } catch (err) {
    res.send("ERROR : " + err.message);
  }
});

module.exports = userRouter;
