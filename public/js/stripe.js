/*eslint-disable*/
import axios from "axios";

import { showAlert } from "./alerts";

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      "pk_test_51NypSSDvqYqofGaekxKcpLqv2e4RxitiOJF8Fh3aPYNlOK0M31FYrBLCcf7ldmBx5Z5mXdXFXYjUs4sYnZ7PXSy900pesrPfkE"
    );

    // 1). Get checkout session fron stripe API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2). Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
