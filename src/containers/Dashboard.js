import { formatDate } from '../app/format.js';
import DashboardFormUI from '../views/DashboardFormUI.js';
import BigBilledIcon from '../assets/svg/big_billed.js';
import { ROUTES_PATH } from '../constants/routes.js';
import USERS_TEST from '../constants/usersTest.js';
import Logout from './Logout.js';

export const filteredBills = (data, status) => {
  return data && data.length
    ? data.filter((bill) => {
        let selectCondition;

        // in jest environment
        if (typeof jest !== 'undefined') {
          selectCondition = bill.status === status;
        } else {
          /* istanbul ignore next */
          // in prod environment
          const userEmail = JSON.parse(localStorage.getItem('user')).email;
          selectCondition =
            bill.status === status &&
            ![...USERS_TEST, userEmail].includes(bill.email);
        }

        return selectCondition;
      })
    : [];
};

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0];
  const firstName = firstAndLastNames.includes('.')
    ? firstAndLastNames.split('.')[0]
    : '';
  const lastName = firstAndLastNames.includes('.')
    ? firstAndLastNames.split('.')[1]
    : firstAndLastNames;

  return `
    <div class='bill-card' id='open-bill${
      bill.id
    }' data-edit='false' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `;
};

export const cards = (bills) => {
  return bills && bills.length ? bills.map((bill) => card(bill)).join('') : '';
};

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return 'pending';
    case 2:
      return 'accepted';
    case 3:
      return 'refused';
  }
};

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    // Add evnt on arrows
    const arrows = document.querySelectorAll('.arrow-icon');
    arrows.forEach((arrow, i) => {
      arrow.addEventListener('click', () =>
        this.handleShowTickets(bills, i + 1)
      );
    });

    new Logout({ localStorage, onNavigate });
  }

  handleShowTickets(bills, index) {
    const billsContainer = document.getElementById(
      `status-bills-container${index}`
    );
    const arrow = document.getElementById(`arrow-icon${index}`);

    if (billsContainer.getAttribute('data-visible') === 'false') {
      billsContainer.setAttribute('data-visible', 'true');
      arrow.style.transform = 'rotate(0deg)';
      billsContainer.innerHTML = cards(filteredBills(bills, getStatus(index)));

      // Add event on the bill just display
      filteredBills(bills, getStatus(index)).forEach((bill) => {
        const openBill = document.getElementById(`open-bill${bill.id}`);
        openBill.addEventListener('click', () => {
          this.handleEditTicket(bill, bills);
        });
      });
    } else {
      billsContainer.setAttribute('data-visible', 'false');
      arrow.style.transform = 'rotate(90deg)';
      billsContainer.innerHTML = '';
    }
  }

  handleEditTicket(bill, bills) {
    const openBill = document.getElementById(`open-bill${bill.id}`);
    const rightContainer = document
      .querySelector('.dashboard-right-container')
      .querySelector('div');
    const verticalNavBar = document.querySelector('.vertical-navbar');

    if (openBill.getAttribute('data-edit') === 'false') {
      bills.forEach((b) => {
        const openB = document.getElementById(`open-bill${b.id}`);
        if (openB) {
          openB.setAttribute('data-edit', 'false');
          openB.style.background = '#0D5AE5';
        }
      });
      openBill.setAttribute('data-edit', 'true');
      openBill.style.background = '#2A2B35';
      rightContainer.innerHTML = DashboardFormUI(bill);
      verticalNavBar.style.height = '150vh';

      // Add event for the icon eye, accept and refuse button in the rightContainer just fill
      document
        .getElementById('icon-eye-d')
        .addEventListener('click', () => this.handleClickIconEye());
      document
        .getElementById('btn-accept-bill')
        .addEventListener('click', () => this.handleAcceptSubmit(bill));
      document
        .getElementById('btn-refuse-bill')
        .addEventListener('click', () => this.handleAcceptSubmit(bill));
    } else {
      openBill.setAttribute('data-edit', 'false');
      openBill.style.background = '#0D5AE5';
      rightContainer.innerHTML = `<div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>`;
      verticalNavBar.style.height = '150vh';
    }
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr('data-bill-url');
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8);
    $('#modaleFileAdmin1')
      .find('.modal-body')
      .html(
        `<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`
      );
    if (typeof $('#modaleFileAdmin1').modal === 'function')
      $('#modaleFileAdmin1').modal('show');
  };

  handleAcceptSubmit = (bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH['Dashboard']);
  };

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH['Dashboard']);
  };

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => ({
            id: doc.id,
            ...doc,
            date: doc.date,
            status: doc.status,
          }));
          return bills;
        })
        .catch((error) => {
          throw error;
        });
    }
  };

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then((bill) => bill)
        .catch(console.log);
    }
  };
}
