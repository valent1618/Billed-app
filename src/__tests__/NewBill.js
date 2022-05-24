/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import router from '../app/Router.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import userEvent from '@testing-library/user-event';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
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
      window.onNavigate(ROUTES_PATH['NewBill']);
    });

    afterEach(() => {
      document.body.removeChild(document.getElementById('root'));
    });

    test('Then I add new proof bill with incorrect format, the file should not be valid', () => {
      const fakeFile = new File(
        [
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
        ],
        'favicon.ico',
        {
          type: 'image/ico',
        }
      );

      const file = screen.getByTestId('file');

      userEvent.upload(file, fakeFile);

      expect(file.getAttribute('valid')).toBe('false');
    });

    test('Then I add new proof bill with correct format, the file should be valid', () => {
      const fakeFile = new File(
        [
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
        ],
        'favicon.png',
        {
          type: 'image/png',
        }
      );

      const file = screen.getByTestId('file');

      userEvent.upload(file, fakeFile);

      expect(file.getAttribute('valid')).toBe('true');
    });
  });
});
