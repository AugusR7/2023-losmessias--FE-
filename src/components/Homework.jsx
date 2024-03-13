import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Snackbar, TextField, Typography, styled } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from "react";
import { useUser } from "@/context/UserContext";

export default function Homework({ id, setHomeWorks, setUploadingHomeworks }) {
    const user = useUser();
    const [open, setOpen] = useState(false); // true or false
    const [alert, setAlert] = useState(false); // true or false
    const [alertSeverity, setAlertSeverity] = useState(''); // ['success', 'info', 'warning', 'error']
    const [file, setFile] = useState(null); // File
    const [newMessage, setNewMessage] = useState(''); // string
    const [alertMessage, setAlertMessage] = useState(''); // string
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [time, setTime] = useState(new Date().toISOString().slice(11, 16)); // HH:MM
    const handleClose = () => setOpen(false);

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

    const handleFileChange = e => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const dateFormatter = (date, time) => {
        return `${date}T${time}:00`
    }

    const handleResponse = () => {

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
                                    assignment: newMessage,
                                    deadline: dateFormatter(date, time),
                                    professorId: user.id,
                                    classReservationId: parseInt(id),
                                    status: 'PENDING',
                                    responseFile: null,
                                    response: null,
                                    assignmentFile: data.file
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

            // .finally(() => setUploadingFileNames(prevNames => prevNames.filter(name => name !== file.name)));
        }
        setOpen(false);
        setAlert(true);
        setNewMessage('');
        setFile(null);
    };

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });


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


            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Add Homework</DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', paddingBottom: '1rem', alignItems: 'center' }}>
                        <div style={{ paddingInline: '2rem' }}>
                            <TextField
                                multiline
                                rows={3}
                                fullWidth
                                value={newMessage}
                                label='Homework message'
                                onChange={event => {
                                    setNewMessage(event.target.value);
                                }}
                            />
                        </div>
                        <Divider orientation='vertical' flexItem />
                        <div style={{ paddingInline: '2rem' }}>
                            <Button component='label' variant='contained' startIcon={<CloudUploadIcon />}>
                                Upload file
                                <VisuallyHiddenInput
                                    type='file'
                                    name='file'
                                    onChange={handleFileChange}
                                />
                            </Button>
                            <Typography>{file?.name}</Typography>
                        </div>
                    </div>

                    <Divider orientation='horizontal' flexItem />
                    <div style={{ paddingTop: '1.5rem' }}>
                        <TextField
                            id="date"
                            label="Due Date"
                            type="date"
                            defaultValue={date}
                            value={date}
                            onChange={event => handleDateChange(event)}
                            sx={{ width: 220 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            id="time"
                            label="Due Time"
                            type="time"
                            defaultValue={time}
                            value={time}
                            onChange={event => setTime(event.target.value)}
                            sx={{ width: 120, marginLeft: 2 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            padding: '1rem'
                        }}
                    >

                        <Button onClick={handleClose} >Cancel</Button>
                        <Button
                            variant='contained'
                            onClick={handleSave}
                        // onClick={handleClose}
                        >
                            Save
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </div>
    )
}