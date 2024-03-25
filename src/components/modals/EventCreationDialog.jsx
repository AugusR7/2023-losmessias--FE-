import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";

export default function EventCreationDialog({
    openCreationDialog,
    handleClose,
    title,
    setTitle,
    description,
    setDescription,
    startDate,
    startTime,
    endDate,
    endTime,
    eventType,
    setEventType,
    handleCreateEvent,
    handleDateChange,
    handleTimeChange,
}) {

    return (
        <Dialog open={openCreationDialog} onClose={handleClose}>
            <DialogTitle>Create Event</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Title"
                    type="text"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Description"
                    type="text"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <Grid container spacing={2} sx={{ paddingTop: '1rem' }}>
                    <Grid item xs={6} >
                        <TextField
                            id="date"
                            label="Starting Date"
                            type="date"
                            defaultValue={startDate}
                            value={startDate}
                            onChange={(event) => handleDateChange(event)}
                            sx={{ width: 220 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            id="time"
                            label="Starting Time"
                            type="time"
                            defaultValue={startTime}
                            value={startTime}
                            onChange={(e) => handleTimeChange(e)}
                            sx={{ width: 120, marginLeft: 2 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ paddingTop: '1rem' }}>
                    <Grid item xs={6} >
                        <TextField
                            id="date"
                            label="Ending Date"
                            type="date"
                            defaultValue={endDate}
                            value={endDate}
                            onChange={(event) => handleDateChange(event, true)}
                            sx={{ width: 220 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            id="time"
                            label="Ending Time"
                            type="time"
                            defaultValue={endTime}
                            value={endTime}
                            onChange={(e) => handleTimeChange(e, true)}
                            sx={{ width: 120, marginLeft: 2 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                </Grid>

                <FormControl fullWidth margin="dense" sx={{ marginTop: '1rem' }}>
                    <InputLabel>Type of Event</InputLabel>
                    <Select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        label="Type of Event"
                    >
                        <MenuItem value="EXAM">Exam</MenuItem>
                        <MenuItem value="VACATION">Vacation</MenuItem>
                        <MenuItem value="PROJECT_PRESENTATION">Project Presentation</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleCreateEvent} color="primary">Create</Button>
            </DialogActions>
        </Dialog>
    )
}