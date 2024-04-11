import {checkRent} from "../rent.js";

describe('Rent Module', () => {
    it('checks if a bitmap is rented1', async () => {
        const result = await checkRent(1);
        // console.log(result)
        expect(result).toBe(true);
    });
    it('checks if a bitmap is rented2', async () => {
        const result = await checkRent(1);
        // console.log(result)
        expect(result).toBe(true);
    });
});