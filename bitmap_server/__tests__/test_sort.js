let rank = [
    {color:"red",land:0},
    {color:"blue",land:0},
    {color:"green",land:0},
    {color:"purple",land:1},
];
rank.sort((a, b) => {
    return b.land - a.land;
});
console.log(rank)