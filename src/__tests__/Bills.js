/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import { fireEvent, screen, waitFor } from '@testing-library/dom';

import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';

import Bills from '../containers/Bills.js';

import { formatDate } from '../app/format.js';
import mockStore from '../__mocks__/store';
import router from '../app/Router.js';

jest.mock('../app/Store.js', () => mockStore);

describe('Given I am connected as an employee', () => {
  // test GET
  describe('When I navigate to Bills Page', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('fetches bills from mock API GET', async () => {
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
      window.onNavigate(ROUTES_PATH['Bills']);

      // wait until the bills container appear
      await waitFor(() => screen.getByTestId('tbody'));
      expect(screen.getByTestId('tbody')).toBeTruthy();

      // check if one of the bills of the store is display
      expect(screen.getByText('test1')).toBeTruthy();
    });
  });

  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills');
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
      document.body.appendChild(root);
      router();
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });

      window.onNavigate(ROUTES_PATH['Bills']);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test('fetches messages from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'));
          },
        };
      });

      window.onNavigate(ROUTES_PATH['Bills']);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });

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

      // mock jQuery for avoid error with the method modal
      window.$ = jest.fn().mockImplementation(() => {
        return {
          modal: jest.fn(),
          width: () => 100,
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
