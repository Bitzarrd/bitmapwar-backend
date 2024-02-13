import {generate2DArray, runTurn, getCircleCoordinates, compress2, compress3} from 'bitmap_sdk';


export const gridWidth = 1000;
export const colors = ['red', 'blue', 'green', 'purple'];
export const durationOfTheMatch = 60 * 10; // 比赛持续时间 秒
export const intervalBetweenMatches = 60 * 1 * 2;//比赛间隔时间 秒
export const stepInterval = 333; // 每一步的时间间隔
export const circle = getCircleCoordinates(1000)