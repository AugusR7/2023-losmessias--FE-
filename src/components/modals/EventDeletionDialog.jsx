import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";


export default function EventDeletionDialog({ open, eventId, handleClose, handleDelete }) {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this event?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={() => handleDelete(eventId)} color="error">Delete</Button>
            </DialogActions>
        </Dialog>
    );
}