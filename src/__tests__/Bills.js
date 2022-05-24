/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import { fireEvent, screen } from '@testing-library/dom';

import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';

import Bills from '../containers/Bills.js';

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
      root.innerHTML = BillsUI({ data: bills });

      const onNavigate = (pathname) => {
        root.innerHTML = ROUTES({ pathname });
      };

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('Then bill icon in vertical layout should be highlighted', () => {
      const windowIcon = screen.getByTestId('icon-window');

      expect(windowIcon).toHaveClass('active-icon');
    });

    test('Then bills should be ordered from earliest to latest', () => {
      // Copy bills for not modify the original array when formatDate is call
      const billsCopy = JSON.parse(JSON.stringify(bills));

      const antiChrono = (a, b) => (a.date < b.date ? 1 : -1);
      const billsSorted = [...billsCopy].sort(antiChrono);

      billsSorted.forEach((bill) => (bill.date = formatDate(bill.date)));

      const datesDOM = screen.getAllByTestId('bill-date');

      datesDOM.forEach((dateDOM, i) => {
        expect(dateDOM.textContent).toEqual(billsSorted[i].date);
      });
    });

    test('Then I click on button for add new bill, the NewBill page should be loaded', async () => {
      const button = screen.getByTestId('btn-new-bill');

      fireEvent.click(button);

      expect(screen.queryByText('Envoyer une note de frais')).toBeTruthy();
    });

    test('Then I click on icon eye, the img in modal should be fill with good value', async () => {
      const iconsEye = screen.getAllByTestId('icon-eye');

      window.$ = jest.fn().mockImplementation(() => {
        return {
          modal: jest.fn(),
          width: jest.fn(),
        };
      });

      iconsEye.forEach((icon) => {
        const billUrl = icon.getAttribute('data-bill-url');
        const imgWidth = Math.floor($('#modaleFile').width() * 0.5);

        fireEvent.click(icon);

        const img = screen.getByAltText('Bill');

        expect(img.getAttribute('src')).toBe(billUrl);
        expect(img.getAttribute('width')).toBe(`${imgWidth}`);
      });
    });
  });
});
