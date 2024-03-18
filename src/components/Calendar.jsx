import useWindowSize from "@/hooks/useWindowSize";
import { Button, Grid, Typography } from "@mui/material";
import { useState } from "react";


export default function Calendar({ }) {

    const events = [
        {
            id: "event-1",
            label: "Medical consultation",
            groupLabel: "Dr Shaun Murphy",
            user: "Dr Shaun Murphy",
            color: "#f28f6a",
            startHour: "04:00 AM",
            endHour: "05:00 AM",
            date: "2024-03-05",
            createdAt: new Date(),
            createdBy: "Kristina Mayer"
        },
        {
            id: "event-2",
            label: "Medical consultation",
            groupLabel: "Dr Claire Brown",
            user: "Dr Claire Brown",
            color: "#099ce5",
            startHour: "09:00 AM",
            endHour: "10:00 AM",
            date: "2024-03-06",
            createdAt: new Date(),
            createdBy: "Kristina Mayer"
        },
        {
            id: "event-3",
            label: "Medical consultation",
            groupLabel: "Dr Menlendez Hary",
            user: "Dr Menlendez Hary",
            color: "#263686",
            startHour: "13 PM",
            endHour: "14 PM",
            date: "2024-03-09",
            createdAt: new Date(),
            createdBy: "Kristina Mayer"
        },
        {
            id: "event-4",
            label: "Consultation prénatale",
            groupLabel: "Dr Shaun Murphy",
            user: "Dr Shaun Murphy",
            color: "#f28f6a",
            startHour: "08:00 AM",
            endHour: "09:00 AM",
            date: "2024-03-11",
            createdAt: new Date(),
            createdBy: "Kristina Mayer"
        }
    ]
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

    const WeekdayContainer = ({ children }) => {
        return (
            <Grid item xs={12 / 7} sx={{
                border: '1px solid #e0e0e0',
                padding: 1,
                textAlign: 'center',
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
    const dayOfTheWeek = new Date(year, month).getDay() - 1;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const lastDaysOfPreviousMonth = Array.from({ length: firstDayOfTheWeek }, (_, i) => i + 1).map(day => day - 1).reverse();
    // console.log(months[month - 1])

    // console.log(lastDaysOfPreviousMonth)
    // console.log(firstDayOfTheWeek)
    // console.log(days[firstDayOfTheWeek])
    // console.log(numberOfDaysInPreviousMonth)

    // console.log(new Date().toISOString().split('T'))
    // console.log(numberOfDaysInMonth)

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
                            {Array.from({ length: numberOfDaysInMonth }, (_, i) => i + 1).map((day, index) => (
                                <WeekdayContainer key={index}>
                                    <Typography>{day}</Typography>
                                    {events.map((event, index) => {
                                        const calendarDay = day < 10 ? `0${day}` : day;
                                        if (event.date === `${year}-${month}-${calendarDay}`) {
                                            return (
                                                <div key={index} style={{ backgroundColor: event.color, padding: 5, borderRadius: 5, marginBlock: 5, cursor: 'pointer' }} onClick={() => handleEventClick(event)}>
                                                    <Typography variant='caption'>{event.startHour} - {event.endHour}</Typography>
                                                    <Typography variant='caption'>{event.groupLabel}</Typography>
                                                </div>
                                            )
                                        }
                                    })}
                                    {/* <div style={{ backgroundColor: 'gray', padding: 5, borderRadius: 5, marginBlock: 5 }}>
                                        <Typography variant='caption'>No event on this day</Typography>
                                    </div> */}

                                </WeekdayContainer>
                            ))}
                        </Grid>

                    </Grid>
                </>
            )}
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
        </div>
    )
}