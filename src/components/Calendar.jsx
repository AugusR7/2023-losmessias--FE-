import { useUser } from "@/context/UserContext";
import useWindowSize from "@/hooks/useWindowSize";
import { Alert, Box, Button, CircularProgress, Grid, Snackbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import EventCreationDialog from "./modals/EventCreationDialog";
import CloseIcon from '@mui/icons-material/Close';
import EventDeletionDialog from "./modals/EventDeletionDialog";


export default function Calendar({ events, handleHomeworkClick, setEvents }) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const verifyTodayDate = (day, month, year) => {
        const today = new Date();
        return parseInt(day) === today.getDate() && parseInt(month) === today.getMonth() + 1 && parseInt(year) === today.getFullYear();
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

    const user = useUser();
    const windowSize = useWindowSize();
    const numDays = (y, m) => new Date(y, m, 0).getDate();
    const [year, setYear] = useState(new Date().toISOString().split('T')[0].split('-')[0]);
    const [month, setMonth] = useState(new Date().toISOString().split('T')[0].split('-')[1]);
    const [day, setDay] = useState(new Date().toISOString().split('T')[0].split('-')[2]);
    const numberOfDaysInMonth = numDays(year, month);
    const numberOfDaysInPreviousMonth = numDays(year, month - 1);
    const firstDayOfTheWeek = new Date(year, month - 1).getDay();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const lastDaysOfPreviousMonth = Array.from({ length: firstDayOfTheWeek }, (_, i) => i + 1).map(day => day - 1).reverse();
    const lastDayOfTheMonth = new Date(year, month, 0).getDay();
    const [alert, setAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [eventToDelete, setEventToDelete] = useState();

    const [openCreationDialog, setOpenCreationDialog] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(new Date().toISOString().split('T')[1].split(':').slice(0, 2).join(':'));
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [endTime, setEndTime] = useState(new Date().toISOString().split('T')[1].split(':').slice(0, 2).join(':'));
    const [eventType, setEventType] = useState('EXAM');

    const [isTodayDate, setIsTodayDate] = useState(true)

    useEffect(() => {
        setIsTodayDate(verifyTodayDate(day, month, year))
    }, [day, month, year])

    const verifyInclusion = (initialDate, finalDate, date) => {
        const initial = new Date(initialDate[0], initialDate[1], initialDate[2]);
        const final = new Date(finalDate[0], finalDate[1], finalDate[2]);
        const current = new Date(date[0], date[1], date[2]);
        return current >= initial && current <= final;
    }

    const handleDateChange = (event, endingDate = false) => {
        if (event.target.value < new Date().toISOString().slice(0, 10)) {
            setAlert(true)
            setAlertSeverity('error')
            setAlertMessage("Please select a date  begining from today (or in the future)")
        } else if (endingDate && event.target.value < startDate) {
            setAlert(true)
            setAlertSeverity('error')
            setAlertMessage("Please select a date greater than the starting date")
        } else if (!endingDate && event.target.value > endDate) {
            setEndDate(event.target.value);
            setStartDate(event.target.value);
        } else {
            setAlert(false)
            if (endingDate)
                setEndDate(event.target.value);
            else
                setStartDate(event.target.value);
        }
    }

    const handleTimeChange = (event, endingTime = false) => {
        if (event.target.value < new Date().toISOString().slice(11, 16) && startDate < new Date().toISOString().split('T')[0]) {
            setAlert(true)
            setAlertSeverity('error')
            setAlertMessage("Please select a time greater than the current time")
        } else if (endingTime && startDate === endDate && event.target.value < startTime) {
            // if it is the ending time, and the starting date is the same as the ending date, then the ending time must be greater than the starting time
            setAlert(true)
            setAlertSeverity('error')
            setAlertMessage("Please select a time greater than the starting time")
        } else if (!endingTime && startDate === endDate && event.target.value > endTime) {
            // if it is the starting time, and the starting date is the same as the ending date, then the ending time must be the same as the new starting time
            setStartTime(event.target.value)
            setEndTime(event.target.value)
        } else {
            setAlert(false)
            if (endingTime)
                setEndTime(event.target.value);
            else
                setStartTime(event.target.value);
        }
    }

    const handleCreateEvent = () => {
        if (title === '' || description === '') {
            setAlert(true)
            setAlertSeverity('error')
            setAlertMessage("Please fill in all the fields")
        }
        else {
            var data = new FormData();
            data.append('title', title)
            data.append('description', description)
            data.append('startTime', startDate + 'T' + startTime)
            data.append('endTime', endDate + 'T' + endTime)
            data.append('type', eventType)
            data.append('userId', user.id)
            setEvents(prevEvents => [...prevEvents, {
                id: events.length + 1,
                title: title,
                description: description,
                startDate: [parseInt(startDate.split('-')[0]), parseInt(startDate.split('-')[1]), parseInt(startDate.split('-')[2]), parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1])],
                endDate: [parseInt(endDate.split('-')[0]), parseInt(endDate.split('-')[1]), parseInt(endDate.split('-')[2]), parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1])],
                type: eventType,
                isLoading: true
            }])

            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/events/create`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                body: data
            })
                .then(res => {
                    if (res.status === 201) {
                        setAlertMessage('Event created successfully!');
                        setAlertSeverity('success');
                        res.json().then(data => {
                            console.log(data)
                            setEvents(prevEvents => prevEvents.filter(event => !event.isLoading));
                            setEvents(prevEvents => [...prevEvents, {
                                id: data.id,
                                title: data.title,
                                description: data.description,
                                startDate: data.startDate,
                                endDate: data.endDate,
                                type: data.type
                            }])
                        })
                    } else {
                        setAlertMessage('An error occurred while creating the event');
                        setAlertSeverity('error');
                    }
                })
                .catch(err => {
                    setAlert(true);
                    setAlertMessage('An error occurred while creating the event');
                    setAlertSeverity('error');
                    console.log(err)
                })
            handleClose();
        }
    }

    const handleDeleteEvent = (id) => {
        fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/events/delete/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
            .then(res => {
                if (res.status === 200) {
                    setAlert(true);
                    setAlertMessage('Event deleted successfully!');
                    setAlertSeverity('success');
                    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
                } else {
                    setAlertMessage('An error occurred while deleting the event');
                    setAlertSeverity('error');
                }
            })
            .catch(err => {
                setAlertMessage('An error occurred while deleting the event');
                setAlertSeverity('error');
                console.log(err)
            }).finally(() => {
                setDeleteDialog(false);
            })
    }

    const handleCloseDialog = () => {
        setDeleteDialog(false);
    }

    const handlePaginationMobile = (direction) => {
        if (direction === 'left') {
            if (day === 1) {
                setMonth(prev => parseInt(prev) - 1);
                setDay(numDays(year, month - 1));
            } else {
                setDay(prev => parseInt(prev) - 1);
            }
        } else {
            if (day === numberOfDaysInMonth) {
                setMonth(prev => parseInt(prev) + 1);
                setDay(1);
            } else {
                setDay(prev => parseInt(prev) + 1);
            }
        }
    }

    const handleClose = () => {
        setOpenCreationDialog(false);
        setStartDate(new Date().toISOString().split('T')[0]);
        setStartTime(new Date().toISOString().split('T')[1].split(':').slice(0, 2).join(':'));
        setEndDate(new Date().toISOString().split('T')[0]);
        setEndTime(new Date().toISOString().split('T')[1].split(':').slice(0, 2).join(':'));
        setTitle('');
        setDescription('');
        setEventType('EXAM');
    }

    return (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginBlock: 10, alignItems: 'center' }}>
            <Snackbar open={alert} autoHideDuration={6000} onClose={() => setAlert(false)}>
                <Alert onClose={() => setAlert(false)} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>

            {windowSize.width > 500 && (
                <>
                    <Grid container >
                        <EventCreationDialog
                            openCreationDialog={openCreationDialog}
                            handleClose={handleClose}
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            startDate={startDate}
                            startTime={startTime}
                            endDate={endDate}
                            endTime={endTime}
                            eventType={eventType}
                            setEventType={setEventType}
                            handleCreateEvent={handleCreateEvent}
                            handleDateChange={handleDateChange}
                            handleTimeChange={handleTimeChange}
                        />
                        <EventDeletionDialog
                            open={deleteDialog}
                            eventId={eventToDelete}
                            handleClose={handleCloseDialog}
                            handleDelete={handleDeleteEvent}
                        />
                        <Grid item xs={12} sx={{
                            border: '1px solid #e0e0e0',
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            padding: 1,
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <Button variant='outlined' disabled={month === 1} onClick={() => setMonth(prev => parseInt(prev) - 1)}>
                                {'<'}
                            </Button>
                            <Typography variant='h6' sx={{ textAlign: 'center' }}>
                                {months[month - 1]} {year}
                            </Typography>
                            <Button variant='outlined' onClick={() => setMonth(prev => parseInt(prev) + 1)}>
                                {'>'}
                            </Button>
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
                                            const color = event.type === 'EXAM' ? '#f28f6a' : event.type === "PROJECT_PRESENTATION" ? "#0a9dff" : "#fff952";
                                            if (event.type !== 'HOMEWORK' && !event.isLoading) {
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
                                                            <Box sx={{ position: 'relative' }}>
                                                                <Typography variant='caption' fontWeight='bold'>{event.title}</Typography>
                                                                <Button
                                                                    variant='contained'
                                                                    onClick={() => {
                                                                        setEventToDelete(event.id);
                                                                        setDeleteDialog(true);
                                                                    }}
                                                                    sx={{
                                                                        marginLeft: 1,
                                                                        padding: 0,
                                                                        minWidth: 0,
                                                                        minHeight: 0,
                                                                        borderRadius: 0,
                                                                        borderRadius: 15,
                                                                        backgroundColor: 'red',
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        right: 0,
                                                                        ":hover": {
                                                                            backgroundColor: '#a40000',
                                                                        }
                                                                    }}
                                                                >
                                                                    <CloseIcon fontSize='small' />
                                                                </Button>
                                                                <br />
                                                            </Box>
                                                            <Typography variant='caption'>{event.description}</Typography><br />
                                                            {event.type !== "VACATION" ?
                                                                <Typography variant='caption' fontStyle='italic'>{startTime} - {endTime} </Typography>
                                                                :
                                                                <Typography variant='caption' fontStyle='italic'>All day</Typography>
                                                            }
                                                        </div>
                                                    )
                                                }
                                            }
                                            if (event.type === 'HOMEWORK' && verifyInclusion(event.startDate, event.endDate, [year, month, calendarDay]) && !event.isLoading) {
                                                const color = event.status === 'PENDING' ? '#ffd86f' : event.status === 'DONE' ? "#42ae80" : "#ff0000";
                                                return (
                                                    <div key={index} style={{ backgroundColor: color, padding: 5, borderRadius: 5, marginBlock: 5, cursor: 'pointer' }} onClick={() => handleHomeworkClick(event)}>
                                                        <Typography variant='caption' fontWeight='bold'>{event.description ? event.description : "Homework assignment given by file uploaded"}</Typography><br />
                                                        <Typography variant='caption' fontStyle='italic'>{event.endDate[3] + ':' + event.endDate[4]} -</Typography>
                                                        <Typography variant='caption' fontStyle='italic' fontWeight='bold'> {event.status}</Typography>
                                                    </div>
                                                )
                                            }
                                            if (event.isLoading && verifyInclusion(event.startDate, event.endDate, [year, month, calendarDay])) {
                                                return (
                                                    <div key={index} style={{ backgroundColor: '#191919', padding: 5, borderRadius: 5, marginBlock: 5 }}>
                                                        <Box sx={{ alignContent: 'center', flexDirection: 'row', display: 'flex', justifyContent: 'center' }}>
                                                            <CircularProgress size={15} sx={{ mr: 1, color: 'white' }} />
                                                            <Typography variant='caption' color='white' fontWeight='bold' fontStyle='italic'>Creating event...</Typography>
                                                        </Box>
                                                        <Typography variant='caption' color='white' fontWeight='bold' fontStyle='italic'>{event.title} </Typography><br />
                                                        <Typography variant='caption' color='white' fontStyle='italic'>{event.description}</Typography> <br />
                                                        <Typography variant='caption' color='white' fontStyle='italic'>{event.startDate[3] + ':' + event.startDate[4]} - {event.endDate[3] + ':' + event.endDate[4]}</Typography>
                                                    </div>
                                                );
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
                        <Button variant='contained' onClick={() => setOpenCreationDialog(true)} sx={{ marginTop: 3 }}>Create Event</Button>
                    </Grid>
                </>
            )
            }

            {windowSize.width <= 500 && (
                <>
                    <Grid container >
                        <EventCreationDialog
                            openCreationDialog={openCreationDialog}
                            handleClose={handleClose}
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            startDate={startDate}
                            startTime={startTime}
                            endDate={endDate}
                            endTime={endTime}
                            eventType={eventType}
                            setEventType={setEventType}
                            handleCreateEvent={handleCreateEvent}
                            handleDateChange={handleDateChange}
                            handleTimeChange={handleTimeChange}
                        />
                        <EventDeletionDialog
                            open={deleteDialog}
                            eventId={eventToDelete}
                            handleClose={handleCloseDialog}
                            handleDelete={handleDeleteEvent}
                        />
                        <Grid item xs={12} sx={{
                            border: '1px solid #e0e0e0',
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            padding: 1,
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <Button variant='outlined' disabled={month === 1} onClick={() => handlePaginationMobile('left')}>
                                {'<'}
                            </Button>
                            <Typography variant='h6' sx={{
                                textAlign: 'center',
                                backgroundColor: !isTodayDate ? 'none' : 'lightblue',
                                borderRadius: 2,
                                padding: 1
                            }}
                            >
                                {new Date(year, month - 1).toLocaleString('en-GB', { month: 'long' })} {day}, {year}
                            </Typography>
                            <Button variant='outlined' onClick={() => handlePaginationMobile('right')}>
                                {'>'}
                            </Button>
                        </Grid>
                        <Grid container>
                            <Grid item xs={12} sx={{
                                border: '1px solid #e0e0e0',
                                padding: 1,
                                textAlign: 'center',
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10
                            }}>
                                <Typography variant='h6'>{days[new Date(year, month - 1, day).getDay()]}</Typography>
                            </Grid>
                            {events.map((event, index) => {
                                const calendarDay = day < 10 ? `0${day}` : day;
                                const color = event.type === 'EXAM' ? '#f28f6a' : event.type === "PROJECT_PRESENTATION" ? "#0a9dff" : "#fff952";
                                if (event.type !== 'HOMEWORK' && !event.isLoading) {
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
                                            <Grid item
                                                xs={12}
                                                key={index}
                                                sx={{
                                                    backgroundColor: color,
                                                    padding: 1,
                                                    borderRadius: 2,
                                                    marginBlock: 2,
                                                    cursor: cursor,
                                                }}
                                            >
                                                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                                                    <Typography variant='h6' fontWeight='bold'>{event.title}</Typography>
                                                    <Button
                                                        variant='contained'
                                                        onClick={() => {
                                                            setEventToDelete(event.id);
                                                            setDeleteDialog(true);
                                                        }}
                                                        sx={{
                                                            marginLeft: 1,
                                                            padding: 0,
                                                            minWidth: 0,
                                                            minHeight: 0,
                                                            borderRadius: 0,
                                                            borderRadius: 15,
                                                            backgroundColor: 'red',
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            ":hover": {
                                                                backgroundColor: '#a40000',
                                                            }
                                                        }}
                                                    >
                                                        <CloseIcon fontSize='small' />
                                                    </Button>
                                                    <br />
                                                </Box>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Typography sx={{ justifyContent: 'center' }}>{event.description}</Typography><br />
                                                    {event.type !== "VACATION" ?
                                                        <Typography fontStyle='italic'>{startTime} - {endTime} </Typography>
                                                        :
                                                        <Typography fontStyle='italic'>All day</Typography>
                                                    }
                                                </Box>
                                            </Grid>
                                        )
                                    }
                                }
                                if (event.type === 'HOMEWORK' && verifyInclusion(event.startDate, event.endDate, [year, month, calendarDay]) && !event.isLoading) {
                                    const color = event.status === 'PENDING' ? '#ffd86f' : event.status === 'DONE' ? "#42ae80" : "#ff0000";
                                    return (
                                        <Grid item xs={12} key={index} sx={{
                                            backgroundColor: color,
                                            padding: 1,
                                            borderRadius: 2,
                                            marginBlock: 2,
                                            cursor: 'pointer',
                                            textAlign: 'center'
                                        }} onClick={() => handleHomeworkClick(event)}>
                                            <Typography fontWeight='bold' sx={{ paddingRight: 2, paddingLeft: 2 }}>{event.description ? event.description : "Homework assignment given by file uploaded"}</Typography><br />
                                            <Typography fontStyle='italic'>{event.endDate[3] + ':' + event.endDate[4]}</Typography>
                                            <Typography fontStyle='italic' fontWeight='bold'> {event.status}</Typography>
                                        </Grid>
                                    )
                                }
                                if (event.isLoading && verifyInclusion(event.startDate, event.endDate, [year, month, calendarDay])) {
                                    return (
                                        <Grid item xs={12} key={index} sx={{
                                            backgroundColor: '#191919',
                                            padding: 1,
                                            borderRadius: 2,
                                            marginBlock: 2,
                                            cursor: 'pointer',
                                        }}>
                                            <Box sx={{ alignContent: 'center', flexDirection: 'row', display: 'flex', justifyContent: 'center' }}>
                                                <CircularProgress size={15} sx={{ mr: 1, color: 'white' }} />
                                                <Typography variant='caption' color='white' fontWeight='bold' fontStyle='italic'>Creating event...</Typography>
                                            </Box>
                                            <Typography variant='caption' color='white' fontWeight='bold' fontStyle='italic'>{event.title} </Typography><br />
                                            <Typography variant='caption' color='white' fontStyle='italic'>{event.description}</Typography> <br />
                                            <Typography variant='caption' color='white' fontStyle='italic'>{event.startDate[3] + ':' + event.startDate[4]} - {event.endDate[3] + ':' + event.endDate[4]}</Typography>
                                        </Grid>
                                    );
                                }
                            }
                            )}
                            {!events.find(event => verifyInclusion(event.startDate, event.endDate, [year, month, day])) && (
                                <Grid item xs={12} sx={{
                                    backgroundColor: 'gray',
                                    padding: 1,
                                    borderRadius: 2,
                                    marginBlock: 2,
                                    textAlign: 'center'
                                }}>
                                    <Typography color='white' fontWeight='bold' fontStyle='italic'>No events on this day</Typography>
                                </Grid>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <Button variant='contained' onClick={() => setOpenCreationDialog(true)} sx={{ marginTop: 3 }}>Create Event</Button>
                                <Button variant='outlined'
                                    onClick={() => {
                                        setYear(new Date().toISOString().split('T')[0].split('-')[0]);
                                        setMonth(new Date().toISOString().split('T')[0].split('-')[1]);
                                        setDay(new Date().toISOString().split('T')[0].split('-')[2]);
                                    }}
                                    sx={{ marginTop: 3, justifySelf: 'center' }}
                                >
                                    Go to today
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </>
            )}
        </div >
    )
}