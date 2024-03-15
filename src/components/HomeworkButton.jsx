import { Alert, Box, Button, Snackbar } from "@mui/material";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { HomeworkDialog } from "./modals/HomeworkDialog";

export default function HomeworkButton({ id, setHomeWorks, setUploadingHomeworks }) {
    const user = useUser();
    const [open, setOpen] = useState(false); // true or false
    const [alert, setAlert] = useState(false); // true or false
    const [alertSeverity, setAlertSeverity] = useState(''); // ['success', 'info', 'warning', 'error']
    const [file, setFile] = useState(null); // File
    const [newMessage, setNewMessage] = useState(''); // string
    const [alertMessage, setAlertMessage] = useState(''); // string
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [time, setTime] = useState(new Date().toISOString().slice(11, 16)); // HH:MM
    const handleClose = () => {
        setOpen(false);
        setNewMessage('');
        setFile(null);
        setDate(new Date().toISOString().slice(0, 10));
        setTime(new Date().toISOString().slice(11, 16));
    };

    const handleDateChange = (event) => {
        if (event.target.value < new Date().toISOString().slice(0, 10)) {
            setAlert(true)
            setAlertSeverity('error')
            setAlertMessage("Please select a date  begining from today (or in the future)")
        } else {
            setAlert(false)
            setDate(event.target.value);
        }
    };

    const handleTimeChange = (event) => {
        if (event.target.value < new Date().toISOString().slice(11, 16)) {
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
                            console.log(data)
                            setHomeWorks(prevHomeworks => {
                                console.log(prevHomeworks)
                                return [...prevHomeworks, {
                                    id: data.id,
                                    assignment: newMessage,
                                    deadline: dateFormatter(date, time),
                                    professorId: user.id,
                                    classReservationId: parseInt(id),
                                    status: 'PENDING',
                                    responseFile: null,
                                    response: null,
                                    assignmentFile: data.assignmentFile
                                }]
                            });
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
                    onClick={() => setOpen(true)}
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