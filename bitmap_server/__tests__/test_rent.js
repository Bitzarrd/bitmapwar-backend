// import mysql from 'mysql';

// jest.mock('axios');
// jest.mock('mysql');



// import {checkRent} from "../rent.js";
// import axios from 'axios';
const axios = require('axios');
const {checkRent} = require('../rent.js');

describe('Rent Module', () => {
    // let mysql_connection;


    // beforeEach(() => {
    //     mysql_connection = { query: jest.fn() };
    // });


    it('checks if a bitmap is rented', async () => {
        const a = await axios.get("http://localhost:8080");
        // axios.get.mockResolvedValue({ data: { data: [{ address: "bc1qptgujmlkez7e6744yctzjgztu0st372mxs6702" }] } });
        const result = await checkRent(1);
        // expect(result).toBe(true);
    });

    // it('gets rental information for a bitmap', async () => {
    //     mysql_connection.query.mockImplementation((sql, params, callback) => callback(null, [{ bitmap_id: 1 }]));
    //     const result = await getRental(mysql_connection, 1);
    //     expect(result).toEqual({ bitmap_id: 1 });
    // });
    //
    // it('gets rental information for multiple bitmaps', async () => {
    //     mysql_connection.query.mockImplementation((sql, params, callback) => callback(null, [{ bitmap_id: 1 }, { bitmap_id: 2 }]));
    //     const result = await getRentalByIds(mysql_connection, [1, 2]);
    //     expect(result).toEqual([{ bitmap_id: 1 }, { bitmap_id: 2 }]);
    // });
    //
    // it('gets available rentals for an owner', async () => {
    //     mysql_connection.query.mockImplementation((sql, params, callback) => callback(null, [{ owner: 'owner1' }]));
    //     const result = await getAvailableRental(mysql_connection, 'owner1');
    //     expect(result).toEqual([{ owner: 'owner1' }]);
    // });
    //
    // it('creates a new rental', () => {
    //     const result = newRental(1, 7, 1000, 'owner1', '0', '0', 0, 'btc');
    //     expect(result).toEqual({
    //         bitmap_id: 1,
    //         days: 7,
    //         timeout: 1000,
    //         owner: 'owner1',
    //         total_profit: '0',
    //         total_btc: '0',
    //         total_energy: 0,
    //         type: 'btc'
    //     });
    // });
    //
    // it('inserts a new rental', async () => {
    //     mysql_connection.query.mockImplementation((sql, params, callback) => callback(null, {}));
    //     await insertRental(mysql_connection, 1, 7, 1000, 'owner1', '0', '0', 0, 'btc');
    //     expect(mysql_connection.query).toHaveBeenCalled();
    // });
    //
    // it('updates a rental', async () => {
    //     mysql_connection.query.mockImplementation((sql, params, callback) => callback(null, {}));
    //     await updateRental(mysql_connection, { bitmap_id: 1, days: 7, timeout: 1000, owner: 'owner1', total_profit: '0', total_btc: '0', total_energy: 0, type: 'btc' });
    //     expect(mysql_connection.query).toHaveBeenCalled();
    // });
    //
    // it('gets rent price for a given number of days', () => {
    //     const result = getRentPrice(7);
    //     expect(result).toEqual({
    //         energy: 500,
    //         btc: '400000000000000',
    //         profit: '400000000000000'
    //     });
    // });
});