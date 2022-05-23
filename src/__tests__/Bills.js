/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import { screen } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

import router from '../app/Router.js';
import { formatDate } from '../app/format.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
    });

    afterEach(() => {
      document.body.removeChild(document.getElementById('root'));
    });

    test('Then bill icon in vertical layout should be highlighted', () => {
      window.onNavigate(ROUTES_PATH['Bills']);

      const windowIcon = screen.getByTestId('icon-window');

      expect(windowIcon).toHaveClass('active-icon');
    });

    test('Then bills should be ordered from earliest to latest', () => {
      // Copy bills for not modify the original array when formatDate is call
      const billsCopyForDom = JSON.parse(JSON.stringify(bills));
      const billsCopy = JSON.parse(JSON.stringify(bills));

      const root = document.getElementById('root');
      root.innerHTML = BillsUI({ data: billsCopyForDom });

      const antiChrono = (a, b) => (a.date < b.date ? 1 : -1);
      const billsSorted = [...billsCopy].sort(antiChrono);

      billsSorted.forEach((bill) => (bill.date = formatDate(bill.date)));

      const datesDOM = screen.getAllByTestId('bill-date');

      datesDOM.forEach((dateDOM, i) => {
        expect(dateDOM.textContent).toEqual(billsSorted[i].date);
      });
    });
  });
});
