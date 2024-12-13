/*eslint-disable*/
// Creating alerts
// Alert type is either 'success' or 'error'

export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  // Alaways hide all alerts before you show any new alert.
  hideAlert();
  // create html markup for the alerts and insert into our html
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  // Alaways hide alert every 5sec after showing it
  window.setTimeout(hideAlert, 5000);
};
