import { useUser } from "@/context/UserContext";
import useWindowSize from "@/hooks/useWindowSize";
import { Button, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";


export default function Calendar({ events }) {
    // console.log(events)

    const handleCellClick = (event, row, day) => {
        // Do something...
    }

    const handleEventClick = (event) => {
        // Do something...
        console.log(event)
    }

    const handleEventsChange = (item) => {
        // Do something...
    }

    const handleAlertCloseButtonClicked = (item) => {
        // Do something...
    }

    const WeekdayContainer = ({ children, style }) => {
        return (
            <Grid item xs={12 / 7} sx={{
                border: '1px solid #e0e0e0',
                padding: 1,
                textAlign: 'center',
                ...style
            }}>
                {children}
            </Grid>
        )
    }

    const WeekDays = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return (
            <Grid container>
                {days.map((day, index) => (
                    <WeekdayContainer key={index}>
                        <Typography variant='h6'>{day}</Typography>
                    </WeekdayContainer>
                ))}
            </Grid>
        )
    }

    const windowSize = useWindowSize();
    const numDays = (y, m) => new Date(y, m, 0).getDate();
    const year = new Date().toISOString().split('T')[0].split('-')[0];
    const month = new Date().toISOString().split('T')[0].split('-')[1];
    const numberOfDaysInMonth = numDays(year, month);
    const numberOfDaysInPreviousMonth = numDays(year, month - 1);
    const firstDayOfTheWeek = new Date(year, month - 1).getDay();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const lastDaysOfPreviousMonth = Array.from({ length: firstDayOfTheWeek }, (_, i) => i + 1).map(day => day - 1).reverse();
    const lastDayOfTheMonth = new Date(year, month, 0).getDay();
    // const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    // console.log(lastDayOfTheMonth)
    // console.log(days[lastDayOfTheMonth])

    const verifyInclusion = (initialDate, finalDate, date) => {
        const initial = new Date(initialDate[0], initialDate[1], initialDate[2]);
        const final = new Date(finalDate[0], finalDate[1], finalDate[2]);
        const current = new Date(date[0], date[1], date[2]);
        return current >= initial && current <= final;
    }

    return (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginBlock: 10, alignItems: 'center' }}>
            {windowSize.width > 500 && (
                <>
                    <Grid container >
                        <Grid item xs={12} sx={{
                            border: '1px solid #e0e0e0',
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            padding: 1,
                        }}>
                            <Typography variant='h6' sx={{ textAlign: 'center' }}>
                                {months[month - 1]} {year}
                            </Typography>
                        </Grid>
                        <Grid container>
                            <WeekDays />
                            {lastDaysOfPreviousMonth.map((day, index) => (
                                <WeekdayContainer key={index}>
                                    <Typography sx={{ color: 'gray' }} >{numberOfDaysInPreviousMonth - day}</Typography>
                                </WeekdayContainer>
                            ))}
                            {Array.from({ length: numberOfDaysInMonth }, (_, i) => i + 1).map((day, index) => {
                                const event_on_this_day = events.find(event => verifyInclusion(event.startDate, event.endDate, [year, month, day]))
                                const radius = index === numberOfDaysInMonth - 1 ? 10 : 0;
                                return (
                                    <WeekdayContainer key={index} style={{ borderBottomLeftRadius: radius }}>
                                        <Typography>{day}</Typography>
                                        {events.map((event, index) => {
                                            const calendarDay = day < 10 ? `0${day}` : day;
                                            // console.log(event)
                                            const color = event.type === 'EXAM' ? '#f28f6a' : event.type === "PROJECT_PRESENTATION" ? "#099ce5" : "#fff952";
                                            if (event.type !== 'HOMEWORK') {
                                                verifyInclusion(event.startDate, event.endDate, [year, month, calendarDay])
                                                if (verifyInclusion(event.startDate, event.endDate, [year, month, calendarDay])) {
                                                    const startHour = event.startDate[3] < 10 ? `0${event.startDate[3]}` : event.startDate[3];
                                                    const startMinute = event.startDate[4] < 10 ? `0${event.startDate[4]}` : event.startDate[4];
                                                    const endHour = event.endDate[3] < 10 ? `0${event.endDate[3]}` : event.endDate[3];
                                                    const endMinute = event.endDate[4] < 10 ? `0${event.endDate[4]}` : event.endDate[4];
                                                    const startTime = startHour + ':' + startMinute;
                                                    const endTime = endHour + ':' + endMinute;
                                                    const cursor = event.type === 'HOMEWORK' ? 'pointer' : 'auto'
                                                    return (
                                                        <div key={index} style={{ backgroundColor: color, padding: 5, borderRadius: 5, marginBlock: 5, cursor: cursor }}>
                                                            <Typography variant='caption' fontWeight='bold'>{event.description}</Typography><br />
                                                            <Typography variant='caption' fontStyle='italic'>{startTime} - {endTime} </Typography>
                                                        </div>
                                                    )
                                                }
                                            }
                                            if (event.type === 'HOMEWORK' && verifyInclusion(event.startDate, event.endDate, [year, month, calendarDay])) {
                                                // const color = event.status === 'PENDING' ? '#f28f6a' : event.status === 'DONE' ? "#099ce5" : "#fff952";
                                                const color = event.status === 'PENDING' ? '#f28f6a' : event.status === 'DONE' ? "#42ae80" : "#ff0000";
                                                return (
                                                    <div key={index} style={{ backgroundColor: color, padding: 5, borderRadius: 5, marginBlock: 5, cursor: 'pointer' }} onClick={() => handleEventClick(event)}>
                                                        <Typography variant='caption' fontWeight='bold'>{event.description ? event.description : "Homework assignment given by file uploaded"}</Typography><br />
                                                        <Typography variant='caption' fontStyle='italic'>{event.endDate[3] + ':' + event.endDate[4]} -</Typography>
                                                        <Typography variant='caption' fontStyle='italic' fontWeight='bold'> {event.status}</Typography>
                                                    </div>
                                                )
                                            }
                                        })}
                                        {(!event_on_this_day) &&
                                            <div style={{ backgroundColor: 'gray', padding: 5, borderRadius: 5, marginBlock: 5 }}>
                                                <Typography variant='caption' color='white' fontWeight='bold' fontStyle='italic'>No events on this day</Typography>
                                            </div>
                                        }
                                    </WeekdayContainer>
                                )
                            })}
                            {Array.from({ length: 6 - lastDayOfTheMonth }, (_, i) => i + 1).map((day, index) => {
                                const radius = index === 6 - lastDayOfTheMonth - 1 ? 10 : 0;
                                return (
                                    <WeekdayContainer key={index} style={{ borderBottomRightRadius: radius }}>
                                        <Typography sx={{ color: 'gray' }} >{day}</Typography>
                                    </WeekdayContainer>
                                )
                            })}
                        </Grid>

                    </Grid>
                </>
            )
            }
            {/* {windowSize.width <= 500 && (
                <>
                    <Button variant='outlined' disabled={week === 0 && day === 1} onClick={() => handlePaginationMobile('left')}>
                        {'<'}
                    </Button>
                    <Typography>{new Date(aux_date.setDate(first + day + 7 * week)).toISOString().split('T')[0]}</Typography>
                    <Button variant='outlined' onClick={() => handlePaginationMobile('right')}>
                        {'>'}
                    </Button>
                </>
            )} */}
        </div >
    )
}