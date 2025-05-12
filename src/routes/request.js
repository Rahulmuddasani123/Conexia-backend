const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/Auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const isToUserIdValid = mongoose.Types.ObjectId.isValid(toUserId);
      if (!isToUserIdValid) {
        throw new Error("Invalid User Id : " + toUserId);
      }

      const allowedStatus = ["interested", "ignored"];

      if (!allowedStatus.includes(status)) {
        throw new Error("Invaid Status Type : " + status);
      }

      const isUserExists = await User.findById(toUserId);

      if (!isUserExists) {
        throw new Error("User does Not Exist");
      }

      const isConnectionRequestExists = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (isConnectionRequestExists) {
        res.json({
          message: "Connection Request Already Exists: ",
          Request: isConnectionRequestExists,
        });
      } else {
        const ConnectionRequestData = new ConnectionRequest({
          fromUserId,
          toUserId,
          status,
        });

        const data = await ConnectionRequestData.save();

        res.json({ message: "Connection Request Sent", data: data });
      }
    } catch (err) {
      res.send("ERROR : " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const isrequestIdValid = mongoose.Types.ObjectId.isValid(requestId);
      if (!isrequestIdValid) {
        throw new Error("Invalid Request Id ");
      }

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid Status Type" + status);
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        throw new Error("Connection Request Not Found");
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({
        message: `Connection Request  ${status} successfully`,
        Data: data,
      });
    } catch (err) {
      res.send("ERROR : " + err.message);
    }
  }
);

requestRouter.post("/removeRequest/:RequestId", userAuth, async (req, res) => {
  try {
    const requestId = req.params.RequestId;
    const deleted = await ConnectionRequest.findByIdAndDelete(requestId);
   
    console.log(deleted);
    res.send("Data Removed");
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = requestRouter;
