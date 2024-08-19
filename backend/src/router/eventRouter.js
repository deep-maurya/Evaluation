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
 * /event/:
 *   get:
 *     summary: Retrieve all events
 *     description: Fetch a list of all events from the database.
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: A list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   eventId:
 *                     type: integer
 *                   eventName:
 *                     type: string
 *                   eventDate:
 *                     type: string
 *                   eventOwner:
 *                     type: string
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
/**
 * @swagger
 * /event/create:
 *   post:
 *     summary: Create a new event
 *     description: Creates a new event with the provided details.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventName:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

eventRouter.post("/delete", Token_auth, async (req, res) => {
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
/**
 * @swagger
 * /event/delete:
 *   post:
 *     summary: Delete an event
 *     description: Deletes an event by ID, and requires the user to be the owner of the event.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

eventRouter.post("/delete_by_admin", Token_auth, Role_Auth(['admin']), async (req, res) => {
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
        eventId: eventId
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
/**
 * @swagger
 * /event/delete_by_admin:
 *   post:
 *     summary: Admin delete an event
 *     description: Deletes an event by ID with admin privileges.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event deleted successfully by admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

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
/**
 * @swagger
 * /event/register:
 *   post:
 *     summary: Register for an event
 *     description: Allows a user to register for an event using the event ID.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully registered for the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

module.exports = { eventRouter };
