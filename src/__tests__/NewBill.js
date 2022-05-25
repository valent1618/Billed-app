/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import mockStore from '../__mocks__/store';
import router from '../app/Router.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import userEvent from '@testing-library/user-event';

jest.mock('../app/Store.js', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I navigate on NewBill Page', () => {
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
      document.body.innerHTML = '';
    });

    test('Then I add new proof bill with incorrect format, the file input should not be valid', () => {
      const fakeFile = new File(['facture'], 'facture.ico', {
        type: 'image/ico',
      });
      const file = screen.getByTestId('file');
      userEvent.upload(file, fakeFile);

      // checkValidity() is always false when adding files manualy
      // check with attribute
      expect(file.getAttribute('data-valid')).toBe('false');
    });

    test('Then I add new proof bill with correct format, the file should be valid', () => {
      const fakeFile = new File(['facture'], 'facture.png', {
        type: 'image/png',
      });
      const file = screen.getByTestId('file');
      userEvent.upload(file, fakeFile);

      expect(file.getAttribute('data-valid')).toBe('true');
    });

    test('Then I click to the submit button with invalid input, the form is not valid and I should not be redirected to the Bills page', async () => {
      // Submit the form without fill required input
      const form = screen.getByTestId('form-new-bill');
      fireEvent.submit(form);

      // Check the validity of the form
      expect(form.getAttribute('data-valid')).toBe('false');

      // Check if we are still on the same page
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    });

    test('Then I click on the submit button with valid inputs, the form is valid and I should be redirected to the Bills page with a new bill', async () => {
      // Check the number of bills into the mocked store
      let numberOfBills = await mockStore
        .bills()
        .list()
        .then((bills) => {
          return bills.length;
        });

      // Fill the four inputs required
      screen.getByTestId('datepicker').value = '1997-12-02';
      screen.getByTestId('amount').value = '777';
      screen.getByTestId('pct').value = '7';
      const fakeFile = new File(['facture'], 'facture.png', {
        type: 'image/png',
      });
      const file = screen.getByTestId('file');
      userEvent.upload(file, fakeFile);

      // Submit the form
      const form = screen.getByTestId('form-new-bill');
      fireEvent.submit(form);

      // Check the validity of the form
      expect(form.getAttribute('data-valid')).toBe('true');

      // Check if the new bill is add on the store
      let newBillIsInclude = await mockStore
        .bills()
        .list()
        .then((bills) => {
          return bills.includes(mockStore.bills().defaultBill);
        });
      expect(newBillIsInclude).toBe(true);

      // Check if the number of bills is incremented by one into the store
      let newNumberOfBills = await mockStore
        .bills()
        .list()
        .then((bills) => {
          return bills.length;
        });
      expect(newNumberOfBills).toBe(numberOfBills + 1);

      // Wait for the Bills page load
      await waitFor(() => screen.getByText('Mes notes de frais'));
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();

      // Check if the number of bills into the Bills page is the same as in the store
      const billsDOM = screen.getAllByTestId('icon-eye');
      expect(billsDOM.length).toBe(newNumberOfBills);
    });
  });
});
