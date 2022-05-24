import { ROUTES_PATH } from '../constants/routes.js';
import { formatDate, formatStatus } from '../app/format.js';
import Logout from './Logout.js';

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    // handle icon vertical layout
    const divIcon1 = document.getElementById('layout-icon1');
    const divIcon2 = document.getElementById('layout-icon2');
    if (divIcon1) divIcon1.classList.add('active-icon');
    if (divIcon2) divIcon2.classList.remove('active-icon');

    // Add event on button new bill
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener('click', this.handleClickNewBill);

    // Add event on icon eye
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener('click', () => this.handleClickIconEye(icon));
      });

    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill']);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute('data-bill-url');
    const modaleFile = document.getElementById('modaleFile');
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5);
    const modalBody = modaleFile.querySelector('.modal-body');

    modalBody.innerHTML = `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`;

    $('#modaleFile').modal('show');
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => {
            try {
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status),
              };
            } catch (e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e, 'for', doc);
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status),
              };
            }
          });
          return bills;
        });
    }
  };
}
