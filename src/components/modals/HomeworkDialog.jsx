import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField, Typography, styled } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
export function HomeworkDialog({ open, newMessage, setNewMessage, file, handleFileChange, date, handleDateChange, time, setTime, handleSave, handleClose, isProfessor }) {

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
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>{isProfessor ? "Add Homework" : "Complete Homework"}</DialogTitle>
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
                {isProfessor && (
                    <>
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
                    </>
                )}
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
                    >
                        Save
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}