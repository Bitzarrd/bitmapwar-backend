import {generate2DArray, runTurn, getCircleCoordinates, compress2, compress3} from 'bitmap_sdk';


export const gridWidth = 1000;
export const colors = ['red', 'blue', 'green', 'purple'];
export const durationOfTheMatch = 60;
export const intervalBetweenMatches = 60;
export const circle = getCircleCoordinates(500)