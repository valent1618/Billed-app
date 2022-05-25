import { ROUTES_PATH } from '../constants/routes.js';
import Logout from './Logout.js';

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener('change', this.handleChangeFile);
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener('submit', this.handleSubmit);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();

    const correctExtension = ['jpg', 'jpeg', 'png'];

    const file = e.target;
    const fileName = file.files[0]?.name;
    const extension = file.files[0]?.type.split('/')[1]
      ? file.files[0].type.split('/')[1]
      : file.files[0].type;

    if (!correctExtension.includes(extension)) {
      file.setCustomValidity('Use only jpg, jpeg or png');
      file.setAttribute('data-valid', 'false');
    } else {
      file.setCustomValidity('');
      file.setAttribute('data-valid', 'true');
      this.fileName = fileName;
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();

    // Test manualy the inputs of the form
    const testDate = /\d{4}-\d{2}-\d{2}$/.test(
      document.querySelector('input[data-testid="datepicker"]').value
    );
    const testAmount = /\d/.test(
      document.querySelector('input[data-testid="amount"]').value
    );
    const testPct = /\d/.test(
      document.querySelector('input[data-testid="pct"]').value
    );
    const testFile =
      document
        .querySelector('input[data-testid="file"]')
        .getAttribute('data-valid') === 'true';

    if (testDate && testAmount && testPct && testFile) {
      e.target.setAttribute('data-valid', 'true');

      const formData = new FormData();
      const file = this.document.querySelector(`input[data-testid="file"]`)
        .files[0];
      const email = JSON.parse(localStorage.getItem('user')).email;
      formData.append('file', file);
      formData.append('email', email);

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          },
        })
        .then(({ fileUrl, key }) => {
          this.fileUrl = fileUrl;
          this.billId = key;

          const bill = {
            email,
            type: e.target.querySelector(`select[data-testid="expense-type"]`)
              .value,
            name: e.target.querySelector(`input[data-testid="expense-name"]`)
              .value,
            amount: parseInt(
              e.target.querySelector(`input[data-testid="amount"]`).value
            ),
            date: e.target.querySelector(`input[data-testid="datepicker"]`)
              .value,
            vat: e.target.querySelector(`input[data-testid="vat"]`).value,
            pct:
              parseInt(
                e.target.querySelector(`input[data-testid="pct"]`).value
              ) || 20,
            commentary: e.target.querySelector(
              `textarea[data-testid="commentary"]`
            ).value,
            fileUrl: this.fileUrl,
            fileName: this.fileName,
            status: 'pending',
          };
          this.updateBill(bill);
          this.onNavigate(ROUTES_PATH['Bills']);
        })
        .catch((error) => console.error(error));
    } else {
      e.target.setAttribute('data-valid', 'false');
    }
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']);
        })
        .catch((error) => console.error(error));
    }
  };
}
