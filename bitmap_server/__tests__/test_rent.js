import {checkRent} from "../rent.js";

describe('<ContactsRoute />', () => {
    it('checks if a bitmap is rented', async () => {
        const result = await checkRent(1);
        // console.log(result)
        expect(result).toBe(true);
    });
});