/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import store from '../app/Store.js';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import { resolve } from 'path';

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
      document.innerHTML = '';
    });

    test('Then bill icon in vertical layout should be highlighted', () => {
      window.onNavigate(ROUTES_PATH['Bills']);

      const windowIcon = screen.getByTestId('icon-window');

      expect(windowIcon).toHaveClass('active-icon');
    });

    test('Then bills should be ordered from earliest to latest', () => {
      const root = document.getElementById('root');
      root.innerHTML = BillsUI({ data: bills });

      const antiChrono = (a, b) => (a.date < b.date ? 1 : -1);
      const billsSorted = [...bills].sort(antiChrono);

      const datesDOM = screen.getAllByTestId('bill-date');

      datesDOM.forEach((dateDOM, i) => {
        expect(dateDOM.textContent).toEqual(billsSorted[i].date);
      });
    });
  });
});
