function isPrime(number) {
    if (number <= 1) {
        return false;
    }

    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i === 0) {
            return false;
        }
    }

    return true;
}

let n = 1;
let result = 0;

while (true) {
    result = 179 * n;

    if (isPrime(result)) {
        console.log(n);
        break;
    }

    n++;
}