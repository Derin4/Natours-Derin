const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

router.get("/tour/:slug", authController.isLoggedIn, viewController.getTour);

router.get("/login", authController.isLoggedIn, viewController.getLoginForm);

// Creating a route for the acoount page
router.get("/me", authController.protect, viewController.getAccount);

// Creating all the tours a customer has booked in customer's account
router.get("/my-tours", authController.protect, viewController.getMyTours);

// Creating a route for submiting a form to update user data for name and email.
router.post(
  "/submit-user-data",
  authController.protect,
  viewController.updateUserData
);

module.exports = router;
