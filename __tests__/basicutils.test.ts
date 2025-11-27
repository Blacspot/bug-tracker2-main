import { product } from "../src/basicutils";

describe("Basicutils test suite", () => {
    test("should return the product of two numbers", () => {
        const actual = product(3, 4);
        const expected = 12;
        expect(actual).toBe(expected);
    });
});