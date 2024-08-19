const { Router } = require("express");
const { eventAttendModel, eventModel } = require("../Module/eventModule");
var jwt = require("jsonwebtoken");
const { Token_auth } = require("../Middleware/Token_auth");
const { Role_Auth } = require("../Middleware/Role");
require("dotenv").config();
const eventRouter = Router();

eventRouter.get("/", async (req, res) => {
  const all_events = await eventModel.find();
  res.json({ ...all_events });
  // console.log("working")
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the given details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             name: "John Doe"
 *             email: "johndoe@example.com"
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             example:
 *               id: "123"
 *               name: "John Doe"
 *               email: "johndoe@example.com"
 */

eventRouter.post("/create", Token_auth, Role_Auth(['user']), async (req, res) => {
  let status = 0;
  let message = "All fields Are required eventName,eventDate,token";
  let return_data = [];
  const { eventName, eventDate } = req.body;
  if (eventName && eventDate && eventName != "" && eventDate != "") {
    try {
      message = "Event Created Successfully";
      const new_event = {
        eventId: parseInt(Math.random() * 10000000),
        eventName,
        eventDate,
        eventOwner: req.user.email,
      };
      const data = await eventModel.create(new_event);
      return_data = data;
    } catch (error) {
      message = "Unauthorized token";
    }
  }
  res.json({ status: status, message: message, data: return_data });
});

eventRouter.post("/delete", Token_auth, Role_Auth(['user','admin']), async (req, res) => {
  let status = 0;
  let message = "All fields Are required eventID";
  let return_data = [];
  const { eventId } = req.body;
  if (eventId && eventId != "") {
    console.log(eventId);
    try {
      message =
        "Wrong event ID or Maybe you are not authorized to delete this event";
      const check = await eventModel.findOneAndDelete({
        eventId: eventId,
        eventOwner: req.user.email,
      });
      if (check != null) {
        status = 1;
        message = "Event Deleted";
      }
    } catch (error) {
      message = "Unauthorized token";
    }
  }
  res.json({ status: status, message: message, data: return_data });
});

eventRouter.post("/register", Token_auth, async (req, res) => {
  let status = 0;
  let message = "All fields Are required eventId,token";
  let return_data = [];
  const { eventId } = req.body;
  if (eventId && eventId != "") {
    message = "Event ID not available";
    const event_data = await eventModel.findOne({ eventId: eventId });
    if (event_data != null) {
      try {
        message = "Your are already in this event";
        const check = await eventAttendModel.findOne({
          eventId: eventId,
          attendBy: req.user.email,
        });
        if (check == null) {
          const data = await eventAttendModel.create({
            eventId,
            attendBy: req.user.email,
          });
          return_data = data;
          message = "Event Participated successfully";
          status = 1;
        }
      } catch (error) {
        message = "Unauthorized token";
      }
    }
  }
  res.json({ status: status, message: message, data: return_data });
});

module.exports = { eventRouter };
