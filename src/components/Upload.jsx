import { useUser } from '@/context/UserContext';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import useWindowSize from '@/hooks/useWindowSize';

export default function Upload({ id, setFiles, setComments, setUploadingFileNames, setUploadingComments }) {
    const user = useUser();
    const [file, setFile] = useState(null);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('');
    const [open, setOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const windowSize = useWindowSize();

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

    const handleFileChange = e => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSave = () => {
        if (file !== null) {
            var data = new FormData();
            setUploadingFileNames(prevNames => [...prevNames, file.name]);
            data.append('file', file);
            data.append('role', user.role);
            data.append('classReservation', id);
            data.append('associatedId', user.id);
            data.append('homeworkId', -1);
            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/file/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                body: data,
            })
                .then(res => {
                    if (res.status === 200) {
                        setAlertMessage('File uploaded successfully!');
                        setAlertSeverity('success');
                        setFiles(prevFiles => [...prevFiles, { fileName: file.name, role: user.role }]);
                        return res.json();
                    } else {
                        console.log(res.status);
                        setAlertSeverity('error');
                        setAlertMessage('There was an error uploading the file!');
                    }
                })
                .catch(err => {
                    setAlertSeverity('error');
                    setAlertMessage('There was an error uploading the file!');
                })
                .finally(() => setUploadingFileNames(prevNames => prevNames.filter(name => name !== file.name)));
        }
        if (newMessage !== '') {
            setUploadingComments(prevComments => [...prevComments, newMessage]);
            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/comment/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    text: newMessage,
                    classReservation: parseInt(id),
                    role: user.role.toUpperCase(),
                    uploadedDateTime: new Date().toISOString().split('.')[0],
                    associatedId: user.id,
                }),
            })
                .then(res => {
                    if (res.status === 200) {
                        setAlertMessage('Message uploaded successfully!');
                        setAlertSeverity('success');
                        setComments(prevComments => [
                            ...prevComments,
                            {
                                comment: newMessage,
                                role: user.role,
                                uploadedDateTime: [
                                    ...new Date().toISOString().split('T')[0].split('-'),
                                    ...new Date().toISOString().split('T')[1].split('.')[0].split(':'),
                                ],
                            },
                        ]);
                    } else {
                        setAlertSeverity('error');
                        setAlertMessage('There was an error uploading the message!');
                    }
                })
                .finally(() => setUploadingComments(prevComments => prevComments.filter(comment => comment !== newMessage)));
        }
        setOpen(false);
        setAlert(true);
        setNewMessage('');
        setFile(null);
    };

    const handleClose = () => {
        setOpen(false);
        setNewMessage('');
        setFile(null);
    };

    return (
        <div>
            <Button variant='contained' onClick={() => setOpen(true)} fullWidth={windowSize.width <= 500}>
                Upload
            </Button>

            <Snackbar
                open={alert}
                autoHideDuration={3000}
                onClose={() => setAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'top' }}
            >
                <Alert severity={alertSeverity}>{alertMessage}</Alert>
            </Snackbar>

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Upload</DialogTitle>

                {windowSize.width > 500 && (
                    <>
                        <DialogContent dividers sx={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ paddingInline: '2rem' }}>
                                <TextField
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={newMessage}
                                    label='Message'
                                    onChange={event => {
                                        setNewMessage(event.target.value);
                                    }}
                                />
                            </div>
                            <Divider orientation='vertical' flexItem />
                            <div style={{ paddingInline: '2rem' }}>
                                <Button component='label' variant='contained' startIcon={<CloudUploadIcon />}>
                                    Upload file
                                    <VisuallyHiddenInput type='file' name='file' onChange={handleFileChange} />
                                </Button>
                                <Typography>{file?.name}</Typography>
                            </div>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button variant='contained' onClick={handleSave}>
                                Save
                            </Button>
                        </DialogActions>
                    </>
                )}

                {windowSize.width <= 500 && (
                    <>
                        <DialogContent dividers>
                            <div style={{ paddingBlock: '2rem' }}>
                                <TextField
                                    multiline
                                    rows={2}
                                    fullWidth
                                    value={newMessage}
                                    label='Message'
                                    onChange={event => {
                                        setNewMessage(event.target.value);
                                    }}
                                />
                            </div>
                            <Divider />
                            <div style={{ paddingBlock: '2rem' }}>
                                <Button component='label' variant='contained' startIcon={<CloudUploadIcon />} fullWidth>
                                    Upload file
                                    <VisuallyHiddenInput type='file' name='file' onChange={handleFileChange} />
                                </Button>
                                <Typography>{file?.name}</Typography>
                            </div>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button variant='contained' onClick={handleSave}>
                                Save
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
}
