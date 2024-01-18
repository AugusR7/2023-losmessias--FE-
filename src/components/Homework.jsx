import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Snackbar, TextField, Typography, styled } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from "react";

export default function Homework({ }) {
    const [open, setOpen] = useState(false); // true or false
    const [alert, setAlert] = useState(false); // true or false
    const [alertSeverity, setAlertSeverity] = useState(''); // ['success', 'info', 'warning', 'error']
    const [file, setFile] = useState(null); // File
    const [newMessage, setNewMessage] = useState(''); // string
    const [alertMessage, setAlertMessage] = useState(''); // string
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
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
                                //   onChange={handleFileChange} 
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

                        <Button
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='contained'
                            onClick={handleClose}
                        >
                            Save
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </div>
    )
}