export function compare_time(a, b) {
    console.log(a)
    console.log(b)
    const startingHour = a.split('-')[0].trim().split(':');
    const endingHour = a.split('-')[1].trim().split(':');

    if (
        (parseInt(startingHour[0]) === parseInt(b.startingHour[0]) && parseInt(startingHour[1]) === parseInt(b.startingHour[1])) ||
        (parseInt(endingHour[0]) === parseInt(b.endingHour[0]) && parseInt(endingHour[1]) === parseInt(b.endingHour[1]))
    )
        return true;
    else if (
        (parseInt(startingHour[0]) > parseInt(b.startingHour[0]) && parseInt(endingHour[0]) < parseInt(b.endingHour[0])) ||
        (parseInt(startingHour[0]) === parseInt(b.startingHour[0]) &&
            parseInt(startingHour[1]) > parseInt(b.startingHour[1]) &&
            parseInt(endingHour[0]) <= parseInt(b.endingHour[0])) ||
        (parseInt(startingHour[0]) > parseInt(b.startingHour[0]) &&
            parseInt(endingHour[0]) === parseInt(b.endingHour[0]) &&
            parseInt(endingHour[1]) < parseInt(b.endingHour[1]))
    ) {
        return true;
    }

    return false;
}

export function first_block(a, b) {
    const startingHour = a.split('-')[0].trim().split(':');
    const endingHour = a.split('-')[1].trim().split(':');

    if (parseInt(startingHour[0]) === parseInt(b.startingHour[0]) && parseInt(startingHour[1]) === parseInt(b.startingHour[1])) return true;
    return false;
}

export function parseDate(date) {
    let splittedDate = date.toLocaleString().split(',')[0].split('/');
    splittedDate.pop();
    return splittedDate.join('/');
}
