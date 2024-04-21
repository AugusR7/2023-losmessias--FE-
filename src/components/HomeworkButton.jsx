import { Alert, Box, Button, Snackbar } from "@mui/material";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { HomeworkDialog } from "./modals/HomeworkDialog";
import { addMinutesToTime, getDateGMTMinus3, getDateGMTMinus3ISO, getISODateFromLocalString, getISOTimeFromLocalString } from "@/helpers/TimeHelpers";

export default function HomeworkButton({ id, setHomeWorks, setUploadingHomeworks }) {
    const user = useUser();
    const [open, setOpen] = useState(false); // true or false
    const [alert, setAlert] = useState(false); // true or false
    const [alertSeverity, setAlertSeverity] = useState(''); // ['success', 'info', 'warning', 'error']
    const [file, setFile] = useState(null); // File
    const [newMessage, setNewMessage] = useState(''); // string
    const [alertMessage, setAlertMessage] = useState(''); // string
    const [date, setDate] = useState(getISODateFromLocalString(getDateGMTMinus3())); // YYYY-MM-DD
    const [time, setTime] = useState(getISOTimeFromLocalString(getDateGMTMinus3())); // HH:MM

    const handleClose = () => {
        setOpen(false);
        setNewMessage('');
        setFile(null);
        setDate(getISODateFromLocalString(getDateGMTMinus3()));
        setTime(getISOTimeFromLocalString(getDateGMTMinus3()));
    };

    const handleDateChange = (event) => {
        if (event.target.value < getDateGMTMinus3ISO().slice(0, 10)) {
            setAlert(true)
            setAlertSeverity('error')
            setAlertMessage("Please select a date  begining from today (or in the future)")
        } else {
            setAlert(false)
            setDate(event.target.value);
            //if the time is less than the current time, set the time to the current time
            if (event.target.value === getDateGMTMinus3ISO().slice(0, 10) && time < getDateGMTMinus3ISO().slice(11, 16)) {
                setTime(getDateGMTMinus3ISO().slice(11, 16));
            }
        }
    };

    const handleTimeChange = (event) => {
        // if the date is tomorrow or in the future, the time can be any time
        // otherwise, if the date is today, the time must be greater than the current time
        if (date > getDateGMTMinus3ISO().slice(0, 10)) {
            setTime(event.target.value);
        } else if (date === getDateGMTMinus3ISO().slice(0, 10) && event.target.value < getDateGMTMinus3ISO().slice(11, 16)) {
            setAlert(true)
            setAlertSeverity('error')
            setAlertMessage("Please select a time greater than the current time")
        } else {
            setAlert(false)
            setTime(event.target.value);
        }
    }

    const handleFileChange = e => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const dateFormatter = (date, time) => {
        return `${date}T${time}:00`
    }

    const handleOpen = () => {
        setOpen(true);
        const secureTime = addMinutesToTime(getISOTimeFromLocalString(getDateGMTMinus3()), 2);
        console.log(secureTime)
        setDate(getISODateFromLocalString(getDateGMTMinus3()));
        setTime(secureTime);
    }

    const handleSave = () => {
        if (file !== null || newMessage !== '') {
            var data = new FormData();
            data.append('file', file);
            data.append('classReservationId', id);
            data.append('professorId', user.id);
            data.append('deadline', dateFormatter(date, time));
            data.append('assignment', newMessage);
            setUploadingHomeworks(prevHomeworks => [...prevHomeworks, {
                assignment: newMessage,
                deadline: dateFormatter(date, time),
                professorId: user.id,
                classReservationId: parseInt(id),
                assignmentFile: file,
                status: 'PENDING',
                responseFile: null,
                response: null
            }]);
            data.forEach((value, key) => {
                console.log(`${key}: ${value}`)
            })

            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/homework/create`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                body: data,
            })
                .then(res => {
                    if (res.status === 201) {
                        setAlertMessage('Homework uploaded successfully!');
                        setAlertSeverity('success');
                        res.json().then(data => {
                            setHomeWorks(prevHomeworks => [...prevHomeworks, {
                                id: data.id,
                                assignment: newMessage,
                                deadline: dateFormatter(date, time),
                                professorId: user.id,
                                classReservationId: parseInt(id),
                                status: 'PENDING',
                                responseFile: null,
                                response: null,
                                assignmentFile: data.assignmentFile
                            }]);
                        });

                    } else {
                        setAlertSeverity('error');
                        setAlertMessage('There was an error uploading the homework!');
                    }
                }).finally(() => setUploadingHomeworks(prevHomeworks => prevHomeworks.filter(homework => homework.assignment !== newMessage)))
                .catch(err => {
                    console.log(err)
                    setAlertSeverity('error');
                    setAlertMessage('There was an error uploading the homework!');
                })
        }
        setOpen(false);
        setAlert(true);
        setNewMessage('');
        setFile(null);
    };

    return (
        <div>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button
                    variant='contained'
                    onClick={handleOpen}
                >
                    Add Homework
                </Button>
            </Box>

            <Snackbar
                open={alert}
                autoHideDuration={6000}
                onClose={() => setAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity={alertSeverity} sx={{ width: '100%' }}>{alertMessage}</Alert>
            </Snackbar>

            <HomeworkDialog
                open={open}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                file={file}
                handleFileChange={handleFileChange}
                date={date}
                handleDateChange={handleDateChange}
                time={time}
                handleTimeChange={handleTimeChange}
                handleClose={handleClose}
                handleSave={handleSave}
                isProfessor={user.role === 'professor'}
            />
        </div>
    )
}