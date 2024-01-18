import { useRouter } from 'next/router';
import HorizontalProfessorCard from '../reservations/components/HorizontalProfessorCard';
import Upload from '@/components/Upload';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    Skeleton,
    Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import useWindowSize from '@/hooks/useWindowSize';
import Homework from '@/components/Homework';

function parse(dateTime) {
    let date = dateTime.slice(0, 3);
    let time = dateTime.slice(3, 7);
    date = date.join('-');
    time = time.join(':');

    return date + ' ' + time;
}

export default function Reservation() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({});
    const [comments, setComments] = useState([]);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [uploadingFileNames, setUploadingFileNames] = useState([]);
    const [uploadingComments, setUploadingComments] = useState([]);
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const user = useUser();
    const windowSize = useWindowSize();

    useEffect(() => {
        if (user.id) {
            if (user.role === 'admin') router.push('/admin-landing');
            setIsLoadingContent(true);
            const requestOptions = {
                method: 'GET',
                headers: { Authorization: `Bearer ${user.token}` },
            };
            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/file/get-uploaded-data?id=${router.query.id}`, requestOptions)
                .then(res => {
                    res.json().then(json => {
                        let comments = [];
                        let files = [];

                        json.forEach(e => {
                            if (e.comment !== undefined) comments.push(e);
                            else files.push(e);
                        });

                        setFiles(files);
                        setComments(comments);
                    });
                })
                .finally(() => setIsLoadingContent(false));

            if (user.role === 'student') {
                fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/professor/${router.query.userId}`, requestOptions).then(res => {
                    res.json().then(json => {
                        setUserInfo(json);
                    });
                });
            } else {
                fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/student/${router.query.userId}`, requestOptions).then(res => {
                    res.json().then(json => {
                        setUserInfo(json);
                    });
                });
            }
        } else {
            router.push('/');
        }
    }, [user, router]);

    const handleClick = message => {
        setMessage(message);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setMessage('');
    };

    const handleDownload = file => {
        const requestOptions = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };

        fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/file/downloadFile?id=${file.id}`, requestOptions)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement('a');
                a.href = url;
                a.download = file.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.error('Error:', error));
    };

    return (
        <div style={{ width: '90%', margin: '2rem auto' }}>
            <div
                style={
                    windowSize.width > 500
                        ? { display: 'flex', alignItems: 'end', justifyContent: 'space-between' }
                        : { display: 'flex', flexDirection: 'column', gap: 15 }
                }
            >
                <HorizontalProfessorCard professor={userInfo} />
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 15,
                        height: '100%',
                    }}
                >
                    <Upload
                        id={router.query.id}
                        setFiles={setFiles}
                        setComments={setComments}
                        setUploadingFileNames={setUploadingFileNames}
                        setUploadingComments={setUploadingComments}
                    />
                    {user.role === 'professor' && (
                        <Homework />
                    )}
                </Box>
            </div>

            {windowSize.width > 500 && (
                <div style={{ display: 'flex', alignItems: 'baseline', margin: '2rem auto', justifyContent: 'space-between' }}>
                    <div style={{ width: '50%', padding: '1.5rem' }}>
                        {isLoadingContent ? (
                            <Skeleton variant='rectangular' height={60} style={{ borderRadius: 10 }} />
                        ) : (
                            <List>
                                {uploadingComments.map((comment, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            flexDirection: 'row',
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: 'rgb(144, 199, 255)',
                                            height: 50,
                                            borderRadius: 10,
                                        }}
                                    >
                                        <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                        <Typography>Posting </Typography>{' '}
                                        <Typography sx={{ ml: 1, fontWeight: 'bold', fontStyle: 'italic' }}> {comment}</Typography>
                                    </div>
                                ))}
                                {comments.map((com, idx) => {
                                    let author = userInfo;
                                    if (com.role.toLowerCase() === user.role) author = user;
                                    return (
                                        <ListItemButton
                                            onClick={() => handleClick(com.comment)}
                                            key={idx}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: com.role.toLowerCase() !== user.role ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <Typography>{author.firstName + ' ' + author.lastName + ' - ' + com.comment}</Typography>
                                            <Typography variant='caption' sx={{ marginLeft: '0.5rem' }}>
                                                {parse(com.uploadedDateTime)}
                                            </Typography>
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        )}
                    </div>

                    <Divider orientation='vertical' flexItem />

                    <div style={{ width: '50%', padding: '1.5rem' }}>
                        {isLoadingContent ? (
                            <Skeleton variant='rectangular' height={60} style={{ borderRadius: 10 }} />
                        ) : (
                            <>
                                {uploadingFileNames.map((fileName, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            flexDirection: 'row',
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: 'rgb(144, 199, 255)',
                                            height: 50,
                                            borderRadius: 10,
                                        }}
                                    >
                                        <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                        <Typography>Uploading </Typography>{' '}
                                        <Typography sx={{ ml: 1, fontWeight: 'bold', fontStyle: 'italic' }}> {fileName}</Typography>
                                        <PictureAsPdfIcon fontSize='large' sx={{ ml: 2, mr: 2, color: 'gray' }} />
                                    </div>
                                ))}
                                {files.map((file, idx) => {
                                    let author = userInfo;
                                    if (file.role.toLowerCase() === user.role) author = user;

                                    return (
                                        <div style={{ display: 'flex', alignItems: 'center' }} key={idx}>
                                            <Button onClick={() => handleDownload(file)}>
                                                <PictureAsPdfIcon fontSize='large' />
                                                <Typography sx={{ marginLeft: '0.5rem' }}>{file.fileName}</Typography>
                                            </Button>
                                            <Typography>{' - ' + author.firstName + ' ' + author.lastName}</Typography>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            )}

            {windowSize.width <= 500 && (
                <div style={{ margin: '2rem auto' }}>
                    {isLoadingContent ? (
                        <Skeleton variant='rectangular' height={60} style={{ borderRadius: 10 }} />
                    ) : (
                        <List>
                            {uploadingComments.map((comment, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        flexDirection: 'row',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'rgb(144, 199, 255)',
                                        height: 50,
                                        borderRadius: 10,
                                    }}
                                >
                                    <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                    <Typography>Posting </Typography>{' '}
                                    <Typography sx={{ ml: 1, fontWeight: 'bold', fontStyle: 'italic' }}> {comment}</Typography>
                                </div>
                            ))}
                            {comments.map((com, idx) => {
                                let author = userInfo;
                                if (com.role.toLowerCase() === user.role) author = user;
                                return (
                                    <ListItemButton
                                        onClick={() => handleClick(com.comment)}
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: com.role.toLowerCase() !== user.role ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <Typography>{author.firstName + ' ' + author.lastName}</Typography>
                                        <Typography variant='caption' sx={{ marginLeft: '0.5rem' }}>
                                            {parse(com.uploadedDateTime)}
                                        </Typography>
                                    </ListItemButton>
                                );
                            })}

                            <Divider />

                            {uploadingFileNames.map((fileName, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        flexDirection: 'row',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'rgb(144, 199, 255)',
                                        height: 50,
                                        borderRadius: 10,
                                    }}
                                >
                                    <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                    <Typography>Uploading </Typography>{' '}
                                    <Typography sx={{ ml: 1, fontWeight: 'bold', fontStyle: 'italic' }}> {fileName}</Typography>
                                    <PictureAsPdfIcon fontSize='large' sx={{ ml: 2, mr: 2, color: 'gray' }} />
                                </div>
                            ))}
                            {files.map((file, idx) => {
                                let author = userInfo;
                                if (file.role.toLowerCase() === user.role) author = user;

                                return (
                                    <ListItemButton
                                        onClick={() => handleDownload(file)}
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: file.role.toLowerCase() !== user.role ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <Typography>{author.firstName + ' ' + author.lastName}</Typography>

                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <PictureAsPdfIcon fontSize='large' color='primary' />
                                            <Typography sx={{ marginLeft: '0.5rem' }} color='primary'>
                                                {file.fileName}
                                            </Typography>
                                        </div>
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    )}
                </div>
            )}

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Message</DialogTitle>

                <DialogContent>
                    <Typography>{message}</Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
