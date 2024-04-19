export const getDateGMTMinus3 = () => {
    const date = new Date();
    const timeInMinus3 = date.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' });
    console.log(timeInMinus3)
    return timeInMinus3;
}

export const getISODateFromLocalString = (date) => {
    const dateSplit = date.split(', ')[0].split('/');
    let day = dateSplit[1];
    if (day.length === 1) day = `0${day}`;
    let month = dateSplit[0];
    if (month.length === 1) month = `0${month}`;
    const year = dateSplit[2];
    return `${year}-${month}-${day}`;
}

export const getISOTimeFromLocalString = (date) => {
    const time = date.split(', ')[1].split(' ');
    const timeOfDay = time[1]
    let hour = time[0].split(':')[0];
    if (timeOfDay === 'PM' && hour !== '12') hour = `${parseInt(hour) + 12}`
    const minute = time[0].split(':')[1];
    return `${hour}:${minute}`;
}

export const getDateGMTMinus3ISO = () => {
    const date = new Date();
    const timeInMinus3 = date.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' });
    return `${getISODateFromLocalString(timeInMinus3)}T${getISOTimeFromLocalString(timeInMinus3)}`;
}